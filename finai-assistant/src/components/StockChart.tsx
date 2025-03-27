import React, { useState, useEffect } from 'react';
import { Box, Flex, Text, Button, HStack, useColorModeValue, VStack, Skeleton } from '@chakra-ui/react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { motion } from 'framer-motion';
import { FiArrowUp, FiArrowDown, FiClock } from 'react-icons/fi';
import { fetchStockHistory, StockHistoryData } from '../services/stockDataService';

const MotionBox = motion(Box);

interface StockChartProps {
  symbol?: string;
  companyName?: string;
  data?: StockHistoryData[];
  isLoading?: boolean;
  period?: '1d' | '5d' | '1mo' | '3mo' | '6mo' | '1y' | '5y';
}

const StockChart: React.FC<StockChartProps> = ({
  symbol = 'NIFTY50',
  companyName,
  data: initialData,
  isLoading: initialLoading = false,
  period: initialPeriod = '1mo',
}) => {
  const [timeframe, setTimeframe] = useState<'1D' | '1W' | '1M' | '3M' | '1Y'>(mapPeriodToTimeframe(initialPeriod));
  const [chartData, setChartData] = useState<StockHistoryData[]>(initialData || []);
  const [loading, setLoading] = useState(initialLoading || !initialData);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string>(new Date().toLocaleTimeString());
  
  // Fetch data based on symbol and timeframe
  useEffect(() => {
    const fetchData = async () => {
      if (!symbol) return;
      
      try {
        setLoading(true);
        setError(null);
        
        // Map UI timeframe to API period
        const period = mapTimeframeToPeriod(timeframe);
        
        // Fetch historical data from our service
        const historyData = await fetchStockHistory(symbol, period);
        setChartData(historyData);
        setLastUpdated(new Date().toLocaleTimeString());
      } catch (err) {
        console.error("Error fetching stock data:", err);
        setError("Could not load stock data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
    
    // Set up auto-refresh (every 1 minute for 1D timeframe, every 5 minutes for others)
    const refreshInterval = timeframe === '1D' ? 60000 : 300000;
    const intervalId = setInterval(fetchData, refreshInterval);
    
    return () => clearInterval(intervalId);
  }, [symbol, timeframe]);
  
  // Helper functions to map between UI timeframes and API periods
  function mapTimeframeToPeriod(tf: string): '1d' | '5d' | '1mo' | '3mo' | '6mo' | '1y' | '5y' {
    switch (tf) {
      case '1D': return '1d';
      case '1W': return '5d';
      case '1M': return '1mo';
      case '3M': return '3mo';
      case '1Y': return '1y';
      default: return '1mo';
    }
  }
  
  function mapPeriodToTimeframe(period: string): '1D' | '1W' | '1M' | '3M' | '1Y' {
    switch (period) {
      case '1d': return '1D';
      case '5d': return '1W';
      case '1mo': return '1M';
      case '3mo': return '3M';
      case '1y': return '1Y';
      default: return '1M';
    }
  }
  
  // Calculate current price and price change
  const hasData = chartData && chartData.length > 0;
  const currentPrice = hasData ? chartData[chartData.length - 1].price : 0;
  const previousPrice = hasData ? chartData[0].price : 0;
  const priceChange = currentPrice - previousPrice;
  const priceChangePercentage = previousPrice ? (priceChange / previousPrice) * 100 : 0;
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
      {loading ? (
        <VStack spacing={4} align="stretch" flex={1}>
          <Skeleton height="24px" width="150px" />
          <Skeleton height="40px" width="200px" />
          <Skeleton height="300px" />
          <Skeleton height="40px" />
        </VStack>
      ) : error ? (
        <VStack spacing={4} align="center" justify="center" flex={1}>
          <Text color="red.400">{error}</Text>
          <Button size="sm" onClick={() => setTimeframe(timeframe)}>Retry</Button>
        </VStack>
      ) : (
        <>
          <Flex justifyContent="space-between" alignItems="flex-start" mb={4}>
            <Box>
              <Text fontSize="sm" color="gray.400">
                {symbol}
              </Text>
              <Text fontSize="xl" fontWeight="bold">
                {companyName || symbol}
              </Text>
              <Flex alignItems="center" mt={1}>
                <Text fontSize="2xl" fontWeight="bold" mr={2}>
                  ₹{currentPrice.toFixed(2)}
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
              <AreaChart data={chartData} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
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
                  formatter={(value) => [`₹${value}`, 'Price']}
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
              <FiClock style={{ marginRight: '4px' }} /> Last updated: {lastUpdated}
            </Text>
            <Button size="sm" variant="outline" borderRadius="md" onClick={() => window.open(`https://www.nseindia.com/get-quotes/equity?symbol=${symbol.replace('^', '').replace('.NS', '')}`, '_blank')}>
              View on NSE
            </Button>
          </Flex>
        </>
      )}
    </MotionBox>
  );
};

export default StockChart; 