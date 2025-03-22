import React, { useState } from 'react';
import { Box, Flex, Text, Button, HStack, useColorModeValue, VStack, Skeleton } from '@chakra-ui/react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { motion } from 'framer-motion';
import { FiArrowUp, FiArrowDown, FiClock } from 'react-icons/fi';

const MotionBox = motion(Box);

interface StockChartProps {
  symbol?: string;
  companyName?: string;
  data?: any[];
  isLoading?: boolean;
}

const StockChart: React.FC<StockChartProps> = ({
  symbol = 'AAPL',
  companyName = 'Apple Inc.',
  data = generateMockData(),
  isLoading = false,
}) => {
  const [timeframe, setTimeframe] = useState<'1D' | '1W' | '1M' | '3M' | '1Y'>('1M');
  
  // Calculate current price and price change
  const currentPrice = data[data.length - 1].price;
  const previousPrice = data[0].price;
  const priceChange = currentPrice - previousPrice;
  const priceChangePercentage = (priceChange / previousPrice) * 100;
  const isPositive = priceChange >= 0;

  const timeframeOptions: Array<'1D' | '1W' | '1M' | '3M' | '1Y'> = ['1D', '1W', '1M', '3M', '1Y'];

  return (
    <MotionBox
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="glass-card"
      p={4}
      borderRadius="xl"
      width="100%"
      height="100%"
      display="flex"
      flexDirection="column"
    >
      {isLoading ? (
        <VStack spacing={4} align="stretch" flex={1}>
          <Skeleton height="24px" width="150px" />
          <Skeleton height="40px" width="200px" />
          <Skeleton height="300px" />
          <Skeleton height="40px" />
        </VStack>
      ) : (
        <>
          <Flex justifyContent="space-between" alignItems="flex-start" mb={4}>
            <Box>
              <Text fontSize="sm" color="gray.400">
                {symbol}
              </Text>
              <Text fontSize="xl" fontWeight="bold">
                {companyName}
              </Text>
              <Flex alignItems="center" mt={1}>
                <Text fontSize="2xl" fontWeight="bold" mr={2}>
                  ${currentPrice.toFixed(2)}
                </Text>
                <Flex
                  alignItems="center"
                  color={isPositive ? 'green.400' : 'red.400'}
                  bg={isPositive ? 'rgba(49, 151, 149, 0.2)' : 'rgba(255, 99, 132, 0.2)'}
                  borderRadius="md"
                  px={2}
                  py={1}
                >
                  {isPositive ? <FiArrowUp /> : <FiArrowDown />}
                  <Text ml={1} fontSize="sm">
                    {Math.abs(priceChange).toFixed(2)} ({Math.abs(priceChangePercentage).toFixed(2)}%)
                  </Text>
                </Flex>
              </Flex>
            </Box>
            <HStack spacing={1}>
              {timeframeOptions.map((option) => (
                <Button
                  key={option}
                  size="sm"
                  variant={timeframe === option ? 'solid' : 'ghost'}
                  onClick={() => setTimeframe(option)}
                  colorScheme={timeframe === option ? 'blue' : undefined}
                  borderRadius="md"
                >
                  {option}
                </Button>
              ))}
            </HStack>
          </Flex>

          <Box flex={1} minH="300px">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="5%"
                      stopColor={isPositive ? "#0EA5E9" : "#EF4444"}
                      stopOpacity={0.8}
                    />
                    <stop
                      offset="95%"
                      stopColor={isPositive ? "#0EA5E9" : "#EF4444"}
                      stopOpacity={0}
                    />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="date"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#94A3B8', fontSize: 12 }}
                />
                <YAxis
                  domain={['dataMin - 5', 'dataMax + 5']}
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#94A3B8', fontSize: 12 }}
                  orientation="right"
                />
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.1)" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(15, 23, 42, 0.9)',
                    borderColor: 'rgba(255,255,255,0.1)',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                    color: '#F8FAFC',
                  }}
                  labelStyle={{ color: '#94A3B8' }}
                  formatter={(value) => [`$${value}`, 'Price']}
                />
                <Area
                  type="monotone"
                  dataKey="price"
                  stroke={isPositive ? "#0EA5E9" : "#EF4444"}
                  fillOpacity={1}
                  fill="url(#colorPrice)"
                  strokeWidth={2}
                  activeDot={{ r: 6, stroke: isPositive ? "#0EA5E9" : "#EF4444", strokeWidth: 2, fill: '#1E293B' }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </Box>

          <Flex justifyContent="space-between" alignItems="center" mt={4}>
            <Text fontSize="xs" color="gray.400" display="flex" alignItems="center">
              <FiClock style={{ marginRight: '4px' }} /> Last updated: {new Date().toLocaleTimeString()}
            </Text>
            <Button size="sm" variant="outline" borderRadius="md">
              View Details
            </Button>
          </Flex>
        </>
      )}
    </MotionBox>
  );
};

// Generate mock stock data
function generateMockData(isPositive = true) {
  const data = [];
  let price = isPositive ? 150 : 200;
  const now = new Date();
  
  for (let i = 0; i < 30; i++) {
    const date = new Date(now);
    date.setDate(date.getDate() - (30 - i));
    
    // Generate a random walk with trend
    const change = (Math.random() - (isPositive ? 0.4 : 0.6)) * 5;
    price += change;
    
    // Ensure price stays positive
    price = Math.max(price, 100);
    
    data.push({
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      price: Number(price.toFixed(2)),
      volume: Math.floor(Math.random() * 10000000) + 5000000,
    });
  }
  
  return data;
}

export default StockChart; 