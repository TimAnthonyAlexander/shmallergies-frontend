import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import { AuthProvider } from './contexts/AuthContext';
import Layout from './components/Layout/Layout';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import EmailVerification from './pages/EmailVerification';
import Products from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import UploadProduct from './pages/UploadProduct';
import Profile from './pages/Profile';
import CameraScanner from './pages/CameraScanner';

import './App.css';

// Create Material UI theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#2563eb', // Blue-600
    },
    secondary: {
      main: '#7c3aed', // Purple-600
    },
    background: {
      default: '#f9fafb',
      paper: '#ffffff',
    },
  },
  typography: {
    fontFamily: '"Roboto", -apple-system, BlinkMacSystemFont, "Segoe UI", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 700,
    },
    h2: {
      fontWeight: 600,
    },
    h3: {
      fontWeight: 600,
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 500,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        },
      },
    },
  },
});

const App: React.FC = () => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <Routes>
            {/* Public routes with layout */}
            <Route path="/" element={<Layout><Home /></Layout>} />
            <Route path="/products" element={<Layout><Products /></Layout>} />
            <Route path="/products/:id" element={<Layout><ProductDetail /></Layout>} />
            
            {/* Auth routes without layout (full screen) */}
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/verify-email" element={<EmailVerification />} />
            
            {/* Camera scanner route without layout (full screen) */}
            <Route 
              path="/scanner" 
              element={
                <ProtectedRoute>
                  <CameraScanner />
                </ProtectedRoute>
              } 
            />
            
            {/* Protected routes with layout */}
            <Route 
              path="/upload" 
              element={
                <Layout>
                  <ProtectedRoute>
                    <UploadProduct />
                  </ProtectedRoute>
                </Layout>
              } 
            />
            <Route 
              path="/profile" 
              element={
                <Layout>
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                </Layout>
              } 
            />
            
            {/* Catch all route - redirect to home */}
            <Route path="*" element={<Layout><Home /></Layout>} />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
