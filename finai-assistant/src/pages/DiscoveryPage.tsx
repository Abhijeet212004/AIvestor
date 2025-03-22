import React, { useState } from 'react';
import { Box, Container, Grid, GridItem, Heading, Text, Flex, Button, HStack, VStack, Icon, SimpleGrid, Slider, SliderTrack, SliderFilledTrack, SliderThumb, Select, Badge, Avatar, Divider, Progress } from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { FiFilter, FiStar, FiDollarSign, FiTrendingUp, FiShield, FiBarChart2, FiInfo, FiExternalLink, FiHeart } from 'react-icons/fi';
import Navigation from '../components/Navigation';
import AnimatedCard from '../components/AnimatedCard';
import StockChart from '../components/StockChart';

const MotionBox = motion(Box);
const MotionFlex = motion(Flex);

const DiscoveryPage: React.FC = () => {
  const [riskLevel, setRiskLevel] = useState<number>(3);
  const [investmentType, setInvestmentType] = useState<string>('all');
  const [investmentTerm, setInvestmentTerm] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);

  // Sample investment product data
  const products = [
    {
      id: 'prod1',
      name: 'Blue Chip Growth Fund',
      type: 'mutual-fund',
      company: 'Vanguard',
      logoUrl: 'https://via.placeholder.com/50',
      risk: 2,
      term: 'long',
      returnRate: { '1y': 8.2, '3y': 24.5, '5y': 52.3 },
      description: 'A fund that invests in large, well-established companies with strong market positions and stable earnings.',
      tags: ['Large Cap', 'Growth', 'Low Fee'],
      rating: 4.8,
      holdings: [
        { name: 'Apple Inc.', allocation: 12 },
        { name: 'Microsoft', allocation: 10 },
        { name: 'Amazon', allocation: 8 },
      ],
      minInvestment: 3000,
      expenseRatio: 0.15,
      popularity: 94,
    },
    {
      id: 'prod2',
      name: 'Global Technology ETF',
      type: 'etf',
      company: 'BlackRock',
      logoUrl: 'https://via.placeholder.com/50',
      risk: 4,
      term: 'medium',
      returnRate: { '1y': 12.4, '3y': 42.1, '5y': 89.7 },
      description: 'An ETF focused on global technology leaders and emerging tech innovators with high growth potential.',
      tags: ['Technology', 'Global', 'High Growth'],
      rating: 4.6,
      holdings: [
        { name: 'NVIDIA', allocation: 15 },
        { name: 'TSMC', allocation: 12 },
        { name: 'Samsung', allocation: 9 },
      ],
      minInvestment: 0,
      expenseRatio: 0.45,
      popularity: 88,
    },
    {
      id: 'prod3',
      name: 'Sustainable Future Fund',
      type: 'mutual-fund',
      company: 'Fidelity',
      logoUrl: 'https://via.placeholder.com/50',
      risk: 3,
      term: 'long',
      returnRate: { '1y': 7.8, '3y': 22.3, '5y': 48.9 },
      description: 'A fund investing in companies with strong environmental, social, and governance (ESG) practices.',
      tags: ['ESG', 'Sustainable', 'Mixed Cap'],
      rating: 4.5,
      holdings: [
        { name: 'Tesla', allocation: 8 },
        { name: 'NextEra Energy', allocation: 7 },
        { name: 'First Solar', allocation: 6 },
      ],
      minInvestment: 2500,
      expenseRatio: 0.58,
      popularity: 82,
    },
    {
      id: 'prod4',
      name: 'Dividend Aristocrats Index',
      type: 'index-fund',
      company: 'Charles Schwab',
      logoUrl: 'https://via.placeholder.com/50',
      risk: 1,
      term: 'long',
      returnRate: { '1y': 5.2, '3y': 16.8, '5y': 38.2 },
      description: 'An index fund tracking companies that have increased their dividend payouts consistently for at least 25 years.',
      tags: ['Dividend', 'Income', 'Stability'],
      rating: 4.7,
      holdings: [
        { name: 'Johnson & Johnson', allocation: 8 },
        { name: 'Procter & Gamble', allocation: 7 },
        { name: 'Coca-Cola', allocation: 6 },
      ],
      minInvestment: 1000,
      expenseRatio: 0.06,
      popularity: 90,
    },
    {
      id: 'prod5',
      name: 'Emerging Markets Opportunities',
      type: 'etf',
      company: 'HSBC',
      logoUrl: 'https://via.placeholder.com/50',
      risk: 5,
      term: 'medium',
      returnRate: { '1y': 9.7, '3y': 28.3, '5y': 64.1 },
      description: 'An ETF that seeks growth opportunities in emerging market economies, focusing on companies with potential for significant growth.',
      tags: ['Emerging Markets', 'High Risk', 'Growth'],
      rating: 4.2,
      holdings: [
        { name: 'Alibaba', allocation: 10 },
        { name: 'Tencent', allocation: 9 },
        { name: 'Reliance Industries', allocation: 7 },
      ],
      minInvestment: 0,
      expenseRatio: 0.68,
      popularity: 76,
    },
    {
      id: 'prod6',
      name: 'Healthcare Innovation Fund',
      type: 'mutual-fund',
      company: 'T. Rowe Price',
      logoUrl: 'https://via.placeholder.com/50',
      risk: 4,
      term: 'long',
      returnRate: { '1y': 11.2, '3y': 36.8, '5y': 77.2 },
      description: 'A fund investing in innovative healthcare companies developing new treatments, technologies, and services.',
      tags: ['Healthcare', 'Innovation', 'Growth'],
      rating: 4.4,
      holdings: [
        { name: 'UnitedHealth Group', allocation: 9 },
        { name: 'Moderna', allocation: 8 },
        { name: 'Thermo Fisher Scientific', allocation: 7 },
      ],
      minInvestment: 2000,
      expenseRatio: 0.75,
      popularity: 80,
    },
  ];

  // Filter products based on selected criteria
  const filteredProducts = products.filter(product => {
    if (investmentType !== 'all' && product.type !== investmentType) return false;
    if (investmentTerm !== 'all' && product.term !== investmentTerm) return false;
    
    // Risk tolerance: allow products with risk level equal to or below selected risk
    if (product.risk > riskLevel) return false;
    
    return true;
  });

  // Sort products by rating (high to low)
  const sortedProducts = [...filteredProducts].sort((a, b) => b.rating - a.rating);

  // Map risk level to text
  const getRiskLevelText = (level: number) => {
    switch (level) {
      case 1: return 'Very Conservative';
      case 2: return 'Conservative';
      case 3: return 'Moderate';
      case 4: return 'Aggressive';
      case 5: return 'Very Aggressive';
      default: return 'Moderate';
    }
  };

  return (
    <Box minH="100vh" bg="darkBlue.900">
      <Navigation />
      
      <Box as="main" pt="80px">
        <Container maxW="container.xl" px={4}>
          {/* Header Section */}
          <Box mb={8} textAlign="center">
            <Heading as="h1" size="xl" mb={4} className="text-gradient">
              Discover Investment Opportunities
            </Heading>
            <Text fontSize="lg" opacity={0.8} maxW="800px" mx="auto">
              Find personalized investment recommendations based on your risk tolerance, investment goals,
              and time horizon. Our AI analyzes thousands of options to match you with the best choices.
            </Text>
          </Box>

          {/* Main Content */}
          <Grid templateColumns={{ base: "1fr", lg: "300px 1fr" }} gap={8}>
            {/* Filters Panel */}
            <GridItem>
              <MotionBox
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
                className="glass-card"
                p={6}
                display={{ base: showFilters ? 'block' : 'none', lg: 'block' }}
                position={{ lg: 'sticky' }}
                top={{ lg: '100px' }}
              >
                <Flex justify="space-between" align="center" mb={6}>
                  <Heading size="md">
                    <Flex align="center">
                      <Icon as={FiFilter} mr={2} />
                      Investment Filters
                    </Flex>
                  </Heading>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    display={{ base: 'block', lg: 'none' }}
                    onClick={() => setShowFilters(false)}
                  >
                    Close
                  </Button>
                </Flex>

                <VStack spacing={6} align="stretch">
                  {/* Risk Tolerance Slider */}
                  <Box>
                    <Text fontWeight="medium" mb={2}>Risk Tolerance</Text>
                    <Flex justify="space-between" mb={2}>
                      <Text fontSize="sm" color="gray.400">Conservative</Text>
                      <Text fontSize="sm" color="gray.400">Aggressive</Text>
                    </Flex>
                    <Slider 
                      min={1} 
                      max={5} 
                      step={1} 
                      value={riskLevel} 
                      onChange={val => setRiskLevel(val)}
                      colorScheme="blue"
                    >
                      <SliderTrack>
                        <SliderFilledTrack />
                      </SliderTrack>
                      <SliderThumb boxSize={6} bg="brand.500">
                        <Box fontSize="xs" color="white">{riskLevel}</Box>
                      </SliderThumb>
                    </Slider>
                    <Text mt={2} fontSize="sm" fontWeight="medium">
                      Selected: <span className="text-gradient">{getRiskLevelText(riskLevel)}</span>
                    </Text>
                  </Box>

                  {/* Investment Type */}
                  <Box>
                    <Text fontWeight="medium" mb={2}>Investment Type</Text>
                    <Select 
                      bg="whiteAlpha.100" 
                      border="none" 
                      value={investmentType}
                      onChange={(e) => setInvestmentType(e.target.value)}
                    >
                      <option value="all">All Types</option>
                      <option value="mutual-fund">Mutual Funds</option>
                      <option value="etf">ETFs</option>
                      <option value="index-fund">Index Funds</option>
                      <option value="stock">Individual Stocks</option>
                    </Select>
                  </Box>

                  {/* Investment Term */}
                  <Box>
                    <Text fontWeight="medium" mb={2}>Investment Term</Text>
                    <Select 
                      bg="whiteAlpha.100" 
                      border="none"
                      value={investmentTerm}
                      onChange={(e) => setInvestmentTerm(e.target.value)}
                    >
                      <option value="all">Any Term</option>
                      <option value="short">Short Term (&lt; 2 years)</option>
                      <option value="medium">Medium Term (2-5 years)</option>
                      <option value="long">Long Term (5+ years)</option>
                    </Select>
                  </Box>

                  <Divider borderColor="whiteAlpha.300" />

                  {/* AI Recommendations */}
                  <Box p={4} bg="whiteAlpha.100" borderRadius="md">
                    <Flex align="center" mb={3}>
                      <Icon as={FiInfo} color="blue.400" mr={2} />
                      <Text fontWeight="medium">AI Recommendation</Text>
                    </Flex>
                    <Text fontSize="sm" opacity={0.8} mb={3}>
                      Based on your profile and market conditions, we recommend:
                    </Text>
                    <VStack align="stretch" spacing={3}>
                      <Flex justify="space-between">
                        <Text fontSize="sm">Stocks</Text>
                        <Text fontSize="sm" fontWeight="medium">40%</Text>
                      </Flex>
                      <Progress value={40} size="sm" colorScheme="blue" borderRadius="full" mb={1} />
                      
                      <Flex justify="space-between">
                        <Text fontSize="sm">Bonds</Text>
                        <Text fontSize="sm" fontWeight="medium">30%</Text>
                      </Flex>
                      <Progress value={30} size="sm" colorScheme="purple" borderRadius="full" mb={1} />
                      
                      <Flex justify="space-between">
                        <Text fontSize="sm">ETFs</Text>
                        <Text fontSize="sm" fontWeight="medium">20%</Text>
                      </Flex>
                      <Progress value={20} size="sm" colorScheme="green" borderRadius="full" mb={1} />
                      
                      <Flex justify="space-between">
                        <Text fontSize="sm">Cash</Text>
                        <Text fontSize="sm" fontWeight="medium">10%</Text>
                      </Flex>
                      <Progress value={10} size="sm" colorScheme="orange" borderRadius="full" mb={1} />
                    </VStack>
                  </Box>
                </VStack>
              </MotionBox>

              {/* Mobile Filter Toggle */}
              <Button 
                leftIcon={<FiFilter />}
                variant="solid"
                w="full"
                display={{ base: showFilters ? 'none' : 'flex', lg: 'none' }}
                onClick={() => setShowFilters(true)}
                mb={4}
              >
                Show Filters
              </Button>
            </GridItem>

            {/* Investment Products Grid */}
            <GridItem>
              <Box mb={6}>
                <Flex justify="space-between" align="center" mb={4}>
                  <Heading size="md">Recommended for You</Heading>
                  <Text fontSize="sm" color="gray.400">
                    Showing {sortedProducts.length} of {products.length} products
                  </Text>
                </Flex>

                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                  {sortedProducts.map((product, index) => (
                    <ProductCard key={product.id} product={product} index={index} />
                  ))}
                </SimpleGrid>
              </Box>
            </GridItem>
          </Grid>
        </Container>
      </Box>
    </Box>
  );
};

interface ProductCardProps {
  product: any;
  index: number;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, index }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <MotionBox
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
    >
      <AnimatedCard 
        p={0} 
        overflow="hidden"
        hoverEffect="lift"
      >
        <Box p={6}>
          <Flex justify="space-between" align="flex-start" mb={4}>
            <HStack spacing={3}>
              <Avatar size="md" name={product.company} src={product.logoUrl} bg="blue.500" />
              <Box>
                <Heading size="md" mb={1}>{product.name}</Heading>
                <Text fontSize="sm" color="gray.400">{product.company}</Text>
              </Box>
            </HStack>
            <HStack>
              <Badge colorScheme={product.risk <= 2 ? 'green' : product.risk >= 4 ? 'red' : 'yellow'} px={2} py={1}>
                {['Very Low', 'Low', 'Medium', 'High', 'Very High'][product.risk-1]} Risk
              </Badge>
              <Box color="yellow.400" display="flex" alignItems="center">
                <Icon as={FiStar} mr={1} />
                <Text fontWeight="bold">{product.rating}</Text>
              </Box>
            </HStack>
          </Flex>

          <Text noOfLines={isExpanded ? undefined : 2} fontSize="sm" mb={4} opacity={0.8}>
            {product.description}
          </Text>

          <Flex wrap="wrap" mb={4} gap={2}>
            {product.tags.map((tag: string, i: number) => (
              <Badge key={i} bg="whiteAlpha.200" color="whiteAlpha.800" px={2} py={1}>
                {tag}
              </Badge>
            ))}
          </Flex>

          <Grid templateColumns="repeat(3, 1fr)" gap={4} mb={4}>
            <Box>
              <Text fontSize="xs" color="gray.400">1Y Return</Text>
              <Text fontSize="lg" fontWeight="bold" color={product.returnRate['1y'] > 0 ? 'green.400' : 'red.400'}>
                {product.returnRate['1y']}%
              </Text>
            </Box>
            <Box>
              <Text fontSize="xs" color="gray.400">Min. Investment</Text>
              <Text fontSize="lg" fontWeight="bold">
                ${product.minInvestment > 0 ? product.minInvestment.toLocaleString() : '0'}
              </Text>
            </Box>
            <Box>
              <Text fontSize="xs" color="gray.400">Expense Ratio</Text>
              <Text fontSize="lg" fontWeight="bold">
                {product.expenseRatio}%
              </Text>
            </Box>
          </Grid>

          {isExpanded && (
            <Box mt={4} mb={4}>
              <Text fontWeight="medium" mb={2}>Top Holdings</Text>
              <VStack align="stretch" spacing={2}>
                {product.holdings.map((holding: any, i: number) => (
                  <Flex key={i} justify="space-between" p={2} bg="whiteAlpha.100" borderRadius="md">
                    <Text fontSize="sm">{holding.name}</Text>
                    <Text fontSize="sm" fontWeight="medium">{holding.allocation}%</Text>
                  </Flex>
                ))}
              </VStack>
            </Box>
          )}

          <Flex justify="space-between" mt={4}>
            <Button 
              size="sm" 
              variant="ghost" 
              leftIcon={isExpanded ? undefined : <FiInfo />}
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? 'Show Less' : 'More Details'}
            </Button>
            <HStack>
              <Button
                size="sm"
                variant="ghost"
                color="brand.300"
                leftIcon={<FiHeart />}
              >
                Save
              </Button>
              <Button
                size="sm"
                variant="solid"
                colorScheme="blue"
                rightIcon={<FiExternalLink />}
              >
                Invest
              </Button>
            </HStack>
          </Flex>
        </Box>
      </AnimatedCard>
    </MotionBox>
  );
};

export default DiscoveryPage; 