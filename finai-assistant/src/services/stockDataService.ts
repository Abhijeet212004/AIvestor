import { getYahooFinanceSymbol } from '../utils/nseSymbolMapping';

export interface StockData {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercentage: number;
  volume: string;
  marketCap: string;
  previousClose: number;
  open: number;
  dayHigh: number;
  dayLow: number;
  yearHigh: number;
  yearLow: number;
  sector: string;
  timestamp: Date;
}

export interface StockHistoryData {
  date: string;
  price: number;
  volume: number;
}

/**
 * Fetches real-time stock data from the backend API which uses yfinance
 * @param symbol The stock symbol (e.g., "TCS", "NIFTY50")
 * @returns Promise with StockData
 */
export async function fetchStockData(symbol: string): Promise<StockData> {
  try {
    const yahooSymbol = getYahooFinanceSymbol(symbol);
    
    // This would connect to your backend API
    // For now, we'll simulate the response
    // In a real implementation, you would make an API call like:
    // const response = await fetch(`http://localhost:5000/api/stock/${yahooSymbol}`);
    // const data = await response.json();
    
    // For demo purposes, return simulated data
    return simulateStockData(yahooSymbol);
  } catch (error) {
    console.error("Error fetching stock data:", error);
    throw error;
  }
}

/**
 * Fetches multiple stocks data at once
 * @param symbols Array of stock symbols
 * @returns Promise with array of StockData
 */
export async function fetchMultipleStocks(symbols: string[]): Promise<StockData[]> {
  try {
    // Convert all symbols to Yahoo Finance format
    const yahooSymbols = symbols.map(getYahooFinanceSymbol);
    
    // This would connect to your backend API with multiple symbols
    // For now, we'll simulate the response
    return Promise.all(yahooSymbols.map(simulateStockData));
  } catch (error) {
    console.error("Error fetching multiple stocks:", error);
    throw error;
  }
}

/**
 * Fetches historical data for a stock
 * @param symbol The stock symbol
 * @param period The time period ('1d', '5d', '1mo', '3mo', '6mo', '1y', '5y')
 * @returns Promise with array of historical data points
 */
export async function fetchStockHistory(
  symbol: string, 
  period: '1d' | '5d' | '1mo' | '3mo' | '6mo' | '1y' | '5y' = '1mo'
): Promise<StockHistoryData[]> {
  try {
    const yahooSymbol = getYahooFinanceSymbol(symbol);
    
    // Try to fetch from our backend API first
    try {
      const response = await fetch(`/api/stock/${yahooSymbol}/history?period=${period}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch from API');
      }
      
      const data = await response.json();
      
      // Transform the data to match our interface
      return data.map((item: any) => ({
        date: item.date.split(' ')[0], // Just get the date part
        price: item.price,
        volume: item.volume
      }));
    } catch (apiError) {
      console.error("Error fetching from API, falling back to simulation:", apiError);
      // Fall back to simulation if API fails
      return simulateHistoricalData(yahooSymbol, period);
    }
  } catch (error) {
    console.error("Error fetching stock history:", error);
    throw error;
  }
}

// Helper functions to simulate data for development
function simulateStockData(yahooSymbol: string): StockData {
  // Extract base symbol without .NS or ^ for display
  const displaySymbol = yahooSymbol.replace('.NS', '').replace('^', '');
  
  // Generate company name based on symbol
  let name = '';
  if (displaySymbol === 'NSEI') {
    name = 'NIFTY 50 Index';
  } else if (displaySymbol === 'BSESN') {
    name = 'BSE SENSEX';
  } else if (displaySymbol === 'NSEBANK') {
    name = 'NIFTY Bank Index';
  } else {
    // For regular stocks, format the ticker as a company name
    name = displaySymbol
      .split(/(?=[A-Z])/)
      .join(' ')
      .replace(/(Ltd|Limited|Corporation|Corp|Inc)$/, '')
      .trim();
      
    if (yahooSymbol.endsWith('.NS')) {
      name += ' Ltd';
    }
  }
  
  // Generate a random price appropriate for Indian stocks
  const isIndex = yahooSymbol.startsWith('^');
  const basePrice = isIndex ? 
    (yahooSymbol.includes('NSEI') ? 22500 : yahooSymbol.includes('BSESN') ? 74000 : 45000) : 
    Math.floor(Math.random() * 4000) + 100;
  
  const price = basePrice + (Math.random() * 100 - 50);
  const previousClose = price - (Math.random() * 20 - 10);
  const change = price - previousClose;
  const changePercentage = (change / previousClose) * 100;
  
  // Random sector for stocks
  const sectors = [
    'Technology', 'Financial Services', 'Healthcare', 'Consumer Cyclical', 
    'Communication Services', 'Automotive', 'Energy', 'Materials'
  ];
  const sector = isIndex ? 'Index' : sectors[Math.floor(Math.random() * sectors.length)];
  
  // Format volume and market cap
  const volume = isIndex ? 
    `${Math.floor(Math.random() * 900) + 100}M` : 
    `${Math.floor(Math.random() * 90) + 10}M`;
  
  const marketCap = isIndex ? 
    'N/A' : 
    `₹${Math.floor(Math.random() * 900) + 100}B`;
  
  return {
    symbol: displaySymbol,
    name,
    price,
    change,
    changePercentage,
    volume,
    marketCap,
    previousClose,
    open: previousClose + (Math.random() * 10 - 5),
    dayHigh: price + (Math.random() * 20),
    dayLow: price - (Math.random() * 20),
    yearHigh: price + (Math.random() * 100),
    yearLow: price - (Math.random() * 100),
    sector,
    timestamp: new Date(),
  };
}

function simulateHistoricalData(yahooSymbol: string, period: string): StockHistoryData[] {
  const data: StockHistoryData[] = [];
  let numPoints: number;
  
  // Determine number of data points based on period
  switch (period) {
    case '1d': numPoints = 24; break;  // Hourly for a day
    case '5d': numPoints = 5 * 8; break;  // 8 points per day for 5 days
    case '1mo': numPoints = 30; break;  // Daily for a month
    case '3mo': numPoints = 90; break;  // Daily for 3 months
    case '6mo': numPoints = 180; break;  // Daily for 6 months
    case '1y': numPoints = 365; break;  // Daily for a year
    case '5y': numPoints = 5 * 12; break;  // Monthly for 5 years
    default: numPoints = 30;
  }
  
  // Generate a start price
  const isIndex = yahooSymbol.startsWith('^');
  const startPrice = isIndex ? 
    (yahooSymbol.includes('NSEI') ? 19000 : yahooSymbol.includes('BSESN') ? 62000 : 40000) : 
    Math.floor(Math.random() * 3000) + 100;
  
  // Create a current date to work backwards from
  const currentDate = new Date();
  let price = startPrice;
  
  // Generate data points
  for (let i = 0; i < numPoints; i++) {
    // Calculate date based on period
    const date = new Date(currentDate);
    
    if (period === '1d') {
      // For 1d, go back by hours
      date.setHours(date.getHours() - (numPoints - i));
    } else if (period === '5d') {
      // For 5d, go back by hours but only during market hours
      const hoursToGoBack = Math.floor((numPoints - i) / 8) * 24 + ((numPoints - i) % 8);
      date.setHours(date.getHours() - hoursToGoBack);
    } else if (period === '5y') {
      // For 5y, go back by months
      date.setMonth(date.getMonth() - (numPoints - i));
    } else {
      // For other periods, go back by days
      date.setDate(date.getDate() - (numPoints - i));
    }
    
    // Generate a price with some randomness but also a trend
    // Add a slight upward bias for a generally positive market
    const changeFactor = (Math.random() - 0.45) * 2;
    const changeAmount = price * 0.01 * changeFactor;
    price += changeAmount;
    
    // Ensure price doesn't go negative
    price = Math.max(price, 10);
    
    // Format the date based on period
    let dateStr: string;
    if (period === '1d' || period === '5d') {
      dateStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (period === '5y') {
      dateStr = date.toLocaleDateString([], { year: 'numeric', month: 'short' });
    } else {
      dateStr = date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
    
    // Add data point
    data.push({
      date: dateStr,
      price: Number(price.toFixed(2)),
      volume: Math.floor(Math.random() * 10000000) + 1000000
    });
  }
  
  return data;
} 