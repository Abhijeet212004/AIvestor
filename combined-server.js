// combined-server.js - Orchestrates all three backend services
require('dotenv').config();
const express = require('express');
const { spawn } = require('child_process');
const path = require('path');
const cors = require('cors');
const fs = require('fs');
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

// Create main Express app
const app = express();
const PORT = process.env.PORT || 8080;

// Enable CORS and JSON parsing
app.use(cors());
app.use(express.json());

// Start upstox server as a separate process
console.log('Initializing Upstox Server...');
const upstoxServer = spawn('node', ['upstox-server.js']);

upstoxServer.stdout.on('data', (data) => {
  console.log(`Upstox Server: ${data}`);
});

upstoxServer.stderr.on('data', (data) => {
  console.error(`Upstox Server Error: ${data}`);
});

// Proxy requests to upstox server
app.use('/upstox', (req, res) => {
  const options = {
    method: req.method,
    headers: {
      'Content-Type': 'application/json',
    },
    body: req.method !== 'GET' ? JSON.stringify(req.body) : undefined,
  };

  fetch(`http://localhost:5001${req.url}`, options)
    .then(response => response.json())
    .then(data => res.json(data))
    .catch(error => {
      console.error('Error proxying to upstox server:', error);
      res.status(500).json({ error: 'Internal Server Error' });
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
  };

  fetch(`http://localhost:5002${req.url}`, options)
    .then(response => response.json())
    .then(data => res.json(data))
    .catch(error => {
      console.error('Error proxying to stock data server:', error);
      res.status(500).json({ error: 'Internal Server Error' });
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

  fetch(`http://localhost:5000${req.url}`, options)
    .then(response => response.json())
    .then(data => res.json(data))
    .catch(error => {
      console.error('Error proxying to chatbot server:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    });
});

// Start the combined server
app.listen(PORT, () => {
  console.log(`Combined AIvestor server running on port ${PORT}`);
});
