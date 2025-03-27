import React, { useEffect } from 'react';
import { Box, Container, Grid, GridItem, Heading, Text, Flex, Button, HStack, VStack, Icon, SimpleGrid, Avatar, AvatarBadge, Badge, Tag, Tabs, TabList, TabPanels, Tab, TabPanel, Table, Thead, Tbody, Tr, Th, Td, Progress, Divider, Menu, MenuButton, MenuList, MenuItem, useColorModeValue } from '@chakra-ui/react';
import { motion, useAnimation } from 'framer-motion';
import { FiUsers, FiAward, FiTrendingUp, FiMessageSquare, FiThumbsUp, FiCalendar, FiBriefcase, FiHeart, FiClock, FiChevronDown, FiCheck, FiMoreVertical, FiStar, FiShield, FiTrendingUp as FiTrendingUpIcon, FiDollarSign } from 'react-icons/fi';
import Navigation from '../components/Navigation';
import AnimatedCard from '../components/AnimatedCard';
import StockChart from '../components/StockChart';
import ProtectedFeature from '../components/ProtectedFeature';

// Enhanced motion components with premium animations
const MotionBox = motion(Box);
const MotionFlex = motion(Flex);
const MotionText = motion(Text);

// Premium color constants
const tealGradient = "linear-gradient(135deg, #0BC5EA 0%, #2C7A7B 100%)";
const goldGradient = "linear-gradient(135deg, #F6E05E 0%, #B7791F 100%)";
const greenGradient = "linear-gradient(135deg, #48BB78 0%, #276749 100%)";
const premiumBg = "linear-gradient(135deg, #1A202C 0%, #2D3748 100%)";
const glowEffect = "0px 0px 15px rgba(72, 187, 120, 0.15)";
const cardHoverTransition = { duration: 0.3, ease: "easeOut" };

const CommunityPage: React.FC = () => {
  const controls = useAnimation();
  
  useEffect(() => {
    controls.start({ opacity: 1, y: 0 });
  }, [controls]);

  // Premium color theme
  const cardBg = "rgba(26, 32, 44, 0.8)";
  const highlightColor = "#F6AD55"; // Gold/amber
  const accentColor = "#48BB78"; // Green
  const dangerColor = "#E53E3E"; // Red
  const tableBgHover = "rgba(72, 187, 120, 0.08)";

  // Mock leaderboard data
  const leaderboardData = [
    { 
      id: 1, 
      name: 'Rahul Sharma', 
      avatar: 'https://randomuser.me/api/portraits/men/1.jpg', 
      points: 8750, 
      rank: 1, 
      returnRate: 18.42, 
      badge: 'Diamond Investor', 
      badgeColor: '#B4F8C8',
      streak: 42,
      portfolio: {
        totalValue: 15870.42,
        performance: 22.14,
        topHoldings: ['AAPL', 'MSFT', 'AMZN']
      }
    },
    { 
      id: 2, 
      name: 'Priya Patel', 
      avatar: 'https://randomuser.me/api/portraits/women/2.jpg', 
      points: 7620, 
      rank: 2, 
      returnRate: 16.38, 
      badge: 'Platinum Investor',
      badgeColor: '#A0E7E5',
      streak: 28,
      portfolio: {
        totalValue: 14560.89,
        performance: 18.21,
        topHoldings: ['GOOGL', 'TSLA', 'NFLX']
      }
    },
    { 
      id: 3, 
      name: 'Vikram Singh', 
      avatar: 'https://randomuser.me/api/portraits/men/3.jpg', 
      points: 6840, 
      rank: 3, 
      returnRate: 15.12, 
      badge: 'Gold Investor',
      badgeColor: '#FFAEBC',
      streak: 19,
      portfolio: {
        totalValue: 13250.67,
        performance: 15.87,
        topHoldings: ['NVDA', 'AMZN', 'JPM']
      }
    },
    { 
      id: 4, 
      name: 'Aisha Khan', 
      avatar: 'https://randomuser.me/api/portraits/women/4.jpg', 
      points: 5950, 
      rank: 4, 
      returnRate: 14.75, 
      badge: 'Silver Investor',
      badgeColor: '#FBE7C6',
      streak: 14,
      portfolio: {
        totalValue: 12180.35,
        performance: 14.22,
        topHoldings: ['META', 'AAPL', 'MSFT']
      }
    },
    { 
      id: 5, 
      name: 'Arjun Mehta', 
      avatar: 'https://randomuser.me/api/portraits/men/5.jpg', 
      points: 4980, 
      rank: 5, 
      returnRate: 13.40, 
      badge: 'Bronze Investor',
      badgeColor: '#B4F8C8',
      streak: 10,
      portfolio: {
        totalValue: 11540.82,
        performance: 12.98,
        topHoldings: ['TSLA', 'GOOGL', 'NFLX']
      }
    }
  ];

  // Mock community posts
  const communityPosts = [
    {
      id: 1,
      user: { name: 'Rahul Sharma', avatar: 'https://randomuser.me/api/portraits/men/1.jpg', badge: 'Diamond Investor' },
      title: 'My investment strategy for tech stocks in 2023',
      content: 'I\'ve been focusing on high-growth tech stocks with strong fundamentals. Here\'s my analysis of the current market trends and why I believe companies with solid cash reserves will outperform in the coming quarters...',
      category: 'Strategy',
      timestamp: '2 hours ago',
      likes: 42,
      comments: 15,
      tags: ['Tech Stocks', 'Growth Investing', 'Market Analysis']
    },
    {
      id: 2,
      user: { name: 'Priya Patel', avatar: 'https://randomuser.me/api/portraits/women/2.jpg', badge: 'Platinum Investor' },
      title: 'How I diversified my portfolio to reduce risk',
      content: 'After seeing high volatility in my all-equity portfolio, I decided to implement a more balanced approach. I\'ve allocated 60% to equities, 20% to bonds, 10% to gold, and 10% to REITs. This has significantly improved my risk-adjusted returns...',
      category: 'Portfolio Management',
      timestamp: '5 hours ago',
      likes: 38,
      comments: 22,
      tags: ['Diversification', 'Risk Management', 'Asset Allocation']
    },
    {
      id: 3,
      user: { name: 'Vikram Singh', avatar: 'https://randomuser.me/api/portraits/men/3.jpg', badge: 'Gold Investor' },
      title: 'Analyzing the recent banking sector developments',
      content: 'With recent policy changes in the banking sector, I believe we\'re going to see significant shifts in how banks operate. Here\'s my take on which banking stocks might benefit from these changes and why...',
      category: 'Sector Analysis',
      timestamp: '1 day ago',
      likes: 27,
      comments: 19,
      tags: ['Banking Sector', 'Financial Analysis', 'Policy Impact']
    }
  ];

  // Mock upcoming events
  const upcomingEvents = [
    {
      id: 1,
      title: 'Webinar: Understanding IPO Investing',
      date: 'June 15, 2023',
      time: '6:00 PM IST',
      speaker: 'Rajesh Kumar, Investment Analyst',
      attendees: 156,
      category: 'Educational'
    },
    {
      id: 2,
      title: 'Live Q&A with Top Investors',
      date: 'June 22, 2023',
      time: '7:30 PM IST',
      speaker: 'Multiple Guest Speakers',
      attendees: 243,
      category: 'Interactive'
    },
    {
      id: 3,
      title: 'Investment Challenge Kickoff',
      date: 'July 1, 2023',
      time: '10:00 AM IST',
      speaker: 'AIvestor Team',
      attendees: 318,
      category: 'Challenge'
    }
  ];

  // Mock trending topics
  const trendingTopics = [
    { tag: 'AI Stocks', count: 342 },
    { tag: 'Budget Impact', count: 287 },
    { tag: 'Renewable Energy', count: 246 },
    { tag: 'Retirement Planning', count: 215 },
    { tag: 'Cryptocurrency Analysis', count: 198 }
  ];

  // Render component
  return (
    <Box minH="100vh" bg={premiumBg}>
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
          bgGradient={tealGradient}
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
        
        {/* Decorative community icon */}
        <MotionBox
          position="absolute"
          top="0"
          right="20px"
          opacity="0.2"
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 0.2, scale: 1 }}
          transition={{ duration: 1 }}
        >
          <Icon as={FiUsers} color="white" boxSize="80px" />
        </MotionBox>
      </Box>
      
      <Box as="main" pt="120px" pb="40px">
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
              bg="rgba(72, 187, 120, 0.1)"
              filter="blur(25px)"
              zIndex="-1"
            />
            
            <MotionText
              as={Heading}
              size="xl"
              mb={4}
              bgGradient={tealGradient}
              bgClip="text"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              display="inline-flex"
              alignItems="center"
            >
              <Icon as={FiUsers} mr={3} />
              Community & Leaderboard
            </MotionText>
            
            <MotionText 
              fontSize="lg" 
              opacity={0.9} 
              maxW="800px"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              Connect with other investors, share insights, learn from top performers, and participate in investment challenges.
            </MotionText>
          </Box>

          {/* User Status */}
          <ProtectedFeature
            featureName="Community Features"
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
                <Icon as={FiUsers} boxSize={12} color="teal.400" mb={4} />
                <Heading size="md" mb={2}>Join Our Investment Community</Heading>
                <Text mb={4}>Sign in to connect with other investors, share insights, and participate in investment challenges.</Text>
                <Button colorScheme="teal">Sign In to Join</Button>
              </MotionBox>
            }
          >
            <MotionBox
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="glass-card"
              p={6}
              mb={10}
              boxShadow={glowEffect}
              borderColor={accentColor}
              borderWidth="1px"
              _hover={{ 
                boxShadow: "0px 0px 20px rgba(72, 187, 120, 0.25)",
                transition: "all 0.3s ease-in-out"
              }}
            >
              <Flex direction={{ base: 'column', md: 'row' }} justify="space-between" align="center">
                <Flex align="center" mb={{ base: 6, md: 0 }}>
                  <Box position="relative">
                    <MotionBox
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 260, damping: 20 }}
                    >
                      <Avatar size="xl" src="https://randomuser.me/api/portraits/men/12.jpg" mr={6}>
                        <AvatarBadge boxSize="1.25em" bg={accentColor} />
                      </Avatar>
                    </MotionBox>
                    <Box
                      position="absolute"
                      top="-5px"
                      right="10px"
                      h="20px"
                      w="20px"
                      borderRadius="full"
                      bgGradient={goldGradient}
                      boxShadow="0px 0px 10px rgba(247, 211, 66, 0.5)"
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                    >
                      <Icon as={FiShield} color="white" boxSize="0.6em" />
                    </Box>
                  </Box>
                  <Box>
                    <MotionHeading 
                      size="md" 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.2 }}
                    >
                      Welcome, Ajay!
                    </MotionHeading>
                    <HStack mt={2}>
                      <Badge 
                        px={2} 
                        py={1} 
                        borderRadius="full" 
                        bgGradient={goldGradient}
                        color="gray.800"
                      >
                        Silver Investor
                      </Badge>
                      <Text fontSize="sm" color="gray.300">Rank #87</Text>
                    </HStack>
                    <HStack mt={3}>
                      <Tag size="sm" bgGradient={goldGradient} color="gray.800" borderRadius="full">
                        <Icon as={FiAward} mr={1} />
                        4,280 points
                      </Tag>
                      <Tag size="sm" bgGradient={greenGradient} color="white" borderRadius="full">
                        <Icon as={FiTrendingUp} mr={1} />
                        11.2% return
                      </Tag>
                      <Tag size="sm" colorScheme="orange" borderRadius="full">
                        <Icon as={FiClock} mr={1} />
                        7 day streak
                      </Tag>
                    </HStack>
                  </Box>
                </Flex>
                
                <HStack spacing={4}>
                  <Button 
                    bgGradient={greenGradient} 
                    color="white" 
                    leftIcon={<FiUsers />} 
                    size="sm"
                    _hover={{ 
                      bgGradient: "linear-gradient(135deg, #38A169 0%, #276749 100%)",
                      transform: "translateY(-2px)",
                      boxShadow: "0px 4px 12px rgba(72, 187, 120, 0.3)"
                    }}
                    transition="all 0.3s ease"
                  >
                    Find Friends
                  </Button>
                  <Button 
                    variant="outline" 
                    leftIcon={<FiMessageSquare />} 
                    size="sm"
                    borderColor={accentColor}
                    color={accentColor}
                    _hover={{
                      bg: "rgba(72, 187, 120, 0.1)",
                      transform: "translateY(-2px)"
                    }}
                    transition="all 0.3s ease"
                  >
                    Create Post
                  </Button>
                </HStack>
              </Flex>
            </MotionBox>
          </ProtectedFeature>

          {/* Main Content Tabs */}
          <Tabs 
            colorScheme="green" 
            variant="soft-rounded" 
            mb={10}
          >
            <TabList 
              mb={6} 
              overflowX="auto" 
              py={2} 
              css={{
                scrollbarWidth: 'none',
                '&::-webkit-scrollbar': { display: 'none' },
                '-ms-overflow-style': 'none'
              }}
              borderBottom="1px solid"
              borderColor="rgba(72, 187, 120, 0.2)"
            >
              <MotionTab 
                _selected={{ color: 'white', bg: accentColor }}
                _hover={{ bg: "rgba(72, 187, 120, 0.1)" }}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                Leaderboard
              </MotionTab>
              <MotionTab 
                _selected={{ color: 'white', bg: accentColor }}
                _hover={{ bg: "rgba(72, 187, 120, 0.1)" }}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                Community Posts
              </MotionTab>
              <MotionTab 
                _selected={{ color: 'white', bg: accentColor }}
                _hover={{ bg: "rgba(72, 187, 120, 0.1)" }}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                Events
              </MotionTab>
              <MotionTab 
                _selected={{ color: 'white', bg: accentColor }}
                _hover={{ bg: "rgba(72, 187, 120, 0.1)" }}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                Challenges
              </MotionTab>
            </TabList>

            <TabPanels>
              {/* Leaderboard Tab */}
              <TabPanel p={0}>
                <Grid templateColumns={{ base: '1fr', lg: '2fr 1fr' }} gap={6}>
                  <GridItem>
                    <MotionBox 
                      className="glass-card" 
                      p={0} 
                      overflow="hidden"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.5 }}
                      boxShadow={glowEffect}
                      borderColor="rgba(72, 187, 120, 0.3)"
                      borderWidth="1px"
                    >
                      <Box p={4} borderBottom="1px solid" borderColor="whiteAlpha.200">
                        <Flex justify="space-between" align="center">
                          <Heading 
                            size="md" 
                            bgGradient={goldGradient} 
                            bgClip="text"
                          >
                            Top Performers
                          </Heading>
                          <HStack>
                            <Menu>
                              <MenuButton as={Button} size="sm" rightIcon={<FiChevronDown />} variant="outline">
                                This Month
                              </MenuButton>
                              <MenuList bg="darkBlue.800" borderColor="whiteAlpha.300">
                                <MenuItem>All Time</MenuItem>
                                <MenuItem>This Year</MenuItem>
                                <MenuItem>This Month</MenuItem>
                                <MenuItem>This Week</MenuItem>
                              </MenuList>
                            </Menu>
                            <Menu>
                              <MenuButton as={Button} size="sm" rightIcon={<FiChevronDown />} variant="outline">
                                Return Rate
                              </MenuButton>
                              <MenuList bg="darkBlue.800" borderColor="whiteAlpha.300">
                                <MenuItem>Return Rate</MenuItem>
                                <MenuItem>Points</MenuItem>
                                <MenuItem>Streak</MenuItem>
                              </MenuList>
                            </Menu>
                          </HStack>
                        </Flex>
                      </Box>
                      
                      <Table variant="simple">
                        <Thead bg="rgba(72, 187, 120, 0.1)">
                          <Tr>
                            <Th>Rank</Th>
                            <Th>Investor</Th>
                            <Th isNumeric>Return Rate</Th>
                            <Th isNumeric>Points</Th>
                            <Th>Top Holdings</Th>
                            <Th></Th>
                          </Tr>
                        </Thead>
                        <Tbody>
                          {leaderboardData.map((investor, index) => (
                            <MotionTr 
                              key={investor.id} 
                              _hover={{ bg: tableBgHover }}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: index * 0.1, duration: 0.3 }}
                              whileHover={{ 
                                backgroundColor: tableBgHover,
                                transition: { duration: 0.2 }
                              }}
                            >
                              <Td>
                                <Flex align="center" justify="center" w="36px" h="36px" borderRadius="full" bg="whiteAlpha.200">
                                  <Text fontWeight="bold">{investor.rank}</Text>
                                </Flex>
                              </Td>
                              <Td>
                                <Flex align="center">
                                  <Avatar size="sm" src={investor.avatar} mr={3}>
                                    {investor.rank <= 3 && (
                                      <AvatarBadge boxSize="1.25em" bg="yellow.500" borderColor="darkBlue.800">
                                        <Icon as={FiAward} color="white" boxSize="0.75em" />
                                      </AvatarBadge>
                                    )}
                                  </Avatar>
                                  <Box>
                                    <Text fontWeight="medium">{investor.name}</Text>
                                    <Badge variant="subtle" colorScheme="green">
                                      {investor.badge}
                                    </Badge>
                                  </Box>
                                </Flex>
                              </Td>
                              <Td isNumeric color="green.400" fontWeight="medium">
                                +{investor.returnRate}%
                              </Td>
                              <Td isNumeric>
                                <Text fontWeight="medium">{investor.points.toLocaleString()}</Text>
                                <Text fontSize="xs" color="gray.400">{investor.streak} day streak</Text>
                              </Td>
                              <Td>
                                <HStack>
                                  {investor.portfolio.topHoldings.map((holding, index) => (
                                    <Tag key={index} size="sm">{holding}</Tag>
                                  ))}
                                </HStack>
                              </Td>
                              <Td>
                                <Button size="xs" variant="ghost">View Profile</Button>
                              </Td>
                            </MotionTr>
                          ))}
                        </Tbody>
                      </Table>
                      
                      <Box p={4} textAlign="center">
                        <Button 
                          variant="outline" 
                          size="sm"
                          borderColor={accentColor}
                          color={accentColor}
                          _hover={{
                            bg: "rgba(72, 187, 120, 0.1)",
                            transform: "scale(1.05)"
                          }}
                          transition="all 0.3s ease"
                        >
                          View Full Leaderboard
                        </Button>
                      </Box>
                    </MotionBox>
                  </GridItem>
                  
                  <GridItem>
                    <VStack spacing={6}>
                      <Box className="glass-card" p={6} w="full">
                        <Heading size="md" mb={4}>Your Progress</Heading>
                        <Box mb={6}>
                          <Flex justify="space-between" mb={1}>
                            <Text fontSize="sm">Next Rank</Text>
                            <Text fontSize="sm" fontWeight="medium">Gold Investor (6,000 pts)</Text>
                          </Flex>
                          <Progress value={71} size="sm" colorScheme="blue" borderRadius="full" />
                          <Flex justify="flex-end">
                            <Text fontSize="xs" color="gray.400" mt={1}>
                              1,720 points to go
                            </Text>
                          </Flex>
                        </Box>
                        
                        <VStack spacing={3} align="stretch">
                          <Flex justify="space-between" align="center" p={3} bg="whiteAlpha.100" borderRadius="md">
                            <Flex align="center">
                              <Icon as={FiHeart} color="red.400" mr={2} />
                              <Text fontSize="sm">Daily Login Streak</Text>
                            </Flex>
                            <HStack>
                              <Text fontSize="sm" fontWeight="medium">7 days</Text>
                              <Button size="xs" colorScheme="blue">Check In</Button>
                            </HStack>
                          </Flex>
                          
                          <Flex justify="space-between" align="center" p={3} bg="whiteAlpha.100" borderRadius="md">
                            <Flex align="center">
                              <Icon as={FiBriefcase} color="purple.400" mr={2} />
                              <Text fontSize="sm">Portfolio Value</Text>
                            </Flex>
                            <Text fontSize="sm" fontWeight="medium">₹11,240.35</Text>
                          </Flex>
                          
                          <Flex justify="space-between" align="center" p={3} bg="whiteAlpha.100" borderRadius="md">
                            <Flex align="center">
                              <Icon as={FiMessageSquare} color="green.400" mr={2} />
                              <Text fontSize="sm">Community Engagement</Text>
                            </Flex>
                            <Text fontSize="sm" fontWeight="medium">12 posts</Text>
                          </Flex>
                        </VStack>
                      </Box>
                      
                      <Box className="glass-card" p={6} w="full">
                        <Heading size="md" mb={4}>Trending Topics</Heading>
                        <VStack spacing={2} align="stretch">
                          {trendingTopics.map((topic, index) => (
                            <Flex 
                              key={index} 
                              justify="space-between" 
                              align="center" 
                              p={3} 
                              bg="whiteAlpha.100" 
                              borderRadius="md"
                              cursor="pointer"
                              _hover={{ bg: "whiteAlpha.200" }}
                            >
                              <Flex align="center">
                                <Text fontSize="sm" fontWeight="medium">#{topic.tag}</Text>
                              </Flex>
                              <Text fontSize="xs" color="gray.400">{topic.count} posts</Text>
                            </Flex>
                          ))}
                        </VStack>
                      </Box>
                    </VStack>
                  </GridItem>
                </Grid>
              </TabPanel>

              {/* Community Posts Tab */}
              <TabPanel p={0}>
                <Grid templateColumns={{ base: '1fr', lg: '2fr 1fr' }} gap={6}>
                  <GridItem>
                    <VStack spacing={6} align="stretch">
                      <Flex justify="space-between" align="center">
                        <Heading size="md">Recent Discussions</Heading>
                        <HStack>
                          <Menu>
                            <MenuButton as={Button} size="sm" rightIcon={<FiChevronDown />} variant="outline">
                              All Categories
                            </MenuButton>
                            <MenuList bg="darkBlue.800" borderColor="whiteAlpha.300">
                              <MenuItem>All Categories</MenuItem>
                              <MenuItem>Strategy</MenuItem>
                              <MenuItem>Portfolio Management</MenuItem>
                              <MenuItem>Sector Analysis</MenuItem>
                              <MenuItem>Economy</MenuItem>
                              <MenuItem>Technical Analysis</MenuItem>
                            </MenuList>
                          </Menu>
                          <Button colorScheme="blue" size="sm">New Post</Button>
                        </HStack>
                      </Flex>
                      
                      {communityPosts.map((post) => (
                        <AnimatedCard key={post.id} p={6} delay={post.id * 0.1}>
                          <HStack spacing={4} mb={4}>
                            <Avatar size="md" src={post.user.avatar}>
                              {post.user.badge.includes('Diamond') && (
                                <AvatarBadge boxSize="1.25em" bg="purple.500" borderColor="darkBlue.800">
                                  <Icon as={FiStar} color="white" boxSize="0.75em" />
                                </AvatarBadge>
                              )}
                            </Avatar>
                            <Box>
                              <Text fontWeight="medium">{post.user.name}</Text>
                              <Flex align="center">
                                <Badge mr={2} colorScheme="purple">{post.user.badge}</Badge>
                                <Text fontSize="xs" color="gray.400">{post.timestamp}</Text>
                              </Flex>
                            </Box>
                            <Spacer />
                            <Tag size="sm" colorScheme="blue">{post.category}</Tag>
                          </HStack>
                          
                          <Heading size="md" mb={3}>{post.title}</Heading>
                          <Text mb={4} noOfLines={3}>{post.content}</Text>
                          
                          <HStack mb={4} wrap="wrap" spacing={2}>
                            {post.tags.map((tag, index) => (
                              <Tag key={index} size="sm" colorScheme="gray">#{tag.replace(/\s/g, '')}</Tag>
                            ))}
                          </HStack>
                          
                          <Divider mb={4} />
                          
                          <Flex justify="space-between" align="center">
                            <HStack>
                              <Button size="sm" leftIcon={<FiThumbsUp />} variant="ghost">
                                {post.likes}
                              </Button>
                              <Button size="sm" leftIcon={<FiMessageSquare />} variant="ghost">
                                {post.comments}
                              </Button>
                            </HStack>
                            <Button size="sm" variant="ghost">Read More</Button>
                          </Flex>
                        </AnimatedCard>
                      ))}
                      
                      <Button variant="outline" size="sm" alignSelf="center">
                        Load More Posts
                      </Button>
                    </VStack>
                  </GridItem>
                  
                  <GridItem>
                    <VStack spacing={6}>
                      <Box className="glass-card" p={6} w="full">
                        <Heading size="md" mb={4}>Upcoming Events</Heading>
                        <VStack spacing={4} align="stretch">
                          {upcomingEvents.map((event) => (
                            <Box 
                              key={event.id} 
                              p={4} 
                              bg="whiteAlpha.100" 
                              borderRadius="md"
                              borderLeft="4px solid"
                              borderColor="blue.400"
                            >
                              <Flex justify="space-between" mb={2}>
                                <Heading size="sm" noOfLines={1}>{event.title}</Heading>
                                <Tag size="sm" colorScheme="blue">{event.category}</Tag>
                              </Flex>
                              <Flex align="center" mb={2}>
                                <Icon as={FiCalendar} mr={2} color="gray.400" />
                                <Text fontSize="sm">{event.date}, {event.time}</Text>
                              </Flex>
                              <Flex align="center" mb={3}>
                                <Icon as={FiUsers} mr={2} color="gray.400" />
                                <Text fontSize="sm">{event.attendees} attending</Text>
                              </Flex>
                              <Flex justify="space-between" align="center">
                                <Text fontSize="xs" color="gray.400">
                                  Speaker: {event.speaker}
                                </Text>
                                <Button size="xs" colorScheme="blue">RSVP</Button>
                              </Flex>
                            </Box>
                          ))}
                        </VStack>
                        <Button mt={4} size="sm" variant="ghost" width="full">
                          View All Events
                        </Button>
                      </Box>
                      
                      <Box className="glass-card" p={6} w="full">
                        <Heading size="md" mb={4}>Active Challenges</Heading>
                        <VStack spacing={4} align="stretch">
                          <Box 
                            p={4} 
                            bg="whiteAlpha.100" 
                            borderRadius="md"
                            borderLeft="4px solid"
                            borderColor="purple.400"
                          >
                            <Heading size="sm" mb={2}>Monthly Investment Challenge</Heading>
                            <Flex align="center" mb={3}>
                              <Icon as={FiClock} mr={2} color="gray.400" />
                              <Text fontSize="sm">12 days remaining</Text>
                            </Flex>
                            <Flex justify="space-between" mb={3}>
                              <Text fontSize="sm">Your Position: #28</Text>
                              <Text fontSize="sm" color="green.400">+8.2% return</Text>
                            </Flex>
                            <Progress value={56} size="sm" colorScheme="purple" borderRadius="full" mb={3} />
                            <Button size="sm" variant="outline" width="full">
                              View Challenge
                            </Button>
                          </Box>
                          
                          <Box 
                            p={4} 
                            bg="whiteAlpha.100" 
                            borderRadius="md"
                            borderLeft="4px solid"
                            borderColor="orange.400"
                          >
                            <Heading size="sm" mb={2}>Tech Sector Trading Challenge</Heading>
                            <Flex align="center" mb={3}>
                              <Icon as={FiClock} mr={2} color="gray.400" />
                              <Text fontSize="sm">5 days remaining</Text>
                            </Flex>
                            <Flex justify="space-between" mb={3}>
                              <Text fontSize="sm">Your Position: #42</Text>
                              <Text fontSize="sm" color="green.400">+5.7% return</Text>
                            </Flex>
                            <Progress value={78} size="sm" colorScheme="orange" borderRadius="full" mb={3} />
                            <Button size="sm" variant="outline" width="full">
                              View Challenge
                            </Button>
                          </Box>
                        </VStack>
                      </Box>
                    </VStack>
                  </GridItem>
                </Grid>
              </TabPanel>

              {/* Events Tab - Basic placeholder */}
              <TabPanel p={0}>
                <Box className="glass-card" p={6}>
                  <Heading size="md" mb={4}>Upcoming Events Calendar</Heading>
                  <Text>Complete events calendar content will be implemented here.</Text>
                </Box>
              </TabPanel>

              {/* Challenges Tab - Basic placeholder */}
              <TabPanel p={0}>
                <Box className="glass-card" p={6}>
                  <Heading size="md" mb={4}>Investment Challenges</Heading>
                  <Text>Complete challenges system will be implemented here.</Text>
                </Box>
              </TabPanel>
            </TabPanels>
          </Tabs>
        </Container>
      </Box>
    </Box>
  );
};

// Define MotionHeading and MotionTab components
const MotionHeading = motion(Heading);
const MotionTab = motion(Tab);
const MotionTr = motion(Tr);

// Missing component from the Chakra UI import
const Spacer = () => <Box flex="1" />;

export default CommunityPage; 