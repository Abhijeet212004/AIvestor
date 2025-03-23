import React, { useState, useRef, useEffect } from 'react';
import { Box, Flex, Text, Input, IconButton, VStack, Avatar, HStack, Spinner, useDisclosure, Button } from '@chakra-ui/react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSend, FiMic, FiMaximize, FiMinimize, FiX } from 'react-icons/fi';
import { useSpring, animated } from 'react-spring';
// Firebase imports
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/config'; // Ensure this path is correct
import { GoogleGenerativeAI } from "@google/generative-ai";
import { addDocument } from '../services/documentService';
import { fetchStockData, fetchStockNews, StockData } from '../services/stockService';

const MotionBox = motion(Box);
const AnimatedBox = animated(Box);

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

// Interface for user preferences from Firestore
interface UserPreferences {
  investmentGoals?: string[];
  riskTolerance?: string;
  investmentHorizon?: string;
  preferredSectors?: string[];
  preferredAssetClasses?: string[];
}

const ChatBot: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Hello! I\'m your AI financial assistant. How can I help you today?',
      sender: 'bot',
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [userPreferences, setUserPreferences] = useState<UserPreferences | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { isOpen, onOpen, onClose } = useDisclosure({ defaultIsOpen: true });

  const expandSpring = useSpring({
    width: isExpanded ? '600px' : '380px',
    height: isExpanded ? '80vh' : '500px',
    config: { tension: 280, friction: 60 },
  });

  // Initialize and fetch user preferences
  useEffect(() => {
    // Fetch user preferences
    const fetchUserPreferences = async () => {
      try {
        // Replace 'currentUserId' with actual user ID from your auth system
        const userId = 'currentUserId'; // TODO: get actual user ID
        const userDoc = await getDoc(doc(db, 'users', userId));
        
        if (userDoc.exists()) {
          setUserPreferences(userDoc.data() as UserPreferences);
        } else {
          // Set sample preferences for testing if user has none
          setUserPreferences({
            investmentGoals: ['Retirement', 'Wealth growth'],
            riskTolerance: 'Moderate',
            investmentHorizon: 'Long-term (10+ years)',
            preferredSectors: ['Technology', 'Healthcare'],
            preferredAssetClasses: ['Stocks', 'ETFs', 'Bonds']
          });
        }
      } catch (error) {
        console.error("Error fetching user preferences:", error);
        // Set default preferences even on error
        setUserPreferences({
          investmentGoals: ['Retirement'],
          riskTolerance: 'Moderate',
          investmentHorizon: 'Medium-term (5-10 years)',
          preferredSectors: ['Technology'],
          preferredAssetClasses: ['ETFs']
        });
      }
    };
    
    fetchUserPreferences();
    
    // Seed financial documents for testing RAG
    const seedFinancialDocuments = async () => {
      await addDocument(
        "Risk tolerance is a measure of how much market volatility an investor can withstand. Conservative investors have low risk tolerance and prefer safer investments. Moderate risk investors can handle some market fluctuations for potentially higher returns. Aggressive investors have high risk tolerance and seek maximum returns despite high volatility.",
        { type: "education", topic: "risk_profile" }
      );
      
      await addDocument(
        "For conservative investors with low risk tolerance, a suitable strategy includes 60-70% bonds, 20-30% blue-chip stocks, and 10% cash or short-term CDs. This provides stability with some growth potential.",
        { type: "strategy", riskProfile: "conservative" }
      );
      
      await addDocument(
        "Moderate risk investors should consider a balanced portfolio of 50-60% stocks (mix of growth and value), 30-40% bonds, and 5-10% alternative investments. This provides growth potential with reasonable stability.",
        { type: "strategy", riskProfile: "moderate" }
      );
      
      await addDocument(
        "Aggressive investors with high risk tolerance might prefer 70-80% stocks (including growth stocks and emerging markets), 10-20% bonds, and 5-10% alternative investments like REITs or commodities. This maximizes growth potential but has higher volatility.",
        { type: "strategy", riskProfile: "aggressive" }
      );
    };

    seedFinancialDocuments();
    
  }, []);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Function to determine if text is a greeting or casual conversation
  const isGreetingOrCasual = (text: string): boolean => {
    const greetings = ['hi', 'hello', 'hey', 'howdy', 'greetings', 'good morning', 'good afternoon', 'good evening'];
    const casual = ['how are you', 'what\'s up', 'how\'s it going', 'nice to meet you'];
    
    const lowercaseText = text.toLowerCase();
    
    return greetings.some(greeting => lowercaseText.includes(greeting)) || 
           casual.some(phrase => lowercaseText.includes(phrase)) ||
           lowercaseText.split(' ').length < 3; // Very short messages are likely greetings
  };

  // Function to format the response text with proper paragraphs and spacing
  const formatResponseText = (text: string): string => {
    // Replace single newlines with double newlines for proper paragraphs
    let formatted = text.replace(/\n(?!\n)/g, '\n\n');
    
    // Ensure proper spacing after bullet points
    formatted = formatted.replace(/•\s*(.*?)(?=\n|$)/g, '• $1\n');
    formatted = formatted.replace(/\*\s*(.*?)(?=\n|$)/g, '• $1\n');
    
    // Ensure proper spacing between sections with headers
    formatted = formatted.replace(/([.:!?])\s*\n\s*([A-Z])/g, '$1\n\n$2');
    
    // Ensure double line breaks between numbered items
    formatted = formatted.replace(/(\d+\.)\s*(.*?)(?=\n|$)/g, '$1 $2\n');
    
    return formatted;
  };

  // Add a function to detect stock-related queries
  const isStockQuery = (text: string): { isStockQuery: boolean, symbol?: string } => {
    // Check for common patterns in stock queries
    const stockPricePattern = /(what is|tell me|show|current|price of) ([a-zA-Z\s]+) (stock|share)/i;
    const match = text.match(stockPricePattern);
    
    if (match) {
      let symbol = match[2].trim().toUpperCase();
      // Map common company names to their stock symbols
      const symbolMap: Record<string, string> = {
        "ZOMATO": "ZOMATO",
        "RELIANCE": "RELIANCE",
        "TCS": "TCS",
        "INFOSYS": "INFY",
        "WIPRO": "WIPRO",
        // Add more mappings as needed
      };
      
      // Try to find the symbol in our map
      const stockSymbol = Object.keys(symbolMap).find(key => 
        symbol.includes(key) || key.includes(symbol)
      );
      
      return { 
        isStockQuery: true, 
        symbol: stockSymbol ? symbolMap[stockSymbol] : symbol 
      };
    }
    
    return { isStockQuery: false };
  };

  // Modify the handleSendMessage function to check for stock queries
  const handleSendMessage = async () => {
    if (inputValue.trim() === '') return;
    
    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputValue,
      sender: 'user',
      timestamp: new Date(),
    };
    
    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);
    
    try {
      // Check if this is a stock query
      const stockQuery = isStockQuery(inputValue);
      
      if (stockQuery.isStockQuery && stockQuery.symbol) {
        // Fetch real-time stock data and news
        const stockData = await fetchStockData(stockQuery.symbol);
        const stockNews = await fetchStockNews(stockQuery.symbol);
        
        // Format the response with real-time data
        const dateStr = new Date().toLocaleDateString('en-IN', { 
          year: 'numeric', month: 'long', day: 'numeric' 
        });
        
        const timeStr = new Date().toLocaleTimeString('en-IN', {
          hour: '2-digit', minute: '2-digit'
        });
        
        let botResponse = `${stockQuery.symbol} (NSE: ${stockQuery.symbol}) - Real-time Data as of ${dateStr}, ${timeStr}\n\n`;
        
        botResponse += `Current Price: ₹${stockData.currentPrice.toFixed(2)}\n`;
        botResponse += `Change: ₹${stockData.change.toFixed(2)} (${stockData.changePercent.toFixed(2)}%)\n`;
        botResponse += `Day Range: ₹${stockData.low.toFixed(2)} - ₹${stockData.high.toFixed(2)}\n`;
        botResponse += `Opening Price: ₹${stockData.open.toFixed(2)}\n`;
        botResponse += `Previous Close: ₹${stockData.previousClose.toFixed(2)}\n`;
        botResponse += `Volume: ${stockData.volume.toLocaleString()}\n\n`;
        
        // Add recent news
        if (stockNews.length > 0) {
          botResponse += `Recent News:\n\n`;
          stockNews.forEach((news, index) => {
            botResponse += `${index + 1}. ${news.title}\n`;
            botResponse += `   Published: ${new Date(news.publishedAt).toLocaleDateString()}\n\n`;
          });
        }
        
        // Now use the AI to analyze this data
        const analysisPrompt = `
You are a financial analyst. Based on the following real-time data for ${stockQuery.symbol}, 
provide a brief analysis and recommendation:

${botResponse}

Focus on key indicators, recent performance, and market trends. Give a clear buy/hold/sell recommendation 
with target price based on technical and fundamental analysis.
`;

        const genAI = new GoogleGenerativeAI("AIzaSyBBINhHV1--cR8VisK8UKxf0oEfeNhmd_g");
        const model = genAI.getGenerativeModel({ 
          model: "gemini-pro",
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 1024,
          }
        });
        
        const result = await model.generateContent(analysisPrompt);
        const aiAnalysis = result.response.text();
        
        // Combine real-time data with AI analysis
        botResponse += `\nAnalysis:\n\n${aiAnalysis}`;
        
        // Format and send the response
        const formattedResponse = improvedFormatResponseText(botResponse);
        
        const botMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: formattedResponse,
          sender: 'bot',
          timestamp: new Date(),
        };
        
        setMessages((prev) => [...prev, botMessage]);
      } else {
        // Continue with regular AI processing for non-stock queries
        // Check if the message is a greeting or casual conversation
        const isJustGreeting = isGreetingOrCasual(inputValue);
        
        // Create system prompt based on message type
        let systemPrompt = '';
        
        if (isJustGreeting) {
          systemPrompt = `You are FinAI, a friendly and conversational AI financial assistant. 
Respond to this greeting in a warm, casual way. Do not give investment advice unless explicitly asked.
Keep your response short and engaging. You could ask if they're interested in learning about investments, 
but don't immediately dive into financial topics.

Respond in well-formatted text with proper spacing between paragraphs. Keep it concise.`;
        } else {
          systemPrompt = `You are FinAI, a confident financial analyst and investment advisor for Indian investors.
When users ask about specific stocks or investment decisions, provide DIRECT and CLEAR recommendations.

IMPORTANT: Users want your professional opinion. Do NOT refuse to give advice on specific investments. 
Do NOT include disclaimers about consulting financial advisors. Do NOT say you can't give investment advice.
Users are asking for YOUR analysis and recommendation, not general education.

For stock-specific questions, provide:
1. Current stock analysis (price trend, recent news, key metrics)
2. Your clear buy/hold/sell recommendation with target price
3. Reasoning behind your recommendation
4. Alternative investments if relevant

When formatting your response:
1. Use clear, simple language with direct statements
2. Use proper paragraphs with double line breaks between them
3. Use clean bullet points with • (not asterisks)
4. Create clear section headers
5. Ensure adequate spacing between sections
6. Make your buy/sell/hold recommendation extremely clear
7. Give exact price targets and timelines when possible
8. For Indian stocks, include NSE/BSE ticker symbols
9. Use language like "I recommend" instead of "you might consider"
10. Be decisive - users want clarity, not hedging

For Indian market questions, provide specific stock names, mutual funds, or ETFs available in India.
Your job is to give specific, actionable investment advice based on your analysis of the market and the user's situation.`;
        }

        // Format user preferences in a more structured way
        let userPreferencesText = '';
        if (userPreferences && !isJustGreeting) {
          userPreferencesText = 'User preferences:\n';
          if (userPreferences.investmentGoals && userPreferences.investmentGoals.length > 0) {
            userPreferencesText += `- Investment goals: ${userPreferences.investmentGoals.join(', ')}\n`;
          }
          if (userPreferences.riskTolerance) {
            userPreferencesText += `- Risk tolerance: ${userPreferences.riskTolerance}\n`;
          }
          if (userPreferences.investmentHorizon) {
            userPreferencesText += `- Investment horizon: ${userPreferences.investmentHorizon}\n`;
          }
          if (userPreferences.preferredSectors && userPreferences.preferredSectors.length > 0) {
            userPreferencesText += `- Preferred sectors: ${userPreferences.preferredSectors.join(', ')}\n`;
          }
          if (userPreferences.preferredAssetClasses && userPreferences.preferredAssetClasses.length > 0) {
            userPreferencesText += `- Preferred asset classes: ${userPreferences.preferredAssetClasses.join(', ')}\n`;
          }
        } else if (!isJustGreeting) {
          // Provide default guidance if no preferences set
          userPreferencesText = 'User has not set specific investment preferences yet. Provide general advice and suggest setting up a profile.';
        }

        console.log("Sending request to Gemini API with prompt:", `${systemPrompt}\n\n${userPreferencesText}\n\nUser: ${inputValue}`);
        
        const genAI = new GoogleGenerativeAI("AIzaSyBBINhHV1--cR8VisK8UKxf0oEfeNhmd_g");
        const model = genAI.getGenerativeModel({ 
          model: "gemini-2.0-pro-exp-02-05",
          generationConfig: {
            temperature: 0.9,
            topP: 0.95,
            topK: 40,
            maxOutputTokens: 2048,
          }
        });

        const result = await model.generateContent(`${systemPrompt}\n\n${userPreferencesText}\n\nUser: ${inputValue}`);
        let botResponse = result.response.text();

        // Enhanced formatting function to properly handle the response
        botResponse = improvedFormatResponseText(botResponse);

        // Add bot response
        const botMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: botResponse,
          sender: 'bot',
          timestamp: new Date(),
        };

        setMessages((prev) => [...prev, botMessage]);
      }
    } catch (error) {
      console.error("Error getting AI response:", error);

      // Add a more descriptive error message
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: `I'm sorry, I encountered an error processing your request. Technical details: ${error instanceof Error ? error.message : 'Unknown error'}. Please try again.`,
        sender: 'bot',
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  // Improved formatting function to handle markdown and ensure better display
  const improvedFormatResponseText = (text: string): string => {
    // Replace all markdown asterisks with clean formatting
    let formatted = text;

    // Remove asterisk-based formatting and replace with clean formatting
    formatted = formatted.replace(/\*\*(.*?)\*\*/g, '$1'); // Remove bold markers
    formatted = formatted.replace(/\*(.*?)\*/g, '$1');     // Remove italics markers

    // Ensure proper spacing after bullet points
    formatted = formatted.replace(/•\s*(.*?)(?=\n|$)/g, '• $1\n');

    // Ensure double newlines between sections
    formatted = formatted.replace(/([.:!?])\s*\n([A-Z])/g, '$1\n\n$2');

    // Ensure paragraphs have proper spacing
    formatted = formatted.replace(/\n{3,}/g, '\n\n'); // Replace excessive newlines with double newlines
    formatted = formatted.replace(/\n(?!\n)/g, '\n\n'); // Replace single newlines with double newlines

    // Ensure proper spacing between numbered list items
    formatted = formatted.replace(/(\d+\.)\s*(.*?)(?=\n|$)/g, '$1 $2\n');

    // Ensure proper spacing after section headers (typically ending with colon)
    formatted = formatted.replace(/(.*?):\s*\n/g, '$1:\n\n');

    return formatted;
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 300);
  };

  const suggestedQuestions = [
    "What investment strategy suits my risk profile?",
    "How should I diversify my portfolio?",
    "Explain mutual funds vs. ETFs",
    "What are current market trends?"
  ];

  if (!isOpen) {
    return (
      <MotionBox
        position="fixed"
        bottom="24px"
        right="24px"
        zIndex="999"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        <IconButton
          aria-label="Open chat"
          icon={<Avatar src="/finai-logo.png" name="FinAI Assistant" />}
          onClick={onOpen}
          size="lg"
          rounded="full"
          className="neon-glow"
          bg="brand.500"
          _hover={{ bg: 'brand.600' }}
        />
      </MotionBox>
    );
  }

  return (
    <AnimatePresence>
      <MotionBox
        position="fixed"
        bottom="24px"
        right="24px"
        zIndex="999"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 50 }}
        transition={{ duration: 0.3 }}
      >
        <AnimatedBox
          style={expandSpring}
          className="glass-card"
          display="flex"
          flexDirection="column"
          overflow="hidden"
          position="relative"
        >
          {/* Chat Header */}
          <Flex
            p={4}
            borderBottom="1px solid rgba(255, 255, 255, 0.1)"
            justify="space-between"
            align="center"
            bg="rgba(14, 165, 233, 0.1)"
          >
            <HStack>
              <Avatar size="sm" name="FinAI Assistant" bg="brand.500" />
              <Text fontWeight="bold">FinAI Assistant</Text>
            </HStack>
            <HStack>
              <IconButton
                aria-label={isExpanded ? "Minimize" : "Maximize"}
                icon={isExpanded ? <FiMinimize /> : <FiMaximize />}
                size="sm"
                variant="ghost"
                onClick={toggleExpand}
              />
              <IconButton
                aria-label="Close"
                icon={<FiX />}
                size="sm"
                variant="ghost"
                onClick={onClose}
              />
            </HStack>
          </Flex>

          {/* Messages Container */}
          <VStack
            flex="1"
            overflowY="auto"
            p={4}
            spacing={4}
            align="stretch"
            css={{
              '&::-webkit-scrollbar': {
                width: '8px',
              },
              '&::-webkit-scrollbar-track': {
                background: 'rgba(0, 0, 0, 0.1)',
              },
              '&::-webkit-scrollbar-thumb': {
                background: 'rgba(255, 255, 255, 0.1)',
                borderRadius: '4px',
              },
            }}
          >
            {messages.map((message) => (
              <MotionBox
                key={message.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                alignSelf={message.sender === 'user' ? 'flex-end' : 'flex-start'}
                maxW="70%"
              >
                <Box
                  bg={message.sender === 'user' ? 'brand.500' : 'rgba(255, 255, 255, 0.1)'}
                  p={3}
                  borderRadius={message.sender === 'user' ? '12px 12px 0 12px' : '12px 12px 12px 0'}
                >
                  <Text 
                    fontSize="sm"
                    whiteSpace="pre-wrap" // This ensures line breaks are preserved
                  >
                    {message.text}
                  </Text>
                </Box>
                <Text fontSize="xs" color="gray.400" mt={1} textAlign={message.sender === 'user' ? 'right' : 'left'}>
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </Text>
              </MotionBox>
            ))}
            {isTyping && (
              <MotionBox
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                alignSelf="flex-start"
                maxW="70%"
              >
                <Box bg="rgba(255, 255, 255, 0.1)" p={3} borderRadius="12px 12px 12px 0">
                  <Flex align="center">
                    <Spinner size="xs" mr={2} />
                    <Text fontSize="sm">FinAI is thinking...</Text>
                  </Flex>
                </Box>
              </MotionBox>
            )}
            <div ref={messagesEndRef} />
          </VStack>

          {/* Suggested Questions */}
          {messages.length < 3 && (
            <Box p={3} borderTop="1px solid rgba(255, 255, 255, 0.1)">
              <Text fontSize="xs" mb={2} color="gray.400">Suggested questions:</Text>
              <Flex overflowX="auto" pb={2} css={{
                '&::-webkit-scrollbar': {
                  height: '4px',
                },
                '&::-webkit-scrollbar-thumb': {
                  background: 'rgba(255, 255, 255, 0.1)',
                },
              }}>
                {suggestedQuestions.map((question, index) => (
                  <MotionBox
                    key={index}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ scale: 1.05 }}
                    mr={2}
                    flexShrink={0}
                  >
                    <Button
                      size="xs"
                      variant="outline"
                      borderColor="rgba(255, 255, 255, 0.2)"
                      borderRadius="full"
                      onClick={() => {
                        setInputValue(question);
                        inputRef.current?.focus();
                      }}
                    >
                      {question}
                    </Button>
                  </MotionBox>
                ))}
              </Flex>
            </Box>
          )}

          {/* Input Area */}
          <Flex p={3} borderTop="1px solid rgba(255, 255, 255, 0.1)" align="center">
            <Input
              ref={inputRef}
              placeholder="Ask about investing, financial concepts..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              bg="rgba(255, 255, 255, 0.05)"
              border="none"
              borderRadius="full"
              _focus={{ boxShadow: "0 0 0 1px rgba(14, 165, 233, 0.6)" }}
              mr={2}
            />
            <IconButton
              aria-label="Voice input"
              icon={<FiMic />}
              variant="ghost"
              isRound
              mr={1}
            />
            <IconButton
              aria-label="Send message"
              icon={<FiSend />}
              onClick={handleSendMessage}
              isRound
              colorScheme="blue"
              disabled={inputValue.trim() === ''}
            />
          </Flex>
        </AnimatedBox>
      </MotionBox>
    </AnimatePresence>
  );
};

export default ChatBot;