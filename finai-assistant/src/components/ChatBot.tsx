import React, { useState, useRef, useEffect } from 'react';
import { Box, Flex, Text, Input, IconButton, VStack, Avatar, HStack, Spinner, useDisclosure, Button } from '@chakra-ui/react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSend, FiMic, FiMaximize, FiMinimize, FiX } from 'react-icons/fi';
import { useSpring, animated } from 'react-spring';
// Firebase imports
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/config'; // Ensure this path is correct
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";
import { addDocument } from '../services/documentService';
import { 
  fetchFinancialNews, 
  fetchBusinessHeadlines, 
  fetchCompanyNews, 
  formatNewsAsString,
  NewsArticle 
} from '../services/newsService';
import finnhubService from '../services/finnhubService';

const MotionBox = motion(Box);
const AnimatedBox = animated(Box);

// Interface for message objects
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
  const [userPreferences, setUserPreferences] = useState<UserPreferences | null>(null);

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
    // Fetch user preferences from Firebase
    const fetchUserPreferences = async () => {
      try {
        // Replace 'currentUserId' with actual user ID from your auth system
        const userId = 'currentUserId'; // TODO: get actual user ID
        const userDoc = await getDoc(doc(db, 'users', userId));
        
        if (userDoc.exists()) {
          setUserPreferences(userDoc.data() as UserPreferences);
          console.log("Loaded user preferences from Firebase:", userDoc.data());
        } else {
          // Set sample preferences for testing if user has none
          setUserPreferences({
            investmentGoals: ['Retirement', 'Wealth growth'],
            riskTolerance: 'Moderate',
            investmentHorizon: 'Long-term (10+ years)',
            preferredSectors: ['Technology', 'Healthcare'],
            preferredAssetClasses: ['Stocks', 'ETFs', 'Bonds']
          });
          console.log("Set default user preferences");
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
        console.log("Set fallback user preferences after error");
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

  // Helper functions for chatbot 
  // Get relevant news for the query
  const getRelevantNews = async (query: string): Promise<string> => {
    try {
      // First try direct company news if it appears to be a query about a company
      const companyNameRegex = /(apple|microsoft|google|amazon|facebook|meta|tesla|nvidia|amd|intel|reliance|tcs|infosys|hdfc|sbi|icici|bharti|airtel|zomato)/i;
      const companyMatch = query.match(companyNameRegex);
      
      if (companyMatch && companyMatch[1]) {
        try {
          const companyName = companyMatch[1].toLowerCase();
          console.log(`Fetching news for company: ${companyName}`);
          // Map common company names to their stock symbols
          const companySymbolMap: Record<string, string> = {
            'apple': 'AAPL',
            'microsoft': 'MSFT',
            'google': 'GOOGL',
            'amazon': 'AMZN',
            'facebook': 'META',
            'meta': 'META',
            'tesla': 'TSLA',
            'nvidia': 'NVDA',
            'amd': 'AMD',
            'intel': 'INTC',
            'reliance': 'RELIANCE.NS',
            'tcs': 'TCS.NS',
            'infosys': 'INFY.NS',
            'hdfc': 'HDFCBANK.NS',
            'sbi': 'SBIN.NS',
            'icici': 'ICICIBANK.NS',
            'bharti': 'BHARTIARTL.NS',
            'airtel': 'BHARTIARTL.NS',
            'zomato': 'ZOMATO.NS'
          };
          
          const symbol = companySymbolMap[companyName] || companyName.toUpperCase();
          const companyNews = await fetchCompanyNews(symbol);
          
          if (companyNews && companyNews.length > 0) {
            return formatNewsAsString(companyNews);
          }
        } catch (error) {
          console.error("Error fetching company specific news:", error);
          // Fall through to general news
        }
      }
      
      // Try to get financial news based on query
      const newsArticles = await fetchFinancialNews(query);
      if (newsArticles && newsArticles.length > 0) {
        return formatNewsAsString(newsArticles);
      }
      
      // Fall back to business headlines if no specific news
      const headlines = await fetchBusinessHeadlines();
      return formatNewsAsString(headlines);
    } catch (error) {
      console.error("Failed to get news:", error);
      return "Unable to fetch relevant news at this time.";
    }
  };

  // Call the Flask API to get AI response
  const callVertexAI = async (userQuery: string, newsContext: string = '', systemPrompt: string = ''): Promise<string> => {
    try {
      // Use the API with Flask backend
      const response = await fetch('https://aivestor-5.onrender.com/chatbot-api/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          userMessage: userQuery,
          newsContext: newsContext,
          systemPrompt: systemPrompt,
          userPreferences: userPreferences || {} // Send preferences if available
        }),
      });
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      const data = await response.json();
      if (data && data.response) {
        return data.response;
      } else {
        throw new Error("Invalid response format");
      }
    } catch (error) {
      console.error("Error calling vertex AI:", error);
      throw error;
    }
  };

  // Get response from advanced model (JavaScript implementation) as backup
  const getAdvancedModelResponse = async (userQuery: string): Promise<string> => {
    try {
      const genAI = new GoogleGenerativeAI("AIzaSyBBINhHV1--cR8VisK8UKxf0oEfeNhmd_g");
      const model = genAI.getGenerativeModel({ 
        model: "gemini-1.5-pro",
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 1024,
        }
      });
      
      // Create system prompt
      let systemPrompt = `You are AIvestor, a decisive financial analyst and investment advisor for Indian investors.

When users ask about specific stocks or investment decisions, provide DIRECT and CLEAR recommendations.

IMPORTANT: 
1. Always end with a SPECIFIC, ACTIONABLE recommendation (BUY, SELL, or HOLD)
2. Format your advice consistently like this at the end:

Recommendation: [BUY/SELL/HOLD] (with reason)

3. Answer directly without hedging or excessive disclaimers

For specific investment questions, prioritize:
1. Clear analysis based on current market conditions in India
2. Direct recommendation on action to take
3. Reasoning behind the recommendation
4. For Indian stocks, include NSE/BSE ticker symbols

For Indian market questions, provide specific names of actual mutual funds and ETFs available in India.`;

      // Format user preferences
      let userPreferencesText = '';
      if (userPreferences) {
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
      }

      const result = await model.generateContent(`${systemPrompt}\n\n${userPreferencesText}\n\nUser: ${userQuery}`);
      return result.response.text();
    } catch (error) {
      console.error("Error with advanced model:", error);
      throw error;
    }
  };

  // Function to determine if text is a greeting or casual conversation
  const isGreetingOrCasual = (text: string): boolean => {
    const greetings = ['hi', 'hello', 'hey', 'howdy', 'greetings', 'good morning', 'good afternoon', 'good evening'];
    const casual = ['how are you', 'what\'s up', 'how\'s it going', 'nice to meet you'];
    
    const lowerText = text.toLowerCase();
    return greetings.some(g => lowerText === g || lowerText.startsWith(g + ' ')) ||
           casual.some(c => lowerText.includes(c));
  };

  // Format response text to improve readability
  const formatResponseText = (text: string): string => {
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
  
  // Test simple API for debugging
  const testSimpleAPI = async (userMessage: string): Promise<string> => {
    try {
      const response = await fetch('https://aivestor-5.onrender.com/chatbot-api/api/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      // Safely parse JSON with error handling
      let data;
      try {
        const responseText = await response.text();
        if (!responseText || responseText.trim() === '') {
          throw new Error('Empty response from server');
        }
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error('Error parsing JSON response:', parseError);
        throw new Error('Failed to parse response from chatbot server');
      }
      
      return data.response;
    } catch (error) {
      console.error('Error calling test API:', error);
      throw error;
    }
  };

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
      let botResponse: string;

      // Check if the message is asking about a stock price
      const stockPriceRegex = /(?:what|what's|whats|tell me|show me|get).*(?:price|value|worth|cost|quote).*(?:of|for)\s+([a-zA-Z\s]+)/i;
      const stockMatch = inputValue.match(stockPriceRegex);
      
      // If it's a stock price query, try to fetch real-time data
      if (stockMatch && stockMatch[1]) {
        const stockName = stockMatch[1].trim().toLowerCase();
        try {
          // Map of common stock names to symbols
          const stockSymbolMap: Record<string, string> = {
            'zomato': 'ZOMATO.NS',
            'reliance': 'RELIANCE.NS',
            'tcs': 'TCS.NS',
            'infosys': 'INFY.NS',
            'hdfc': 'HDFCBANK.NS',
            'sbi': 'SBIN.NS',
            'icici': 'ICICIBANK.NS',
            'bharti airtel': 'BHARTIARTL.NS',
            'airtel': 'BHARTIARTL.NS',
            'itc': 'ITC.NS',
            'tata motors': 'TATAMOTORS.NS',
            'maruti': 'MARUTI.NS',
            'wipro': 'WIPRO.NS',
            'axis bank': 'AXISBANK.NS',
            'axis': 'AXISBANK.NS',
            'kotak': 'KOTAKBANK.NS'
          };
          
          // Get the symbol
          let symbol = stockSymbolMap[stockName] || `${stockName.replace(/\s+/g, '')}.NS`;
          
          console.log(`Attempting to fetch real-time price for symbol: ${symbol}`);
          const stockData = await finnhubService.getRealTimeStockDataFromYFinanceServer(symbol);
          
          if (stockData && stockData.current_price) {
            const formattedPrice = typeof stockData.current_price === 'number' 
              ? stockData.current_price.toFixed(2) 
              : stockData.current_price;
              
            const changeText = stockData.change && stockData.percent_change 
              ? ` (${stockData.change > 0 ? '+' : ''}${typeof stockData.change === 'number' ? stockData.change.toFixed(2) : stockData.change}, ${stockData.percent_change > 0 ? '+' : ''}${typeof stockData.percent_change === 'number' ? stockData.percent_change.toFixed(2) : stockData.percent_change}%)` 
              : '';
              
            const priceResponse = `The current stock price of ${stockData.company_name || stockName.toUpperCase()} is ₹${formattedPrice}${changeText}.`;
            
            // Add market cap and volume info if available
            let additionalInfo = '';
            if (stockData.market_cap && stockData.market_cap !== 'N/A') {
              const marketCapInBillions = (stockData.market_cap / 1000000000).toFixed(2);
              additionalInfo += ` Market Cap: ₹${marketCapInBillions}B.`;
            }
            
            if (stockData.volume && stockData.volume !== 'N/A') {
              additionalInfo += ` Volume: ${stockData.volume.toLocaleString()}.`;
            }
            
            // Still send to AI for analysis and recommendation
            const analysisPrompt = `The current stock price of ${stockName.toUpperCase()} is ₹${formattedPrice}${changeText}.${additionalInfo} Based on this information and considering the user's investment profile (${userPreferences?.riskTolerance || 'Moderate'} risk tolerance with ${userPreferences?.investmentHorizon || 'Medium-term'} horizon), provide a brief analysis and recommendation. The user is interested in ${userPreferences?.preferredSectors?.join(', ') || 'various sectors'} and has goals including ${userPreferences?.investmentGoals?.join(', ') || 'general investing'}.`;
            
            try {
              const aiAnalysis = await callVertexAI(analysisPrompt, '', '');
              botResponse = `${priceResponse}${additionalInfo}\n\n${aiAnalysis}`;
            } catch (error) {
              // If AI analysis fails, still return the price
              console.error("Failed to get AI analysis:", error);
              botResponse = `${priceResponse}${additionalInfo}\n\nI don't have enough additional information to provide a detailed analysis at this time.`;
            }
          } else {
            // If we couldn't get the price data, proceed with normal AI response
            console.log("Could not find stock price data, falling back to normal response");
            botResponse = await callVertexAI(inputValue, '', '');
          }
        } catch (stockError) {
          console.error("Error fetching stock price:", stockError);
          // Fall back to normal AI processing
          botResponse = await callVertexAI(inputValue, '', '');
        }
      } else {
        // Check if the message is a greeting or casual conversation
        const greetingRegex = /^(hi|hello|hey|greetings|howdy|hola|sup|yo|what's up|how are you|good morning|good afternoon|good evening)$/i;
        const isJustGreeting = greetingRegex.test(inputValue.trim());

        // Create system prompt based on message type
        let systemPrompt = '';
        
        if (isJustGreeting) {
          systemPrompt = `You are AIvestor, a friendly and conversational AI financial assistant. 
Respond to this greeting in a warm, casual way. Do not give investment advice unless explicitly asked.
Keep your response short and engaging. You could ask if they're interested in learning about investments, 
but don't immediately dive into financial topics.

Respond in well-formatted text with proper spacing between paragraphs. Keep it concise.`;
        } else {
          systemPrompt = `You are AIvestor, a decisive financial analyst and investment advisor for Indian investors.
When users ask about specific stocks or investment decisions, provide DIRECT and CLEAR recommendations.

IMPORTANT: 
1. DO NOT include placeholder text like [insert X]. Use only what you know.
2. DO NOT say "this is not financial advice" or add disclaimers.
3. DO NOT tell users to consult financial advisors.
4. NEVER mention that you lack real-time data - work with what you're given.

For stock-specific questions:
1. Always start with actual data provided in the context (price, news, etc.)
2. Give a clear buy/hold/sell recommendation with a target price
3. Be confident and direct in your assessment
4. Provide specific ETF recommendations with actual ticker symbols

For formatting:
1. Use direct statements like "I recommend buying X" not "you might consider X"
2. Use proper spacing between paragraphs
3. Make your recommendation stand out clearly
4. For Indian stocks, include NSE/BSE ticker symbols

For Indian market questions, provide specific names of actual mutual funds and ETFs available in India.`;
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

        // Get relevant news data
        let relevantNewsText = '';
        if (!isJustGreeting) {
          try {
            console.log("Fetching relevant news for query:", inputValue);
            relevantNewsText = await getRelevantNews(inputValue);
            console.log("Got news data:", relevantNewsText.substring(0, 100) + "...");
          } catch (error) {
            console.error("Error fetching news:", error);
            relevantNewsText = "Unable to fetch latest news at this time.";
          }
        }

        // Update systemPrompt to include news data
        systemPrompt += `\n\nLatest relevant news for context:
${relevantNewsText}

Consider this news data when providing your financial analysis and recommendations. Use the most relevant pieces to support your advice.`;

        console.log("Sending request to Vertex API with prompt:", `${systemPrompt}\n\n${userPreferencesText}\n\nUser: ${inputValue}`);
        
        // For non-greetings, use the advanced Flask API first, then fall back to the direct Gemini model
        if (!isJustGreeting) {
          try {
            // Use the main Vertex AI endpoint instead of the test endpoint
            botResponse = await callVertexAI(inputValue, relevantNewsText, systemPrompt);
            botResponse = formatResponseText(botResponse);
          } catch (error) {
            console.error("Error with Flask API:", error);
            
            try {
              // Then try the JavaScript implementation (with renamed function)
              botResponse = await getAdvancedModelResponse(inputValue);
              botResponse = formatResponseText(botResponse);
            } catch (error) {
              console.error("Error with advanced model:", error);
              
              // Finally fall back to the basic Gemini model
              console.log("Falling back to basic Gemini API");
              const genAI = new GoogleGenerativeAI("AIzaSyBBINhHV1--cR8VisK8UKxf0oEfeNhmd_g");
              const model = genAI.getGenerativeModel({ 
                model: "gemini-1.5-pro",
                generationConfig: {
                  temperature: 0.7,
                  maxOutputTokens: 1024,
                }
              });
              const result = await model.generateContent(`${systemPrompt}\n\n${userPreferencesText}\n\nUser: ${inputValue}`);
              botResponse = result.response.text();
            }
          }
        } else {
          // For greetings, continue using the simple model directly
          const genAI = new GoogleGenerativeAI("AIzaSyBBINhHV1--cR8VisK8UKxf0oEfeNhmd_g");
          const model = genAI.getGenerativeModel({ 
            model: "gemini-1.5-pro",
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 1024,
            }
          });
          const result = await model.generateContent(`${systemPrompt}\n\n${userPreferencesText}\n\nUser: ${inputValue}`);
          botResponse = result.response.text();
        }
      }

      // Add bot response
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: botResponse,
        sender: 'bot',
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, botMessage]);
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
    "How should I diversify my investments?",
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
          icon={<Avatar src="/finai-logo.png" name="AIvestor Assistant" />}
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
              <Avatar size="sm" name="AIvestor Assistant" bg="brand.500" />
              <Text fontWeight="bold">AIvestor Assistant</Text>
            </HStack>
            <HStack>
              <IconButton
                aria-label={isExpanded ? "Minimize" : "Maximize"}
                icon={isExpanded ? <FiMinimize /> : <FiMaximize />}
                size="sm"
                variant="ghost"
                bg="white"
                onClick={toggleExpand}
              />
              <IconButton
                aria-label="Close"
                icon={<FiX />}
                size="sm"
                variant="ghost"
                bg="white"
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
                    <Text fontSize="sm">AIvestor is thinking...</Text>
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
                      bg="white"
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