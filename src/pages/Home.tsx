import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Box, 
  Container, 
  Typography, 
  Button, 
  Stack,
  Alert,
  Card,
  CardContent,
  Avatar,
  Paper
} from '@mui/material';
import { 
  Shield, 
  Upload, 
  CheckCircle, 
  Warning,
  ArrowForward,
  QrCodeScanner,
  SmartphoneOutlined,
  AutoAwesomeOutlined,
  VerifiedUserOutlined,
  GroupsOutlined,
  ShoppingBagOutlined,
  HomeOutlined,
  FlightOutlined
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';

const Home: React.FC = () => {
  const { isAuthenticated, user } = useAuth();

  const coreFeatures = [
    {
      icon: QrCodeScanner,
      title: 'Scan',
      description: 'Point your camera at any product barcode for instant allergen information.'
    },
    {
      icon: AutoAwesomeOutlined,
      title: 'Analyze',
      description: 'Our AI instantly reads ingredient lists and identifies potential allergens.'
    },
    {
      icon: VerifiedUserOutlined,
      title: 'Personalize',
      description: 'Get warnings tailored to your specific allergy profile and sensitivities.'
    },
    {
      icon: GroupsOutlined,
      title: 'Contribute',
      description: 'Help others by adding new products to our growing community database.'
    }
  ];
  
  const userScenarios = [
    {
      icon: ShoppingBagOutlined,
      title: 'Shopping',
      description: 'Scan products before you buy to avoid bringing allergens home.'
    },
    {
      icon: HomeOutlined,
      title: 'Home Check',
      description: 'Verify the safety of items already in your pantry or fridge.'
    },
    {
      icon: FlightOutlined,
      title: 'Travel',
      description: 'Navigate unfamiliar products in new countries with confidence.'
    }
  ];

  const testimonials = [
    {
      quote: "I used to spend 10 minutes reading every label. Now it takes seconds to know if something is safe for my daughter.",
      name: "Sarah K.",
      role: "Parent of child with multiple allergies"
    },
    {
      quote: "The barcode scanner has been a lifesaver when shopping in foreign countries where I can't read the labels.",
      name: "Michael T.",
      role: "Traveler with gluten sensitivity"
    }
  ];

  return (
    <Container maxWidth="xl" sx={{ py: { xs: 4, md: 8 } }}>
      <Stack spacing={{ xs: 10, md: 16 }}>
        
        {/* Hero Section */}
        <Box sx={{ textAlign: 'center' }}>
          <Box 
            sx={{ 
              width: 80, 
              height: 80, 
              mx: 'auto', 
              mb: 5,
              backgroundColor: '#000',
              borderRadius: 3,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Shield sx={{ fontSize: 40, color: 'white' }} />
          </Box>
          
          <Typography 
            variant="h1" 
            component="h1" 
            sx={{ 
              fontSize: { xs: '2.5rem', md: '3.75rem' },
              fontWeight: 300,
              mb: 3,
              color: '#000',
              letterSpacing: '-0.02em',
              textAlign: 'center',
              lineHeight: 1.1
            }}
          >
            Never wonder about<br />ingredients again.
          </Typography>
          
          <Typography 
            variant="h6" 
            sx={{ 
              color: '#666',
              mb: 6,
              fontWeight: 400,
              lineHeight: 1.6,
              textAlign: 'center',
              maxWidth: '650px',
              mx: 'auto'
            }}
          >
            Living with food allergies means reading every label, every time.
            We make it instant with AI-powered allergen detection.
          </Typography>
          
          <Stack 
            direction={{ xs: 'column', sm: 'row' }} 
            spacing={2} 
            justifyContent="center"
            sx={{ mb: 4 }}
          >
            {!isAuthenticated ? (
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
                  borderRadius: 2,
                  textTransform: 'none',
                  fontWeight: 500,
                  '&:hover': {
                    backgroundColor: '#333'
                  }
                }}
              >
                Get Started
              </Button>
            ) : (
              <>
                <Button
                  component={Link}
                  to="/scanner"
                  variant="contained"
                  size="large"
                  startIcon={<QrCodeScanner />}
                  sx={{ 
                    px: 4, 
                    py: 1.5,
                    backgroundColor: '#1976d2',
                    color: 'white',
                    borderRadius: 2,
                    textTransform: 'none',
                    fontWeight: 500,
                    boxShadow: '0 4px 10px rgba(25, 118, 210, 0.2)',
                    '&:hover': {
                      backgroundColor: '#1565c0'
                    }
                  }}
                >
                  Scan Product
                </Button>
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
                    borderRadius: 2,
                    textTransform: 'none',
                    fontWeight: 500,
                    '&:hover': {
                      backgroundColor: '#333'
                    }
                  }}
                >
                  Add Product
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

        {/* Scanner Demo for authenticated users */}
        {isAuthenticated && (
          <Box sx={{ 
            background: 'linear-gradient(to right, #f5f9ff, #e1effe)',
            borderRadius: 4,
            p: { xs: 4, md: 6 },
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 4
          }}>
            <Box sx={{ maxWidth: { md: '60%' } }}>
              <Typography variant="h4" component="h2" sx={{ fontWeight: 500, mb: 2, color: '#1565c0' }}>
                Quick Allergen Check
              </Typography>
              <Typography variant="body1" sx={{ color: '#555', mb: 3, lineHeight: 1.6 }}>
                Scan product barcodes instantly to check for allergens and get personalized safety information. 
                Perfect for shopping or checking products you already have.
              </Typography>
              <Button
                component={Link}
                to="/scanner"
                variant="contained"
                size="large"
                startIcon={<QrCodeScanner />}
                sx={{ 
                  backgroundColor: '#1976d2',
                  color: 'white',
                  fontWeight: 500,
                  textTransform: 'none',
                  px: 4, 
                  py: 1.5,
                  borderRadius: 2,
                  boxShadow: '0 4px 10px rgba(25, 118, 210, 0.3)',
                  '&:hover': {
                    backgroundColor: '#1565c0'
                  }
                }}
              >
                Open Scanner
              </Button>
            </Box>
            <Box sx={{ 
              backgroundColor: '#fff', 
              borderRadius: 3,
              p: 3,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 10px 25px rgba(25, 118, 210, 0.15)',
              width: { xs: '100%', md: '200px' },
              height: { xs: '200px', md: '200px' }
            }}>
              <QrCodeScanner sx={{ fontSize: 100, color: '#1976d2' }} />
            </Box>
          </Box>
        )}

        {/* How It Works - Visual Flow */}
        <Box>
          <Typography 
            variant="h3" 
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
                md: 'repeat(4, 1fr)' 
              },
              gap: { xs: 6, md: 4 },
              maxWidth: 1200,
              mx: 'auto',
              position: 'relative'
            }}
          >
            {/* Connecting line between steps (desktop only) */}
            <Box 
              sx={{ 
                display: { xs: 'none', md: 'block' },
                position: 'absolute',
                top: '40px',
                left: '10%',
                width: '80%',
                height: '2px',
                backgroundColor: '#f0f0f0',
                zIndex: 0
              }}
            />
            
            {coreFeatures.map((feature, index) => (
              <Box 
                key={index} 
                sx={{ 
                  textAlign: 'center',
                  position: 'relative',
                  zIndex: 1
                }}
              >
                <Box
                  sx={{
                    width: 80,
                    height: 80,
                    mb: 3,
                    mx: 'auto',
                    backgroundColor: '#f8f8f8',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '2px solid #fff',
                    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)'
                  }}
                >
                  <feature.icon sx={{ fontSize: 36, color: '#666' }} />
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
                    fontSize: '0.95rem',
                    maxWidth: '220px',
                    mx: 'auto'
                  }}
                >
                  {feature.description}
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>

        {/* AI Analysis Section */}
        <Box sx={{ 
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          alignItems: 'center',
          gap: { xs: 6, md: 10 }
        }}>
          <Box sx={{ flex: 1 }}>
            <Typography 
              variant="h3" 
              component="h2" 
              sx={{ 
                fontWeight: 300,
                mb: 3,
                color: '#000',
                letterSpacing: '-0.01em'
              }}
            >
              AI-powered allergen detection
            </Typography>
            <Typography 
              variant="body1" 
              sx={{ 
                color: '#666',
                mb: 4,
                lineHeight: 1.6
              }}
            >
              Our advanced AI technology analyzes ingredient lists from product images, identifying potential allergens with 99.9% accuracy. No more squinting at tiny text or worrying about missing something important.
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <CheckCircle sx={{ color: '#4caf50' }} />
                <Typography variant="body1">Recognizes over 500 common allergens</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <CheckCircle sx={{ color: '#4caf50' }} />
                <Typography variant="body1">Detects alternative names and derivatives</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <CheckCircle sx={{ color: '#4caf50' }} />
                <Typography variant="body1">Updates regularly with new ingredients</Typography>
              </Box>
            </Box>
          </Box>
          <Box sx={{ 
            flex: 1,
            backgroundColor: '#f8f8f8',
            borderRadius: 4,
            p: 4,
            maxWidth: { xs: '100%', md: '500px' }
          }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 500, mb: 2 }}>Sample Ingredient Analysis</Typography>
            <Box sx={{ 
              backgroundColor: '#fff',
              borderRadius: 2,
              p: 3,
              mb: 3,
              border: '1px solid #eee'
            }}>
              <Typography variant="body2" sx={{ fontFamily: 'monospace', whiteSpace: 'pre-line' }}>
                {"Ingredients: Wheat flour, sugar, vegetable oil (palm, rapeseed), cocoa butter, milk powder, emulsifier (soy lecithin), natural flavoring.\n\nContains: wheat, milk, soy"}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box sx={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: '#f44336' }} />
                <Typography variant="body2">Wheat (detected in "wheat flour")</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box sx={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: '#f44336' }} />
                <Typography variant="body2">Milk (detected in "milk powder")</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box sx={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: '#f44336' }} />
                <Typography variant="body2">Soy (detected in "soy lecithin")</Typography>
              </Box>
            </Box>
          </Box>
        </Box>

        {/* User Scenarios */}
        <Box>
          <Typography 
            variant="h3" 
            component="h2"
            sx={{ 
              fontWeight: 300,
              textAlign: 'center', 
              mb: 8,
              color: '#000',
              letterSpacing: '-0.01em'
            }}
          >
            Use it anywhere
          </Typography>
          
          <Box 
            sx={{ 
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' },
              gap: 4
            }}
          >
            {userScenarios.map((scenario, index) => (
              <Paper
                key={index}
                elevation={0}
                sx={{
                  p: 4,
                  height: '100%',
                  borderRadius: 4,
                  border: '1px solid #f0f0f0',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.05)'
                  }
                }}
              >
                <Box
                  sx={{
                    width: 60,
                    height: 60,
                    mb: 3,
                    backgroundColor: '#f8f8f8',
                    borderRadius: 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <scenario.icon sx={{ fontSize: 30, color: '#666' }} />
                </Box>
                <Typography 
                  variant="h5" 
                  sx={{ 
                    fontWeight: 500, 
                    mb: 2, 
                    color: '#000'
                  }}
                >
                  {scenario.title}
                </Typography>
                <Typography 
                  variant="body1" 
                  sx={{ 
                    color: '#666', 
                    lineHeight: 1.6
                  }}
                >
                  {scenario.description}
                </Typography>
              </Paper>
            ))}
          </Box>
        </Box>

        {/* Personalization Section */}
        <Box sx={{ 
          backgroundColor: '#f9f9f9',
          borderRadius: 4,
          p: { xs: 4, md: 6 },
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          alignItems: 'center',
          gap: 6
        }}>
          <Box sx={{ flex: 1 }}>
            <Typography variant="h3" component="h2" sx={{ fontWeight: 300, mb: 3, color: '#000' }}>
              Personalized for your needs
            </Typography>
            <Typography variant="body1" sx={{ color: '#666', mb: 4, lineHeight: 1.6 }}>
              Set up your personal allergy profile and get customized alerts when a product contains ingredients you need to avoid. From common allergens to specific sensitivities, we've got you covered.
            </Typography>
            <Button
              component={Link}
              to={isAuthenticated ? "/profile" : "/signup"}
              variant="contained"
              size="large"
              sx={{ 
                backgroundColor: '#000',
                color: 'white',
                textTransform: 'none',
                fontWeight: 500,
                borderRadius: 2,
                px: 4,
                py: 1.5,
                '&:hover': {
                  backgroundColor: '#333'
                }
              }}
            >
              {isAuthenticated ? "Manage Your Profile" : "Create Your Profile"}
            </Button>
          </Box>
          <Box sx={{ 
            flex: 1,
            backgroundColor: '#fff',
            borderRadius: 3,
            p: 3,
            border: '1px solid #eee',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.05)',
            maxWidth: { xs: '100%', md: '450px' }
          }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 500, mb: 3, color: '#000' }}>
              Sample Allergy Profile
            </Typography>
            <Stack spacing={2}>
              {['Peanuts', 'Tree nuts', 'Dairy', 'Shellfish'].map((allergy, index) => (
                <Box 
                  key={index}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    p: 2,
                    borderRadius: 2,
                    backgroundColor: '#f8f8f8',
                    gap: 2
                  }}
                >
                  <Box sx={{ 
                    width: 8, 
                    height: 8, 
                    borderRadius: '50%', 
                    backgroundColor: '#f44336' 
                  }} />
                  <Typography variant="body1">{allergy}</Typography>
                </Box>
              ))}
            </Stack>
          </Box>
        </Box>

        {/* Testimonials */}
        <Box>
          <Typography 
            variant="h3" 
            component="h2"
            sx={{ 
              fontWeight: 300,
              textAlign: 'center', 
              mb: 8,
              color: '#000',
              letterSpacing: '-0.01em'
            }}
          >
            What our users say
          </Typography>
          
          <Box 
            sx={{ 
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' },
              gap: 4
            }}
          >
            {testimonials.map((testimonial, index) => (
              <Card 
                key={index}
                elevation={0}
                sx={{ 
                  p: 4, 
                  height: '100%',
                  borderRadius: 4,
                  border: '1px solid #f0f0f0'
                }}
              >
                <CardContent>
                  <Typography 
                    variant="body1" 
                    sx={{ 
                      fontStyle: 'italic',
                      mb: 4,
                      color: '#333',
                      lineHeight: 1.7,
                      fontSize: '1.1rem'
                    }}
                  >
                    "{testimonial.quote}"
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar sx={{ bgcolor: '#f0f0f0', color: '#666' }}>
                      {testimonial.name.charAt(0)}
                    </Avatar>
                    <Box>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                        {testimonial.name}
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#666' }}>
                        {testimonial.role}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            ))}
          </Box>
        </Box>

        {/* Safety Warning */}
        <Alert 
          severity="warning" 
          icon={<Warning sx={{ color: '#666' }} />}
          sx={{ 
            backgroundColor: '#fafafa',
            border: '1px solid #f0f0f0',
            borderRadius: 2,
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
            careful label reading and professional medical advice. Always verify ingredients 
            directly when your health is at stake.
          </Typography>
        </Alert>

        {/* Final CTA */}
        {!isAuthenticated && (
          <Box sx={{ textAlign: 'center', pt: 4 }}>
            <Typography 
              variant="h4" 
              component="h2" 
              sx={{ 
                fontWeight: 300,
                mb: 4,
                color: '#000'
              }}
            >
              Ready to take control of your allergies?
            </Typography>
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
                borderRadius: 2,
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
        pt: 12, 
        pb: 4, 
        borderTop: '1px solid #f5f5f5',
        mt: 12 
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