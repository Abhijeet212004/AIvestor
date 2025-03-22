import React, { useState, useRef, useEffect } from 'react';
import { Box, Flex, Text, Input, IconButton, VStack, Avatar, HStack, Spinner, useDisclosure, Button } from '@chakra-ui/react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSend, FiMic, FiMaximize, FiMinimize, FiX } from 'react-icons/fi';
import { useSpring, animated } from 'react-spring';
// Import LangChain and Gemini packages
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { HumanMessage, AIMessage, SystemMessage } from "@langchain/core/messages";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { RunnableSequence } from "@langchain/core/runnables";
import { formatDocumentsAsString } from "langchain/util/document";
// Firebase imports
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/config'; // Ensure this path is correct

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
  const [chatModel, setChatModel] = useState<ChatGoogleGenerativeAI | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { isOpen, onOpen, onClose } = useDisclosure({ defaultIsOpen: true });

  const expandSpring = useSpring({
    width: isExpanded ? '600px' : '380px',
    height: isExpanded ? '80vh' : '500px',
    config: { tension: 280, friction: 60 },
  });

  // Initialize the chat model
  useEffect(() => {
    // Initialize Gemini model
    const model = new ChatGoogleGenerativeAI({
      apiKey: "AIzaSyBBINhHV1--cR8VisK8UKxf0oEfeNhmd_g",
      modelName: "gemini-pro",
      temperature: 0.7,
      maxOutputTokens: 1024,
    });
    
    setChatModel(model);
    
    // Fetch user preferences
    const fetchUserPreferences = async () => {
      try {
        // Replace 'currentUserId' with actual user ID from your auth system
        const userId = 'currentUserId'; // TODO: get actual user ID
        const userDoc = await getDoc(doc(db, 'users', userId));
        
        if (userDoc.exists()) {
          setUserPreferences(userDoc.data() as UserPreferences);
        }
      } catch (error) {
        console.error("Error fetching user preferences:", error);
      }
    };
    
    fetchUserPreferences();
  }, []);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const createSystemPrompt = () => {
    let systemPrompt = `You are FinAI, a sophisticated financial assistant. 
You provide accurate, helpful and ethical financial advice.
Always present information clearly and avoid financial jargon unless necessary.
`;

    // Add user preferences to the system prompt if available
    if (userPreferences) {
      systemPrompt += `\nUser preferences:\n`;
      if (userPreferences.investmentGoals) {
        systemPrompt += `- Investment goals: ${userPreferences.investmentGoals.join(', ')}\n`;
      }
      if (userPreferences.riskTolerance) {
        systemPrompt += `- Risk tolerance: ${userPreferences.riskTolerance}\n`;
      }
      if (userPreferences.investmentHorizon) {
        systemPrompt += `- Investment horizon: ${userPreferences.investmentHorizon}\n`;
      }
      if (userPreferences.preferredSectors) {
        systemPrompt += `- Preferred sectors: ${userPreferences.preferredSectors.join(', ')}\n`;
      }
      if (userPreferences.preferredAssetClasses) {
        systemPrompt += `- Preferred asset classes: ${userPreferences.preferredAssetClasses.join(', ')}\n`;
      }
      systemPrompt += `\nTailor your responses to align with these preferences when appropriate.`;
    }

    return systemPrompt;
  };

  const handleSendMessage = async () => {
    if (inputValue.trim() === '' || !chatModel) return;
    
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
      // Prepare message history
      const messageHistory = [
        new SystemMessage(createSystemPrompt()),
      ];
      
      // Add previous conversation context (limit to last 5 for brevity)
      const recentMessages = messages.slice(-5);
      recentMessages.forEach(msg => {
        if (msg.sender === 'user') {
          messageHistory.push(new HumanMessage(msg.text));
        } else if (msg.sender === 'bot') {
          messageHistory.push(new AIMessage(msg.text));
        }
      });
      
      // Add the current user message
      messageHistory.push(new HumanMessage(inputValue));
      
      // Get response from Gemini
      const response = await chatModel.invoke(messageHistory);
      
      // Add bot response
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: response.content.toString(),
        sender: 'bot',
        timestamp: new Date(),
      };
      
      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error("Error getting AI response:", error);
      
      // Add error message
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: "I'm sorry, I encountered an error processing your request. Please try again.",
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
                  <Text fontSize="sm">{message.text}</Text>
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