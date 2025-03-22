import React from 'react';
import { Box, Container, Grid, GridItem, Heading, Text, Flex, Button, HStack, VStack, Icon, SimpleGrid, Avatar, AvatarBadge, Badge, Tag, Tabs, TabList, TabPanels, Tab, TabPanel, Table, Thead, Tbody, Tr, Th, Td, Progress, Divider, Menu, MenuButton, MenuList, MenuItem } from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { FiUsers, FiAward, FiTrendingUp, FiMessageSquare, FiThumbsUp, FiCalendar, FiBriefcase, FiHeart, FiClock, FiChevronDown, FiCheck, FiMoreVertical, FiStar } from 'react-icons/fi';
import Navigation from '../components/Navigation';
import AnimatedCard from '../components/AnimatedCard';
import StockChart from '../components/StockChart';

const MotionBox = motion(Box);

const CommunityPage: React.FC = () => {
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
      speaker: 'FinAI Team',
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
    <Box minH="100vh" bg="darkBlue.900">
      <Navigation />
      
      <Box as="main" pt="80px">
        <Container maxW="container.xl" px={4}>
          {/* Header Section */}
          <Box mb={10}>
            <Heading as="h1" size="xl" mb={4} className="text-gradient">
              Community & Leaderboard
            </Heading>
            <Text fontSize="lg" opacity={0.8} maxW="800px">
              Connect with other investors, share insights, learn from top performers, and participate in investment challenges.
            </Text>
          </Box>

          {/* User Status */}
          <MotionBox
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="glass-card"
            p={6}
            mb={10}
          >
            <Flex direction={{ base: 'column', md: 'row' }} justify="space-between" align="center">
              <Flex align="center" mb={{ base: 6, md: 0 }}>
                <Avatar size="xl" src="https://randomuser.me/api/portraits/men/12.jpg" mr={6}>
                  <AvatarBadge boxSize="1.25em" bg="green.500" />
                </Avatar>
                <Box>
                  <Heading size="md">Welcome, Ajay!</Heading>
                  <HStack mt={2}>
                    <Badge colorScheme="purple" px={2} py={1} borderRadius="full">
                      Silver Investor
                    </Badge>
                    <Text fontSize="sm" color="gray.400">Rank #87</Text>
                  </HStack>
                  <HStack mt={3}>
                    <Tag size="sm" colorScheme="blue" borderRadius="full">
                      <Icon as={FiAward} mr={1} />
                      4,280 points
                    </Tag>
                    <Tag size="sm" colorScheme="green" borderRadius="full">
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
                <Button colorScheme="blue" leftIcon={<FiUsers />} size="sm">
                  Find Friends
                </Button>
                <Button variant="outline" leftIcon={<FiMessageSquare />} size="sm">
                  Create Post
                </Button>
              </HStack>
            </Flex>
          </MotionBox>

          {/* Main Content Tabs */}
          <Tabs colorScheme="blue" variant="soft-rounded" mb={10}>
            <TabList mb={6} overflowX="auto" py={2} css={{
              scrollbarWidth: 'none',
              '&::-webkit-scrollbar': { display: 'none' },
              '-ms-overflow-style': 'none'
            }}>
              <Tab>Leaderboard</Tab>
              <Tab>Community Posts</Tab>
              <Tab>Events</Tab>
              <Tab>Challenges</Tab>
            </TabList>

            <TabPanels>
              {/* Leaderboard Tab */}
              <TabPanel p={0}>
                <Grid templateColumns={{ base: '1fr', lg: '2fr 1fr' }} gap={6}>
                  <GridItem>
                    <Box className="glass-card" p={0} overflow="hidden">
                      <Box p={4} borderBottom="1px solid" borderColor="whiteAlpha.200">
                        <Flex justify="space-between" align="center">
                          <Heading size="md">Top Performers</Heading>
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
                        <Thead bg="whiteAlpha.100">
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
                          {leaderboardData.map((investor) => (
                            <Tr key={investor.id} _hover={{ bg: "whiteAlpha.100" }}>
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
                            </Tr>
                          ))}
                        </Tbody>
                      </Table>
                      
                      <Box p={4} textAlign="center">
                        <Button variant="outline" size="sm">View Full Leaderboard</Button>
                      </Box>
                    </Box>
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

// Missing component from the Chakra UI import
const Spacer = () => <Box flex="1" />;

export default CommunityPage; 