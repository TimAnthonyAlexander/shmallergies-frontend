import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Box, 
  Container, 
  Typography, 
  Button, 
  Stack,
  Alert,
  Divider
} from '@mui/material';
import { 
  Shield, 
  Search, 
  Upload, 
  CheckCircle, 
  Warning,
  ArrowForward
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';

const Home: React.FC = () => {
  const { isAuthenticated, user } = useAuth();

  const coreFeatures = [
    {
      icon: Search,
      title: 'Search',
      description: 'Find allergen information instantly in our comprehensive product database.'
    },
    {
      icon: Upload,
      title: 'Contribute',
      description: 'Upload products with AI-powered allergen detection to help the community.'
    },
    {
      icon: Shield,
      title: 'Stay Safe',
      description: 'Get personalized warnings based on your specific allergy profile.'
    }
  ];

  return (
    <Container maxWidth="xl" sx={{ py: { xs: 4, md: 8 } }}>
      <Stack spacing={{ xs: 8, md: 12 }}>
        
        {/* Hero Section */}
        <Box sx={{ textAlign: 'center' }}>
          <Box 
            sx={{ 
              width: 64, 
              height: 64, 
              mx: 'auto', 
              mb: 4,
              backgroundColor: '#000',
              borderRadius: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Shield sx={{ fontSize: 32, color: 'white' }} />
          </Box>
          
          <Typography 
            variant="h1" 
            component="h1" 
            sx={{ 
              fontSize: { xs: '2.5rem', md: '3.5rem' },
              fontWeight: 300,
              mb: 3,
              color: '#000',
              letterSpacing: '-0.02em',
              textAlign: 'center'
            }}
          >
            Track allergies.
            <br />
            Stay safe.
          </Typography>
          
          <Typography 
            variant="h6" 
            sx={{ 
              color: '#666',
              mb: 6,
              fontWeight: 400,
              lineHeight: 1.6,
              textAlign: 'center'
            }}
          >
            A community-driven platform for identifying allergens in food products.
          </Typography>
          
          <Stack 
            direction={{ xs: 'column', sm: 'row' }} 
            spacing={2} 
            justifyContent="center"
            sx={{ mb: 4 }}
          >
            {!isAuthenticated ? (
              <>
                <Button
                  component={Link}
                  to="/signup"
                  variant="contained"
                  size="large"
                  endIcon={<ArrowForward />}
                  sx={{ 
                    px: 4, 
                    py: 1.5,
                    backgroundColor: '#000',
                    color: 'white',
                    borderRadius: 1,
                    textTransform: 'none',
                    fontWeight: 500,
                    '&:hover': {
                      backgroundColor: '#333'
                    }
                  }}
                >
                  Get Started
                </Button>
                <Button
                  component={Link}
                  to="/products"
                  variant="outlined"
                  size="large"
                  sx={{ 
                    px: 4, 
                    py: 1.5,
                    borderColor: '#ddd',
                    color: '#666',
                    borderRadius: 1,
                    textTransform: 'none',
                    fontWeight: 500,
                    '&:hover': {
                      borderColor: '#000',
                      backgroundColor: 'transparent'
                    }
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
                  endIcon={<Upload />}
                  sx={{ 
                    px: 4, 
                    py: 1.5,
                    backgroundColor: '#000',
                    color: 'white',
                    borderRadius: 1,
                    textTransform: 'none',
                    fontWeight: 500,
                    '&:hover': {
                      backgroundColor: '#333'
                    }
                  }}
                >
                  Add Product
                </Button>
                <Button
                  component={Link}
                  to="/products"
                  variant="outlined"
                  size="large"
                  sx={{ 
                    px: 4, 
                    py: 1.5,
                    borderColor: '#ddd',
                    color: '#666',
                    borderRadius: 1,
                    textTransform: 'none',
                    fontWeight: 500,
                    '&:hover': {
                      borderColor: '#000',
                      backgroundColor: 'transparent'
                    }
                  }}
                >
                  Search Products
                </Button>
              </>
            )}
          </Stack>

          {/* User greeting - minimal */}
          {isAuthenticated && user && (
            <Typography variant="body2" sx={{ color: '#999', fontStyle: 'italic' }}>
              Welcome back, {user.name}
            </Typography>
          )}
        </Box>

        <Divider sx={{ borderColor: '#f0f0f0' }} />

        {/* Core Features */}
        <Box>
          <Typography 
            variant="h4" 
            component="h2"
            sx={{ 
              fontWeight: 300,
              textAlign: 'center', 
              mb: 8,
              color: '#000',
              letterSpacing: '-0.01em'
            }}
          >
            How it works
          </Typography>
          
                     <Box 
             sx={{ 
               display: 'grid', 
               gridTemplateColumns: { 
                 xs: '1fr', 
                 md: 'repeat(3, 1fr)' 
               },
               gap: { xs: 6, md: 8 },
               maxWidth: 1200,
               mx: 'auto'
             }}
          >
            {coreFeatures.map((feature, index) => (
              <Box 
                key={index} 
                sx={{ 
                  textAlign: { xs: 'center', md: 'left' }
                }}
              >
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    mb: 3,
                    mx: { xs: 'auto', md: 0 },
                    backgroundColor: '#f8f8f8',
                    borderRadius: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <feature.icon sx={{ fontSize: 24, color: '#666' }} />
                </Box>
                <Typography 
                  variant="h6" 
                  sx={{ 
                    fontWeight: 500, 
                    mb: 2, 
                    color: '#000'
                  }}
                >
                  {feature.title}
                </Typography>
                <Typography 
                  variant="body1" 
                  sx={{ 
                    color: '#666', 
                    lineHeight: 1.6,
                    fontSize: '0.95rem'
                  }}
                >
                  {feature.description}
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>

        <Divider sx={{ borderColor: '#f0f0f0' }} />

        {/* Stats - minimal presentation */}
        <Box sx={{ textAlign: 'center' }}>
          <Typography 
            variant="h4" 
            component="h2"
            sx={{ 
              fontWeight: 300,
              mb: 6,
              color: '#000',
              letterSpacing: '-0.01em'
            }}
          >
            Trusted by the community
          </Typography>
          
          <Box 
            sx={{ 
              display: 'grid', 
              gridTemplateColumns: { 
                xs: 'repeat(2, 1fr)', 
                sm: 'repeat(4, 1fr)' 
              },
                           gap: 4,
               maxWidth: 800,
               mx: 'auto'
            }}
          >
            {[
              { number: '10K+', label: 'Products' },
              { number: '50K+', label: 'Allergens detected' },
              { number: '2.5K+', label: 'Users' },
              { number: '99.9%', label: 'Accuracy' }
            ].map((stat, index) => (
              <Box key={index}>
                <Typography 
                  variant="h5" 
                  sx={{ 
                    fontWeight: 600, 
                    color: '#000',
                    mb: 0.5
                  }}
                >
                  {stat.number}
                </Typography>
                <Typography 
                  variant="body2" 
                  sx={{ 
                    color: '#999',
                    fontSize: '0.85rem'
                  }}
                >
                  {stat.label}
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>

        <Divider sx={{ borderColor: '#f0f0f0' }} />

        {/* Safety Warning */}
        <Alert 
          severity="warning" 
          icon={<Warning sx={{ color: '#666' }} />}
          sx={{ 
            backgroundColor: '#fafafa',
            border: '1px solid #f0f0f0',
            borderRadius: 1,
            color: '#666',
            '& .MuiAlert-message': { 
              width: '100%',
              fontSize: '0.9rem'
            }
          }}
        >
          <Typography variant="body2" sx={{ fontWeight: 500, mb: 1 }}>
            Safety Notice
          </Typography>
          <Typography variant="body2" sx={{ lineHeight: 1.5 }}>
            This app assists in identifying potential allergens but should not replace 
            careful label reading and professional medical advice.
          </Typography>
        </Alert>

        {/* Final CTA */}
        {!isAuthenticated && (
          <Box sx={{ textAlign: 'center', pt: 4 }}>
            <Button
              component={Link}
              to="/signup"
              variant="contained"
              size="large"
              endIcon={<CheckCircle />}
              sx={{
                backgroundColor: '#000',
                color: 'white',
                px: 6,
                py: 2,
                borderRadius: 1,
                textTransform: 'none',
                fontWeight: 500,
                '&:hover': {
                  backgroundColor: '#333'
                }
              }}
            >
              Start protecting yourself
            </Button>
          </Box>
        )}
      </Stack>

      {/* Subtle Footer */}
      <Box sx={{ 
        textAlign: 'center', 
        pt: 8, 
        pb: 4, 
        borderTop: '1px solid #f5f5f5',
        mt: 8 
      }}>
        <Typography 
          variant="body2" 
          sx={{ 
            color: '#999', 
            fontSize: '0.8rem',
            mb: 1
          }}
        >
          A project by Tim Anthony Alexander & Feli Schenke
        </Typography>
        <Typography 
          variant="body2" 
          sx={{ 
            color: '#ccc', 
            fontSize: '0.75rem'
          }}
        >
          © 2025 Shmallergies
        </Typography>
      </Box>
    </Container>
  );
};

export default Home; 