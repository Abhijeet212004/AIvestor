// combined-server.js - Orchestrates all three backend services
require('dotenv').config();
const express = require('express');
const { spawn } = require('child_process');
const path = require('path');
const cors = require('cors');
const fs = require('fs');
let fetch;
try {
  // First try CommonJS style import
  fetch = require('node-fetch');
} catch (e) {
  // Fallback to dynamic import for ESM
  fetch = (...args) => import('node-fetch').then(({default: fetchFn}) => fetchFn(...args));
}

// Ensure fetch is a function
if (typeof fetch !== 'function') {
  // Handle ESM default export structure
  fetch = fetch.default || fetch;
}

// Create main Express app
const app = express();
const PORT = process.env.PORT || 8080;

// Enable CORS and JSON parsing
app.use(cors());
app.use(express.json());

// Import upstox server as a module
console.log('Initializing Upstox Server...');
const upstoxApp = require('./upstox-server');

// Mount the upstox app directly
app.use('/upstox', upstoxApp);
console.log('Upstox routes initialized');

// Add compatibility routes for frontend that expects /api/* endpoints
app.use('/api/market-data', (req, res) => {
  // Direct call to upstoxApp instead of HTTP request to avoid circular references
  try {
    // Extract query parameters
    const instruments = req.query.instruments;
    
    // Call the internal handler directly
    if (upstoxApp.handleMarketData && typeof upstoxApp.handleMarketData === 'function') {
      upstoxApp.handleMarketData(instruments, (error, data) => {
        if (error) {
          console.error('Error in direct upstox market data call:', error);
          return res.status(500).json({ error: 'Internal Server Error' });
        }
        res.json(data);
      });
    } else {
      // Fallback to regular upstox endpoint
      console.log('Redirecting to upstox routes');
      res.redirect(`/upstox/api/market-data?instruments=${instruments}`);
    }
  } catch (error) {
    console.error('Error forwarding to upstox market data:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Also add historical data endpoint for compatibility
app.use('/api/historical-data', (req, res) => {
  // Redirect to the upstox route instead of making an HTTP request
  try {
    // Simply redirect to the proper endpoint with all query parameters preserved
    const queryString = req.url.includes('?') ? req.url.substring(req.url.indexOf('?')) : '';
    res.redirect(`/upstox/api/historical-data${queryString}`);
  } catch (error) {
    console.error('Error forwarding to upstox historical data:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Root route for API information
app.get('/', (req, res) => {
  res.json({
    status: 'online',
    message: 'AIvestor API is running. Please connect from the frontend application.',
    endpoints: {
      upstox: '/upstox/*',
      stockData: '/stock-api/*',
      chatbot: '/chatbot-api/*'
    }
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', services: ['upstox', 'stock-data', 'chatbot'] });
});

// Start Python stock data server
console.log('Starting Stock Data Server...');
const stockDataServer = spawn('python3', ['stock-data-server.py']);

stockDataServer.stdout.on('data', (data) => {
  console.log(`Stock Data Server: ${data}`);
});

stockDataServer.stderr.on('data', (data) => {
  console.error(`Stock Data Server Error: ${data}`);
});

// Proxy requests to stock data server
app.use('/stock-api', (req, res) => {
  const options = {
    method: req.method,
    headers: {
      'Content-Type': 'application/json',
    },
    body: req.method !== 'GET' ? JSON.stringify(req.body) : undefined,
  };

  // Use 127.0.0.1 instead of localhost to avoid potential DNS resolution issues
  fetch(`http://127.0.0.1:5002${req.url}`, options)
    .then(response => {
      if (!response.ok) {
        throw new Error(`Stock data server responded with status: ${response.status}`);
      }
      return response.json();
    })
    .then(data => res.json(data))
    .catch(error => {
      console.error('Error proxying to stock data server:', error);
      // Return a fallback response with mock data for trending stocks
      if (req.url.includes('/trending')) {
        const mockData = require('./mock-data/trending-stocks.json');
        return res.json(mockData);
      }
      res.status(500).json({ error: 'Internal Server Error', message: error.message });
    });
});

// Start Python chatbot server
console.log('Starting Chatbot Server...');
const chatbotServer = spawn('python3', ['server/app.py']);

chatbotServer.stdout.on('data', (data) => {
  console.log(`Chatbot Server: ${data}`);
});

chatbotServer.stderr.on('data', (data) => {
  console.error(`Chatbot Server Error: ${data}`);
});

// Proxy requests to chatbot server
app.use('/chatbot-api', (req, res) => {
  const options = {
    method: req.method,
    headers: {
      'Content-Type': 'application/json',
    },
    body: req.method !== 'GET' ? JSON.stringify(req.body) : undefined,
  };

  // Use 127.0.0.1 instead of localhost to avoid potential DNS resolution issues
  fetch(`http://127.0.0.1:5000${req.url}`, options)
    .then(response => {
      if (!response.ok) {
        throw new Error(`Chatbot server responded with status: ${response.status}`);
      }
      return response.json();
    })
    .then(data => res.json(data))
    .catch(error => {
      console.error('Error proxying to chatbot server:', error);
      
      // If the Gemini API fails, return an error
      res.status(500).json({ 
        error: 'Internal Server Error', 
        message: error.message
      });
    });
});

// Start the combined server
app.listen(PORT, () => {
  console.log(`Combined AIvestor server running on port ${PORT}`);
});
