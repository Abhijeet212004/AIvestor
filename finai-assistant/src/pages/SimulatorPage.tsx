import React, { useState, useEffect } from 'react';
import { Box, Container, Grid, GridItem, Heading, Text, Flex, Button, HStack, VStack, Icon, SimpleGrid, Progress, Tag, Divider, Stat, StatLabel, StatNumber, StatHelpText, StatArrow, Tabs, TabList, TabPanels, Tab, TabPanel, Table, Thead, Tbody, Tr, Th, Td, Badge, Menu, MenuButton, MenuList, MenuItem, Input, Select, Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton, FormControl, FormLabel, NumberInput, NumberInputField, useDisclosure, useColorModeValue, InputGroup, InputLeftElement, NumberInputStepper, NumberIncrementStepper, NumberDecrementStepper, Switch, Spinner } from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { FiTrendingUp, FiTrendingDown, FiDollarSign, FiPieChart, FiActivity, FiClock, FiArrowUp, FiArrowDown, FiChevronDown, FiPlus, FiSearch, FiRefreshCw, FiSettings, FiAlertCircle, FiCalendar } from 'react-icons/fi';
import Navigation from '../components/Navigation';
import StockChart from '../components/StockChart';
import AnimatedCard from '../components/AnimatedCard';
import ProtectedFeature from '../components/ProtectedFeature';
import { fetchStockData, fetchMultipleStocks, StockData } from '../services/stockDataService';
import MiniChart from '../components/MiniChart';

const MotionBox = motion(Box);
const MotionFlex = motion(Flex);

// Update PortfolioStock interface to accommodate portfolio assets
interface PortfolioStock extends Partial<StockData> {
  id?: string;
  name: string;
  shares?: number;
  avgBuyPrice?: number;
  currentPrice?: number;
  change?: number;
  changePercentage?: number;
  value?: number;
  weight?: number;
  sector?: string;
  transactions?: { date: string; type: string; shares: number; price: number; total: number; }[];
}

// Define CSV stock interface for the stocks.csv file
interface CSVStock {
  SYMBOL: string;
  'NAME OF COMPANY': string;
  SECTOR: string;
}

// Add fallback stock data in case the CSV loading fails
const fallbackStocks: CSVStock[] = [
  {
    SYMBOL: 'RELIANCE',
    'NAME OF COMPANY': 'Reliance Industries Limited',
    SECTOR: 'Energy'
  },
  {
    SYMBOL: 'TCS',
    'NAME OF COMPANY': 'Tata Consultancy Services Limited',
    SECTOR: 'Technology'
  },
  {
    SYMBOL: 'HDFCBANK',
    'NAME OF COMPANY': 'HDFC Bank Limited',
    SECTOR: 'Financial Services'
  },
  {
    SYMBOL: 'INFY',
    'NAME OF COMPANY': 'Infosys Limited',
    SECTOR: 'Technology'
  },
  {
    SYMBOL: 'ICICIBANK',
    'NAME OF COMPANY': 'ICICI Bank Limited',
    SECTOR: 'Financial Services'
  },
  {
    SYMBOL: 'BHARTIARTL',
    'NAME OF COMPANY': 'Bharti Airtel Limited',
    SECTOR: 'Telecommunications'
  },
  {
    SYMBOL: 'HINDUNILVR',
    'NAME OF COMPANY': 'Hindustan Unilever Limited',
    SECTOR: 'Consumer Goods'
  },
  {
    SYMBOL: 'SBIN',
    'NAME OF COMPANY': 'State Bank of India',
    SECTOR: 'Financial Services'
  },
  {
    SYMBOL: 'ITC',
    'NAME OF COMPANY': 'ITC Limited',
    SECTOR: 'Consumer Goods'
  },
  {
    SYMBOL: 'KOTAKBANK',
    'NAME OF COMPANY': 'Kotak Mahindra Bank Limited',
    SECTOR: 'Financial Services'
  }
];

// Improved CSV parser function
const parseCSV = (csvText: string): CSVStock[] => {
  try {
    console.log("Starting CSV parsing");
    // Split the CSV by lines and filter out empty lines
    const lines = csvText.split('\n').filter(line => line.trim() !== '');
    console.log(`CSV has ${lines.length} lines`);
    
    if (lines.length <= 1) {
      console.error("CSV file only has header or is empty");
      return [];
    }
    
    // The first line contains headers
    const headers = lines[0].split(',').map(header => header.trim());
    console.log("CSV headers:", headers);
    
    // Process the remaining lines
    const results: CSVStock[] = [];
    
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      
      // Basic CSV parsing - this is a simplified approach for basic CSV files
      // For more complex CSVs with quoted fields containing commas, a more robust parser would be needed
      const values = line.split(',');
      
      // Create an object with the headers as keys
      const stock: any = {};
      
      // Map values to keys
      headers.forEach((header, index) => {
        if (index < values.length) {
          // Remove quotes if present
          const value = values[index].trim().replace(/^"(.*)"$/, '$1');
          stock[header] = value;
        }
      });
      
      // Only add if it has the required fields
      if (stock.SYMBOL && stock['NAME OF COMPANY']) {
        // If SECTOR is missing or N/A, assign a default sector
        if (!stock.SECTOR || stock.SECTOR === 'N/A') {
          // Assign a sector based on company name patterns or use a default
          if (stock['NAME OF COMPANY'].toLowerCase().includes('bank') || 
              stock['NAME OF COMPANY'].toLowerCase().includes('finance')) {
            stock.SECTOR = 'Financial Services';
          } else if (stock['NAME OF COMPANY'].toLowerCase().includes('tech') || 
                    stock['NAME OF COMPANY'].toLowerCase().includes('software')) {
            stock.SECTOR = 'Technology';
          } else if (stock['NAME OF COMPANY'].toLowerCase().includes('pharma') || 
                    stock['NAME OF COMPANY'].toLowerCase().includes('health')) {
            stock.SECTOR = 'Healthcare';
          } else {
            // Default to a random sector for demonstration
            const sectors = ['Technology', 'Financial Services', 'Healthcare', 'Consumer Goods', 'Energy'];
            stock.SECTOR = sectors[Math.floor(Math.random() * sectors.length)];
          }
        }
        
        results.push(stock as CSVStock);
      }
    }
    
    console.log(`Successfully parsed ${results.length} stocks from CSV`);
    return results;
  } catch (error) {
    console.error('Error parsing CSV:', error);
    return [];
  }
};

const SimulatorPage: React.FC = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [activeTab, setActiveTab] = useState(0);
  const [buyAmount, setBuyAmount] = useState(1000);
  const [selectedStock, setSelectedStock] = useState<PortfolioStock | null>(null);
  const [transactionType, setTransactionType] = useState<'buy' | 'sell'>('buy');
  const [marketStocks, setMarketStocks] = useState<StockData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSector, setSelectedSector] = useState<string | null>(null);
  const [showStockDetail, setShowStockDetail] = useState(false);
  const [csvStocks, setCsvStocks] = useState<CSVStock[]>([]);
  const [isLoadingCSV, setIsLoadingCSV] = useState(true);
  const [csvSearchTerm, setCsvSearchTerm] = useState<string>('');
  const [csvSelectedSector, setCsvSelectedSector] = useState<string>('');
  
  // Mock portfolio data
  const [mockPortfolio, setMockPortfolio] = useState({
    totalValue: 10420.68,
    initialInvestment: 10000,
    cash: 2500.32,
    returnPercentage: 4.21,
    dailyChange: -128.42,
    dailyChangePercentage: -1.22,
    assets: [
      {
        id: 'AAPL',
        name: 'Apple Inc.',
        value: 2345.60,
        shares: 15,
        avgBuyPrice: 142.53,
        currentPrice: 156.37,
        change: 1.42,
        changePercentage: 0.91,
        weight: 29.89,
        sector: 'Technology',
        transactions: [
          { date: '2023-03-15', type: 'buy', shares: 10, price: 145.32, total: 1453.20 },
          { date: '2023-05-22', type: 'buy', shares: 5, price: 137.15, total: 685.75 }
        ]
      },
      {
        id: 'MSFT',
        name: 'Microsoft Corporation',
        value: 1856.40,
        shares: 6,
        avgBuyPrice: 292.75,
        currentPrice: 309.40,
        change: -2.83,
        changePercentage: -0.91,
        weight: 23.65,
        sector: 'Technology',
        transactions: [
          { date: '2023-02-08', type: 'buy', shares: 6, price: 292.75, total: 1756.50 }
        ]
      },
      {
        id: 'TSLA',
        name: 'Tesla, Inc.',
        value: 1254.20,
        shares: 5,
        avgBuyPrice: 233.76,
        currentPrice: 250.84,
        change: -8.22,
        changePercentage: -3.17,
        weight: 15.98,
        sector: 'Automotive',
        transactions: [
          { date: '2023-04-03', type: 'buy', shares: 5, price: 233.76, total: 1168.80 }
        ]
      },
      {
        id: 'AMZN',
        name: 'Amazon.com, Inc.',
        value: 1482.16,
        shares: 12,
        avgBuyPrice: 128.32,
        currentPrice: 123.51,
        change: -2.28,
        changePercentage: -1.81,
        weight: 18.88,
        sector: 'Consumer Cyclical',
        transactions: [
          { date: '2023-01-22', type: 'buy', shares: 10, price: 132.45, total: 1324.50 },
          { date: '2023-06-05', type: 'buy', shares: 2, price: 110.65, total: 221.30 }
        ]
      },
      {
        id: 'GOOGL',
        name: 'Alphabet Inc.',
        value: 982.00,
        shares: 8,
        avgBuyPrice: 115.43,
        currentPrice: 122.75,
        change: 0.92,
        changePercentage: 0.75,
        weight: 12.52,
        sector: 'Communication Services',
        transactions: [
          { date: '2023-02-18', type: 'buy', shares: 8, price: 115.43, total: 923.44 }
        ]
      }
    ],
    transactions: [
      { date: '2023-06-05', ticker: 'AMZN', type: 'buy', shares: 2, price: 110.65, total: 221.30 },
      { date: '2023-05-22', ticker: 'AAPL', type: 'buy', shares: 5, price: 137.15, total: 685.75 },
      { date: '2023-04-03', ticker: 'TSLA', type: 'buy', shares: 5, price: 233.76, total: 1168.80 },
      { date: '2023-03-15', ticker: 'AAPL', type: 'buy', shares: 10, price: 145.32, total: 1453.20 },
      { date: '2023-02-18', ticker: 'GOOGL', type: 'buy', shares: 8, price: 115.43, total: 923.44 },
      { date: '2023-02-08', ticker: 'MSFT', type: 'buy', shares: 6, price: 292.75, total: 1756.50 },
      { date: '2023-01-22', ticker: 'AMZN', type: 'buy', shares: 10, price: 132.45, total: 1324.50 },
      { date: '2023-01-01', ticker: '', type: 'deposit', shares: 0, price: 0, total: 10000.00 }
    ]
  });

  // Fetch actual stock data from backend (changed from simulation)
  useEffect(() => {
    const fetchRealStockData = async () => {
      try {
        setLoading(true);
        
        // List of popular Indian stocks
        const symbols = [
          'RELIANCE', 'TCS', 'HDFCBANK', 'INFY', 'ICICIBANK',
          'HINDUNILVR', 'ITC', 'SBIN', 'BHARTIARTL', 'KOTAKBANK',
          'WIPRO', 'NIFTY50', 'BANKNIFTY', 'TATAMOTORS', 'MARUTI'
        ];
        
        // Directly fetch from our backend API (which uses yfinance)
        const response = await fetch('/api/stocks/multiple', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ symbols })
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch stock data');
        }
        
        const stocksData = await response.json();
        setMarketStocks(stocksData);
      } catch (error) {
        console.error('Error fetching market stocks:', error);
        // Fallback to simulation if API fails
        const fallbackData = await fetchMultipleStocks([
          'RELIANCE', 'TCS', 'HDFCBANK', 'INFY', 'ICICIBANK',
          'HINDUNILVR', 'ITC', 'SBIN', 'BHARTIARTL', 'KOTAKBANK'
        ]);
        setMarketStocks(fallbackData);
      } finally {
        setLoading(false);
      }
    };
    
    fetchRealStockData();
    
    // Refresh data every 1 minute
    const intervalId = setInterval(() => {
      fetchRealStockData();
    }, 60 * 1000);
    
    return () => clearInterval(intervalId);
  }, []);

  // Load CSV stocks data
  useEffect(() => {
    const loadCSVStocks = async () => {
      try {
        setIsLoadingCSV(true);
        console.log("Loading CSV stocks from public/stocks.csv");
        
        // Use a relative path to access the CSV file correctly
        const response = await fetch('/stocks.csv');
        const csvText = await response.text();
        console.log("CSV loaded, length:", csvText.length);
        
        // Parse CSV manually
        const parsed = parseCSV(csvText);
        console.log("Parsed CSV stocks:", parsed.length);
        
        // Filter out any incomplete data
        const validStocks = parsed.filter(
          stock => stock.SYMBOL && stock['NAME OF COMPANY'] && stock.SECTOR
        );
        console.log("Valid CSV stocks:", validStocks.length);
        
        if (validStocks.length > 0) {
          // Take only the first 100 stocks to avoid performance issues
          const limitedStocks = validStocks.slice(0, 100);
          console.log("Setting CSV stocks:", limitedStocks.length);
          setCsvStocks(limitedStocks);
        } else {
          // If no valid stocks were found, use the fallback data
          console.log("No valid stocks found, using fallback data");
          setCsvStocks(fallbackStocks);
        }
        
        setIsLoadingCSV(false);
      } catch (error) {
        console.error('Error loading CSV file:', error);
        // Use fallback data in case of error
        console.log("Using fallback stock data due to error");
        setCsvStocks(fallbackStocks);
        setIsLoadingCSV(false);
      }
    };
    
    loadCSVStocks();
  }, []);
  
  // Convert CSV stock to StockData format
  const mapCSVStockToStockData = (csvStock: CSVStock): StockData => {
    // Generate a realistic price between 500 and 5000
    const price = Math.floor(Math.random() * 4500) + 500;
    
    // Generate realistic change (-5% to +5%)
    const changePercent = (Math.random() * 10) - 5;
    const change = price * (changePercent / 100);
    
    // Generate realistic volume (10,000 to 1,000,000)
    const volume = `${Math.floor(Math.random() * 990000) + 10000}`;
    
    return {
      symbol: csvStock.SYMBOL,
      name: csvStock['NAME OF COMPANY'],
      price: price,
      change: change,
      changePercentage: changePercent,
      volume: volume,
      marketCap: `₹${(price * (Math.floor(Math.random() * 100000) + 10000) / 10000000).toFixed(2)}M`,
      previousClose: price - (Math.random() * 50) - 25,
      open: price - (Math.random() * 40) - 20,
      dayHigh: price + (Math.random() * 30),
      dayLow: price - (Math.random() * 30),
      yearHigh: price + (Math.random() * 200),
      yearLow: price - (Math.random() * 200),
      sector: csvStock.SECTOR,
      timestamp: new Date()
    };
  };

  // Filter stocks based on search and sector
  const filteredStocks = marketStocks.filter(stock => {
    const matchesSearch = searchTerm === '' || 
      stock.symbol.toLowerCase().includes(searchTerm.toLowerCase()) || 
      stock.name.toLowerCase().includes(searchTerm.toLowerCase());
      
    const matchesSector = selectedSector === null || stock.sector === selectedSector;
    
    return matchesSearch && matchesSector;
  });

  // Filter CSV stocks based on search and sector
  const filteredCsvStocks = csvStocks.filter(stock => {
    const matchesSearch = !csvSearchTerm || 
      stock.SYMBOL.toLowerCase().includes(csvSearchTerm.toLowerCase()) || 
      stock['NAME OF COMPANY'].toLowerCase().includes(csvSearchTerm.toLowerCase());
      
    const matchesSector = !csvSelectedSector || stock.SECTOR === csvSelectedSector;
    
    return matchesSearch && matchesSector;
  });

  // Updated handler that sets showStockDetail flag
  const handleStockSelection = async (stock: StockData) => {
    try {
      // Fetch detailed stock data from backend
      const response = await fetch(`/api/stock/${stock.symbol}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch detailed stock data');
      }
      
      const detailedStock = await response.json();
      setSelectedStock(detailedStock);
      setShowStockDetail(true); // Show detail view
    } catch (error) {
      console.error('Error fetching detailed stock data:', error);
      setSelectedStock(stock);
      setShowStockDetail(true); // Show detail view even if fetch fails
    }
  };

  // New handler for portfolio assets
  const handlePortfolioAssetSelection = (asset: PortfolioStock) => {
    // Create a simplified StockData object from portfolio asset
    const stockDataFromAsset: StockData = {
      symbol: asset.id || '',
      name: asset.name,
      price: asset.currentPrice || 0,
      change: asset.change || 0,
      changePercentage: asset.changePercentage || 0,
      volume: '',
      marketCap: '',
      previousClose: asset.currentPrice || 0,
      open: asset.currentPrice || 0,
      dayHigh: asset.currentPrice || 0,
      dayLow: asset.currentPrice || 0,
      yearHigh: asset.currentPrice || 0,
      yearLow: asset.currentPrice || 0,
      sector: asset.sector || '',
      timestamp: new Date()
    };

    setSelectedStock(asset);
    setTransactionType('sell'); // Default to sell for portfolio assets
    onOpen();
  };

  // Handle back button to return to table view
  const handleBackToMarket = () => {
    setShowStockDetail(false); // Hide detail view but keep selectedStock
  };

  // Function to reload CSV data
  const refreshCSVData = async () => {
    try {
      setIsLoadingCSV(true);
      const response = await fetch('/stocks.csv');
      const csvText = await response.text();
      
      // Parse CSV manually
      const parsed = parseCSV(csvText);
      
      // Filter out any incomplete data
      const validStocks = parsed.filter(
        stock => stock.SYMBOL && stock['NAME OF COMPANY'] && stock.SECTOR
      );
      
      // Take only the first 100 stocks to avoid performance issues
      const limitedStocks = validStocks.slice(0, 100);
      setCsvStocks(limitedStocks);
      setIsLoadingCSV(false);
      setCsvSearchTerm('');
      setCsvSelectedSector('');
    } catch (error) {
      console.error('Error loading CSV file:', error);
      setIsLoadingCSV(false);
    }
  };

  // Enhanced stock selection handler for CSV stocks
  const handleCSVStockSelection = (csvStock: CSVStock) => {
    const stockData = mapCSVStockToStockData(csvStock);
    setSelectedStock(stockData);
    setShowStockDetail(true);
  };

  // Enhanced transaction handler
  const handleTransaction = () => {
    if (!selectedStock) return;
    
    // Create a transaction record
    const stockPrice = (selectedStock as StockData)?.price || (selectedStock as PortfolioStock)?.currentPrice || 0;
    const shares = Math.floor(buyAmount / stockPrice);
    const totalCost = shares * stockPrice;
    
    const date = new Date().toISOString().split('T')[0];
    const ticker = (selectedStock as StockData)?.symbol || (selectedStock as PortfolioStock)?.id || '';
    
    // For a buy transaction
    if (transactionType === 'buy' && ticker) {
      // Update cash balance
      const updatedPortfolio = {
        ...mockPortfolio,
        cash: mockPortfolio.cash - totalCost
      };
      
      // Check if stock already exists in portfolio
      const existingAssetIndex = mockPortfolio.assets.findIndex(asset => asset.id === ticker);
      
      if (existingAssetIndex >= 0) {
        // Update existing asset
        const existingAsset = mockPortfolio.assets[existingAssetIndex];
        const totalShares = (existingAsset.shares || 0) + shares;
        const totalValue = totalShares * stockPrice;
        const avgBuyPrice = ((existingAsset.avgBuyPrice || 0) * (existingAsset.shares || 0) + totalCost) / totalShares;
        
        updatedPortfolio.assets = [
          ...mockPortfolio.assets.slice(0, existingAssetIndex),
          {
            ...existingAsset,
            shares: totalShares,
            avgBuyPrice: avgBuyPrice,
            currentPrice: stockPrice,
            value: totalValue,
            transactions: [
              ...(existingAsset.transactions || []),
              { date, type: 'buy', shares, price: stockPrice, total: totalCost }
            ]
          },
          ...mockPortfolio.assets.slice(existingAssetIndex + 1)
        ];
      } else {
        // Add new asset
        updatedPortfolio.assets = [
          ...mockPortfolio.assets,
          {
            id: ticker,
            name: selectedStock.name,
            value: totalCost,
            shares,
            avgBuyPrice: stockPrice,
            currentPrice: stockPrice,
            change: 0,
            changePercentage: 0,
            weight: (totalCost / updatedPortfolio.totalValue) * 100,
            sector: (selectedStock as StockData)?.sector || '',
            transactions: [
              { date, type: 'buy', shares, price: stockPrice, total: totalCost }
            ]
          }
        ];
      }
      
      // Add to transactions history
      updatedPortfolio.transactions = [
        { date, ticker, type: 'buy', shares, price: stockPrice, total: totalCost },
        ...mockPortfolio.transactions
      ];
      
      // Update total portfolio value
      updatedPortfolio.totalValue = updatedPortfolio.assets.reduce(
        (total, asset) => total + (asset.value || 0), 
        0
      ) + updatedPortfolio.cash;
      
      // Update return percentage
      updatedPortfolio.returnPercentage = ((updatedPortfolio.totalValue - updatedPortfolio.initialInvestment) / updatedPortfolio.initialInvestment) * 100;
      
      // Update mock portfolio state
      setMockPortfolio(updatedPortfolio);
    }
    
    // For a sell transaction (simplified)
    if (transactionType === 'sell' && ticker) {
      // Similar logic for selling would go here
      // For brevity, we're focusing on the buy functionality
    }
    
    // Close modal
    onClose();
    
    // Reset form fields
    setBuyAmount(1000);
    setTransactionType('buy');
  };

  const allocations = [
    { name: 'Technology', value: 53.54, color: '#0EA5E9' },
    { name: 'Automotive', value: 15.98, color: '#F59E0B' },
    { name: 'Consumer Cyclical', value: 18.88, color: '#10B981' },
    { name: 'Communication Services', value: 12.52, color: '#8B5CF6' }
  ];

  // Header gradient for simulator page
  const simulatorGradient = "linear-gradient(135deg, #10B981 0%, #3B82F6 100%)";

  // List of all sectors for filtering
  const sectors = Array.from(new Set(marketStocks.map(stock => stock.sector).filter(Boolean)));

  return (
    <Box minH="100vh" bg="darkBlue.900">
      {/* Custom Page Header */}
      <Box 
        position="fixed" 
        top="0" 
        left="0" 
        right="0" 
        zIndex="999"
        overflow="hidden"
      >
        {/* Background decorative elements */}
        <Box
          position="absolute"
          top="-10px"
          left="-10px"
          right="-10px"
          bottom="-10px"
          bgGradient={simulatorGradient}
          opacity="0.95"
          filter="blur(0px)"
          transform="skewY(-1deg)"
          boxShadow="lg"
        />
        
        {/* Light pattern overlay */}
        <Box
          position="absolute"
          top="0"
          left="0"
          right="0"
          bottom="0"
          opacity="0.1"
          backgroundImage="url('data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')"
        />
        
        {/* Navigation Component */}
        <Navigation />
        
        {/* Decorative investment icon */}
        <MotionBox
          position="absolute"
          top="0"
          right="20px"
          opacity="0.2"
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 0.2, scale: 1 }}
          transition={{ duration: 1 }}
        >
          <Icon as={FiTrendingUp} color="white" boxSize="80px" />
        </MotionBox>
      </Box>
      
      <Box as="main" pt="120px">
        <Container maxW="container.xl" px={4}>
          {/* Header Section with enhanced styling */}
          <Box mb={10} position="relative">
            <MotionBox
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              position="absolute"
              top="-30px"
              left="-10px"
              width="150px"
              height="150px"
              borderRadius="full"
              bg="rgba(16, 185, 129, 0.1)"
              filter="blur(25px)"
              zIndex="-1"
            />
            
            <Heading as="h1" size="xl" mb={4} className="text-gradient" display="inline-flex" alignItems="center">
              <Icon as={FiTrendingUp} mr={3} />
              Virtual Investment Simulator
            </Heading>
            
            <Text fontSize="lg" opacity={0.8} maxW="800px">
              Practice investing without risking real money. Start with ₹10,000 virtual cash, build a portfolio, and track your performance over time.
            </Text>
          </Box>

          {/* Portfolio Summary */}
          <ProtectedFeature
            featureName="Investment Simulator"
            fallback={
              <MotionBox
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="glass-card"
                p={6}
                borderRadius="xl"
                textAlign="center"
                mb={8}
              >
                <Icon as={FiTrendingUp} boxSize={12} color="green.400" mb={4} />
                <Heading size="md" mb={2}>Investment Simulator</Heading>
                <Text mb={4}>Sign in to access our virtual investment simulator and practice trading without risking real money.</Text>
                <Button colorScheme="green">Sign In to Start Investing</Button>
              </MotionBox>
            }
          >
            <MotionBox
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="glass-card"
              p={6}
              mb={8}
            >
              <Grid templateColumns={{ base: "1fr", lg: "1fr 2fr" }} gap={6}>
                <GridItem>
                  <VStack align="stretch" spacing={6}>
                    <Heading size="md">Your Virtual Portfolio</Heading>
                    
                    <Box>
                      <Text color="gray.400">Total Value</Text>
                      <Flex align="baseline">
                        <Heading size="xl">₹{mockPortfolio.totalValue.toLocaleString()}</Heading>
                        <Stat ml={4}>
                          <StatHelpText>
                            <StatArrow type={mockPortfolio.returnPercentage >= 0 ? 'increase' : 'decrease'} />
                            {mockPortfolio.returnPercentage}% overall
                          </StatHelpText>
                        </Stat>
                      </Flex>
                    </Box>
                    
                    <SimpleGrid columns={2} spacing={4}>
                      <Stat>
                        <StatLabel>Cash Available</StatLabel>
                        <StatNumber>₹{mockPortfolio.cash.toLocaleString()}</StatNumber>
                      </Stat>
                      <Stat>
                        <StatLabel>Daily Change</StatLabel>
                        <StatNumber color={mockPortfolio.dailyChange >= 0 ? 'green.400' : 'red.400'}>
                          ₹{Math.abs(mockPortfolio.dailyChange).toLocaleString()}
                        </StatNumber>
                        <StatHelpText>
                          <StatArrow type={mockPortfolio.dailyChange >= 0 ? 'increase' : 'decrease'} />
                          {Math.abs(mockPortfolio.dailyChangePercentage)}%
                        </StatHelpText>
                      </Stat>
                    </SimpleGrid>
                    
                    <Box>
                      <Flex justify="space-between" mb={2}>
                        <Text fontSize="sm">Initial Investment</Text>
                        <Text fontSize="sm">₹{mockPortfolio.initialInvestment.toLocaleString()}</Text>
                      </Flex>
                      <Flex justify="space-between" mb={2}>
                        <Text fontSize="sm">Current Value</Text>
                        <Text fontSize="sm">₹{mockPortfolio.totalValue.toLocaleString()}</Text>
                      </Flex>
                      <Flex justify="space-between" mb={4}>
                        <Text fontSize="sm">Total Return</Text>
                        <Text 
                          fontSize="sm" 
                          fontWeight="bold"
                          color={mockPortfolio.returnPercentage >= 0 ? 'green.400' : 'red.400'}
                        >
                          ₹{(mockPortfolio.totalValue - mockPortfolio.initialInvestment).toLocaleString()} ({mockPortfolio.returnPercentage}%)
                        </Text>
                      </Flex>
                      
                      <Button size="sm" leftIcon={<FiRefreshCw />} variant="outline" width="full">
                        Reset Portfolio
                      </Button>
                    </Box>
                  </VStack>
                </GridItem>
                
                <GridItem>
                  <Flex direction="column" h="100%">
                    <Heading size="md" mb={4}>Portfolio Performance</Heading>
                    <Box flex="1" minH="200px">
                      <StockChart 
                        data={[
                          { date: 'Jan 1', price: 100, volume: 5000000 },
                          { date: 'Feb 1', price: 120, volume: 6200000 },
                          { date: 'Mar 1', price: 110, volume: 4800000 },
                          { date: 'Apr 1', price: 130, volume: 7500000 },
                          { date: 'May 1', price: 150, volume: 8900000 }
                        ]}
                      />
                    </Box>
                    <HStack spacing={6} mt={6} justify="center">
                      <Button size="sm" variant="ghost">1D</Button>
                      <Button size="sm" variant="ghost">1W</Button>
                      <Button size="sm" variant="ghost">1M</Button>
                      <Button size="sm" variant="ghost" colorScheme="blue">3M</Button>
                      <Button size="sm" variant="ghost">YTD</Button>
                      <Button size="sm" variant="ghost">1Y</Button>
                      <Button size="sm" variant="ghost">ALL</Button>
                    </HStack>
                  </Flex>
                </GridItem>
              </Grid>
            </MotionBox>
          </ProtectedFeature>

          {/* Portfolio Details Tabs */}
          <Box mb={10}>
            <Tabs variant="soft-rounded" colorScheme="blue" onChange={(index) => setActiveTab(index)}>
              <TabList mb={6}>
                <Tab>Holdings</Tab>
                <Tab>Transactions</Tab>
                <Tab>Market</Tab>
                <Tab>Allocation</Tab>
              </TabList>

              <TabPanels>
                {/* Holdings Tab */}
                <TabPanel p={0}>
                  <Box className="glass-card" p={0} overflow="hidden">
                    <Box p={4} borderBottom="1px solid" borderColor="whiteAlpha.200">
                      <Flex justify="space-between" align="center">
                        <Heading size="sm">Your Holdings</Heading>
                        <HStack>
                          <Menu>
                            <MenuButton as={Button} size="sm" rightIcon={<FiChevronDown />} variant="outline">
                              Sort By
                            </MenuButton>
                            <MenuList bg="darkBlue.800" borderColor="whiteAlpha.300">
                              <MenuItem>Value (High to Low)</MenuItem>
                              <MenuItem>Value (Low to High)</MenuItem>
                              <MenuItem>Performance (Best First)</MenuItem>
                              <MenuItem>Performance (Worst First)</MenuItem>
                              <MenuItem>Alphabetical</MenuItem>
                            </MenuList>
                          </Menu>
                          <Button size="sm" leftIcon={<FiPlus />} colorScheme="blue" onClick={() => setActiveTab(2)}>
                            Add Stock
                          </Button>
                        </HStack>
                      </Flex>
                    </Box>
                    
                    <Table variant="simple" size="sm">
                      <Thead bg="whiteAlpha.100">
                        <Tr>
                          <Th>Ticker</Th>
                          <Th>Name</Th>
                          <Th isNumeric>Shares</Th>
                          <Th isNumeric>Avg. Price</Th>
                          <Th isNumeric>Current Price</Th>
                          <Th isNumeric>Value</Th>
                          <Th isNumeric>Return</Th>
                          <Th isNumeric>Weight</Th>
                          <Th></Th>
                        </Tr>
                      </Thead>
                      <Tbody>
                        {mockPortfolio.assets.map((asset) => (
                          <Tr key={asset.id} _hover={{ bg: "whiteAlpha.100" }}>
                            <Td fontWeight="bold">{asset.id}</Td>
                            <Td>{asset.name}</Td>
                            <Td isNumeric>{asset.shares}</Td>
                            <Td isNumeric>₹{asset.avgBuyPrice?.toFixed(2) || 'N/A'}</Td>
                            <Td isNumeric>
                              <HStack justify="flex-end" spacing={1}>
                                <Text>₹{asset.currentPrice?.toFixed(2) || 'N/A'}</Text>
                                <Icon 
                                  as={asset.change && asset.change >= 0 ? FiArrowUp : FiArrowDown} 
                                  color={asset.change && asset.change >= 0 ? 'green.400' : 'red.400'}
                                  boxSize={3}
                                />
                              </HStack>
                            </Td>
                            <Td isNumeric>₹{asset.value?.toFixed(2) || 'N/A'}</Td>
                            <Td isNumeric>
                              <Text 
                                color={
                                  asset.currentPrice && asset.currentPrice > (asset.avgBuyPrice || 0) ? 'green.400' : 
                                  asset.currentPrice && asset.currentPrice < (asset.avgBuyPrice || 0) ? 'red.400' : 
                                  'gray.400'
                                }
                              >
                                {(((asset.currentPrice || 0) - (asset.avgBuyPrice || 0)) / (asset.avgBuyPrice || 1) * 100).toFixed(2)}%
                              </Text>
                            </Td>
                            <Td isNumeric>{asset.weight?.toFixed(2)}%</Td>
                            <Td>
                              <Button 
                                size="xs" 
                                variant="ghost" 
                                onClick={() => handlePortfolioAssetSelection(asset)}
                              >
                                Trade
                              </Button>
                            </Td>
                          </Tr>
                        ))}
                      </Tbody>
                    </Table>
                  </Box>
                </TabPanel>

                {/* Transactions Tab */}
                <TabPanel p={0}>
                  <Box className="glass-card" p={0} overflow="hidden">
                    <Box p={4} borderBottom="1px solid" borderColor="whiteAlpha.200">
                      <Flex justify="space-between" align="center">
                        <Heading size="sm">Transaction History</Heading>
                        <HStack>
                          <Menu>
                            <MenuButton as={Button} size="sm" rightIcon={<FiChevronDown />} variant="outline">
                              Filter
                            </MenuButton>
                            <MenuList bg="darkBlue.800" borderColor="whiteAlpha.300">
                              <MenuItem>All Transactions</MenuItem>
                              <MenuItem>Buy Orders</MenuItem>
                              <MenuItem>Sell Orders</MenuItem>
                              <MenuItem>Deposits</MenuItem>
                              <MenuItem>Withdrawals</MenuItem>
                            </MenuList>
                          </Menu>
                          <Button size="sm" leftIcon={<FiCalendar />} variant="outline">
                            Date Range
                          </Button>
                        </HStack>
                      </Flex>
                    </Box>
                    
                    <Table variant="simple" size="sm">
                      <Thead bg="whiteAlpha.100">
                        <Tr>
                          <Th>Date</Th>
                          <Th>Type</Th>
                          <Th>Ticker</Th>
                          <Th isNumeric>Shares</Th>
                          <Th isNumeric>Price</Th>
                          <Th isNumeric>Total</Th>
                        </Tr>
                      </Thead>
                      <Tbody>
                        {mockPortfolio.transactions.map((transaction, index) => (
                          <Tr key={index} _hover={{ bg: "whiteAlpha.100" }}>
                            <Td>{transaction.date}</Td>
                            <Td>
                              <Badge
                                colorScheme={
                                  transaction.type === 'buy' ? 'green' :
                                  transaction.type === 'sell' ? 'red' :
                                  transaction.type === 'deposit' ? 'blue' : 'orange'
                                }
                                borderRadius="full"
                                px={2}
                                py={0.5}
                              >
                                {transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1)}
                              </Badge>
                            </Td>
                            <Td>{transaction.ticker || '-'}</Td>
                            <Td isNumeric>{transaction.shares || '-'}</Td>
                            <Td isNumeric>{transaction.price ? `₹${transaction.price.toFixed(2)}` : '-'}</Td>
                            <Td isNumeric>₹{transaction.total.toFixed(2)}</Td>
                          </Tr>
                        ))}
                      </Tbody>
                    </Table>
                  </Box>
                </TabPanel>

                {/* Market Tab */}
                <TabPanel>
                  <Box>
                    <Flex justify="space-between" align="center" mb={6}>
                      <Heading size="md">Market Stocks</Heading>
                      <Flex align="center">
                        <InputGroup size="sm" maxW="200px" mr={4}>
                          <InputLeftElement pointerEvents="none">
                            <Icon as={FiSearch} color="gray.400" />
                          </InputLeftElement>
                          <Input 
                            placeholder="Search stocks..." 
                            value={csvSearchTerm}
                            onChange={(e) => setCsvSearchTerm(e.target.value)}
                          />
                        </InputGroup>
                        <Select 
                          size="sm" 
                          maxW="150px" 
                          mr={4} 
                          placeholder="All Sectors"
                          value={csvSelectedSector}
                          onChange={(e) => setCsvSelectedSector(e.target.value)}
                        >
                          <option value="">All Sectors</option>
                          <option value="Technology">Technology</option>
                          <option value="Healthcare">Healthcare</option>
                          <option value="Financial Services">Financial Services</option>
                          <option value="Consumer Goods">Consumer Goods</option>
                          <option value="Energy">Energy</option>
                          <option value="RealEstate">Real Estate</option>
                          <option value="Utilities">Utilities</option>
                          <option value="Industrials">Industrials</option>
                          <option value="Materials">Materials</option>
                          <option value="Telecommunications">Telecommunications</option>
                        </Select>
                        <Button
                          size="sm"
                          leftIcon={<Icon as={FiRefreshCw} />}
                          isLoading={isLoadingCSV}
                          onClick={refreshCSVData}
                        >
                          Refresh
                        </Button>
                      </Flex>
                    </Flex>

                    {isLoadingCSV ? (
                      <Flex justify="center" align="center" h="300px">
                        <Spinner size="xl" color="blue.500" />
                        <Text ml={4} color="gray.500">Loading market data...</Text>
                      </Flex>
                    ) : showStockDetail && selectedStock ? (
                      // Stock Detail View
                      <Box className="glass-card" borderRadius="md" p={6}>
                        <Flex justify="space-between" mb={6}>
                          <Heading size="md">{selectedStock.name} ({(selectedStock as StockData)?.symbol || (selectedStock as PortfolioStock)?.id})</Heading>
                          <Button 
                            leftIcon={<Icon as={FiArrowDown} />} 
                            variant="outline" 
                            size="sm"
                            onClick={handleBackToMarket}
                          >
                            Back to Market
                          </Button>
                        </Flex>
                        
                        <Grid templateColumns={{ base: "1fr", lg: "1fr 1fr" }} gap={8} mb={6}>
                          <Box height="450px" p={4} className="glass-card">
                            <StockChart 
                              symbol={(selectedStock as StockData)?.symbol || (selectedStock as PortfolioStock)?.id}
                              companyName={selectedStock.name} 
                              period="3mo"
                            />
                          </Box>
                          
                          <Box p={4} className="glass-card">
                            <SimpleGrid columns={2} spacing={6} mb={6}>
                              <Stat>
                                <StatLabel>Current Price</StatLabel>
                                <StatNumber>₹{((selectedStock as StockData)?.price || (selectedStock as PortfolioStock)?.currentPrice || 0).toFixed(2)}</StatNumber>
                                <StatHelpText>
                                  <StatArrow type={selectedStock?.change && selectedStock.change >= 0 ? 'increase' : 'decrease'} />
                                  {Math.abs(selectedStock?.changePercentage || 0).toFixed(2)}%
                                </StatHelpText>
                              </Stat>
                              
                              <Stat>
                                <StatLabel>Volume</StatLabel>
                                <StatNumber>{(selectedStock as StockData)?.volume || 'N/A'}</StatNumber>
                              </Stat>
                            </SimpleGrid>
                            
                            <Divider my={4} />
                            
                            <SimpleGrid columns={2} spacing={6} mb={6}>
                              <Box>
                                <Text fontWeight="medium" mb={2}>Market Cap</Text>
                                <Text>{(selectedStock as StockData)?.marketCap || 'N/A'}</Text>
                              </Box>
                              <Box>
                                <Text fontWeight="medium" mb={2}>Sector</Text>
                                <Badge
                                  colorScheme={
                                    selectedStock.sector === 'Technology' ? 'blue' :
                                    selectedStock.sector === 'Healthcare' ? 'green' :
                                    selectedStock.sector === 'Financial Services' ? 'purple' :
                                    selectedStock.sector === 'Consumer Goods' ? 'orange' :
                                    selectedStock.sector === 'Energy' ? 'red' :
                                    selectedStock.sector === 'RealEstate' ? 'teal' :
                                    selectedStock.sector === 'Utilities' ? 'cyan' :
                                    selectedStock.sector === 'Industrials' ? 'gray' :
                                    selectedStock.sector === 'Materials' ? 'yellow' :
                                    'pink' // For Telecommunications
                                  }
                                >
                                  {selectedStock.sector || 'N/A'}
                                </Badge>
                              </Box>
                            </SimpleGrid>
                            
                            <Divider my={4} />
                            
                            <Heading size="sm" mb={4}>Trade {(selectedStock as StockData)?.symbol || (selectedStock as PortfolioStock)?.id}</Heading>
                            
                            <Flex direction="column" gap={4}>
                              <Flex>
                                <Button
                                  flex={1} 
                                  colorScheme="green"
                                  mr={2}
                                  leftIcon={<FiTrendingUp />}
                                  onClick={() => {
                                    setTransactionType('buy');
                                    onOpen();
                                  }}
                                >
                                  Buy
                                </Button>
                                <Button 
                                  flex={1} 
                                  colorScheme="red"
                                  leftIcon={<FiTrendingDown />}
                                  onClick={() => {
                                    setTransactionType('sell');
                                    onOpen();
                                  }}
                                >
                                  Sell
                                </Button>
                              </Flex>
                            </Flex>
                          </Box>
                        </Grid>
                      </Box>
                    ) : filteredCsvStocks.length > 0 ? (
                      // Stock Table View
                      <Box overflowX="auto">
                        <Table variant="simple">
                          <Thead>
                            <Tr>
                              <Th>Symbol</Th>
                              <Th>Name</Th>
                              <Th>Sector</Th>
                              <Th isNumeric>Price</Th>
                              <Th isNumeric>Change</Th>
                              <Th>Chart</Th>
                              <Th>Actions</Th>
                            </Tr>
                          </Thead>
                          <Tbody>
                            {filteredCsvStocks.map((stock) => {
                              const stockData = mapCSVStockToStockData(stock);
                              return (
                                <Tr key={stock.SYMBOL}>
                                  <Td>{stock.SYMBOL}</Td>
                                  <Td>{stock['NAME OF COMPANY']}</Td>
                                  <Td>
                                    <Badge colorScheme={
                                      stock.SECTOR === 'Technology' ? 'blue' :
                                      stock.SECTOR === 'Healthcare' ? 'green' :
                                      stock.SECTOR === 'Financial Services' ? 'purple' :
                                      stock.SECTOR === 'Consumer Goods' ? 'orange' :
                                      stock.SECTOR === 'Energy' ? 'red' :
                                      stock.SECTOR === 'RealEstate' ? 'teal' :
                                      stock.SECTOR === 'Utilities' ? 'cyan' :
                                      stock.SECTOR === 'Industrials' ? 'gray' :
                                      stock.SECTOR === 'Materials' ? 'yellow' :
                                      'pink' // For Telecommunications
                                    }>
                                      {stock.SECTOR}
                                    </Badge>
                                  </Td>
                                  <Td isNumeric>₹{stockData.price.toFixed(2)}</Td>
                                  <Td isNumeric>
                                    <Text color={stockData.change >= 0 ? 'green.400' : 'red.400'}>
                                      {stockData.change >= 0 ? '+' : ''}{stockData.change.toFixed(2)} ({stockData.change >= 0 ? '+' : ''}{stockData.changePercentage.toFixed(2)}%)
                                    </Text>
                                  </Td>
                                  <Td width="120px">
                                    <Box h="40px">
                                      <MiniChart 
                                        symbol={stock.SYMBOL} 
                                        isPositive={stockData.change >= 0} 
                                      />
                                    </Box>
                                  </Td>
                                  <Td>
                                    <Button
                                      size="xs"
                                      colorScheme="blue"
                                      onClick={() => handleCSVStockSelection(stock)}
                                    >
                                      Trade
                                    </Button>
                                  </Td>
                                </Tr>
                              );
                            })}
                          </Tbody>
                        </Table>
                      </Box>
                    ) : (
                      // No stocks found
                      <Box textAlign="center" p={10}>
                        <Icon as={FiAlertCircle} boxSize={10} color="gray.500" mb={4} />
                        <Heading size="md" mb={2}>No Stocks Found</Heading>
                        <Text>We couldn't find any stocks matching your criteria. Please try adjusting your filters.</Text>
                        <Button mt={4} onClick={refreshCSVData} leftIcon={<FiRefreshCw />}>
                          Refresh Data
                        </Button>
                      </Box>
                    )}
                  </Box>
                </TabPanel>

                {/* Allocation Tab */}
                <TabPanel p={0}>
                  <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                    <Box className="glass-card" p={6}>
                      <Heading size="sm" mb={6}>Sector Allocation</Heading>
                      <Flex direction="column" align="center">
                        <Box height="250px" width="250px" mb={6}>
                          {/* This would be a pie chart in a full implementation */}
                          <StockChart />
                        </Box>
                        
                        <VStack spacing={2} align="stretch" width="100%">
                          {allocations.map((item) => (
                            <Flex key={item.name} justify="space-between" align="center">
                              <Flex align="center">
                                <Box 
                                  width="12px" 
                                  height="12px" 
                                  borderRadius="full" 
                                  bg={item.color} 
                                  mr={2} 
                                />
                                <Text fontSize="sm">{item.name}</Text>
                              </Flex>
                              <Text fontSize="sm" fontWeight="medium">{item.value}%</Text>
                            </Flex>
                          ))}
                        </VStack>
                      </Flex>
                    </Box>

                    <Box className="glass-card" p={6}>
                      <Heading size="sm" mb={6}>Risk Analysis</Heading>
                      <VStack spacing={6} align="stretch">
                        <Box>
                          <Flex justify="space-between" mb={2}>
                            <Text fontSize="sm">Portfolio Risk Level</Text>
                            <Text fontSize="sm" fontWeight="medium">Moderate</Text>
                          </Flex>
                          <Progress value={65} size="sm" colorScheme="orange" borderRadius="full" />
                        </Box>
                        
                        <Box>
                          <Flex justify="space-between" mb={2}>
                            <Text fontSize="sm">Diversification Score</Text>
                            <Text fontSize="sm" fontWeight="medium">7.5/10</Text>
                          </Flex>
                          <Progress value={75} size="sm" colorScheme="blue" borderRadius="full" />
                        </Box>
                        
                        <Box>
                          <Text fontSize="sm" mb={4}>Recommendations to Improve Portfolio</Text>
                          <VStack spacing={3} align="stretch">
                            <Flex className="glass-card" p={3} borderLeft="4px solid" borderColor="yellow.400">
                              <Icon as={FiAlertCircle} color="yellow.400" mr={3} mt={0.5} />
                              <Text fontSize="sm">Consider adding more defensive stocks to balance your technology-heavy portfolio.</Text>
                            </Flex>
                            <Flex className="glass-card" p={3} borderLeft="4px solid" borderColor="blue.400">
                              <Icon as={FiAlertCircle} color="blue.400" mr={3} mt={0.5} />
                              <Text fontSize="sm">Your portfolio has potential for high growth but also increased volatility.</Text>
                            </Flex>
                            <Flex className="glass-card" p={3} borderLeft="4px solid" borderColor="green.400">
                              <Icon as={FiAlertCircle} color="green.400" mr={3} mt={0.5} />
                              <Text fontSize="sm">Explore adding fixed-income assets to reduce overall portfolio risk.</Text>
                            </Flex>
                          </VStack>
                        </Box>
                      </VStack>
                    </Box>
                  </SimpleGrid>
                </TabPanel>
              </TabPanels>
            </Tabs>
          </Box>
        </Container>
      </Box>

      {/* Stock Transaction Modal - Increased size for better layout */}
      {selectedStock && (
        <Modal isOpen={isOpen} onClose={onClose} size="xl">
          <ModalOverlay backdropFilter="blur(10px)" />
          <ModalContent bg="darkBlue.800" color="white" maxW="1000px">
            <ModalHeader>
              <Flex align="center">
                <Text>{selectedStock?.name} ({(selectedStock as StockData)?.symbol || (selectedStock as PortfolioStock)?.id})</Text>
              </Flex>
            </ModalHeader>
            <ModalCloseButton />

            <ModalBody>
              <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={6} mb={6}>
                <Box>
                  <Text color="gray.400" mb={1}>Current Price</Text>
                  <Flex align="center">
                    <Heading size="md">₹{((selectedStock as StockData)?.price || (selectedStock as PortfolioStock)?.currentPrice || 0).toFixed(2)}</Heading>
                    <Badge ml={2} colorScheme={selectedStock?.change && selectedStock.change >= 0 ? 'green' : 'red'}>
                      {selectedStock?.change && selectedStock.change >= 0 ? '+' : ''}{selectedStock?.changePercentage && Math.abs(selectedStock.changePercentage).toFixed(2)}%
                    </Badge>
                  </Flex>
                  
                  {(selectedStock as StockData)?.previousClose && (
                    <Box mt={4}>
                      <Text color="gray.400" mb={1}>Previous Close</Text>
                      <Heading size="md">₹{(selectedStock as StockData).previousClose.toFixed(2)}</Heading>
                    </Box>
                  )}
                </Box>
                
                <Box>
                  <Text color="gray.400" mb={2}>Market Information</Text>
                  <SimpleGrid columns={2} spacing={3}>
                    <Box>
                      <Text fontSize="xs" color="gray.500">Volume</Text>
                      <Text fontSize="sm">{(selectedStock as StockData)?.volume || 'N/A'}</Text>
                    </Box>
                    <Box>
                      <Text fontSize="xs" color="gray.500">Market Cap</Text>
                      <Text fontSize="sm">{(selectedStock as StockData)?.marketCap || 'N/A'}</Text>
                    </Box>
                    <Box>
                      <Text fontSize="xs" color="gray.500">Day Range</Text>
                      <Text fontSize="sm">
                        {(selectedStock as StockData)?.dayLow && (selectedStock as StockData)?.dayHigh ? 
                          `₹${(selectedStock as StockData).dayLow.toFixed(2)} - ₹${(selectedStock as StockData).dayHigh.toFixed(2)}` : 
                          'N/A'}
                      </Text>
                    </Box>
                    <Box>
                      <Text fontSize="xs" color="gray.500">52W Range</Text>
                      <Text fontSize="sm">
                        {(selectedStock as StockData)?.yearLow && (selectedStock as StockData)?.yearHigh ? 
                          `₹${(selectedStock as StockData).yearLow.toFixed(2)} - ₹${(selectedStock as StockData).yearHigh.toFixed(2)}` : 
                          'N/A'}
                      </Text>
                    </Box>
                  </SimpleGrid>
                </Box>
              </Grid>
              
              <Box height="300px" mb={6}>
                <StockChart 
                  symbol={(selectedStock as StockData)?.symbol || (selectedStock as PortfolioStock)?.id}
                  companyName={selectedStock?.name}
                  period="1mo"
                />
              </Box>
              
              <Divider my={4} borderColor="whiteAlpha.300" />
              
              <Heading size="sm" mb={4}>Place Order</Heading>
              
              <HStack mb={4}>
                <Button 
                  flex={1} 
                  colorScheme={transactionType === 'buy' ? 'green' : 'gray'}
                  variant={transactionType === 'buy' ? 'solid' : 'outline'}
                  onClick={() => setTransactionType('buy')}
                  leftIcon={<FiTrendingUp />}
                >
                  Buy
                </Button>
                <Button 
                  flex={1} 
                  colorScheme={transactionType === 'sell' ? 'red' : 'gray'}
                  variant={transactionType === 'sell' ? 'solid' : 'outline'}
                  onClick={() => setTransactionType('sell')}
                  leftIcon={<FiTrendingDown />}
                >
                  Sell
                </Button>
              </HStack>
              
              <FormControl mb={4}>
                <FormLabel>Amount to {transactionType === 'buy' ? 'Invest' : 'Sell'}</FormLabel>
                <NumberInput 
                  value={buyAmount}
                  onChange={(valueString) => setBuyAmount(parseFloat(valueString))}
                  min={100}
                  max={mockPortfolio.cash}
                >
                  <NumberInputField />
                </NumberInput>
              </FormControl>
              
              <FormControl mb={4}>
                <FormLabel>Order Type</FormLabel>
                <Select defaultValue="market" bg="whiteAlpha.100">
                  <option value="market">Market Order</option>
                  <option value="limit">Limit Order</option>
                  <option value="stop">Stop Order</option>
                </Select>
              </FormControl>
              
              <Box p={4} bg="whiteAlpha.100" borderRadius="md" mb={4}>
                <Flex justify="space-between" mb={2}>
                  <Text fontSize="sm">Estimated Shares</Text>
                  <Text fontSize="sm" fontWeight="bold">
                    {selectedStock && (selectedStock.price || (selectedStock as PortfolioStock).currentPrice) 
                      ? Math.floor(buyAmount / (selectedStock.price || (selectedStock as PortfolioStock).currentPrice || 1))
                      : 0} shares
                  </Text>
                </Flex>
                <Flex justify="space-between" mb={2}>
                  <Text fontSize="sm">Share Price</Text>
                  <Text fontSize="sm">₹{
                    selectedStock 
                      ? ((selectedStock.price || (selectedStock as PortfolioStock).currentPrice) || 0).toFixed(2)
                      : 'N/A'
                  }</Text>
                </Flex>
                <Flex justify="space-between" mb={2}>
                  <Text fontSize="sm">Estimated Cost</Text>
                  <Text fontSize="sm">₹{
                    selectedStock && (selectedStock.price || (selectedStock as PortfolioStock).currentPrice)
                      ? (Math.floor(buyAmount / (selectedStock.price || (selectedStock as PortfolioStock).currentPrice || 1)) 
                         * (selectedStock.price || (selectedStock as PortfolioStock).currentPrice || 0)).toFixed(2)
                      : '0.00'
                  }</Text>
                </Flex>
                <Divider my={2} borderColor="whiteAlpha.300" />
                <Flex justify="space-between">
                  <Text fontSize="sm" fontWeight="bold">Remaining Cash</Text>
                  <Text fontSize="sm" fontWeight="bold">
                    ₹{
                      selectedStock && (selectedStock.price || (selectedStock as PortfolioStock).currentPrice)
                        ? (mockPortfolio.cash - (Math.floor(buyAmount / (selectedStock.price || (selectedStock as PortfolioStock).currentPrice || 1)) 
                           * (selectedStock.price || (selectedStock as PortfolioStock).currentPrice || 0))).toFixed(2)
                        : mockPortfolio.cash.toFixed(2)
                    }
                  </Text>
                </Flex>
              </Box>
            </ModalBody>

            <ModalFooter>
              <Button mr={3} onClick={onClose} variant="ghost">
                Cancel
              </Button>
              <Button 
                colorScheme={transactionType === 'buy' ? 'green' : 'red'} 
                onClick={handleTransaction}
              >
                {transactionType === 'buy' ? 'Buy' : 'Sell'} {selectedStock.symbol}
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      )}
    </Box>
  );
};

export default SimulatorPage; 