import React from 'react';
import { ChakraProvider, extendTheme } from '@chakra-ui/react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Import pages
import HomePage from './pages/HomePage';
import ChatPage from './pages/ChatPage';
import DiscoveryPage from './pages/DiscoveryPage';
import EducationPage from './pages/EducationPage';
import SimulatorPage from './pages/SimulatorPage';
import CommunityPage from './pages/CommunityPage';
import AuthPage from './pages/AuthPage';
import ProfilePage from './pages/ProfilePage';

// Import context providers
import { AuthProvider } from './contexts/AuthContext';

// Custom theme
const theme = extendTheme({
  fonts: {
    heading: 'Poppins, sans-serif',
    body: 'Inter, sans-serif',
  },
  colors: {
    brand: {
      50: '#e6f7ff',
      100: '#b3e0ff',
      200: '#80caff',
      300: '#4db4ff',
      400: '#1a9eff',
      500: '#0087e6',
      600: '#0068b3',
      700: '#004980',
      800: '#002a4d',
      900: '#000b1a',
    },
    darkBlue: {
      50: '#f0f5fa',
      100: '#d1e0f0',
      200: '#b1cbe6',
      300: '#92b6dc',
      400: '#73a1d2',
      500: '#538cc8',
      600: '#43779e',
      700: '#326275',
      800: '#224d4c',
      900: '#0f172a', // Dark blue background
    },
  },
  styles: {
    global: {
      body: {
        bg: 'darkBlue.900',
        color: 'whiteAlpha.900',
      },
    },
  },
  components: {
    Button: {
      baseStyle: {
        borderRadius: 'lg',
      },
      variants: {
        solid: {
          bg: 'brand.500',
          color: 'white',
          _hover: {
            bg: 'brand.600',
          },
        },
        outline: {
          border: '2px solid',
          borderColor: 'brand.500',
          color: 'brand.500',
        },
        glass: {
          bg: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(10px)',
          borderRadius: 'lg',
          color: 'white',
          _hover: {
            bg: 'rgba(255, 255, 255, 0.15)',
          },
        },
      },
    },
  },
});

const App: React.FC = () => {
  return (
    <ChakraProvider theme={theme}>
      <Router>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/chat" element={<ChatPage />} />
            <Route path="/discovery" element={<DiscoveryPage />} />
            <Route path="/education" element={<EducationPage />} />
            <Route path="/simulator" element={<SimulatorPage />} />
            <Route path="/community" element={<CommunityPage />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/profile" element={<ProfilePage />} />
          </Routes>
        </AuthProvider>
      </Router>
    </ChakraProvider>
  );
};

export default App; 