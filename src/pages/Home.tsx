import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Box, 
  Container, 
  Typography, 
  Button, 
  Card, 
  CardContent, 
  Stack,
  Paper,
  Alert,
  Avatar,
  Chip,
  Grid,
  Divider
} from '@mui/material';
import { 
  Shield, 
  Search, 
  Upload, 
  People, 
  CheckCircle, 
  Warning,
  SecurityOutlined,
  SearchOutlined,
  UploadOutlined,
  AutoAwesome,
  Storage,
  Speed,
  PersonalVideo
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';

const Home: React.FC = () => {
  const { isAuthenticated, user } = useAuth();

  const features = [
    {
      icon: SearchOutlined,
      title: 'Product Search',
      description: 'Search our extensive database of food products to find allergen information instantly.',
      color: '#10B981', // Green
      bgColor: '#ECFDF5' // Light green
    },
    {
      icon: UploadOutlined,
      title: 'Add Products',
      description: 'Upload new products with ingredient photos. Our AI automatically detects allergens.',
      color: '#059669', // Darker green
      bgColor: '#D1FAE5' // Very light green
    },
    {
      icon: SecurityOutlined,
      title: 'Safety Checks',
      description: 'Get instant safety warnings based on your personal allergy profile.',
      color: '#0D9488', // Teal green
      bgColor: '#F0FDFA' // Very light teal
    },
    {
      icon: People,
      title: 'Community Driven',
      description: 'Help build a comprehensive database that benefits everyone with allergies.',
      color: '#16A34A', // Forest green
      bgColor: '#F0FDF4' // Lightest green
    }
  ];

  const stats = [
    { number: '10,000+', label: 'Products Scanned' },
    { number: '50,000+', label: 'Allergens Detected' },
    { number: '2,500+', label: 'Active Users' },
    { number: '99.9%', label: 'Accuracy Rate' }
  ];

  const detailedFeatures = [
    {
      icon: AutoAwesome,
      title: 'AI-Powered Detection',
      description: 'Our advanced AI automatically analyzes ingredient photos to identify potential allergens, saving you time and reducing human error.',
      color: '#10B981'
    },
    {
      icon: Storage,
      title: 'Global Database',
      description: 'Access a comprehensive, publicly available database where every product uploaded contributes to helping the entire allergy community.',
      color: '#059669'
    },
    {
      icon: Speed,
      title: 'Instant Safety Checks',
      description: 'Get immediate warnings when a product contains allergens from your personal profile, helping you make safe choices quickly.',
      color: '#0D9488'
    },
    {
      icon: PersonalVideo,
      title: 'Personal Profiles',
      description: 'Maintain detailed allergy profiles that automatically cross-reference with our database for personalized safety recommendations.',
      color: '#16A34A'
    }
  ];

  return (
    <Box sx={{ py: 2 }}>
      <Stack spacing={8}>
        {/* Hero Section */}
        <Box sx={{ textAlign: 'center' }}>
          <Box 
            sx={{ 
              width: 80, 
              height: 80, 
              mx: 'auto', 
              mb: 4,
              backgroundColor: '#10B981',
              borderRadius: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Shield sx={{ fontSize: 40, color: 'white' }} />
          </Box>
          
          <Typography 
            variant="h2" 
            component="h1" 
            sx={{ 
              fontWeight: 700,
              mb: 3,
              fontSize: { xs: '2.5rem', sm: '3.5rem', md: '4rem' },
              color: '#1F2937' // Dark gray
            }}
          >
            Track Your Allergies{' '}
            <Typography 
              variant="h2" 
              component="span" 
              sx={{ 
                color: '#10B981', // Green emphasis
                fontSize: { xs: '2.5rem', sm: '3.5rem', md: '4rem' },
                fontWeight: 800,
                position: 'relative',
                '&::after': {
                  content: '""',
                  position: 'absolute',
                  bottom: '-8px',
                  left: 0,
                  right: 0,
                  height: '4px',
                  backgroundColor: '#10B981',
                  borderRadius: '2px',
                  opacity: 0.3
                }
              }}
            >
              Safely
            </Typography>
          </Typography>
          
          <Typography 
            variant="h5" 
            sx={{ 
              color: '#6B7280', 
              mb: 5,
              maxWidth: 600,
              mx: 'auto',
              lineHeight: 1.4,
              fontWeight: 400
            }}
          >
            Shmallergies helps you identify allergens in food products through our community-driven database. 
            Upload products, check safety, and keep your allergies under control.
          </Typography>
          
          <Stack 
            direction={{ xs: 'column', sm: 'row' }} 
            spacing={2} 
            justifyContent="center"
          >
            {!isAuthenticated ? (
              <>
                <Button
                  component={Link}
                  to="/signup"
                  variant="contained"
                  size="large"
                  sx={{ 
                    px: 4, 
                    py: 1.5, 
                    fontSize: '1.1rem',
                    backgroundColor: '#10B981',
                    '&:hover': {
                      backgroundColor: '#059669'
                    },
                    borderRadius: '12px',
                    textTransform: 'none',
                    fontWeight: 600
                  }}
                >
                  Get Started Free
                </Button>
                <Button
                  component={Link}
                  to="/products"
                  variant="outlined"
                  size="large"
                  sx={{ 
                    px: 4, 
                    py: 1.5, 
                    fontSize: '1.1rem',
                    borderColor: '#10B981',
                    color: '#10B981',
                    '&:hover': {
                      backgroundColor: '#F0FDF4',
                      borderColor: '#059669'
                    },
                    borderRadius: '12px',
                    textTransform: 'none',
                    fontWeight: 600
                  }}
                >
                  Browse Products
                </Button>
              </>
            ) : (
              <>
                <Button
                  component={Link}
                  to="/upload"
                  variant="contained"
                  size="large"
                  startIcon={<UploadOutlined />}
                  sx={{ 
                    px: 4, 
                    py: 1.5, 
                    fontSize: '1.1rem',
                    backgroundColor: '#10B981',
                    '&:hover': {
                      backgroundColor: '#059669'
                    },
                    borderRadius: '12px',
                    textTransform: 'none',
                    fontWeight: 600
                  }}
                >
                  Add Product
                </Button>
                <Button
                  component={Link}
                  to="/products"
                  variant="outlined"
                  size="large"
                  startIcon={<SearchOutlined />}
                  sx={{ 
                    px: 4, 
                    py: 1.5, 
                    fontSize: '1.1rem',
                    borderColor: '#10B981',
                    color: '#10B981',
                    '&:hover': {
                      backgroundColor: '#F0FDF4',
                      borderColor: '#059669'
                    },
                    borderRadius: '12px',
                    textTransform: 'none',
                    fontWeight: 600
                  }}
                >
                  Search Products
                </Button>
              </>
            )}
          </Stack>
        </Box>

        {/* Welcome back section - Less green stimulation */}
        {isAuthenticated && user && (
          <Box
            sx={{
              backgroundColor: '#F8FAFC',
              border: '2px solid #10B981',
              color: '#1F2937',
              p: 4,
              borderRadius: '16px',
              textAlign: 'center',
              position: 'relative',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '4px',
                backgroundColor: '#10B981',
                borderRadius: '16px 16px 0 0'
              }
            }}
          >
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 2, color: '#1F2937' }}>
              Welcome back, {user.name}!
            </Typography>
            <Typography variant="body1" sx={{ mb: 3, color: '#6B7280' }}>
              {user.allergies && user.allergies.length > 0 
                ? `You have ${user.allergies.length} ${user.allergies.length === 1 ? 'allergy' : 'allergies'} tracked.`
                : 'Complete your profile by adding your allergies for personalized safety checks.'
              }
            </Typography>
            <Stack 
              direction={{ xs: 'column', sm: 'row' }} 
              spacing={2} 
              justifyContent="center"
            >
              <Button
                component={Link}
                to="/profile"
                variant="outlined"
                sx={{ 
                  color: '#10B981', 
                  borderColor: '#10B981',
                  '&:hover': {
                    backgroundColor: '#F0FDF4'
                  },
                  borderRadius: '12px',
                  textTransform: 'none',
                  fontWeight: 600
                }}
              >
                Manage Allergies
              </Button>
              <Button
                component={Link}
                to="/products"
                variant="contained"
                sx={{ 
                  backgroundColor: '#10B981',
                  color: 'white',
                  '&:hover': {
                    backgroundColor: '#059669'
                  },
                  borderRadius: '12px',
                  textTransform: 'none',
                  fontWeight: 600
                }}
              >
                Check Product Safety
              </Button>
            </Stack>
          </Box>
        )}

        {/* Stats Section */}
        <Box 
          sx={{ 
            display: 'grid', 
            gridTemplateColumns: { 
              xs: 'repeat(2, 1fr)', 
              sm: 'repeat(4, 1fr)' 
            },
            gap: 3,
            textAlign: 'center'
          }}
        >
          {stats.map((stat, index) => (
            <Box key={index}>
              <Typography 
                variant="h3" 
                sx={{ 
                  fontWeight: 800, 
                  color: '#10B981',
                  mb: 1
                }}
              >
                {stat.number}
              </Typography>
              <Typography 
                variant="body1" 
                sx={{ 
                  color: '#6B7280',
                  fontWeight: 500
                }}
              >
                {stat.label}
              </Typography>
            </Box>
          ))}
        </Box>

        {/* Features Grid - Redesigned */}
        <Box>
          <Typography 
            variant="h3" 
            sx={{ 
              fontWeight: 700, 
              textAlign: 'center', 
              mb: 6,
              color: '#1F2937'
            }}
          >
            Core Features
          </Typography>
          <Box 
            sx={{ 
              display: 'grid', 
              gridTemplateColumns: { 
                xs: '1fr', 
                sm: 'repeat(2, 1fr)', 
                lg: 'repeat(4, 1fr)' 
              },
              gap: 3 
            }}
          >
            {features.map((feature, index) => (
              <Box 
                key={index} 
                sx={{ 
                  textAlign: 'center',
                  p: 3,
                  backgroundColor: '#FAFAFA',
                  borderRadius: '16px',
                  border: '1px solid #F3F4F6',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    backgroundColor: feature.bgColor,
                    borderColor: feature.color,
                    transform: 'translateY(-2px)'
                  }
                }}
              >
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    mx: 'auto',
                    mb: 2,
                    backgroundColor: feature.bgColor,
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <feature.icon sx={{ fontSize: 24, color: feature.color }} />
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 1, color: '#1F2937' }}>
                  {feature.title}
                </Typography>
                <Typography variant="body2" sx={{ color: '#6B7280', lineHeight: 1.5 }}>
                  {feature.description}
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>

        {/* Detailed Features */}
        <Box sx={{ backgroundColor: '#FAFAFA', borderRadius: '16px', p: 6 }}>
          <Typography 
            variant="h3" 
            sx={{ 
              fontWeight: 700, 
              textAlign: 'center', 
              mb: 6,
              color: '#1F2937'
            }}
          >
            Why Choose Shmallergies?
          </Typography>
          <Box 
            sx={{ 
              display: 'grid', 
              gridTemplateColumns: { 
                xs: '1fr', 
                md: 'repeat(2, 1fr)' 
              },
              gap: 4 
            }}
          >
            {detailedFeatures.map((feature, index) => (
              <Box 
                key={index} 
                sx={{ 
                  display: 'flex',
                  gap: 3,
                  p: 3,
                  backgroundColor: 'white',
                  borderRadius: '12px',
                  border: '1px solid #F3F4F6'
                }}
              >
                <Box
                  sx={{
                    width: 56,
                    height: 56,
                    backgroundColor: `${feature.color}15`,
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}
                >
                  <feature.icon sx={{ fontSize: 28, color: feature.color }} />
                </Box>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 1, color: '#1F2937' }}>
                    {feature.title}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#6B7280', lineHeight: 1.6 }}>
                    {feature.description}
                  </Typography>
                </Box>
              </Box>
            ))}
          </Box>
        </Box>

        {/* How it works */}
        <Box>
          <Typography 
            variant="h3" 
            sx={{ 
              fontWeight: 700, 
              textAlign: 'center', 
              mb: 6,
              color: '#1F2937'
            }}
          >
            How It Works
          </Typography>
          <Box 
            sx={{ 
              display: 'grid', 
              gridTemplateColumns: { 
                xs: '1fr', 
                md: 'repeat(3, 1fr)' 
              },
              gap: 4 
            }}
          >
            {[
              {
                step: 1,
                title: 'Create Your Profile',
                description: 'Sign up and add your specific allergies to create a personalized safety profile that will protect you from harmful ingredients.',
                color: '#10B981'
              },
              {
                step: 2,
                title: 'Search or Upload',
                description: 'Search our comprehensive database or upload new products with ingredient photos. Our AI automatically analyzes and detects allergens.',
                color: '#059669'
              },
              {
                step: 3,
                title: 'Stay Safe & Help Others',
                description: 'Get instant safety warnings for your allergies and contribute to our global database to help the entire allergy community stay safe.',
                color: '#0D9488'
              }
            ].map((item, index) => (
              <Box key={index} sx={{ textAlign: 'center' }}>
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    mx: 'auto',
                    mb: 3,
                    backgroundColor: item.color,
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.2rem',
                    fontWeight: 700,
                    color: 'white'
                  }}
                >
                  {item.step}
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: '#1F2937' }}>
                  {item.title}
                </Typography>
                <Typography variant="body2" sx={{ color: '#6B7280', lineHeight: 1.6 }}>
                  {item.description}
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>

        {/* Technical Details */}
        <Box sx={{ backgroundColor: '#FAFAFA', borderRadius: '16px', p: 6 }}>
          <Typography 
            variant="h3" 
            sx={{ 
              fontWeight: 700, 
              textAlign: 'center', 
              mb: 6,
              color: '#1F2937'
            }}
          >
            Built for Accuracy & Speed
          </Typography>
          <Box 
            sx={{ 
              display: 'grid', 
              gridTemplateColumns: { 
                xs: '1fr', 
                md: 'repeat(2, 1fr)' 
              },
              gap: 6 
            }}
          >
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 600, mb: 3, color: '#1F2937' }}>
                Advanced Technology Stack
              </Typography>
              <Stack spacing={2}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Chip 
                    label="Laravel API" 
                    sx={{ backgroundColor: '#10B981', color: 'white', fontWeight: 600 }} 
                  />
                  <Typography variant="body2" sx={{ color: '#6B7280' }}>
                    Robust PHP backend with comprehensive API
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Chip 
                    label="React Frontend" 
                    sx={{ backgroundColor: '#059669', color: 'white', fontWeight: 600 }} 
                  />
                  <Typography variant="body2" sx={{ color: '#6B7280' }}>
                    Modern TypeScript interface with real-time updates
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Chip 
                    label="AI Detection" 
                    sx={{ backgroundColor: '#0D9488', color: 'white', fontWeight: 600 }} 
                  />
                  <Typography variant="body2" sx={{ color: '#6B7280' }}>
                    Machine learning for accurate allergen identification
                  </Typography>
                </Box>
              </Stack>
            </Box>
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 600, mb: 3, color: '#1F2937' }}>
                Database Architecture
              </Typography>
              <Typography variant="body2" sx={{ color: '#6B7280', lineHeight: 1.6, mb: 2 }}>
                Our system maintains comprehensive relationships between products, ingredients, and allergens:
              </Typography>
              <Stack spacing={1}>
                <Typography variant="body2" sx={{ color: '#6B7280' }}>
                  • <strong>Global Product Database:</strong> Publicly accessible with UPC codes
                </Typography>
                <Typography variant="body2" sx={{ color: '#6B7280' }}>
                  • <strong>Ingredient Analysis:</strong> AI-powered detection from photos
                </Typography>
                <Typography variant="body2" sx={{ color: '#6B7280' }}>
                  • <strong>Personal Profiles:</strong> Individual allergy tracking and safety checks
                </Typography>
                <Typography variant="body2" sx={{ color: '#6B7280' }}>
                  • <strong>Community Driven:</strong> Every upload helps everyone stay safer
                </Typography>
              </Stack>
            </Box>
          </Box>
        </Box>

        {/* Safety Warning - Back to warning language */}
        <Alert 
          severity="warning" 
          icon={<Warning />}
          sx={{ 
            backgroundColor: '#FEF3C7',
            border: '1px solid #F59E0B',
            borderRadius: '12px',
            '& .MuiAlert-message': { width: '100%' },
            '& .MuiAlert-icon': { color: '#D97706' }
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 1, color: '#1F2937' }}>
            Important Safety Warning
          </Typography>
          <Typography variant="body2" sx={{ color: '#6B7280', lineHeight: 1.5 }}>
            While our app helps identify potential allergens using advanced AI technology, it should not replace 
            careful reading of product labels and professional medical advice. Always verify ingredient information 
            and consult with healthcare professionals about your specific allergies.
          </Typography>
        </Alert>

        {/* CTA Section */}
        {!isAuthenticated && (
          <Box
            sx={{
              backgroundColor: '#1F2937',
              color: 'white',
              p: 6,
              borderRadius: '16px',
              textAlign: 'center'
            }}
          >
            <Typography variant="h3" sx={{ fontWeight: 700, mb: 2 }}>
              Ready to Take Control?
            </Typography>
            <Typography variant="h6" sx={{ color: '#9CA3AF', mb: 4, fontWeight: 400 }}>
              Join thousands of users who trust Shmallergies to keep them safe.
            </Typography>
            <Button
              component={Link}
              to="/signup"
              variant="contained"
              size="large"
              startIcon={<CheckCircle />}
              sx={{
                backgroundColor: '#10B981',
                color: 'white',
                px: 4,
                py: 1.5,
                fontSize: '1.1rem',
                '&:hover': {
                  backgroundColor: '#059669'
                },
                borderRadius: '12px',
                textTransform: 'none',
                fontWeight: 600
              }}
            >
              Create Free Account
            </Button>
          </Box>
        )}
      </Stack>
    </Box>
  );
};

export default Home; 