import React, { useState, useEffect } from 'react';
import { Box, Container, Grid, GridItem, Heading, Text, Flex, Button, HStack, VStack, Icon, SimpleGrid, Progress, Tag, Divider, Stat, StatLabel, StatNumber, StatHelpText, StatArrow, Tabs, TabList, TabPanels, Tab, TabPanel, Table, Thead, Tbody, Tr, Th, Td, Badge, Menu, MenuButton, MenuList, MenuItem, Input, Select, Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton, FormControl, FormLabel, NumberInput, NumberInputField, useDisclosure, useColorModeValue, InputGroup, InputLeftElement, NumberInputStepper, NumberIncrementStepper, NumberDecrementStepper, Switch } from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { FiTrendingUp, FiTrendingDown, FiDollarSign, FiPieChart, FiActivity, FiClock, FiArrowUp, FiArrowDown, FiChevronDown, FiPlus, FiSearch, FiRefreshCw, FiSettings, FiAlertCircle, FiCalendar } from 'react-icons/fi';
import Navigation from '../components/Navigation';
import StockChart from '../components/StockChart';
import AnimatedCard from '../components/AnimatedCard';
import ProtectedFeature from '../components/ProtectedFeature';

const MotionBox = motion(Box);
const MotionFlex = motion(Flex);

const SimulatorPage: React.FC = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [activeTab, setActiveTab] = useState(0);
  const [buyAmount, setBuyAmount] = useState(1000);
  const [selectedStock, setSelectedStock] = useState<any>(null);
  const [transactionType, setTransactionType] = useState<'buy' | 'sell'>('buy');
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

  // Market data - simulated stocks for trading
  const marketStocks = [
    { id: 'AAPL', name: 'Apple Inc.', price: 156.37, change: 1.42, changePercentage: 0.91, volume: '68.2M', marketCap: '2.45T', sector: 'Technology' },
    { id: 'MSFT', name: 'Microsoft Corporation', price: 309.40, change: -2.83, changePercentage: -0.91, volume: '22.5M', marketCap: '2.30T', sector: 'Technology' },
    { id: 'TSLA', name: 'Tesla, Inc.', price: 250.84, change: -8.22, changePercentage: -3.17, volume: '131.7M', marketCap: '795.2B', sector: 'Automotive' },
    { id: 'AMZN', name: 'Amazon.com, Inc.', price: 123.51, change: -2.28, changePercentage: -1.81, volume: '46.3M', marketCap: '1.26T', sector: 'Consumer Cyclical' },
    { id: 'GOOGL', name: 'Alphabet Inc.', price: 122.75, change: 0.92, changePercentage: 0.75, volume: '24.8M', marketCap: '1.56T', sector: 'Communication Services' },
    { id: 'META', name: 'Meta Platforms, Inc.', price: 293.16, change: 2.36, changePercentage: 0.81, volume: '19.3M', marketCap: '752.1B', sector: 'Communication Services' },
    { id: 'NFLX', name: 'Netflix, Inc.', price: 398.75, change: 5.62, changePercentage: 1.43, volume: '7.2M', marketCap: '176.8B', sector: 'Communication Services' },
    { id: 'NVDA', name: 'NVIDIA Corporation', price: 421.96, change: 8.32, changePercentage: 2.01, volume: '50.1M', marketCap: '1.04T', sector: 'Technology' },
    { id: 'JPM', name: 'JPMorgan Chase & Co.', price: 143.42, change: -0.86, changePercentage: -0.60, volume: '11.3M', marketCap: '417.8B', sector: 'Financial Services' },
    { id: 'JNJ', name: 'Johnson & Johnson', price: 162.15, change: 1.23, changePercentage: 0.76, volume: '6.7M', marketCap: '421.3B', sector: 'Healthcare' }
  ];

  const handleStockSelection = (stock: any) => {
    setSelectedStock(stock);
    onOpen();
  };

  const handleTransaction = () => {
    // In a real app, this would handle the transaction logic
    // For now, we'll just close the modal
    onClose();
    
    // Reset form fields
    setBuyAmount(1000);
    setTransactionType('buy');
    // Here we would update the portfolio with the new transaction
  };

  const allocations = [
    { name: 'Technology', value: 53.54, color: '#0EA5E9' },
    { name: 'Automotive', value: 15.98, color: '#F59E0B' },
    { name: 'Consumer Cyclical', value: 18.88, color: '#10B981' },
    { name: 'Communication Services', value: 12.52, color: '#8B5CF6' }
  ];

  // Header gradient for simulator page - money/investment theme
  const simulatorGradient = "linear-gradient(135deg, #10B981 0%, #3B82F6 100%)";

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
                          { date: 'Jan 1', price: 100 },
                          { date: 'Feb 1', price: 120 },
                          { date: 'Mar 1', price: 110 },
                          { date: 'Apr 1', price: 130 },
                          { date: 'May 1', price: 150 }
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
                            <Td isNumeric>₹{asset.avgBuyPrice.toFixed(2)}</Td>
                            <Td isNumeric>
                              <HStack justify="flex-end" spacing={1}>
                                <Text>₹{asset.currentPrice.toFixed(2)}</Text>
                                <Icon 
                                  as={asset.change >= 0 ? FiArrowUp : FiArrowDown} 
                                  color={asset.change >= 0 ? 'green.400' : 'red.400'}
                                  boxSize={3}
                                />
                              </HStack>
                            </Td>
                            <Td isNumeric>₹{asset.value.toFixed(2)}</Td>
                            <Td isNumeric>
                              <Text 
                                color={
                                  asset.currentPrice > asset.avgBuyPrice ? 'green.400' : 
                                  asset.currentPrice < asset.avgBuyPrice ? 'red.400' : 
                                  'gray.400'
                                }
                              >
                                {(((asset.currentPrice - asset.avgBuyPrice) / asset.avgBuyPrice) * 100).toFixed(2)}%
                              </Text>
                            </Td>
                            <Td isNumeric>{asset.weight.toFixed(2)}%</Td>
                            <Td>
                              <Button 
                                size="xs" 
                                variant="ghost" 
                                onClick={() => handleStockSelection({
                                  ...asset,
                                  price: asset.currentPrice,
                                  alreadyOwned: true
                                })}
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
                <TabPanel p={0}>
                  <Box className="glass-card" p={0} overflow="hidden">
                    <Box p={4} borderBottom="1px solid" borderColor="whiteAlpha.200">
                      <Flex justify="space-between" align="center" mb={4}>
                        <Heading size="sm">Market Watch</Heading>
                        <HStack>
                          <InputGroup size="sm" width="240px">
                            <InputLeftElement>
                              <Icon as={FiSearch} color="gray.400" />
                            </InputLeftElement>
                            <Input 
                              placeholder="Search stocks" 
                              bg="whiteAlpha.100"
                            />
                          </InputGroup>
                          <Menu>
                            <MenuButton as={Button} size="sm" rightIcon={<FiChevronDown />} variant="outline">
                              Filter by Sector
                            </MenuButton>
                            <MenuList bg="darkBlue.800" borderColor="whiteAlpha.300">
                              <MenuItem>All Sectors</MenuItem>
                              <MenuItem>Technology</MenuItem>
                              <MenuItem>Financial Services</MenuItem>
                              <MenuItem>Healthcare</MenuItem>
                              <MenuItem>Consumer Cyclical</MenuItem>
                              <MenuItem>Communication Services</MenuItem>
                              <MenuItem>Automotive</MenuItem>
                            </MenuList>
                          </Menu>
                        </HStack>
                      </Flex>
                      
                      <Text fontSize="sm" color="gray.400" mb={2}>
                        Explore market opportunities and add stocks to your portfolio.
                      </Text>
                    </Box>
                    
                    <Table variant="simple" size="sm">
                      <Thead bg="whiteAlpha.100">
                        <Tr>
                          <Th>Ticker</Th>
                          <Th>Name</Th>
                          <Th>Sector</Th>
                          <Th isNumeric>Price</Th>
                          <Th isNumeric>Change</Th>
                          <Th>Volume</Th>
                          <Th>Market Cap</Th>
                          <Th></Th>
                        </Tr>
                      </Thead>
                      <Tbody>
                        {marketStocks.map((stock) => (
                          <Tr key={stock.id} _hover={{ bg: "whiteAlpha.100" }}>
                            <Td fontWeight="bold">{stock.id}</Td>
                            <Td>{stock.name}</Td>
                            <Td>
                              <Tag size="sm" colorScheme={
                                stock.sector === 'Technology' ? 'blue' :
                                stock.sector === 'Automotive' ? 'orange' :
                                stock.sector === 'Consumer Cyclical' ? 'green' :
                                stock.sector === 'Communication Services' ? 'purple' :
                                stock.sector === 'Financial Services' ? 'cyan' :
                                'pink'
                              }>
                                {stock.sector}
                              </Tag>
                            </Td>
                            <Td isNumeric>₹{stock.price.toFixed(2)}</Td>
                            <Td isNumeric>
                              <HStack justify="flex-end" spacing={1}>
                                <Text
                                  color={stock.change >= 0 ? 'green.400' : 'red.400'}
                                >
                                  {stock.change >= 0 ? '+' : ''}{stock.change.toFixed(2)} ({stock.changePercentage.toFixed(2)}%)
                                </Text>
                                <Icon 
                                  as={stock.change >= 0 ? FiArrowUp : FiArrowDown} 
                                  color={stock.change >= 0 ? 'green.400' : 'red.400'}
                                  boxSize={3}
                                />
                              </HStack>
                            </Td>
                            <Td>{stock.volume}</Td>
                            <Td>{stock.marketCap}</Td>
                            <Td>
                              <Button
                                size="xs"
                                colorScheme="blue"
                                onClick={() => handleStockSelection(stock)}
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

      {/* Stock Transaction Modal */}
      {selectedStock && (
        <Modal isOpen={isOpen} onClose={onClose} size="lg">
          <ModalOverlay backdropFilter="blur(10px)" />
          <ModalContent bg="darkBlue.800" color="white">
            <ModalHeader>
              <Flex align="center">
                <Text>{selectedStock.name} ({selectedStock.id})</Text>
              </Flex>
            </ModalHeader>
            <ModalCloseButton />

            <ModalBody>
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6} mb={6}>
                <Box>
                  <Text color="gray.400" mb={1}>Current Price</Text>
                  <Flex align="center">
                    <Heading size="md">₹{selectedStock.price.toFixed(2)}</Heading>
                    <Badge ml={2} colorScheme={selectedStock.change >= 0 ? 'green' : 'red'}>
                      {selectedStock.change >= 0 ? '+' : ''}{selectedStock.changePercentage.toFixed(2)}%
                    </Badge>
                  </Flex>
                </Box>
                
                {selectedStock.alreadyOwned && (
                  <Box>
                    <Text color="gray.400" mb={1}>Your Position</Text>
                    <Heading size="md">{selectedStock.shares} shares</Heading>
                    <Text fontSize="sm">
                      Avg. Price: ₹{selectedStock.avgBuyPrice.toFixed(2)}
                    </Text>
                  </Box>
                )}
              </SimpleGrid>
              
              <Box height="150px" mb={6}>
                <StockChart />
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
                  isDisabled={!selectedStock.alreadyOwned}
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
                  max={transactionType === 'buy' ? mockPortfolio.cash : selectedStock?.value || 0}
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
                    {Math.floor(buyAmount / selectedStock.price)} shares
                  </Text>
                </Flex>
                <Flex justify="space-between" mb={2}>
                  <Text fontSize="sm">Share Price</Text>
                  <Text fontSize="sm">₹{selectedStock.price.toFixed(2)}</Text>
                </Flex>
                <Flex justify="space-between" mb={2}>
                  <Text fontSize="sm">Estimated Cost</Text>
                  <Text fontSize="sm">₹{(Math.floor(buyAmount / selectedStock.price) * selectedStock.price).toFixed(2)}</Text>
                </Flex>
                <Divider my={2} borderColor="whiteAlpha.300" />
                <Flex justify="space-between">
                  <Text fontSize="sm" fontWeight="bold">Remaining Cash</Text>
                  <Text fontSize="sm" fontWeight="bold">
                    ₹{(mockPortfolio.cash - (Math.floor(buyAmount / selectedStock.price) * selectedStock.price)).toFixed(2)}
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
                {transactionType === 'buy' ? 'Buy' : 'Sell'} {selectedStock.id}
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      )}
    </Box>
  );
};

export default SimulatorPage; 