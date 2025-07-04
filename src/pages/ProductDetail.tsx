import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
    Box,
    Container,
    Typography,
    Stack,
    Button,
    CardMedia,
    Chip,
    Divider,
    Tabs,
    Tab,
    Modal,
    IconButton,
    alpha,
    Paper,
    Fade
} from '@mui/material';
import {
    ArrowBack,
    Inventory as Package,
    QrCode,
    CalendarToday,
    CheckCircle,
    WarningAmber,
    Close,
    ZoomIn
} from '@mui/icons-material';
import { API_DOMAIN, apiClient } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';
import type { Product, ProductSafetyCheck } from '../types';
import LoadingSpinner from '../components/UI/LoadingSpinner';
import ErrorMessage from '../components/UI/ErrorMessage';

// Tab panel component for the tabbed interface
interface TabPanelProps {
    children?: React.ReactNode;
    index: number;
    value: number;
}

function TabPanel(props: TabPanelProps) {
    const { children, value, index, ...other } = props;

    return (
        <Box
            role="tabpanel"
            hidden={value !== index}
            id={`product-tabpanel-${index}`}
            aria-labelledby={`product-tab-${index}`}
            sx={{ py: 3 }}
            {...other}
        >
            {value === index && (
                <Box>{children}</Box>
            )}
        </Box>
    );
}

const ProductDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const { isAuthenticated } = useAuth();
    const [product, setProduct] = useState<Product | null>(null);
    const [safetyCheck, setSafetyCheck] = useState<ProductSafetyCheck | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isCheckingSafety, setIsCheckingSafety] = useState(false);
    const [error, setError] = useState<string>('');
    const [tabValue, setTabValue] = useState(0);
    const [imageOpen, setImageOpen] = useState(false);
    
    // Animation states
    const [contentVisible, setContentVisible] = useState(false);

    useEffect(() => {
        if (id) {
            loadProduct();
        }
    }, [id]);

    useEffect(() => {
        if (product && isAuthenticated) {
            checkSafety();
        }
    }, [product, isAuthenticated]);

    useEffect(() => {
        // Trigger animation after loading
        if (!isLoading && product) {
            const timer = setTimeout(() => setContentVisible(true), 100);
            return () => clearTimeout(timer);
        }
    }, [isLoading, product]);

    const loadProduct = async () => {
        if (!id) return;

        setIsLoading(true);
        setError('');

        try {
            const response = await apiClient.getProduct(parseInt(id));
            setProduct(response.product);
        } catch (err: any) {
            setError(err.message || 'Failed to load product');
        } finally {
            setIsLoading(false);
        }
    };

    const checkSafety = async () => {
        if (!id || !isAuthenticated) return;

        setIsCheckingSafety(true);

        try {
            const response = await apiClient.checkProductSafety(parseInt(id));
            setSafetyCheck(response);
        } catch (err: any) {
            console.error('Safety check failed:', err);
        } finally {
            setIsCheckingSafety(false);
        }
    };

    const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
        setTabValue(newValue);
    };

    const handleImageOpen = () => setImageOpen(true);
    const handleImageClose = () => setImageOpen(false);

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString();
    };

    if (isLoading) {
        return (
            <Container maxWidth="lg" sx={{ py: 8, display: 'flex', justifyContent: 'center' }}>
                <LoadingSpinner size="large" />
            </Container>
        );
    }

    if (error) {
        return (
            <Container maxWidth="lg" sx={{ py: 8 }}>
                <Stack spacing={6}>
                    <Button
                        component={Link}
                        to="/products"
                        startIcon={<ArrowBack />}
                        sx={{
                            alignSelf: 'flex-start',
                            color: '#666',
                            borderRadius: 2,
                            textTransform: 'none',
                            fontWeight: 500,
                            px: 1.5,
                            py: 0.75,
                            '&:hover': {
                                backgroundColor: alpha('#000', 0.05),
                            }
                        }}
                    >
                        Products
                    </Button>
                    <ErrorMessage message={error} />
                </Stack>
            </Container>
        );
    }

    if (!product) {
        return (
            <Container maxWidth="lg" sx={{ py: 8 }}>
                <Stack spacing={6}>
                    <Button
                        component={Link}
                        to="/products"
                        startIcon={<ArrowBack />}
                        sx={{
                            alignSelf: 'flex-start',
                            color: '#666',
                            borderRadius: 2,
                            textTransform: 'none',
                            fontWeight: 500,
                            px: 1.5,
                            py: 0.75,
                            '&:hover': {
                                backgroundColor: alpha('#000', 0.05),
                            }
                        }}
                    >
                        Products
                    </Button>
                    <Box sx={{ textAlign: 'center', py: 12 }}>
                        <Package sx={{ fontSize: 48, color: '#ddd', mb: 3 }} />
                        <Typography variant="h6" sx={{ color: '#666', fontWeight: 400 }}>
                            Product not found
                        </Typography>
                    </Box>
                </Stack>
            </Container>
        );
    }

    // Extract unique allergens
    const allAllergens = product.ingredients?.flatMap(ingredient =>
        ingredient.allergens || []
    ) || [];
    const uniqueAllergens = allAllergens.filter((allergen, index, self) =>
        index === self.findIndex(a => a.name === allergen.name)
    );

    // Determine safety status colors and icons
    const getSafetyStatus = () => {
        if (!isAuthenticated) return { color: '#888', bgColor: '#f8f8f8', icon: null };
        if (isCheckingSafety) return { color: '#888', bgColor: '#f8f8f8', icon: null };
        if (!safetyCheck) return { color: '#888', bgColor: '#f8f8f8', icon: null };
        
        return safetyCheck.is_safe 
            ? { color: '#34c759', bgColor: alpha('#34c759', 0.05), icon: <CheckCircle sx={{ fontSize: 20 }} /> }
            : { color: '#ff3b30', bgColor: alpha('#ff3b30', 0.05), icon: <WarningAmber sx={{ fontSize: 20 }} /> };
    };
    
    const safetyStatus = getSafetyStatus();

    return (
        <Container maxWidth="lg" sx={{ py: 5 }}>
            <Fade in={contentVisible} timeout={700}>
                <Stack spacing={4}>
                    {/* Navigation */}
                    <Button
                        component={Link}
                        to="/products"
                        startIcon={<ArrowBack />}
                        sx={{
                            alignSelf: 'flex-start',
                            color: '#666',
                            borderRadius: 2,
                            textTransform: 'none',
                            fontWeight: 500,
                            px: 1.5,
                            py: 0.75,
                            '&:hover': {
                                backgroundColor: alpha('#000', 0.05),
                            }
                        }}
                    >
                        Products
                    </Button>
                    
                    {/* Product Header with Safety Check */}
                    <Box 
                        sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 2
                        }}
                    >
                        {/* Product Name and Critical Info */}
                        <Typography
                            variant="h2"
                            component="h1"
                            sx={{
                                fontWeight: 600,
                                color: '#000',
                                fontSize: { xs: '2rem', md: '2.5rem' },
                                letterSpacing: '-0.02em',
                            }}
                        >
                            {product.name}
                        </Typography>
                        
                        {/* Safety Status Banner - Prominent Display */}
                        {isAuthenticated && (
                            <Paper 
                                elevation={0} 
                                sx={{
                                    mt: 1,
                                    mb: 2,
                                    p: 2.5,
                                    borderRadius: 3,
                                    backgroundColor: safetyStatus.bgColor,
                                    border: `1px solid ${alpha(safetyStatus.color, 0.2)}`,
                                    transition: 'all 0.3s ease-in-out',
                                }}
                            >
                                {isCheckingSafety ? (
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                        <LoadingSpinner size="small" />
                                        <Typography variant="body1" sx={{ fontWeight: 500 }}>
                                            Checking product safety...
                                        </Typography>
                                    </Box>
                                ) : safetyCheck ? (
                                    <Stack spacing={1.5}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                            {safetyStatus.icon}
                                            <Typography 
                                                variant="body1" 
                                                sx={{ 
                                                    fontWeight: 600, 
                                                    color: safetyStatus.color 
                                                }}
                                            >
                                                {safetyCheck.is_safe 
                                                    ? 'Safe for your allergies' 
                                                    : 'Contains allergens from your profile'
                                                }
                                            </Typography>
                                        </Box>
                                        
                                        {!safetyCheck.is_safe && safetyCheck.potential_conflicts.length > 0 && (
                                            <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
                                                {safetyCheck.potential_conflicts.map((conflict, index) => (
                                                    <Chip
                                                        key={index}
                                                        label={conflict}
                                                        size="small"
                                                        sx={{
                                                            backgroundColor: alpha('#ff3b30', 0.1),
                                                            color: '#ff3b30',
                                                            fontWeight: 500,
                                                            borderRadius: 1.5,
                                                            border: `1px solid ${alpha('#ff3b30', 0.2)}`,
                                                        }}
                                                    />
                                                ))}
                                            </Stack>
                                        )}
                                    </Stack>
                                ) : null}
                            </Paper>
                        )}
                        
                        {/* Product Content Section */}
                        <Box sx={{ 
                            display: 'flex',
                            flexDirection: { xs: 'column', sm: 'row' },
                            alignItems: { xs: 'stretch', sm: 'flex-start' },
                            gap: 4,
                            mt: 1
                        }}>
                            {/* Small Thumbnail with Zoom functionality - hidden on mobile */}
                            <Box sx={{
                                width: { xs: '100%', sm: '160px' },
                                flexShrink: 0,
                                display: { xs: 'none', sm: 'block' }, // Hide on mobile, show on sm and up
                            }}>
                                <Paper
                                    elevation={0}
                                    sx={{
                                        borderRadius: 3,
                                        overflow: 'hidden',
                                        backgroundColor: '#f8f8f8',
                                        aspectRatio: '1/1',
                                        position: 'relative',
                                        cursor: product.ingredient_image_url ? 'pointer' : 'default',
                                        transition: 'transform 0.2s ease',
                                        '&:hover': product.ingredient_image_url ? {
                                            transform: 'scale(1.02)'
                                        } : {},
                                    }}
                                    onClick={product.ingredient_image_url ? handleImageOpen : undefined}
                                >
                                    {product.ingredient_image_url ? (
                                        <>
                                            <CardMedia
                                                component="img"
                                                height="100%"
                                                image={API_DOMAIN + product.ingredient_image_url}
                                                alt={`${product.name} ingredients`}
                                                sx={{ objectFit: 'cover' }}
                                            />
                                            <Box sx={{
                                                position: 'absolute',
                                                bottom: 8,
                                                right: 8,
                                                backgroundColor: alpha('#fff', 0.8),
                                                borderRadius: '50%',
                                                p: 0.5,
                                            }}>
                                                <ZoomIn sx={{ fontSize: 18, color: '#666' }} />
                                            </Box>
                                        </>
                                    ) : (
                                        <Box
                                            sx={{
                                                height: '100%',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center'
                                            }}
                                        >
                                            <Package sx={{ fontSize: 40, color: '#ccc' }} />
                                        </Box>
                                    )}
                                </Paper>
                                
                                {/* UPC and Date - More subtle placement */}
                                <Stack spacing={1.5} sx={{ mt: 2 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <QrCode sx={{ fontSize: 16, color: '#999' }} />
                                        <Typography
                                            variant="body2"
                                            sx={{
                                                fontFamily: 'monospace',
                                                color: '#999',
                                                fontSize: '0.8rem'
                                            }}
                                        >
                                            {product.upc_code}
                                        </Typography>
                                    </Box>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <CalendarToday sx={{ fontSize: 16, color: '#999' }} />
                                        <Typography variant="body2" sx={{ color: '#999', fontSize: '0.8rem' }}>
                                            {formatDate(product.created_at)}
                                        </Typography>
                                    </Box>
                                </Stack>
                            </Box>
                            
                            {/* Main Content with Tabs */}
                            <Box sx={{ flexGrow: 1, width: '100%' }}>
                                <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                                    <Tabs 
                                        value={tabValue} 
                                        onChange={handleTabChange} 
                                        aria-label="product information tabs"
                                        sx={{
                                            '& .MuiTab-root': {
                                                textTransform: 'none',
                                                fontSize: '1rem',
                                                fontWeight: 500,
                                                color: '#666',
                                                py: 1.5,
                                                minWidth: 'unset',
                                                mr: 4,
                                            },
                                            '& .Mui-selected': {
                                                color: '#007aff !important',
                                                fontWeight: 600,
                                            },
                                            '& .MuiTabs-indicator': {
                                                backgroundColor: '#007aff',
                                                height: 2,
                                            },
                                        }}
                                    >
                                        <Tab label={`Ingredients (${product.ingredients?.length || 0})`} id="product-tab-0" aria-controls="product-tabpanel-0" />
                                        <Tab label={`Allergens (${uniqueAllergens.length})`} id="product-tab-1" aria-controls="product-tabpanel-1" />
                                    </Tabs>
                                </Box>
                                
                                {/* Tab Panels */}
                                <TabPanel value={tabValue} index={0}>
                                    {product.ingredients && product.ingredients.length > 0 ? (
                                        <Box sx={{ mt: 1 }}>
                                            {product.ingredients.map((ingredient, index) => (
                                                <Box
                                                    key={index}
                                                    sx={{
                                                        py: 1.5,
                                                        borderBottom: '1px solid #f0f0f0',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                    }}
                                                >
                                                    <Typography
                                                        variant="body1"
                                                        sx={{
                                                            color: '#333',
                                                            fontWeight: 400,
                                                            fontSize: '0.95rem',
                                                            lineHeight: 1.5,
                                                        }}
                                                    >
                                                        {ingredient.title}
                                                    </Typography>
                                                    
                                                    {ingredient.allergens && ingredient.allergens.length > 0 && (
                                                        <Box sx={{ ml: 'auto' }}>
                                                            <Chip
                                                                size="small"
                                                                label={`${ingredient.allergens.length} ${ingredient.allergens.length === 1 ? 'allergen' : 'allergens'}`}
                                                                sx={{
                                                                    fontSize: '0.75rem',
                                                                    fontWeight: 500,
                                                                    backgroundColor: alpha('#ff3b30', 0.08),
                                                                    color: '#ff3b30',
                                                                    height: 24,
                                                                }}
                                                            />
                                                        </Box>
                                                    )}
                                                </Box>
                                            ))}
                                        </Box>
                                    ) : (
                                        <Typography variant="body1" sx={{ color: '#999', fontStyle: 'italic', py: 3 }}>
                                            Ingredient information is being processed...
                                        </Typography>
                                    )}
                                </TabPanel>
                                
                                <TabPanel value={tabValue} index={1}>
                                    {uniqueAllergens.length > 0 ? (
                                        <Box sx={{ mt: 1 }}>
                                            {uniqueAllergens.map((allergen, index) => {
                                                // Check if this allergen matches user's allergens
                                                const isUserAllergen = safetyCheck?.potential_conflicts?.some(
                                                    conflict => conflict.toLowerCase().includes(allergen.name.toLowerCase())
                                                );
                                                
                                                return (
                                                    <Box
                                                        key={allergen.id || index}
                                                        sx={{
                                                            py: 1.5,
                                                            borderBottom: '1px solid #f0f0f0',
                                                        }}
                                                    >
                                                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                            <Typography
                                                                variant="body1"
                                                                sx={{
                                                                    color: isUserAllergen ? '#ff3b30' : '#333',
                                                                    fontWeight: isUserAllergen ? 500 : 400,
                                                                    fontSize: '0.95rem',
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                }}
                                                            >
                                                                {allergen.name}
                                                                {isUserAllergen && (
                                                                    <Chip
                                                                        size="small"
                                                                        label="Your allergy"
                                                                        sx={{
                                                                            ml: 2,
                                                                            fontSize: '0.7rem',
                                                                            fontWeight: 500,
                                                                            backgroundColor: alpha('#ff3b30', 0.08),
                                                                            color: '#ff3b30',
                                                                            height: 22,
                                                                        }}
                                                                    />
                                                                )}
                                                            </Typography>
                                                        </Box>
                                                    </Box>
                                                );
                                            })}
                                        </Box>
                                    ) : (
                                        <Box sx={{ py: 3, textAlign: 'center' }}>
                                            <CheckCircle sx={{ fontSize: 32, color: '#34c759', mb: 2 }} />
                                            <Typography variant="body1" sx={{ color: '#666' }}>
                                                No allergens detected.
                                            </Typography>
                                        </Box>
                                    )}
                                </TabPanel>
                                
                                {/* Authentication prompt */}
                                {!isAuthenticated && (
                                    <Box sx={{ mt: 4, p: 3, backgroundColor: alpha('#007aff', 0.05), borderRadius: 3 }}>
                                        <Typography 
                                            variant="body2" 
                                            sx={{ 
                                                color: '#007aff', 
                                                fontWeight: 500,
                                                display: 'flex',
                                                alignItems: 'center'
                                            }}
                                        >
                                            <Button
                                                component={Link}
                                                to="/login"
                                                sx={{
                                                    color: '#007aff',
                                                    fontWeight: 600,
                                                    textTransform: 'none',
                                                    p: 0,
                                                    minWidth: 'auto',
                                                    mr: 0.5,
                                                    '&:hover': {
                                                        backgroundColor: 'transparent',
                                                        textDecoration: 'underline'
                                                    }
                                                }}
                                            >
                                                Sign in
                                            </Button>
                                            to receive personalized allergen safety checks.
                                        </Typography>
                                    </Box>
                                )}
                            </Box>
                        </Box>
                    </Box>
                    
                    {/* AI Processing Note */}
                    <Box sx={{ mt: 4 }}>
                        <Typography variant="body2" sx={{ color: '#999', fontSize: '0.8rem', lineHeight: 1.6 }}>
                            <strong>AI Processing:</strong> Allergen information is automatically extracted from ingredient photos.
                            Always verify with the actual product label and consult healthcare professionals for severe allergies.
                        </Typography>
                    </Box>
                </Stack>
            </Fade>
            
            {/* Image Modal */}
            <Modal
                open={imageOpen}
                onClose={handleImageClose}
                closeAfterTransition
                aria-labelledby="ingredient-image-modal"
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}
            >
                <Fade in={imageOpen}>
                    <Box sx={{ 
                        position: 'relative',
                        width: '90%',
                        maxWidth: '800px',
                        bgcolor: 'background.paper',
                        borderRadius: 2,
                        boxShadow: 24,
                        p: 1,
                    }}>
                        <IconButton
                            onClick={handleImageClose}
                            sx={{
                                position: 'absolute',
                                right: 8,
                                top: 8,
                                backgroundColor: alpha('#fff', 0.8),
                                '&:hover': {
                                    backgroundColor: alpha('#fff', 0.9),
                                }
                            }}
                        >
                            <Close />
                        </IconButton>
                        
                        {product?.ingredient_image_url && (
                            <CardMedia
                                component="img"
                                image={API_DOMAIN + product.ingredient_image_url}
                                alt={`${product.name} ingredients`}
                                sx={{ 
                                    width: '100%',
                                    maxHeight: '80vh',
                                    objectFit: 'contain',
                                }}
                            />
                        )}
                    </Box>
                </Fade>
            </Modal>
        </Container>
    );
};

export default ProductDetail; 
