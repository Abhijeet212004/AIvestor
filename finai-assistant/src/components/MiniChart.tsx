import React, { useState, useEffect } from 'react';
import { Box, Spinner, Text } from '@chakra-ui/react';
import { LineChart, Line, ResponsiveContainer } from 'recharts';
import { fetchStockHistory } from '../services/stockDataService';

interface MiniChartProps {
  symbol: string;
  isPositive?: boolean;
}

const MiniChart: React.FC<MiniChartProps> = ({ symbol, isPositive = true }) => {
  const [data, setData] = useState<Array<{ date: string; price: number }>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [usingFallback, setUsingFallback] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  // Generate fallback data when real data is unavailable
  const generateFallbackData = (points = 20, isUp = true): Array<{ date: string; price: number }> => {
    const result = [];
    let basePrice = 100;
    const now = new Date();
    
    for (let i = 0; i < points; i++) {
      const date = new Date(now);
      date.setDate(date.getDate() - (points - i));
      
      // Generate a small random change
      // Tends upward if isUp is true, downward if false
      const change = (Math.random() * 5) - (isUp ? 1 : 4);
      basePrice = Math.max(10, basePrice + change);
      
      result.push({
        date: date.toISOString().split('T')[0],
        price: basePrice
      });
    }
    
    return result;
  };

  useEffect(() => {
    const fetchData = async () => {
      // Only fetch if we have a valid symbol
      if (!symbol) {
        setLoading(false);
        setError('No symbol provided');
        setUsingFallback(true);
        setData(generateFallbackData(20, isPositive));
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        // Get Indian stock data history
        const historyData = await fetchStockHistory(symbol, '1mo');
        
        if (historyData && historyData.length > 0) {
          setData(historyData);
          setUsingFallback(false);
        } else {
          // If no data returned, use fallback
          setUsingFallback(true);
          setData(generateFallbackData(20, isPositive));
        }
      } catch (err) {
        console.error(`Error loading chart for ${symbol}:`, err);
        setError(`Failed to load ${symbol} data`);
        setUsingFallback(true);
        setData(generateFallbackData(20, isPositive));
        
        // Retry once after 2 seconds for transient errors
        if (retryCount < 1) {
          setTimeout(() => {
            setRetryCount(retryCount + 1);
          }, 2000);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [symbol, isPositive, retryCount]);

  return (
    <Box width="100%" height="100%">
      {loading ? (
        <Box display="flex" justifyContent="center" alignItems="center" height="100%">
          <Spinner size="sm" color={isPositive ? 'green.300' : 'red.300'} />
        </Box>
      ) : error ? (
        <Box display="flex" justifyContent="center" alignItems="center" height="100%">
          <Text fontSize="xs" color="gray.400">{usingFallback ? "Simulated" : error}</Text>
        </Box>
      ) : (
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <Line
              type="monotone"
              dataKey="price"
              stroke={isPositive ? "#38A169" : "#E53E3E"}
              dot={false}
              strokeWidth={1.5}
            />
          </LineChart>
        </ResponsiveContainer>
      )}
      {usingFallback && !loading && (
        <Text fontSize="6px" color="gray.500" position="absolute" bottom="0" right="0">
          Simulated
        </Text>
      )}
    </Box>
  );
};

export default MiniChart; 