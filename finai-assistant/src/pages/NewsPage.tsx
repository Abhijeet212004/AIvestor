import React, { useState, useEffect, useRef } from 'react';
import {
  Box, Container, Heading, Text, Flex, Button, Grid, GridItem, 
  HStack, VStack, Icon, Spinner, Input, Select, Badge, 
  Avatar, SimpleGrid, useToast, InputGroup, InputLeftElement,
  Image, Divider, useColorModeValue, Tooltip, Tag
} from '@chakra-ui/react';
import { 
  FiFileText, FiTrendingUp, FiClock, FiExternalLink, 
  FiFilter, FiRefreshCw, FiStar, FiSave, FiX, 
  FiSearch, FiPlus, FiInfo, FiChevronDown
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
  const [symbols, setSymbols] = useState<string[]>([]);
  const [quotes, setQuotes] = useState<Record<string, SymbolQuote>>({});
  const [selectedCategory, setSelectedCategory] = useState<string>('general');
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [symbolInput, setSymbolInput] = useState<string>('');
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

  // Enhanced error handling for API calls
  async function fetchWithErrorHandling(url: string, options = {}) {
    try {
      const response = await fetch(url, options);
      
      if (!response.ok) {
        throw new Error(`Network response was not ok: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Fetch error:', error);
      toast({
        title: 'API Error',
        description: `Failed to fetch data: ${error instanceof Error ? error.message : 'Unknown error'}`,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      return null;
    }
  }

  async function fetchMarketNews() {
    setIsLoading(true);
    
    try {
      // Fetch market news
      const data = await fetchWithErrorHandling(`https://finnhub.io/api/v1/news?category=${selectedCategory}&token=${finnhubApiKey}`);
      
      if (data && Array.isArray(data)) {
        // Sort news by datetime (newest first)
        const sortedNews = data.sort((a, b) => b.datetime - a.datetime);
        setNews(sortedNews.slice(0, 20)); // Limit to 20 articles
        
        // Show success toast when news is loaded
        if (lastUpdated) {  // Only show toast after initial load
          toast({
            title: 'News Updated',
            description: 'Latest market news has been loaded',
            status: 'success',
            duration: 3000,
            isClosable: true,
          });
        }
        
        setLastUpdated(new Date());
      }
    } catch (error) {
      console.error('Error fetching market news:', error);
    } finally {
      setIsLoading(false);
    }
  }

  async function fetchQuotesForSymbols() {
    if (symbols.length === 0) return;
    
    try {
      const newQuotes: Record<string, SymbolQuote> = {};
      
      // Fetch quotes for each symbol
      for (const symbol of symbols) {
        const data = await fetchWithErrorHandling(`https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${finnhubApiKey}`);
        
        if (data && data.c) {
          newQuotes[symbol] = data;
        }
      }
      
      setQuotes(newQuotes);
    } catch (error) {
      console.error('Error fetching quotes:', error);
    }
  }

  function handleSymbolAdd(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    
    if (!symbolInput) {
      toast({
        title: 'Symbol Required',
        description: 'Please enter a stock symbol to add',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    
    // Convert to uppercase
    const formattedSymbol = symbolInput.toUpperCase().trim();
    
    // Check if symbol already exists
    if (symbols.includes(formattedSymbol)) {
      toast({
        title: 'Symbol Already Added',
        description: `${formattedSymbol} is already in your watchlist`,
        status: 'info',
        duration: 3000,
        isClosable: true,
      });
      setSymbolInput('');
      return;
    }
    
    // Add symbol to list
    const updatedSymbols = [...symbols, formattedSymbol];
    setSymbols(updatedSymbols);
    
    // Save to localStorage
    localStorage.setItem('watchedSymbols', JSON.stringify(updatedSymbols));
    
    // Show success message
    toast({
      title: 'Symbol Added',
      description: `${formattedSymbol} has been added to your watchlist`,
      status: 'success',
      duration: 3000,
      isClosable: true,
    });
    
    // Clear input
    setSymbolInput('');
    
    // Fetch quote for the new symbol
    fetchQuotesForSymbols();
  }

  function handleSymbolRemove(symbol: string) {
    // Remove symbol from list
    const updatedSymbols = symbols.filter(s => s !== symbol);
    setSymbols(updatedSymbols);
    
    // Save to localStorage
    localStorage.setItem('watchedSymbols', JSON.stringify(updatedSymbols));
    
    // Show success message
    toast({
      title: 'Symbol Removed',
      description: `${symbol} has been removed from your watchlist`,
      status: 'info',
      duration: 3000,
      isClosable: true,
    });
  }

  function handleCategoryChange(category: string) {
    setSelectedCategory(category);
  }

  function manualRefresh() {
    // Refresh both news and quotes
    fetchMarketNews();
    fetchQuotesForSymbols();
    
    toast({
      title: 'Refreshing Data',
      description: 'Fetching the latest market news and quotes',
      status: 'info',
      duration: 2000,
      isClosable: true,
    });
  }

  return (
    <Box minH="100vh" bg="gray.900">
      <Navigation />
      
      <Container maxW="container.xl" pt="100px" pb="40px">
        <Grid templateColumns={{ base: '1fr', lg: '1fr 350px' }} gap={6}>
          {/* News Section */}
          <GridItem>
            <AnimatedCard delay={0.1}>
              <Box p={6} borderRadius="lg" bg="rgba(26, 32, 44, 0.7)" backdropFilter="blur(10px)">
                <Flex align="center" justify="space-between" mb={6}>
                  <Heading size="md" display="flex" alignItems="center">
                    <Icon as={FiFileText} boxSize={5} mr={2} color="blue.400" />
                    Financial News
                  </Heading>
                  <Flex align="center" gap={3}>
                    <Box 
                      position="relative"
                      bg="gray.800"
                      borderRadius="md"
                      p={1}
                      pl={3}
                      borderWidth="1px"
                      borderColor="gray.600"
                    >
                      <Flex align="center">
                        <Icon as={FiFilter} boxSize={4} color="blue.400" mr={2} />
                        <Text color="gray.300" fontSize="sm" fontWeight="medium" mr={2}>Category:</Text>
                        <Select
                          value={selectedCategory}
                          onChange={(e) => handleCategoryChange(e.target.value)}
                          bg="transparent"
                          border="none"
                          color="white"
                          fontWeight="medium"
                          size="sm"
                          w="120px"
                          _focus={{ boxShadow: "none" }}
                          icon={<Icon as={FiChevronDown} color="blue.400" />}
                          sx={{
                            "& option": {
                              bg: "gray.800",
                              color: "white"
                            }
                          }}
                        >
                          {categories.map(category => (
                            <option key={category.id} value={category.id}>
                              {category.name}
                            </option>
                          ))}
                        </Select>
                      </Flex>
                    </Box>
                  </Flex>
                </Flex>

                {lastUpdated && (
                  <Flex align="center" justify="space-between" mb={4}>
                    <Text fontSize="sm" color="gray.400">
                      Last updated: {format(lastUpdated, 'MMM d, yyyy h:mm a')}
                    </Text>
                    <Button 
                      leftIcon={<Icon as={FiRefreshCw} />}
                      onClick={manualRefresh}
                      size="xs"
                      colorScheme="blue"
                      variant="ghost"
                    >
                      Refresh
                    </Button>
                  </Flex>
                )}

                {isLoading ? (
                  <Flex justify="center" align="center" minH="300px" direction="column">
                    <Spinner size="xl" color="blue.400" thickness="3px" speed="0.8s" mb={4} />
                    <Text color="gray.400">Loading financial news...</Text>
                  </Flex>
                ) : (
                  <Box maxH="calc(100vh - 200px)" overflow="auto" pr={2}>
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
                        {/* Headline section with gradient background */}
                        <Box 
                          background="linear-gradient(to bottom, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.3) 100%)"
                          p={4}
                        >
                          <Heading size="md" mb={2} lineHeight="1.4">
                            {item.headline}
                          </Heading>
                          <Flex justify="space-between" align="center">
                            <Badge colorScheme="blue" fontSize="xs">
                              {item.category.toUpperCase()}
                            </Badge>
                            <Flex align="center">
                              <Icon as={FiClock} boxSize={3} mr={1} color="gray.400" />
                              <Text fontSize="xs" color="gray.400">
                                {format(new Date(item.datetime * 1000), 'MMM d, yyyy')}
                              </Text>
                            </Flex>
                          </Flex>
                        </Box>
                        
                        {/* Content grid: image + summary */}
                        <Grid templateColumns={{ base: '1fr', sm: '240px 1fr' }} gap={4} p={4}>
                          {item.image && (
                            <Image 
                              src={item.image} 
                              alt={item.headline} 
                              height="180px"
                              width="100%"
                              objectFit="cover"
                              borderRadius="md"
                              fallback={
                                <Flex height="180px" width="100%" bg="gray.700" align="center" justify="center">
                                  <Icon as={FiFileText} boxSize={8} color="gray.500" />
                                </Flex>
                              }
                            />
                          )}
                          
                          <Box>
                            <Text fontSize="sm" mb={4} noOfLines={3} lineHeight="1.6">
                              {item.summary}
                            </Text>
                            
                            <Flex justify="space-between" align="center">
                              <Text fontSize="xs" fontWeight="medium" color="gray.400">
                                Source: {item.source}
                              </Text>
                              <Button 
                                as="a"
                                href={item.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                size="sm"
                                rightIcon={<Icon as={FiExternalLink} />}
                                variant="outline"
                                borderColor="blue.500"
                                color="blue.400"
                                _hover={{ bg: 'blue.900', borderColor: 'blue.400' }}
                              >
                                Read More
                              </Button>
                            </Flex>
                          </Box>
                        </Grid>
                      </Box>
                    ))}
                    
                    {news.length === 0 && !isLoading && (
                      <Flex 
                        justify="center" 
                        align="center" 
                        direction="column" 
                        minH="300px" 
                        bg="gray.800" 
                        borderRadius="lg" 
                        p={6}
                      >
                        <Icon as={FiInfo} boxSize={8} color="gray.500" mb={4} />
                        <Heading size="md" mb={2}>No News Available</Heading>
                        <Text color="gray.400" textAlign="center">
                          No financial news found for this category. Please try a different category or check back later.
                        </Text>
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
                    )}
                  </Box>
                )}
              </Box>
            </AnimatedCard>
          </GridItem>
          
          {/* Stock Watchlist */}
          <GridItem>
            <AnimatedCard delay={0.2}>
              <Box p={6} borderRadius="lg" bg="rgba(26, 32, 44, 0.7)" backdropFilter="blur(10px)" h="100%">
                <Heading size="md" mb={4} display="flex" alignItems="center">
                  <Icon as={FiStar} boxSize={5} mr={2} color="yellow.400" />
                  Stock Watchlist
                </Heading>
                
                <form onSubmit={handleSymbolAdd}>
                  <Flex mb={4}>
                    <InputGroup size="md">
                      <InputLeftElement pointerEvents="none">
                        <Icon as={FiSearch} color="gray.400" />
                      </InputLeftElement>
                      <Input 
                        placeholder="Add symbol (e.g. AAPL)" 
                        value={symbolInput}
                        onChange={(e) => setSymbolInput(e.target.value)}
                        borderColor="gray.600"
                        _hover={{ borderColor: "gray.500" }}
                        _focus={{ borderColor: "blue.500" }}
                      />
                    </InputGroup>
                    <Button 
                      type="submit"
                      ml={2} 
                      colorScheme="blue"
                      leftIcon={<Icon as={FiPlus} />}
                    >
                      Add
                    </Button>
                  </Flex>
                </form>
                
                <Box maxH="600px" overflowY="auto" pr={2}>
                  {symbols.length > 0 ? (
                    <VStack spacing={3} align="stretch">
                      {symbols.map(symbol => {
                        const quote = quotes[symbol];
                        return (
                          <Flex 
                            key={symbol}
                            align="center"
                            justify="space-between"
                            bg="whiteAlpha.100"
                            p={3}
                            borderRadius="md"
                            borderLeft="3px solid"
                            borderLeftColor={
                              quote?.dp && quote.dp > 0 
                                ? "green.400" 
                                : quote?.dp && quote.dp < 0 
                                  ? "red.400" 
                                  : "gray.400"
                            }
                          >
                            <Box>
                              <Flex align="center">
                                <Text fontWeight="bold" fontSize="md">{symbol}</Text>
                                <Button 
                                  size="xs" 
                                  variant="ghost" 
                                  colorScheme="red" 
                                  ml={2}
                                  p={0}
                                  minW={6}
                                  height={6}
                                  onClick={() => handleSymbolRemove(symbol)}
                                >
                                  <Icon as={FiX} boxSize={3} />
                                </Button>
                              </Flex>
                              {quote?.pc && (
                                <Text fontSize="xs" color="gray.400">
                                  Prev Close: ${quote.pc.toFixed(2)}
                                </Text>
                              )}
                            </Box>
                            
                            <Box textAlign="right">
                              {quote ? (
                                <>
                                  <Text fontWeight="bold" fontSize="md">
                                    ${quote.c.toFixed(2)}
                                  </Text>
                                  <Text 
                                    fontSize="sm"
                                    color={quote.dp > 0 ? "green.400" : quote.dp < 0 ? "red.400" : "gray.400"}
                                  >
                                    {quote.dp > 0 ? "+" : ""}{quote.dp.toFixed(2)}%
                                  </Text>
                                </>
                              ) : (
                                <Spinner size="sm" />
                              )}
                            </Box>
                          </Flex>
                        );
                      })}
                    </VStack>
                  ) : (
                    <Flex 
                      justify="center" 
                      align="center" 
                      direction="column" 
                      minH="200px" 
                      bg="gray.800" 
                      borderRadius="lg" 
                      p={6}
                    >
                      <Icon as={FiStar} boxSize={8} color="gray.500" mb={4} />
                      <Heading size="sm" mb={2}>No Symbols Added</Heading>
                      <Text color="gray.400" textAlign="center" fontSize="sm">
                        Add stock symbols to your watchlist to track their performance in real-time.
                      </Text>
                    </Flex>
                  )}
                </Box>
                
                {/* Market information and links */}
                <Box mt={6}>
                  <Divider mb={4} />
                  <Heading size="sm" mb={3}>Market Resources</Heading>
                  <SimpleGrid columns={2} spacing={3}>
                    <Button 
                      as="a"
                      href="https://finance.yahoo.com/calendar/earnings" 
                      target="_blank"
                      rel="noopener noreferrer"
                      size="sm"
                      variant="outline"
                      colorScheme="blue"
                      leftIcon={<Icon as={FiFileText} />}
                      justifyContent="flex-start"
                    >
                      Earnings Calendar
                    </Button>
                    
                    <Button 
                      as="a"
                      href="https://finance.yahoo.com/calendar/ipo" 
                      target="_blank"
                      rel="noopener noreferrer"
                      size="sm"
                      variant="outline"
                      colorScheme="green"
                      leftIcon={<Icon as={FiTrendingUp} />}
                      justifyContent="flex-start"
                    >
                      IPO Calendar
                    </Button>
                    
                    <Button 
                      as="a"
                      href="https://finance.yahoo.com/screener/predefined/aggressive_small_caps" 
                      target="_blank"
                      rel="noopener noreferrer"
                      size="sm"
                      variant="outline"
                      colorScheme="purple"
                      leftIcon={<Icon as={FiSearch} />}
                      justifyContent="flex-start"
                    >
                      Stock Screener
                    </Button>
                    
                    <Button 
                      as="a"
                      href="https://www.tradingview.com/chart/" 
                      target="_blank"
                      rel="noopener noreferrer"
                      size="sm"
                      variant="outline"
                      colorScheme="orange"
                      leftIcon={<Icon as={FiTrendingUp} />}
                      justifyContent="flex-start"
                    >
                      Advanced Charts
                    </Button>
                  </SimpleGrid>
                </Box>
              </Box>
            </AnimatedCard>
          </GridItem>
        </Grid>
      </Container>
    </Box>
  );
};

export default NewsPage;
