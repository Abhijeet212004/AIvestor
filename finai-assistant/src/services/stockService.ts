import axios from 'axios';

// Interface for stock data
export interface StockData {
  symbol: string;
  currentPrice: number;
  change: number;
  changePercent: number;
  high: number;
  low: number;
  open: number;
  previousClose: number;
  volume: number;
  lastUpdated: string;
}

// API Keys
const ALPHA_VANTAGE_API_KEY = 'CZILV64G3SK01Q6W';
const ALPHA_VANTAGE_GLOBAL_API_KEY = 'RGA97IAEMI2H9I80';
const NEWS_API_KEY = '9dbdf33740aa42e9a71925ef0c9d411d';

// Fetch real-time stock data with fallback options
export const fetchStockData = async (symbol: string): Promise<StockData> => {
  try {
    // Try Indian market first using NSE prefix
    return await fetchIndianStockData(symbol);
  } catch (error) {
    console.log("Error fetching Indian stock data, trying global market data...");
    try {
      // Fallback to global market data
      return await fetchGlobalStockData(symbol);
    } catch (globalError) {
      console.error("Failed to fetch stock data from all sources:", globalError);
      // Return mock data for development/testing
      return getMockStockData(symbol);
    }
  }
};

// Fetch stock data from Indian markets
const fetchIndianStockData = async (symbol: string): Promise<StockData> => {
  try {
    // Use Alpha Vantage with NSE prefix for Indian stocks
    const response = await axios.get(
      `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=NSE:${symbol}&apikey=${ALPHA_VANTAGE_API_KEY}`
    );
    
    // Check if we have valid data
    const data = response.data['Global Quote'];
    if (!data || Object.keys(data).length === 0) {
      throw new Error("No data returned for Indian stock");
    }
    
    return {
      symbol: symbol,
      currentPrice: parseFloat(data['05. price']),
      change: parseFloat(data['09. change']),
      changePercent: parseFloat(data['10. change percent'].replace('%', '')),
      high: parseFloat(data['03. high']),
      low: parseFloat(data['04. low']),
      open: parseFloat(data['02. open']),
      previousClose: parseFloat(data['08. previous close']),
      volume: parseInt(data['06. volume']),
      lastUpdated: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error fetching Indian stock data:', error);
    throw new Error('Failed to fetch Indian stock data');
  }
};

// Fetch global stock data
const fetchGlobalStockData = async (symbol: string): Promise<StockData> => {
  try {
    // Use global API key without NSE prefix
    const response = await axios.get(
      `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${ALPHA_VANTAGE_GLOBAL_API_KEY}`
    );
    
    // Check if we have valid data
    const data = response.data['Global Quote'];
    if (!data || Object.keys(data).length === 0) {
      throw new Error("No data returned for global stock");
    }
    
    return {
      symbol: symbol,
      currentPrice: parseFloat(data['05. price']),
      change: parseFloat(data['09. change']),
      changePercent: parseFloat(data['10. change percent'].replace('%', '')),
      high: parseFloat(data['03. high']),
      low: parseFloat(data['04. low']),
      open: parseFloat(data['02. open']),
      previousClose: parseFloat(data['08. previous close']),
      volume: parseInt(data['06. volume']),
      lastUpdated: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error fetching global stock data:', error);
    throw new Error('Failed to fetch global stock data');
  }
};

// Generate mock data for development/testing when APIs fail
const getMockStockData = (symbol: string): StockData => {
  console.warn(`Using mock data for ${symbol} as API requests failed`);
  const basePrice = Math.floor(Math.random() * 1000) + 100;
  const change = Math.floor(Math.random() * 20) - 10;
  const changePercent = (change / basePrice) * 100;
  
  return {
    symbol: symbol,
    currentPrice: basePrice,
    change: change,
    changePercent: changePercent,
    high: basePrice + Math.floor(Math.random() * 10),
    low: basePrice - Math.floor(Math.random() * 10),
    open: basePrice - change,
    previousClose: basePrice - change,
    volume: Math.floor(Math.random() * 1000000) + 100000,
    lastUpdated: new Date().toISOString()
  };
};

// News article interface
export interface NewsArticle {
  title: string;
  description: string;
  publishedAt: string;
  url: string;
  source?: string;
  urlToImage?: string;
}

// Fetch stock news with improved search terms for Indian markets
export const fetchStockNews = async (symbol: string): Promise<NewsArticle[]> => {
  try {
    // Use the provided News API key to fetch real news data
    const response = await axios.get(
      `https://newsapi.org/v2/everything`, {
        params: {
          q: `${symbol} stock market india`,
          language: 'en',
          sortBy: 'publishedAt',
          apiKey: NEWS_API_KEY
        }
      }
    );
    
    // Check if we have valid data
    if (response.data && response.data.articles && response.data.articles.length > 0) {
      return response.data.articles.slice(0, 5).map((article: any) => ({
        title: article.title,
        description: article.description || 'No description available',
        publishedAt: article.publishedAt,
        url: article.url,
        source: article.source?.name,
        urlToImage: article.urlToImage
      }));
    } else {
      console.warn("No news found for " + symbol + ", using mock data");
      return getMockNewsData(symbol);
    }
  } catch (error) {
    console.error('Error fetching stock news:', error);
    return getMockNewsData(symbol); // Return mock news data as fallback
  }
};

// Generate mock news data for development/testing
const getMockNewsData = (symbol: string): NewsArticle[] => {
  const currentDate = new Date();
  
  return [
    {
      title: `${symbol} Reports Strong Q2 Earnings, Exceeds Expectations`,
      description: `${symbol} has announced better-than-expected quarterly results with rising revenue and profit margins. The company continues to show strong performance in the Indian market despite economic challenges.`,
      publishedAt: new Date(currentDate.getTime() - 86400000).toISOString(), // Yesterday
      url: '#',
      source: 'Economic Times'
    },
    {
      title: `Analysts Upgrade ${symbol} to "Buy" on Growth Prospects`,
      description: `Major investment firms have upgraded ${symbol} stock to a "Buy" rating, citing strong growth potential in the Indian consumer market and expansion plans.`,
      publishedAt: new Date(currentDate.getTime() - 172800000).toISOString(), // 2 days ago
      url: '#',
      source: 'LiveMint'
    },
    {
      title: `${symbol} Expands Operations in Indian Market`,
      description: `${symbol} has announced plans to expand its operations in key Indian cities, increasing its market presence and potentially boosting revenues in the coming fiscal year.`,
      publishedAt: new Date(currentDate.getTime() - 259200000).toISOString(), // 3 days ago
      url: '#',
      source: 'Business Standard'
    }
  ];
}; 