import React, { useState } from 'react';
import { Box, Container, Grid, GridItem, Heading, Text, Flex, Tag, VStack, HStack, Icon, Button, useBreakpointValue, Input, InputGroup, InputLeftElement } from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { FiMessageCircle, FiSearch, FiTrendingUp, FiDollarSign, FiPieChart, FiShield, FiBarChart2, FiBookOpen } from 'react-icons/fi';
import Navigation from '../components/Navigation';
import AnimatedCard from '../components/AnimatedCard';

const MotionBox = motion(Box);

const ChatPage: React.FC = () => {
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const isMobile = useBreakpointValue({ base: true, md: false });

  // Chat topics with icons and descriptions
  const chatTopics = [
    {
      id: 'investing-basics',
      title: 'Investing Basics',
      icon: FiTrendingUp,
      color: '#0EA5E9',
      description: 'Learn about stocks, bonds, mutual funds, and how to start investing.',
      suggestedQuestions: [
        'What is the difference between stocks and bonds?',
        'How do I start investing with a small amount of money?',
        'What are index funds and why are they recommended for beginners?'
      ]
    },
    {
      id: 'retirement-planning',
      title: 'Retirement Planning',
      icon: FiPieChart,
      color: '#8B5CF6',
      description: 'Plan for your future with retirement accounts and long-term strategies.',
      suggestedQuestions: [
        'What is the difference between a 401(k) and an IRA?',
        'How much should I save for retirement?',
        'When should I start planning for retirement?'
      ]
    },
    {
      id: 'market-analysis',
      title: 'Market Analysis',
      icon: FiBarChart2,
      color: '#F59E0B',
      description: 'Get insights on market trends, sectors, and economic indicators.',
      suggestedQuestions: [
        'How do interest rates affect the stock market?',
        'Which sectors perform well during inflation?',
        'What economic indicators should I watch for investment decisions?'
      ]
    },
    {
      id: 'personal-finance',
      title: 'Personal Finance',
      icon: FiDollarSign,
      color: '#10B981',
      description: 'Manage budgets, debt, emergency funds, and improve financial health.',
      suggestedQuestions: [
        'How do I create an effective monthly budget?',
        'What is the fastest way to pay off debt?',
        'How large should my emergency fund be?'
      ]
    },
    {
      id: 'financial-literacy',
      title: 'Financial Literacy',
      icon: FiBookOpen,
      color: '#EC4899',
      description: 'Build your knowledge of financial concepts and terminology.',
      suggestedQuestions: [
        'Can you explain compound interest in simple terms?',
        'What is the Rule of 72?',
        'How do I read a company\'s financial statement?'
      ]
    },
    {
      id: 'risk-management',
      title: 'Risk Management',
      icon: FiShield,
      color: '#6366F1',
      description: 'Protect your investments and understand risk factors.',
      suggestedQuestions: [
        'How do I diversify my portfolio effectively?',
        'What is the relationship between risk and return?',
        'How can I hedge against market downturns?'
      ]
    }
  ];

  return (
    <Box minH="100vh" bg="darkBlue.900">
      <Navigation />
      
      <Box as="main" pt="80px">
        <Container maxW="container.xl" px={4}>
          <Grid templateColumns={{ base: "1fr", lg: "280px 1fr" }} gap={8}>
            {/* Topics Sidebar */}
            <GridItem display={{ base: selectedTopic ? 'none' : 'block', lg: 'block' }}>
              <VStack spacing={4} align="stretch" position={{ base: 'relative', lg: 'sticky' }} top={{ lg: '100px' }}>
                <Heading size="md" mb={2}>Chat Topics</Heading>
                
                <InputGroup mb={4}>
                  <InputLeftElement pointerEvents="none">
                    <Icon as={FiSearch} color="gray.400" />
                  </InputLeftElement>
                  <Input placeholder="Search topics..." bg="whiteAlpha.100" border="none" />
                </InputGroup>
                
                {chatTopics.map((topic, index) => (
                  <MotionBox
                    key={topic.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    onClick={() => setSelectedTopic(topic.id)}
                  >
                    <AnimatedCard
                      p={4}
                      hoverEffect="lift"
                      cursor="pointer"
                      bg={selectedTopic === topic.id ? `${topic.color}20` : 'transparent'}
                      borderLeft={selectedTopic === topic.id ? `3px solid ${topic.color}` : '3px solid transparent'}
                    >
                      <Flex align="center">
                        <Flex
                          align="center"
                          justify="center"
                          w="40px"
                          h="40px"
                          borderRadius="md"
                          bg={`${topic.color}20`}
                          color={topic.color}
                          mr={3}
                        >
                          <Icon as={topic.icon} boxSize={5} />
                        </Flex>
                        <Box>
                          <Text fontWeight="medium">{topic.title}</Text>
                          <Text fontSize="xs" color="gray.400" noOfLines={1}>
                            {topic.description}
                          </Text>
                        </Box>
                      </Flex>
                    </AnimatedCard>
                  </MotionBox>
                ))}
              </VStack>
            </GridItem>
            
            {/* Chat Interface Area */}
            <GridItem>
              {selectedTopic ? (
                <ChatInterface 
                  topic={chatTopics.find(t => t.id === selectedTopic)!} 
                  onBack={() => isMobile ? setSelectedTopic(null) : null}
                />
              ) : (
                <Box display={{ base: 'block', lg: 'none' }}>
                  <Text textAlign="center" fontSize="lg" mb={6} opacity={0.7}>
                    Select a topic to start chatting with FinAI
                  </Text>
                </Box>
              )}
              
              {!selectedTopic && (
                <Box 
                  display={{ lg: 'flex' }} 
                  alignItems="center" 
                  justifyContent="center" 
                  flexDirection="column"
                  h="calc(100vh - 200px)"
                  textAlign="center"
                  p={8}
                  className="glass-card"
                >
                  <Icon as={FiMessageCircle} boxSize={16} color="blue.400" mb={6} />
                  <Heading size="lg" className="text-gradient" mb={4}>
                    Your AI Financial Assistant
                  </Heading>
                  <Text fontSize="lg" maxW="600px" opacity={0.8} mb={6}>
                    Select a topic from the sidebar to start a conversation with FinAI.
                    Ask questions about investing, get personalized financial advice, or
                    learn about complex financial concepts in simple terms.
                  </Text>
                  <HStack spacing={3} wrap="wrap" justifyContent="center">
                    <Tag colorScheme="blue" size="lg">Investing</Tag>
                    <Tag colorScheme="purple" size="lg">Retirement</Tag>
                    <Tag colorScheme="green" size="lg">Budgeting</Tag>
                    <Tag colorScheme="orange" size="lg">Stocks</Tag>
                    <Tag colorScheme="pink" size="lg">Financial Terms</Tag>
                    <Tag colorScheme="cyan" size="lg">Market Trends</Tag>
                  </HStack>
                </Box>
              )}
            </GridItem>
          </Grid>
        </Container>
      </Box>
    </Box>
  );
};

interface ChatInterfaceProps {
  topic: {
    id: string;
    title: string;
    icon: React.ComponentType;
    color: string;
    description: string;
    suggestedQuestions: string[];
  };
  onBack: () => void;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ topic, onBack }) => {
  // In a real application, this would integrate with your chatbot component
  // but for this demo, we'll just show the topic and suggested questions
  
  return (
    <MotionBox
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="glass-card"
      p={6}
      borderRadius="xl"
      minH="70vh"
    >
      <Flex mb={6} align="center" justify="space-between">
        <Flex align="center">
          <Flex
            align="center"
            justify="center"
            w="48px"
            h="48px"
            borderRadius="lg"
            bg={`${topic.color}20`}
            color={topic.color}
            mr={4}
          >
            <Icon as={topic.icon} boxSize={6} />
          </Flex>
          <Box>
            <Heading size="md">{topic.title}</Heading>
            <Text fontSize="sm" color="gray.400">{topic.description}</Text>
          </Box>
        </Flex>
        
        <Button variant="ghost" display={{ base: 'block', lg: 'none' }} onClick={onBack}>
          Back
        </Button>
      </Flex>
      
      <Box p={5} bg="whiteAlpha.100" borderRadius="lg" mb={6}>
        <Text fontWeight="medium" mb={3}>Suggested Questions</Text>
        <VStack align="stretch" spacing={3}>
          {topic.suggestedQuestions.map((question, index) => (
            <Button 
              key={index} 
              variant="ghost" 
              justifyContent="flex-start" 
              bg="whiteAlpha.100"
              _hover={{ bg: "whiteAlpha.200" }}
              leftIcon={<FiMessageCircle />}
            >
              {question}
            </Button>
          ))}
        </VStack>
      </Box>
      
      {/* This would be replaced with your actual ChatBot component */}
      <Flex 
        direction="column" 
        align="center" 
        justify="center" 
        h="300px" 
        bg="whiteAlpha.50" 
        borderRadius="lg"
      >
        <Text>Your chat interface would be embedded here.</Text>
        <Text fontSize="sm" color="gray.400" mt={2}>
          Integrate your ChatBot component for a full experience.
        </Text>
      </Flex>
    </MotionBox>
  );
};

export default ChatPage; 