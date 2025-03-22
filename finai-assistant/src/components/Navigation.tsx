import React, { useState } from 'react';
import { Box, Flex, Text, Button, Image, HStack, useDisclosure, IconButton, Drawer, DrawerBody, DrawerHeader, DrawerOverlay, DrawerContent, DrawerCloseButton, VStack } from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiMenu, FiHome, FiMessageCircle, FiCompass, FiBookOpen, FiTrendingUp, FiUsers } from 'react-icons/fi';

const MotionBox = motion(Box);

const Navigation: React.FC = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [isScrolled, setIsScrolled] = useState(false);

  React.useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { name: 'Home', path: '/', icon: <FiHome /> },
    { name: 'AI Chat', path: '/chat', icon: <FiMessageCircle /> },
    { name: 'Discovery', path: '/discovery', icon: <FiCompass /> },
    { name: 'Education', path: '/education', icon: <FiBookOpen /> },
    { name: 'Simulator', path: '/simulator', icon: <FiTrendingUp /> },
    { name: 'Community', path: '/community', icon: <FiUsers /> },
  ];

  return (
    <Box
      as="nav"
      position="fixed"
      top="0"
      left="0"
      right="0"
      zIndex="999"
      transition="all 0.3s ease"
    >
      <Flex
        px={{ base: 4, md: 8 }}
        py={3}
        align="center"
        justify="space-between"
        className={isScrolled ? 'glass-card' : ''}
        borderBottom={isScrolled ? '1px solid rgba(255, 255, 255, 0.1)' : 'none'}
        backdropFilter={isScrolled ? 'blur(10px)' : 'none'}
        transition="all 0.3s ease"
      >
        <RouterLink to="/">
          <Flex align="center">
            <MotionBox
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              whileHover={{ scale: 1.05 }}
            >
              <Text fontSize="2xl" fontWeight="bold" className="text-gradient">
                FinAI
              </Text>
            </MotionBox>
          </Flex>
        </RouterLink>

        <HStack spacing={8} display={{ base: 'none', md: 'flex' }}>
          {navItems.map((item, index) => (
            <MotionBox
              key={item.name}
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ y: -5 }}
            >
              <Button
                as={RouterLink}
                to={item.path}
                variant="ghost"
                leftIcon={item.icon}
                _hover={{ bg: 'rgba(255, 255, 255, 0.1)' }}
                _active={{ bg: 'rgba(255, 255, 255, 0.15)' }}
              >
                {item.name}
              </Button>
            </MotionBox>
          ))}
        </HStack>

        <HStack spacing={4} display={{ base: 'none', md: 'flex' }}>
          <MotionBox
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            whileHover={{ scale: 1.05 }}
          >
            <Button variant="outline" size="md" className="button-3d">
              Sign In
            </Button>
          </MotionBox>
          <MotionBox
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            whileHover={{ scale: 1.05 }}
          >
            <Button variant="solid" size="md" className="neon-glow button-3d">
              Get Started
            </Button>
          </MotionBox>
        </HStack>

        <IconButton
          aria-label="Open Menu"
          size="lg"
          mr={2}
          icon={<FiMenu />}
          display={{ base: 'flex', md: 'none' }}
          onClick={onOpen}
          variant="ghost"
        />

        <Drawer isOpen={isOpen} placement="right" onClose={onClose}>
          <DrawerOverlay />
          <DrawerContent bg="darkBlue.900" color="white">
            <DrawerCloseButton />
            <DrawerHeader borderBottomWidth="1px">Menu</DrawerHeader>
            <DrawerBody>
              <VStack spacing={4} align="stretch" mt={8}>
                {navItems.map((item) => (
                  <Button
                    key={item.name}
                    as={RouterLink}
                    to={item.path}
                    variant="ghost"
                    justifyContent="flex-start"
                    leftIcon={item.icon}
                    _hover={{ bg: 'rgba(255, 255, 255, 0.1)' }}
                    onClick={onClose}
                  >
                    {item.name}
                  </Button>
                ))}
                <Button variant="outline" w="full" mt={4}>
                  Sign In
                </Button>
                <Button colorScheme="blue" w="full">
                  Get Started
                </Button>
              </VStack>
            </DrawerBody>
          </DrawerContent>
        </Drawer>
      </Flex>
    </Box>
  );
};

export default Navigation; 