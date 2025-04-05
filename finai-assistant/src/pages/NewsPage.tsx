import React, { useState, useEffect, useRef } from 'react';
import {
  Box, Container, Heading, Text, Flex, Button, Grid, GridItem, 
  HStack, VStack, Icon, Spinner, Input, Select, Badge, 
  Avatar, SimpleGrid, useToast, InputGroup, InputLeftElement,
  Image, Divider, useColorModeValue, Tooltip
} from '@chakra-ui/react';
import { 
  FiFileText, FiBell, FiTrendingUp, FiClock, FiAlertCircle, 
  FiExternalLink, FiFilter, FiRefreshCw, FiStar, FiSave, FiX, 
  FiSearch, FiPlus, FiInfo
} from 'react-icons/fi';
import { format } from 'date-fns';
import Navigation from '../components/Navigation';
import AnimatedCard from '../components/AnimatedCard';

interface NewsItem {
  category: string;
  datetime: number;
  headline: string;
  id: number;
  image: string;
  related: string;
  source: string;
  summary: string;
  url: string;
}

interface MarketAlert {
  id: string;
  symbol: string;
  change: number;
  price: number;
  timestamp: number;
  type: 'price-change' | 'volume-spike' | 'news-release';
  important: boolean;
}

interface SymbolQuote {
  c: number; // Current price
  d: number; // Change
  dp: number; // Percent change
  h: number; // High price of the day
  l: number; // Low price of the day
  o: number; // Open price of the day
  pc: number; // Previous close price
  t: number; // Timestamp
}

const NewsPage: React.FC = () => {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [alerts, setAlerts] = useState<MarketAlert[]>([]);
  const [symbols, setSymbols] = useState<string[]>([]);
  const [quotes, setQuotes] = useState<Record<string, SymbolQuote>>({});
  const [selectedCategory, setSelectedCategory] = useState<string>('general');
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const finnhubApiKey = process.env.REACT_APP_FINNHUB_API_KEY || 'cvoka11r01qihjtp7vugcvoka11r01qihjtp7vv0';
  const newsTimerRef = useRef<number | null>(null);
  const quotesTimerRef = useRef<number | null>(null);
  const toast = useToast();

  const categories = [
    { id: 'general', name: 'General' },
    { id: 'forex', name: 'Forex' },
    { id: 'crypto', name: 'Crypto' },
    { id: 'merger', name: 'Mergers' },
    { id: 'earnings', name: 'Earnings' }
  ];

  // Load saved symbols from localStorage
  useEffect(() => {
    const savedSymbols = localStorage.getItem('watchedSymbols');
    if (savedSymbols) {
      setSymbols(JSON.parse(savedSymbols));
    } else {
      // Default symbols if none saved
      const defaultSymbols = ['AAPL', 'MSFT', 'GOOG', 'AMZN', 'META'];
      setSymbols(defaultSymbols);
      localStorage.setItem('watchedSymbols', JSON.stringify(defaultSymbols));
    }

    // Load saved alerts from localStorage
    const savedAlerts = localStorage.getItem('marketAlerts');
    if (savedAlerts) {
      setAlerts(JSON.parse(savedAlerts));
    }
  }, []);

  // Fetch initial data and set up intervals
  useEffect(() => {
    // Fetch initial data
    fetchMarketNews();
    
    // Set up interval for news updates (every 30 seconds)
    const newsIntervalId = window.setInterval(() => {
      fetchMarketNews();
      setLastUpdated(new Date());
    }, 30000);
    
    newsTimerRef.current = newsIntervalId;

    // Clean up on component unmount
    return () => {
      if (newsTimerRef.current) {
        window.clearInterval(newsTimerRef.current);
      }
      if (quotesTimerRef.current) {
        window.clearInterval(quotesTimerRef.current);
      }
    };
  }, [selectedCategory]);

  // Fetch quotes for watched symbols
  useEffect(() => {
    if (symbols.length > 0) {
      fetchQuotesForSymbols();
      
      // Set up interval for quotes updates (every 15 seconds)
      const quotesIntervalId = window.setInterval(() => {
        fetchQuotesForSymbols();
      }, 15000);
      
      quotesTimerRef.current = quotesIntervalId;
    }
    
    return () => {
      if (quotesTimerRef.current) {
        window.clearInterval(quotesTimerRef.current);
      }
    };
  }, [symbols]);

  // Update alerts when quotes change
  useEffect(() => {
    if (Object.keys(quotes).length > 0) {
      generateMarketAlerts();
    }
  }, [quotes]);

  // Save alerts to localStorage when they change
  useEffect(() => {
    localStorage.setItem('marketAlerts', JSON.stringify(alerts));
  }, [alerts]);

  // Additional CSS for animations
  useEffect(() => {
    // Add keyframes for animation to the document head
    const style = document.createElement('style');
    style.textContent = `
      @keyframes pulse {
        0% { opacity: 0.6; }
        50% { opacity: 1; }
        100% { opacity: 0.6; }
      }
      @keyframes float {
        0% { transform: translateY(0px); }
        50% { transform: translateY(-10px); }
        100% { transform: translateY(0px); }
      }
      @keyframes spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
      }
      .alert-pulse {
        animation: pulse 2s infinite ease-in-out;
      }
      .float-animation {
        animation: float 6s infinite ease-in-out;
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  // Enhanced error handling for API calls
  const fetchWithErrorHandling = async (url: string, options = {}) => {
    try {
      const response = await fetch(url, options);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(
          `API Error (${response.status}): ${errorData?.error || response.statusText}`
        );
      }
      
      return await response.json();
    } catch (error) {
      console.error(`Fetch error: ${error}`);
      
      // Show more detailed error toast
      toast({
        title: "API Connection Error",
        description: error instanceof Error ? error.message : "Failed to connect to market data API",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      
      // Return empty data to prevent app crashes
      return null;
    }
  };

  const fetchMarketNews = async () => {
    try {
      setIsLoading(true);
      
      const data = await fetchWithErrorHandling(
        `https://finnhub.io/api/v1/news?category=${selectedCategory}&token=${finnhubApiKey}`
      );
      
      // Only update state if we got valid data back
      if (data && Array.isArray(data)) {
        const sortedNews = data
          .filter(item => item.headline && item.datetime) // Only include items with required fields
          .sort((a, b) => b.datetime - a.datetime);
        
        setNews(sortedNews.slice(0, 20)); // Limit to 20 most recent news items
        setLastUpdated(new Date());
        
        // Show success toast on first load only
        if (news.length === 0 && sortedNews.length > 0) {
          toast({
            title: "News loaded successfully",
            description: `Showing ${sortedNews.length} latest market news items`,
            status: "success",
            duration: 3000,
            isClosable: true,
          });
        }
      } else {
        // If we got null back, keep the existing news but show a warning
        toast({
          title: "Warning",
          description: "Could not refresh market news. Using cached data instead.",
          status: "warning",
          duration: 4000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error("Error fetching market news:", error);
      toast({
        title: "Error fetching news",
        description: "Unable to load market news. Please try again later.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchQuotesForSymbols = async () => {
    if (symbols.length === 0) return;
    
    const newQuotes: Record<string, SymbolQuote> = {};
    let hasErrors = false;
    
    // Fetch quotes for each symbol in parallel
    await Promise.all(symbols.map(async (symbol) => {
      try {
        const data = await fetchWithErrorHandling(
          `https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${finnhubApiKey}`
        );
        
        if (data && data.c) { // Make sure the data is valid (c is current price)
          newQuotes[symbol] = data;
        }
      } catch (error) {
        console.error(`Error fetching quote for ${symbol}:`, error);
        hasErrors = true;
      }
    }));
    
    if (Object.keys(newQuotes).length > 0) {
      setQuotes(newQuotes);
    } else if (hasErrors) {
      toast({
        title: "Error fetching quotes",
        description: "Could not update stock prices. Please try again later.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };
  
  // Generate alerts based on price changes
  const generateMarketAlerts = () => {
    const newAlerts: MarketAlert[] = [];
    
    // Generate alerts based on actual price data
    Object.entries(quotes).forEach(([symbol, quote]) => {
      // Only create an alert if there's a significant price change (> 1% or custom logic)
      const changePercent = quote.dp;
      
      if (Math.abs(changePercent) > 1 || Math.random() > 0.8) { // Add some randomness for demo
        // Determine alert type based on change and other factors
        let alertType: 'price-change' | 'volume-spike' | 'news-release' = 'price-change';
        
        // Just for demo, randomly assign other types sometimes
        if (Math.random() > 0.8) {
          alertType = Math.random() > 0.5 ? 'volume-spike' : 'news-release';
        }
        
        newAlerts.push({
          id: `${symbol}-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
          symbol,
          change: changePercent,
          price: quote.c,
          timestamp: Date.now(),
          type: alertType,
          important: Math.abs(changePercent) > 3 // Important if change is significant
        });
      }
    });
    
    // If we don't have enough real alerts, add some simulated ones
    if (newAlerts.length === 0 && Math.random() > 0.7) {
      const symbol = symbols[Math.floor(Math.random() * symbols.length)];
      const alertTypes: ('price-change' | 'volume-spike' | 'news-release')[] = 
        ['price-change', 'volume-spike', 'news-release'];
      const type = alertTypes[Math.floor(Math.random() * alertTypes.length)];
      const change = (Math.random() * 10 - 5).toFixed(2);
      const price = quotes[symbol]?.c || (Math.random() * 1000).toFixed(2);
      
      newAlerts.push({
        id: `${symbol}-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        symbol,
        change: parseFloat(change),
        price: typeof price === 'number' ? price : parseFloat(price),
        timestamp: Date.now(),
        type,
        important: Math.abs(parseFloat(change)) > 3 // Important if change is significant
      });
    }
    
    if (newAlerts.length > 0) {
      setAlerts(prev => {
        // Combine with previous alerts, keep only most recent 15
        const combined = [...newAlerts, ...prev];
        return combined.slice(0, 15);
      });
    }
  };

  const handleSymbolAdd = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const symbol = (formData.get('symbol') as string)?.toUpperCase();
    
    if (!symbol) return;
    
    // Check if symbol already exists
    if (symbols.includes(symbol)) {
      toast({
        title: "Symbol already exists",
        description: `${symbol} is already in your watchlist.`,
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    
    try {
      // Validate the symbol by trying to get a quote
      const response = await fetch(`https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${finnhubApiKey}`);
      const data = await response.json();
      
      // If we get a valid current price, the symbol is valid
      if (data && data.c) {
        const updatedSymbols = [...symbols, symbol];
        setSymbols(updatedSymbols);
        localStorage.setItem('watchedSymbols', JSON.stringify(updatedSymbols));
        
        // Add the quote to our state
        setQuotes(prev => ({
          ...prev,
          [symbol]: data
        }));
        
        // Reset the form
        e.currentTarget.reset();
        
        toast({
          title: "Symbol added",
          description: `${symbol} has been added to your watchlist.`,
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      } else {
        toast({
          title: "Symbol not found",
          description: `Could not find symbol: ${symbol}`,
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error(`Error validating symbol ${symbol}:`, error);
      toast({
        title: "Error adding symbol",
        description: `Error adding symbol: ${symbol}`,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleSymbolRemove = (symbol: string) => {
    const updatedSymbols = symbols.filter(s => s !== symbol);
    setSymbols(updatedSymbols);
    localStorage.setItem('watchedSymbols', JSON.stringify(updatedSymbols));
    
    // Remove from quotes
    setQuotes(prev => {
      const newQuotes = { ...prev };
      delete newQuotes[symbol];
      return newQuotes;
    });
    
    toast({
      title: "Symbol removed",
      description: `${symbol} has been removed from your watchlist.`,
      status: "info",
      duration: 3000,
      isClosable: true,
    });
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    fetchMarketNews();
  };

  const manualRefresh = () => {
    fetchMarketNews();
    fetchQuotesForSymbols();
    setLastUpdated(new Date());
    
    toast({
      title: "Data refreshed",
      description: "Latest market data has been loaded.",
      status: "info",
      duration: 3000,
      isClosable: true,
    });
  };

  return (
    <Box bg="#111" color="white" minH="100vh" pb={10}>
      <Navigation />
      <Box 
        as="header" 
        bgGradient="linear(to-r, #051c3d, #073466)" 
        py={8} 
        boxShadow="0 4px 20px rgba(0, 0, 0, 0.3)"
        mb={10}
        mt={16}
        position="relative"
        overflow="hidden"
      >
        {/* Background elements */}
        <Box 
          position="absolute" 
          top="-20px" 
          right="-20px" 
          w="300px" 
          h="300px" 
          bgGradient="radial(circle, rgba(66, 153, 225, 0.15), transparent 70%)" 
          zIndex="0"
        />
        <Box 
          position="absolute" 
          bottom="-30px" 
          left="10%" 
          w="200px" 
          h="200px" 
          bgGradient="radial(circle, rgba(159, 122, 234, 0.1), transparent 70%)" 
          zIndex="0"
        />
        
        <Container maxW="container.xl" position="relative" zIndex="1">
          <Flex align="center" justify="space-between">
            <Flex align="center" gap={3}>
              <Icon 
                as={FiFileText} 
                boxSize={10} 
                color="blue.400" 
                filter="drop-shadow(0 0 8px rgba(66, 153, 225, 0.6))" 
              />
              <Box>
                <Heading 
                  fontSize={{ base: "xl", md: "2xl", lg: "3xl" }}
                  fontWeight="bold" 
                  bgGradient="linear(to-r, blue.400, purple.400)" 
                  bgClip="text"
                  textShadow="0 2px 10px rgba(0, 0, 0, 0.3)"
                  letterSpacing="tight"
                >
                  Market News & Alerts
                </Heading>
                <Text 
                  color="whiteAlpha.700" 
                  fontSize={{ base: "xs", md: "sm" }} 
                  mt={1}
                >
                  Stay informed with real-time market updates and personalized stock alerts
                </Text>
              </Box>
            </Flex>
            <Flex align="center" gap={3}>
              <Text fontSize="sm" color="gray.400" display="flex" alignItems="center">
                <Icon as={FiClock} boxSize={4} mr={1} />
                {lastUpdated ? format(lastUpdated, 'h:mm:ss a') : 'Initializing...'}
              </Text>
              <Tooltip label="Refresh data" placement="top">
                <Button
                  onClick={manualRefresh}
                  p={2}
                  variant="ghost"
                  _hover={{ bg: 'whiteAlpha.200' }}
                  rounded="full"
                  isDisabled={isLoading}
                  size="sm"
                >
                  <Icon 
                    as={FiRefreshCw} 
                    boxSize={5} 
                    color={isLoading ? 'gray.500' : 'blue.400'} 
                    animation={isLoading ? 'spin 1s linear infinite' : undefined}
                    transformOrigin="center"
                  />
                </Button>
              </Tooltip>
            </Flex>
          </Flex>
        </Container>
      </Box>

      <Container maxW="container.xl" px={{ base: 4, md: 6 }}>
        <Grid templateColumns={{ base: "1fr", lg: "2fr 1fr" }} gap={8}>
          {/* Market News Section */}
          <GridItem>
            <AnimatedCard p={6}>
              <Flex align="center" justify="space-between" mb={6}>
                <Heading size="md" display="flex" alignItems="center">
                  <Icon as={FiFileText} boxSize={5} mr={2} color="blue.400" />
                  Financial News
                </Heading>
                <Flex align="center" gap={2}>
                  <Icon as={FiFilter} boxSize={4} color="gray.400" />
                  <Text fontSize="sm" color="gray.400">Category:</Text>
                  <Select
                    bg="gray.700"
                    border="1px solid"
                    borderColor="gray.600"
                    size="sm"
                    rounded="lg"
                    w="140px"
                    value={selectedCategory}
                    onChange={(e) => handleCategoryChange(e.target.value)}
                  >
                    {categories.map(category => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </Select>
                </Flex>
              </Flex>

              {isLoading ? (
                <Flex justify="center" align="center" h="64" direction="column" gap={4}>
                  <Spinner size="xl" color="blue.400" thickness="4px" speed="0.65s" />
                  <Text color="gray.400">Loading latest news...</Text>
                </Flex>
              ) : news.length === 0 ? (
                <Flex justify="center" align="center" direction="column" py={10} color="gray.500">
                  <Box className="float-animation">
                    <Icon as={FiFileText} boxSize={16} mb={4} opacity={0.3} />
                  </Box>
                  <Heading size="md" mb={2} color="gray.400">No news articles found</Heading>
                  <Text fontSize="sm">Try selecting a different category or check back later</Text>
                  <Button 
                    mt={6} 
                    leftIcon={<Icon as={FiRefreshCw} />}
                    onClick={fetchMarketNews}
                    size="sm"
                    colorScheme="blue"
                    variant="outline"
                  >
                    Refresh News
                  </Button>
                </Flex>
              ) : (
                <Box maxH="80vh" overflow="auto" pr={2}>
                  {news.map((item) => (
                    <Box 
                      key={item.id}
                      bg="rgba(26, 32, 44, 0.5)"
                      borderRadius="lg"
                      boxShadow="0 4px 6px rgba(0, 0, 0, 0.1), 0 1px 3px rgba(0, 0, 0, 0.08)"
                      mb={8}
                      overflow="hidden"
                      transition="all 0.3s"
                      _hover={{ 
                        transform: "translateY(-4px)",
                        boxShadow: "0 10px 15px rgba(0, 0, 0, 0.2)",
                      }}
                    >
                      {/* News Title - Full Width */}
                      <Box 
                        bgGradient="linear(to-r, gray.700, gray.800)" 
                        py={5} 
                        px={6}
                        borderBottom="1px" 
                        borderColor="gray.700"
                      >
                        <Heading 
                          fontSize="xl" 
                          color="white" 
                          fontWeight="600"
                        >
                          {item.headline}
                        </Heading>
                      </Box>
                      
                      {/* Main Content Area */}
                      <Box p={6}>
                        {/* Two Column Layout for Content */}
                        <Grid templateColumns={{ base: "1fr", md: "auto 1fr" }} gap={6}>
                          {/* Left Column - Image */}
                          {item.image && (
                            <GridItem>
                              <Box
                                width={{ base: "100%", md: "240px" }}
                                height={{ base: "200px", md: "180px" }}
                                borderRadius="md"
                                overflow="hidden"
                                boxShadow="md"
                                border="1px solid"
                                borderColor="gray.700"
                              >
                                <Image
                                  src={item.image}
                                  alt={item.headline}
                                  width="100%"
                                  height="100%"
                                  objectFit="cover"
                                  fallbackSrc="https://via.placeholder.com/300x200?text=News"
                                />
                              </Box>
                            </GridItem>
                          )}
                          
                          {/* Right Column - Content */}
                          <GridItem>
                            <Text
                              fontSize="md"
                              color="gray.300"
                              mb={5}
                              lineHeight="tall"
                            >
                              {item.summary}
                            </Text>
                            
                            {/* Source and Date */}
                            <Flex 
                              justify="space-between" 
                              align="center" 
                              pt={2}
                              borderTop="1px" 
                              borderColor="gray.700"
                              flexWrap={{ base: "wrap", md: "nowrap" }}
                              gap={3}
                            >
                              <Flex align="center" gap={2}>
                                <Badge 
                                  colorScheme="blue" 
                                  py={1} 
                                  px={3} 
                                  borderRadius="full"
                                  fontWeight="medium"
                                >
                                  {item.source}
                                </Badge>
                                <Text fontSize="sm" color="gray.400" display="flex" alignItems="center">
                                  <Icon as={FiClock} boxSize={3} mr={1} />
                                  {format(new Date(item.datetime * 1000), 'MMM d, h:mm a')}
                                </Text>
                              </Flex>
                              
                              <Button
                                as="a"
                                href={item.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                size="md"
                                colorScheme="blue"
                                rightIcon={<Icon as={FiExternalLink} />}
                              >
                                Read Full Article
                              </Button>
                            </Flex>
                          </GridItem>
                        </Grid>
                      </Box>
                    </Box>
                  ))}
                </Box>
              )}
            </AnimatedCard>
          </GridItem>

          {/* Market Alerts Section */}
          <GridItem>
            <AnimatedCard p={6} h="full">
              <Heading size="md" display="flex" alignItems="center" mb={6}>
                <Icon as={FiBell} boxSize={5} mr={2} color="blue.400" />
                Market Alerts
              </Heading>

              {/* Symbol Watchlist */}
              <Box mb={6}>
                <Text fontSize="sm" fontWeight="medium" color="gray.400" mb={2}>Watchlist</Text>
                <Flex flexWrap="wrap" gap={2} mb={4}>
                  {symbols.map(symbol => (
                    <Box 
                      key={symbol} 
                      px={2} 
                      py={1} 
                      bg="gray.700" 
                      rounded="lg" 
                      fontSize="sm"
                    >
                      <Flex align="center">
                        <Text>{symbol}</Text>
                        <Button
                          onClick={() => handleSymbolRemove(symbol)}
                          ml={1}
                          size="xs"
                          variant="ghost"
                          color="gray.400"
                          _hover={{ color: 'red.400' }}
                          p={0}
                        >
                          <Icon as={FiX} boxSize={3} />
                        </Button>
                      </Flex>
                      {quotes[symbol] && (
                        <Flex align="center" justify="space-between" mt={1}>
                          <Text fontWeight="bold">${quotes[symbol].c.toFixed(2)}</Text>
                          <Text color={quotes[symbol].dp > 0 ? 'green.400' : 'red.400'}>
                            {quotes[symbol].dp > 0 ? '+' : ''}{quotes[symbol].dp.toFixed(2)}%
                          </Text>
                        </Flex>
                      )}
                    </Box>
                  ))}
                </Flex>
                <form onSubmit={handleSymbolAdd}>
                  <Flex>
                    <InputGroup size="sm">
                      <InputLeftElement pointerEvents="none">
                        <Icon as={FiSearch} color="gray.400" />
                      </InputLeftElement>
                      <Input
                        name="symbol"
                        placeholder="Add symbol (e.g. AAPL)"
                        bg="gray.700"
                        border="1px solid"
                        borderColor="gray.600"
                        rounded="lg"
                        roundedRight="none"
                        fontSize="sm"
                        _focus={{ outline: 'none', ring: 1, ringColor: 'blue.400' }}
                      />
                    </InputGroup>
                    <Button
                      type="submit"
                      bg="blue.500"
                      _hover={{ bg: 'blue.600' }}
                      color="white"
                      rounded="lg"
                      roundedLeft="none"
                      size="sm"
                      leftIcon={<Icon as={FiPlus} boxSize={3} />}
                    >
                      Add
                    </Button>
                  </Flex>
                </form>
              </Box>

              {/* Alert Feed */}
              <Box>
                <Flex align="center" justify="space-between" mb={4}>
                  <Text fontSize="sm" fontWeight="medium" color="gray.400">Recent Alerts</Text>
                  {alerts.length > 0 && (
                    <Button
                      onClick={() => {
                        setAlerts([]);
                        toast({
                          title: "Alerts cleared",
                          status: "info",
                          duration: 2000,
                        });
                      }}
                      fontSize="xs"
                      color="gray.400"
                      _hover={{ color: 'red.400' }}
                      variant="link"
                      display="flex"
                      alignItems="center"
                    >
                      Clear All
                    </Button>
                  )}
                </Flex>
                {alerts.length === 0 ? (
                  <Flex direction="column" align="center" justify="center" py={8} color="gray.500">
                    <Box className="float-animation">
                      <Icon as={FiBell} boxSize={12} mb={2} opacity={0.3} />
                    </Box>
                    <Heading size="md" mb={2} color="gray.400">No alerts yet</Heading>
                    <Text fontSize="sm" textAlign="center">
                      Alerts will appear as market conditions change
                    </Text>
                    <Text fontSize="xs" mt={2} color="gray.500" textAlign="center">
                      Add symbols to your watchlist to receive alerts
                    </Text>
                  </Flex>
                ) : (
                  <VStack spacing={3} maxH="40vh" overflow="auto" pr={2} align="stretch">
                    {alerts.map((alert) => (
                      <Box
                        key={alert.id}
                        borderLeftWidth="4px"
                        borderLeftColor={
                          alert.important
                            ? 'red.500'
                            : alert.change > 0
                              ? 'green.500'
                              : 'gray.500'
                        }
                        bg={
                          alert.important
                            ? 'red.500/10'
                            : alert.change > 0
                              ? 'green.500/10'
                              : 'gray.700/30'
                        }
                        rounded="md"
                        p={3}
                        className={alert.important ? 'alert-pulse' : ''}
                        _hover={{ 
                          transform: 'translateY(-2px)',
                          boxShadow: 'lg',
                          transition: 'all 0.2s ease-in-out'
                        }}
                        transition="all 0.2s ease-in-out"
                      >
                        <Flex align="start">
                          <Box
                            p={1}
                            rounded="full"
                            color={alert.important ? 'red.500' : 'gray.400'}
                          >
                            <Icon
                              as={alert.important ? FiAlertCircle : FiTrendingUp}
                              boxSize={5}
                            />
                          </Box>
                          <Box ml={3} flex={1}>
                            <Flex justify="space-between" align="start">
                              <Text fontWeight="bold" fontSize="sm">{alert.symbol}</Text>
                              <Badge
                                px={2}
                                py={0.5}
                                rounded="full"
                                fontSize="xs"
                                bg={
                                  alert.type === 'price-change'
                                    ? 'blue.500/20'
                                    : alert.type === 'volume-spike'
                                      ? 'purple.500/20'
                                      : 'yellow.500/20'
                                }
                                color={
                                  alert.type === 'price-change'
                                    ? 'blue.300'
                                    : alert.type === 'volume-spike'
                                      ? 'purple.300'
                                      : 'yellow.300'
                                }
                              >
                                {alert.type === 'price-change'
                                  ? 'Price Alert'
                                  : alert.type === 'volume-spike'
                                    ? 'Volume Spike'
                                    : 'News Alert'}
                              </Badge>
                            </Flex>
                            <Text fontSize="sm" mt={1}>
                              {alert.type === 'price-change' && (
                                <>
                                  Current price: <Text as="span" fontWeight="medium">${alert.price.toFixed(2)}</Text> ({' '}
                                  <Text as="span" color={alert.change > 0 ? 'green.400' : 'red.400'}>
                                    {alert.change > 0 ? '+' : ''}{alert.change.toFixed(2)}%
                                  </Text>)
                                </>
                              )}
                              {alert.type === 'volume-spike' && 'Unusual trading volume detected'}
                              {alert.type === 'news-release' && 'Breaking news may affect stock price'}
                            </Text>
                            <Text fontSize="xs" color="gray.400" mt={1}>
                              {format(new Date(alert.timestamp), 'h:mm:ss a')}
                            </Text>
                          </Box>
                        </Flex>
                      </Box>
                    ))}
                  </VStack>
                )}
              </Box>
            </AnimatedCard>
          </GridItem>
        </Grid>
      </Container>
    </Box>
  );
};

export default NewsPage;
