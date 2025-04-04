import { MarketStock, StockHistoryData } from '../types/stock';

// API endpoints - Using our upstox-server implementation
const API_BASE_URL = 'http://localhost:5001'; // Updated to match server port
const MARKET_DATA_ENDPOINT = `${API_BASE_URL}/api/market-data`;
const HISTORICAL_DATA_ENDPOINT = `${API_BASE_URL}/api/historical-data`;
const API_STATUS_ENDPOINT = `${API_BASE_URL}/api/status`;
const API_TEST_ENDPOINT = `${API_BASE_URL}/api/test`;

/**
 * Fetch real-time market data for multiple symbols
 */
export const fetchMarketData = async (symbols: string[]): Promise<MarketStock[]> => {
  try {
    const response = await fetch(`${MARKET_DATA_ENDPOINT}?instruments=${symbols.join(',')}`);
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data.status === 'success' && data.data) {
      // Convert the data object to an array of MarketStock objects
      return Object.entries(data.data).map(([key, value]: [string, any]) => {
        // Check if the value already has SYMBOL, PRICE, etc. (direct format)
        if (value.SYMBOL && value.PRICE !== undefined) {
          // Return the data directly, making sure timestamps are proper Date objects
          return {
            ...value,
            timestamp: value.timestamp ? new Date(value.timestamp) : new Date(),
            lastUpdated: value.lastUpdated || new Date().toISOString()
          } as MarketStock;
        } else if (value.instrument) {
          // Handle older API response format with nested instrument object
          const symbolParts = key.split(':');
          const symbol = symbolParts.length > 1 ? symbolParts[1] : key;
          
          return {
            SYMBOL: symbol,
            NAME: value.instrument?.name || symbol,
            PRICE: value.last_price || 0,
            CHANGE: 0, // Calculate from prev_close if available
            CHANGE_PERCENT: 0, // Calculate from prev_close if available
            VOLUME: value.volume?.toString() || '0',
            MARKET_CAP: '0', // Not provided by this API
            PREV_CLOSE: value.prev_close || value.last_price || 0,
            OPEN: value.ohlc?.open || value.last_price || 0,
            HIGH: value.ohlc?.high || value.last_price || 0,
            LOW: value.ohlc?.low || value.last_price || 0,
            CLOSE: value.last_price || 0,
            SECTOR: '', // Not provided by this API
            timestamp: new Date(),
            lastUpdated: new Date().toISOString()
          };
        }
        
        // Fallback - shouldn't happen with our server implementation
        console.warn('Unexpected data format received from API');
        const symbolParts = key.split(':');
        const symbol = symbolParts.length > 1 ? symbolParts[1] : key;
        
        return {
          SYMBOL: symbol,
          NAME: `${symbol} Stock`,
          PRICE: 0,
          CHANGE: 0,
          CHANGE_PERCENT: 0,
          VOLUME: '0',
          MARKET_CAP: '0',
          PREV_CLOSE: 0,
          OPEN: 0,
          HIGH: 0, 
          LOW: 0,
          CLOSE: 0,
          SECTOR: '',
          timestamp: new Date(),
          lastUpdated: new Date().toISOString()
        };
      });
    }
    
    throw new Error('Invalid response format');
  } catch (error) {
    console.error('Error fetching market data:', error);
    throw error;
  }
};

/**
 * Set up real-time market feed subscription
 */
export const setupMarketFeed = (symbols: string[], callback: (stock: MarketStock) => void) => {
  // Use polling instead of SSE for reliability
  const pollInterval = 15000; // Poll every 15 seconds
  
  let isPolling = true;
  
  const pollFeed = async () => {
    if (!isPolling) return;
    
    try {
      const data = await fetchMarketData(symbols);
      
      if (callback) {
        data.forEach(stock => {
          callback(stock);
        });
      }
    } catch (error) {
      console.error('Error polling market feed:', error);
    }
    
    // Schedule next poll
    if (isPolling) {
      setTimeout(pollFeed, pollInterval);
    }
  };
  
  // Start polling
  pollFeed();
  
  // Return cleanup method
  return {
    close: () => {
      isPolling = false;
    }
  };
};

/**
 * Fetch historical data for a symbol
 */
export const fetchHistoricalData = async (
  symbol: string, 
  interval: string = '1D',
  fromDate?: string,
  toDate?: string
): Promise<StockHistoryData[]> => {
  try {
    // Format dates if provided
    const from = fromDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const to = toDate || new Date().toISOString().split('T')[0];
    
    // Construct API URL with proper parameters matching our server.js implementation
    const url = `${HISTORICAL_DATA_ENDPOINT}?instrument=${symbol}&interval=${interval}&from_date=${from}&to_date=${to}`;
    console.log(`Fetching historical data from: ${url}`);
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data.status === 'success' && data.data?.candles) {
      // Map the response data format to what our frontend expects
      return data.data.candles.map((candle: any) => ({
        date: new Date(candle.timestamp),
        open: candle.open,
        high: candle.high,
        low: candle.low,
        close: candle.close,
        volume: candle.volume
      }));
    }
    
    throw new Error('Invalid response format or empty data');
  } catch (error) {
    console.error('Error fetching historical data:', error);
    // Return empty array instead of throwing to avoid breaking UI
    return [];
  }
};

/**
 * Search for instruments (Simplified mock implementation)
 */
export const searchInstruments = async (query: string): Promise<any[]> => {
  try {
    // Our server.js doesn't have a search endpoint, so we'll provide common instruments
    // This is a simple implementation that returns hardcoded results based on the query
    console.log(`Searching for instruments with query: ${query}`);
    
    // Default stock list
    const commonStocks = [
      { symbol: 'NSE:RELIANCE', name: 'Reliance Industries Ltd.', exchange: 'NSE', sector: 'Energy' },
      { symbol: 'NSE:TCS', name: 'Tata Consultancy Services Ltd.', exchange: 'NSE', sector: 'Technology' },
      { symbol: 'NSE:HDFCBANK', name: 'HDFC Bank Ltd.', exchange: 'NSE', sector: 'Financial Services' },
      { symbol: 'NSE:INFY', name: 'Infosys Ltd.', exchange: 'NSE', sector: 'Technology' },
      { symbol: 'NSE:ICICIBANK', name: 'ICICI Bank Ltd.', exchange: 'NSE', sector: 'Financial Services' },
      { symbol: 'NSE:SBIN', name: 'State Bank of India', exchange: 'NSE', sector: 'Financial Services' },
      { symbol: 'NSE:BHARTIARTL', name: 'Bharti Airtel Ltd.', exchange: 'NSE', sector: 'Telecommunications' },
      { symbol: 'NSE:HINDUNILVR', name: 'Hindustan Unilever Ltd.', exchange: 'NSE', sector: 'Consumer Goods' },
      { symbol: 'NSE:ITC', name: 'ITC Ltd.', exchange: 'NSE', sector: 'Consumer Goods' },
      { symbol: 'NSE:KOTAKBANK', name: 'Kotak Mahindra Bank Ltd.', exchange: 'NSE', sector: 'Financial Services' },
      // Add indices
      { symbol: 'NSE:NIFTY50', name: 'Nifty 50 Index', exchange: 'NSE', sector: 'Index' },
      { symbol: 'NSE:NIFTYBANK', name: 'Nifty Bank Index', exchange: 'NSE', sector: 'Index' }
    ];
    
    // Filter results based on the query
    if (!query || query.trim() === '') {
      return commonStocks;
    }
    
    const lowerQuery = query.toLowerCase();
    const filteredResults = commonStocks.filter(stock => 
      stock.symbol.toLowerCase().includes(lowerQuery) || 
      stock.name.toLowerCase().includes(lowerQuery) ||
      stock.sector.toLowerCase().includes(lowerQuery)
    );
    
    return filteredResults;
  } catch (error) {
    console.error('Error with instrument search:', error);
    return [];
  }
};

// Export a combined service object
export const upstoxService = {
  fetchMarketData,
  setupMarketFeed,
  fetchHistoricalData,
  searchInstruments
};

export default upstoxService; 