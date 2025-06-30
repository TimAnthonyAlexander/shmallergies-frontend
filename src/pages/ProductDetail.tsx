import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
    Box,
    Container,
    Typography,
    Stack,
    Button,
    Card,
    CardMedia,
    Alert,
    Chip,
    List,
    ListItem,
    ListItemText,
    Breadcrumbs
} from '@mui/material';
import {
    ArrowBack,
    Inventory as Package,
    QrCode,
    CalendarToday,
    Shield,
    CheckCircle,
    Cancel,
    Warning,
    Info,
    Visibility
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
            <Container maxWidth="lg" sx={{ py: 6, display: 'flex', justifyContent: 'center' }}>
                <LoadingSpinner size="large" />
            </Container>
        );
    }

    if (error) {
        return (
            <Container maxWidth="lg" sx={{ py: 6 }}>
                <Stack spacing={4}>
                    <Button
                        component={Link}
                        to="/products"
                        startIcon={<ArrowBack />}
                        sx={{
                            alignSelf: 'flex-start',
                            color: '#10B981',
                            '&:hover': {
                                backgroundColor: '#F0FDF4'
                            },
                            borderRadius: '12px',
                            textTransform: 'none',
                            fontWeight: 600
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
            <Container maxWidth="lg" sx={{ py: 6 }}>
                <Stack spacing={4}>
                    <Button
                        component={Link}
                        to="/products"
                        startIcon={<ArrowBack />}
                        sx={{
                            alignSelf: 'flex-start',
                            color: '#10B981',
                            '&:hover': {
                                backgroundColor: '#F0FDF4'
                            },
                            borderRadius: '12px',
                            textTransform: 'none',
                            fontWeight: 600
                        }}
                    >
                        Back to Products
                    </Button>
                    <Box sx={{ textAlign: 'center', py: 8 }}>
                        <Box
                            sx={{
                                width: 80,
                                height: 80,
                                mx: 'auto',
                                mb: 3,
                                backgroundColor: '#F3F4F6',
                                borderRadius: '20px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}
                        >
                            <Package sx={{ fontSize: 40, color: '#9CA3AF' }} />
                        </Box>
                        <Typography variant="h5" sx={{ color: '#6B7280', fontWeight: 600 }}>
                            Product not found
                        </Typography>
                    </Box>
                </Stack>
            </Container>
        );
    }

    return (
        <Container maxWidth="lg" sx={{ py: 6 }}>
            <Stack spacing={6}>
                {/* Navigation */}
                <Button
                    component={Link}
                    to="/products"
                    startIcon={<ArrowBack />}
                    sx={{
                        alignSelf: 'flex-start',
                        color: '#10B981',
                        '&:hover': {
                            backgroundColor: '#F0FDF4'
                        },
                        borderRadius: '12px',
                        textTransform: 'none',
                        fontWeight: 600
                    }}
                >
                    Back to Products
                </Button>

                {/* Safety Check Banner */}
                {isAuthenticated && safetyCheck && (
                    <Box
                        sx={{
                            borderLeft: `4px solid ${safetyCheck.is_safe ? '#10B981' : '#EF4444'}`,
                            pl: 3,
                            py: 2
                        }}
                    >
                        <Typography 
                            variant="body1" 
                            sx={{ 
                                fontWeight: 600, 
                                mb: safetyCheck.is_safe ? 0 : 1.5, 
                                color: safetyCheck.is_safe ? '#10B981' : '#EF4444'
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
                                            color: '#DC2626',
                                            fontWeight: 500,
                                            backgroundColor: '#FEF2F2',
                                            px: 2,
                                            py: 0.5,
                                            borderRadius: '16px',
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
                    <Box
                        sx={{
                            backgroundColor: '#F0F9FF',
                            border: '2px solid #0EA5E9',
                            borderRadius: '16px',
                            p: 4,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 2
                        }}
                    >
                        <LoadingSpinner size="small" />
                        <Typography variant="body1" sx={{ color: '#1F2937', fontWeight: 500 }}>
                            Checking product safety for your allergies...
                        </Typography>
                    </Box>
                )}

                {/* Product Header */}
                <Box
                    sx={{
                        backgroundColor: '#FAFAFA',
                        border: '1px solid #F3F4F6',
                        borderRadius: '20px',
                        p: 4,
                        overflow: 'hidden'
                    }}
                >
                    <Box sx={{
                        display: 'grid',
                        gridTemplateColumns: { xs: '1fr', lg: '1fr 2fr' },
                        gap: 6
                    }}>
                        {/* Product Image */}
                        <Box>
                            <Box
                                sx={{
                                    borderRadius: '16px',
                                    overflow: 'hidden',
                                    backgroundColor: 'white',
                                    border: '1px solid #F3F4F6'
                                }}
                            >
                                {product.ingredient_image_url ? (
                                    <CardMedia
                                        component="img"
                                        height="300"
                                        image={'http://shmallergies.test:2811' + product.ingredient_image_url}
                                        alt={`${product.name} ingredients`}
                                        sx={{ objectFit: 'cover' }}
                                    />
                                ) : (
                                    <Box
                                        sx={{
                                            height: 300,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            backgroundColor: '#F9FAFB'
                                        }}
                                    >
                                        <Package sx={{ fontSize: 48, color: '#D1D5DB' }} />
                                    </Box>
                                )}
                            </Box>
                        </Box>

                        {/* Product Info */}
                        <Box>
                            <Stack spacing={4}>
                                <Typography 
                                    variant="h3" 
                                    component="h1" 
                                    sx={{ 
                                        fontWeight: 800, 
                                        color: '#1F2937',
                                        fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' }
                                    }}
                                >
                                    {product.name}
                                </Typography>

                                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                        <Box
                                            sx={{
                                                width: 32,
                                                height: 32,
                                                backgroundColor: '#F0FDF4',
                                                borderRadius: '8px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center'
                                            }}
                                        >
                                            <QrCode sx={{ fontSize: 18, color: '#10B981' }} />
                                        </Box>
                                        <Typography 
                                            variant="body1" 
                                            sx={{ 
                                                fontFamily: 'monospace', 
                                                fontWeight: 600,
                                                color: '#374151'
                                            }}
                                        >
                                            {product.upc_code}
                                        </Typography>
                                    </Box>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                        <Box
                                            sx={{
                                                width: 32,
                                                height: 32,
                                                backgroundColor: '#F0FDF4',
                                                borderRadius: '8px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center'
                                            }}
                                        >
                                            <CalendarToday sx={{ fontSize: 18, color: '#10B981' }} />
                                        </Box>
                                        <Typography variant="body2" sx={{ color: '#6B7280', fontWeight: 500 }}>
                                            Added {formatDate(product.created_at)}
                                        </Typography>
                                    </Box>
                                </Stack>

                                <Box sx={{
                                    display: 'grid',
                                    gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(2, 1fr)' },
                                    gap: 3
                                }}>
                                    <Box 
                                        sx={{ 
                                            backgroundColor: 'white',
                                            border: '1px solid #F3F4F6',
                                            borderRadius: '12px',
                                            p: 3, 
                                            textAlign: 'center' 
                                        }}
                                    >
                                        <Typography 
                                            variant="h4" 
                                            sx={{ 
                                                color: '#10B981', 
                                                fontWeight: 800,
                                                mb: 1
                                            }}
                                        >
                                            {product.ingredients?.length || 0}
                                        </Typography>
                                        <Typography variant="body2" sx={{ color: '#6B7280', fontWeight: 500 }}>
                                            Ingredients
                                        </Typography>
                                    </Box>
                                    <Box 
                                        sx={{ 
                                            backgroundColor: 'white',
                                            border: '1px solid #F3F4F6',
                                            borderRadius: '12px',
                                            p: 3, 
                                            textAlign: 'center' 
                                        }}
                                    >
                                        <Typography 
                                            variant="h4" 
                                            sx={{ 
                                                color: '#EF4444', 
                                                fontWeight: 800,
                                                mb: 1
                                            }}
                                        >
                                            {(() => {
                                                if (!product.ingredients) return 0;
                                                const allAllergens = product.ingredients.flatMap(ingredient => 
                                                    ingredient.allergens || []
                                                );
                                                const uniqueAllergens = allAllergens.filter((allergen, index, self) => 
                                                    index === self.findIndex(a => a.name === allergen.name)
                                                );
                                                return uniqueAllergens.length;
                                            })()}
                                        </Typography>
                                        <Typography variant="body2" sx={{ color: '#6B7280', fontWeight: 500 }}>
                                            Allergens
                                        </Typography>
                                    </Box>
                                </Box>

                                {!isAuthenticated && (
                                    <Box
                                        sx={{
                                            backgroundColor: '#F0F9FF',
                                            border: '1px solid #0EA5E9',
                                            borderRadius: '12px',
                                            p: 3,
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 2
                                        }}
                                    >
                                        <Box
                                            sx={{
                                                width: 32,
                                                height: 32,
                                                backgroundColor: '#0EA5E9',
                                                borderRadius: '8px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                flexShrink: 0
                                            }}
                                        >
                                            <Info sx={{ color: 'white', fontSize: 18 }} />
                                        </Box>
                                        <Box>
                                            <Typography variant="body2" sx={{ color: '#1F2937', lineHeight: 1.5 }}>
                                                <Button
                                                    component={Link}
                                                    to="/login"
                                                    sx={{
                                                        color: '#0EA5E9',
                                                        fontWeight: 600,
                                                        textTransform: 'none',
                                                        p: 0,
                                                        minWidth: 'auto',
                                                        '&:hover': {
                                                            backgroundColor: 'transparent',
                                                            textDecoration: 'underline'
                                                        }
                                                    }}
                                                >
                                                    Sign in
                                                </Button>
                                                {' '}to get personalized safety checks based on your allergies.
                                            </Typography>
                                        </Box>
                                    </Box>
                                )}
                            </Stack>
                        </Box>
                    </Box>
                </Box>

                {/* Ingredients Section */}
                <Box
                    sx={{
                        backgroundColor: 'white',
                        border: '1px solid #F3F4F6',
                        borderRadius: '16px',
                        p: 4
                    }}
                >
                    <Typography 
                        variant="h5" 
                        sx={{ 
                            fontWeight: 700, 
                            mb: 3, 
                            color: '#1F2937',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 2
                        }}
                    >
                        <Box
                            sx={{
                                width: 32,
                                height: 32,
                                backgroundColor: '#F0FDF4',
                                borderRadius: '8px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}
                        >
                            <Package sx={{ fontSize: 18, color: '#10B981' }} />
                        </Box>
                        Ingredients ({product.ingredients?.length || 0})
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
                                        backgroundColor: '#FAFAFA',
                                        border: '1px solid #F3F4F6',
                                        borderRadius: '8px',
                                        p: 2
                                    }}
                                >
                                                                         <Typography 
                                         variant="body2" 
                                         sx={{ 
                                             color: '#374151',
                                             fontWeight: 500
                                         }}
                                     >
                                         {ingredient.title}
                                     </Typography>
                                </Box>
                            ))}
                        </Box>
                    ) : (
                        <Typography variant="body2" sx={{ color: '#9CA3AF', fontStyle: 'italic' }}>
                            Ingredient information is being processed...
                        </Typography>
                    )}
                </Box>

                {/* Allergens Section */}
                <Box
                    sx={{
                        backgroundColor: 'white',
                        border: '1px solid #F3F4F6',
                        borderRadius: '16px',
                        p: 4
                    }}
                >
                    {(() => {
                        // Extract all allergens from ingredients
                        const allAllergens = product.ingredients?.flatMap(ingredient => 
                            ingredient.allergens || []
                        ) || [];
                        
                        // Remove duplicates based on allergen name
                        const uniqueAllergens = allAllergens.filter((allergen, index, self) => 
                            index === self.findIndex(a => a.name === allergen.name)
                        );
                        
                        return (
                            <>
                                <Typography 
                                    variant="h5" 
                                    sx={{ 
                                        fontWeight: 700, 
                                        mb: 3, 
                                        color: '#1F2937',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 2
                                    }}
                                >
                                    <Box
                                        sx={{
                                            width: 32,
                                            height: 32,
                                            backgroundColor: '#FEF2F2',
                                            borderRadius: '8px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center'
                                        }}
                                    >
                                        <Warning sx={{ fontSize: 18, color: '#EF4444' }} />
                                    </Box>
                                    Detected Allergens ({uniqueAllergens.length})
                                </Typography>
                                {uniqueAllergens.length > 0 ? (
                                    <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 2 }}>
                                        {uniqueAllergens.map((allergen, index) => (
                                            <Chip
                                                key={allergen.id || index}
                                                label={allergen.name}
                                                sx={{
                                                    backgroundColor: '#FEE2E2',
                                                    color: '#DC2626',
                                                    border: '1px solid #FECACA',
                                                    fontWeight: 600,
                                                    '& .MuiChip-icon': {
                                                        color: '#DC2626'
                                                    }
                                                }}
                                                icon={<Warning />}
                                            />
                                        ))}
                                    </Stack>
                                ) : (
                                    <Box
                                        sx={{
                                            backgroundColor: '#F0FDF4',
                                            border: '1px solid #BBF7D0',
                                            borderRadius: '12px',
                                            p: 3,
                                            textAlign: 'center'
                                        }}
                                    >
                                        <CheckCircle sx={{ fontSize: 32, color: '#10B981', mb: 1 }} />
                                        <Typography variant="body2" sx={{ color: '#059669', fontWeight: 500 }}>
                                            No allergens detected in this product.
                                        </Typography>
                                    </Box>
                                )}
                            </>
                        );
                    })()}
                </Box>

                {/* AI Processing Note */}
                <Box
                    sx={{
                        backgroundColor: '#FEF3C7',
                        border: '1px solid #F59E0B',
                        borderRadius: '16px',
                        p: 4,
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: 2
                    }}
                >
                    <Box
                        sx={{
                            width: 32,
                            height: 32,
                            backgroundColor: '#F59E0B',
                            borderRadius: '8px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0
                        }}
                    >
                        <Info sx={{ color: 'white', fontSize: 18 }} />
                    </Box>
                    <Box>
                        <Typography variant="body2" sx={{ color: '#1F2937', lineHeight: 1.6 }}>
                            <strong>AI Processing:</strong> Allergen information is automatically extracted from ingredient photos using AI.
                            Always verify with the actual product label and consult healthcare professionals for severe allergies.
                        </Typography>
                    </Box>
                </Box>
            </Stack>
        </Container>
    );
};

export default ProductDetail; 
