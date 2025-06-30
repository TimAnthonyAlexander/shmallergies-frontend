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
    Divider
} from '@mui/material';
import {
    ArrowBack,
    Inventory as Package,
    QrCode,
    CalendarToday,
    Warning,
    CheckCircle,
    Info
} from '@mui/icons-material';
import { apiClient } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';
import type { Product, ProductSafetyCheck } from '../types';
import LoadingSpinner from '../components/UI/LoadingSpinner';
import ErrorMessage from '../components/UI/ErrorMessage';

const ProductDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const { isAuthenticated } = useAuth();
    const [product, setProduct] = useState<Product | null>(null);
    const [safetyCheck, setSafetyCheck] = useState<ProductSafetyCheck | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isCheckingSafety, setIsCheckingSafety] = useState(false);
    const [error, setError] = useState<string>('');

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
                            borderRadius: 1,
                            textTransform: 'none',
                            fontWeight: 500,
                            px: 0,
                            '&:hover': {
                                backgroundColor: 'transparent',
                                color: '#000'
                            }
                        }}
                    >
                        Back to Products
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
                            borderRadius: 1,
                            textTransform: 'none',
                            fontWeight: 500,
                            px: 0,
                            '&:hover': {
                                backgroundColor: 'transparent',
                                color: '#000'
                            }
                        }}
                    >
                        Back to Products
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

    return (
        <Container maxWidth="lg" sx={{ py: 8 }}>
            <Stack spacing={12}>
                {/* Navigation */}
                <Button
                    component={Link}
                    to="/products"
                    startIcon={<ArrowBack />}
                    sx={{
                        alignSelf: 'flex-start',
                        color: '#666',
                        borderRadius: 1,
                        textTransform: 'none',
                        fontWeight: 500,
                        px: 0,
                        '&:hover': {
                            backgroundColor: 'transparent',
                            color: '#000'
                        }
                    }}
                >
                    Back to Products
                </Button>

                {/* Safety Check */}
                {isAuthenticated && safetyCheck && (
                    <Box sx={{ py: 2 }}>
                        <Typography 
                            variant="body1" 
                            sx={{ 
                                fontWeight: 500, 
                                color: safetyCheck.is_safe ? '#000' : '#666',
                                mb: safetyCheck.is_safe ? 0 : 2
                            }}
                        >
                            {safetyCheck.is_safe ? '✓ Safe for your allergies' : '⚠ Contains allergens from your profile'}
                        </Typography>
                        {!safetyCheck.is_safe && safetyCheck.potential_conflicts.length > 0 && (
                            <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
                                {safetyCheck.potential_conflicts.map((conflict, index) => (
                                    <Typography
                                        key={index}
                                        variant="body2"
                                        sx={{
                                            color: '#666',
                                            backgroundColor: '#f8f8f8',
                                            px: 2,
                                            py: 0.5,
                                            borderRadius: 1,
                                            fontSize: '0.875rem'
                                        }}
                                    >
                                        {conflict}
                                    </Typography>
                                ))}
                            </Stack>
                        )}
                    </Box>
                )}

                {/* Safety Check Loading */}
                {isAuthenticated && isCheckingSafety && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, py: 2 }}>
                        <LoadingSpinner size="small" />
                        <Typography variant="body2" sx={{ color: '#666' }}>
                            Checking product safety...
                        </Typography>
                    </Box>
                )}

                {/* Product Header */}
                <Box sx={{
                    display: 'grid',
                    gridTemplateColumns: { xs: '1fr', lg: '1fr 1.5fr' },
                    gap: 8
                }}>
                    {/* Product Image */}
                    <Box>
                        <Box sx={{
                            borderRadius: 1,
                            overflow: 'hidden',
                            backgroundColor: '#f8f8f8',
                            aspectRatio: '1/1'
                        }}>
                            {product.ingredient_image_url ? (
                                <CardMedia
                                    component="img"
                                    height="100%"
                                    image={'http://shmallergies.test:2811' + product.ingredient_image_url}
                                    alt={`${product.name} ingredients`}
                                    sx={{ objectFit: 'cover' }}
                                />
                            ) : (
                                <Box
                                    sx={{
                                        height: '100%',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}
                                >
                                    <Package sx={{ fontSize: 48, color: '#ccc' }} />
                                </Box>
                            )}
                        </Box>
                    </Box>

                    {/* Product Info */}
                    <Box>
                        <Stack spacing={6}>
                            <Box>
                                <Typography 
                                    variant="h2" 
                                    component="h1" 
                                    sx={{ 
                                        fontWeight: 300, 
                                        color: '#000',
                                        fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' },
                                        letterSpacing: '-0.02em',
                                        mb: 4
                                    }}
                                >
                                    {product.name}
                                </Typography>

                                <Stack spacing={3}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                        <QrCode sx={{ fontSize: 20, color: '#666' }} />
                                        <Typography 
                                            variant="body1" 
                                            sx={{ 
                                                fontFamily: 'monospace', 
                                                color: '#666',
                                                fontSize: '0.9rem'
                                            }}
                                        >
                                            {product.upc_code}
                                        </Typography>
                                    </Box>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                        <CalendarToday sx={{ fontSize: 20, color: '#666' }} />
                                        <Typography variant="body2" sx={{ color: '#999' }}>
                                            Added {formatDate(product.created_at)}
                                        </Typography>
                                    </Box>
                                </Stack>
                            </Box>

                            <Box sx={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(2, 1fr)',
                                gap: 4
                            }}>
                                <Box sx={{ textAlign: 'center' }}>
                                    <Typography 
                                        variant="h4" 
                                        sx={{ 
                                            color: '#000', 
                                            fontWeight: 500,
                                            mb: 1
                                        }}
                                    >
                                        {product.ingredients?.length || 0}
                                    </Typography>
                                    <Typography variant="body2" sx={{ color: '#666' }}>
                                        Ingredients
                                    </Typography>
                                </Box>
                                <Box sx={{ textAlign: 'center' }}>
                                    <Typography 
                                        variant="h4" 
                                        sx={{ 
                                            color: '#000', 
                                            fontWeight: 500,
                                            mb: 1
                                        }}
                                    >
                                        {uniqueAllergens.length}
                                    </Typography>
                                    <Typography variant="body2" sx={{ color: '#666' }}>
                                        Allergens
                                    </Typography>
                                </Box>
                            </Box>

                            {!isAuthenticated && (
                                <Box sx={{ pt: 2 }}>
                                    <Typography variant="body2" sx={{ color: '#666', lineHeight: 1.6 }}>
                                        <Button
                                            component={Link}
                                            to="/login"
                                            sx={{
                                                color: '#000',
                                                fontWeight: 500,
                                                textTransform: 'none',
                                                p: 0,
                                                minWidth: 'auto',
                                                textDecoration: 'underline',
                                                '&:hover': {
                                                    backgroundColor: 'transparent',
                                                    textDecoration: 'underline'
                                                }
                                            }}
                                        >
                                            Sign in
                                        </Button>
                                        {' '}for personalized safety checks.
                                    </Typography>
                                </Box>
                            )}
                        </Stack>
                    </Box>
                </Box>

                <Divider sx={{ borderColor: '#f0f0f0' }} />

                {/* Ingredients Section */}
                <Box>
                    <Typography 
                        variant="h4" 
                        sx={{ 
                            fontWeight: 300, 
                            mb: 6, 
                            color: '#000',
                            letterSpacing: '-0.01em'
                        }}
                    >
                        Ingredients
                        <Typography component="span" sx={{ color: '#999', fontWeight: 300 }}>
                            {' '}({product.ingredients?.length || 0})
                        </Typography>
                    </Typography>
                    
                    {product.ingredients && product.ingredients.length > 0 ? (
                        <Box sx={{ 
                            display: 'grid', 
                            gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' },
                            gap: 2 
                        }}>
                            {product.ingredients.map((ingredient, index) => (
                                <Box
                                    key={index}
                                    sx={{
                                        py: 2,
                                        px: 0,
                                        borderBottom: '1px solid #f0f0f0'
                                    }}
                                >
                                    <Typography 
                                        variant="body1" 
                                        sx={{ 
                                            color: '#000',
                                            fontWeight: 400,
                                            fontSize: '0.95rem'
                                        }}
                                    >
                                        {ingredient.title}
                                    </Typography>
                                </Box>
                            ))}
                        </Box>
                    ) : (
                        <Typography variant="body1" sx={{ color: '#999', fontStyle: 'italic' }}>
                            Ingredient information is being processed...
                        </Typography>
                    )}
                </Box>

                <Divider sx={{ borderColor: '#f0f0f0' }} />

                {/* Allergens Section */}
                <Box>
                    <Typography 
                        variant="h4" 
                        sx={{ 
                            fontWeight: 300, 
                            mb: 6, 
                            color: '#000',
                            letterSpacing: '-0.01em'
                        }}
                    >
                        Allergens
                        <Typography component="span" sx={{ color: '#999', fontWeight: 300 }}>
                            {' '}({uniqueAllergens.length})
                        </Typography>
                    </Typography>
                    
                    {uniqueAllergens.length > 0 ? (
                        <Stack direction="row" spacing={2} sx={{ flexWrap: 'wrap', gap: 2 }}>
                            {uniqueAllergens.map((allergen, index) => (
                                <Chip
                                    key={allergen.id || index}
                                    label={allergen.name}
                                    sx={{
                                        backgroundColor: '#f8f8f8',
                                        color: '#000',
                                        border: '1px solid #f0f0f0',
                                        fontWeight: 500,
                                        borderRadius: 1,
                                        '&:hover': {
                                            backgroundColor: '#f0f0f0'
                                        }
                                    }}
                                />
                            ))}
                        </Stack>
                    ) : (
                        <Box sx={{ py: 4, textAlign: 'center' }}>
                            <CheckCircle sx={{ fontSize: 32, color: '#ccc', mb: 2 }} />
                            <Typography variant="body1" sx={{ color: '#666' }}>
                                No allergens detected.
                            </Typography>
                        </Box>
                    )}
                </Box>

                <Divider sx={{ borderColor: '#f0f0f0' }} />

                {/* AI Processing Note */}
                <Box sx={{ py: 2 }}>
                    <Typography variant="body2" sx={{ color: '#999', lineHeight: 1.6 }}>
                        <strong>AI Processing:</strong> Allergen information is automatically extracted from ingredient photos. 
                        Always verify with the actual product label and consult healthcare professionals for severe allergies.
                    </Typography>
                </Box>
            </Stack>
        </Container>
    );
};

export default ProductDetail; 
