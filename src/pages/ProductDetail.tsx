import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
    Box,
    Container,
    Typography,
    Paper,
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
            <Container maxWidth="lg" sx={{ py: 4, display: 'flex', justifyContent: 'center' }}>
                <LoadingSpinner size="large" />
            </Container>
        );
    }

    if (error) {
        return (
            <Container maxWidth="lg" sx={{ py: 4 }}>
                <Stack spacing={3}>
                    <Breadcrumbs>
                        <Button
                            component={Link}
                            to="/products"
                            startIcon={<ArrowBack />}
                            color="primary"
                        >
                            Back to Products
                        </Button>
                    </Breadcrumbs>
                    <ErrorMessage message={error} />
                </Stack>
            </Container>
        );
    }

    if (!product) {
        return (
            <Container maxWidth="lg" sx={{ py: 4 }}>
                <Stack spacing={3}>
                    <Breadcrumbs>
                        <Button
                            component={Link}
                            to="/products"
                            startIcon={<ArrowBack />}
                            color="primary"
                        >
                            Back to Products
                        </Button>
                    </Breadcrumbs>
                    <Box sx={{ textAlign: 'center', py: 6 }}>
                        <Package sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                        <Typography variant="h6" color="text.secondary">
                            Product not found
                        </Typography>
                    </Box>
                </Stack>
            </Container>
        );
    }

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <Stack spacing={4}>
                {/* Navigation */}
                <Breadcrumbs>
                    <Button
                        component={Link}
                        to="/products"
                        startIcon={<ArrowBack />}
                        color="primary"
                    >
                        Back to Products
                    </Button>
                </Breadcrumbs>

                {/* Safety Check Banner */}
                {isAuthenticated && safetyCheck && (
                    <Alert
                        severity={safetyCheck.is_safe ? 'success' : 'error'}
                        icon={safetyCheck.is_safe ? <CheckCircle /> : <Cancel />}
                    >
                        <Typography variant="subtitle1" gutterBottom>
                            {safetyCheck.is_safe ? 'Product appears safe for you' : 'Warning: Potential allergen conflicts'}
                        </Typography>
                        {!safetyCheck.is_safe && safetyCheck.potential_conflicts.length > 0 && (
                            <Box sx={{ mt: 1, mb: 2 }}>
                                <Typography variant="body2" gutterBottom>
                                    Potential conflicts with your allergies:
                                </Typography>
                                <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 0.5 }}>
                                    {safetyCheck.potential_conflicts.map((conflict, index) => (
                                        <Chip
                                            key={index}
                                            label={conflict}
                                            size="small"
                                            color="error"
                                            variant="outlined"
                                        />
                                    ))}
                                </Stack>
                            </Box>
                        )}
                        <Typography variant="body2">
                            Always double-check the ingredient list and consult with healthcare professionals for severe allergies.
                        </Typography>
                    </Alert>
                )}

                {/* Safety Check Loading */}
                {isAuthenticated && isCheckingSafety && (
                    <Alert severity="info" icon={<LoadingSpinner size="small" />}>
                        Checking product safety for your allergies...
                    </Alert>
                )}

                {/* Product Header */}
                <Paper sx={{ p: 3 }}>
                    <Box sx={{
                        display: 'grid',
                        gridTemplateColumns: { xs: '1fr', lg: '1fr 2fr' },
                        gap: 4
                    }}>
                        {/* Product Image */}
                        <Box>
                            <Card>
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
                                            backgroundColor: 'grey.100'
                                        }}
                                    >
                                        <Package sx={{ fontSize: 64, color: 'grey.400' }} />
                                    </Box>
                                )}
                            </Card>
                        </Box>

                        {/* Product Info */}
                        <Box>
                            <Stack spacing={3}>
                                <Typography variant="h3" component="h1" sx={{ fontWeight: 'bold' }}>
                                    {product.name}
                                </Typography>

                                <Stack direction="row" spacing={3}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <QrCode color="action" />
                                        <Typography variant="body1" sx={{ fontFamily: 'monospace' }}>
                                            {product.upc_code}
                                        </Typography>
                                    </Box>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <CalendarToday color="action" />
                                        <Typography variant="body2" color="text.secondary">
                                            Added {formatDate(product.created_at)}
                                        </Typography>
                                    </Box>
                                </Stack>

                                <Box sx={{
                                    display: 'grid',
                                    gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(4, 1fr)' },
                                    gap: 2
                                }}>
                                    <Paper variant="outlined" sx={{ p: 2, textAlign: 'center' }}>
                                        <Typography variant="h4" color="primary">
                                            {product.ingredients?.length || 0}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            Ingredients
                                        </Typography>
                                    </Paper>
                                    <Paper variant="outlined" sx={{ p: 2, textAlign: 'center' }}>
                                        <Typography variant="h4" color="error">
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
                                        <Typography variant="body2" color="text.secondary">
                                            Allergens
                                        </Typography>
                                    </Paper>
                                </Box>

                                {!isAuthenticated && (
                                    <Alert severity="info" icon={<Info />}>
                                        <Typography variant="body2">
                                            <Link to="/login" style={{ textDecoration: 'none' }}>
                                                <Button variant="text" size="small">Sign in</Button>
                                            </Link>
                                            {' '}to get personalized safety checks based on your allergies.
                                        </Typography>
                                    </Alert>
                                )}
                            </Stack>
                        </Box>
                    </Box>
                </Paper>

                {/* Ingredients Section */}
                <Paper sx={{ p: 3 }}>
                    <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold' }}>
                        Ingredients ({product.ingredients?.length || 0})
                    </Typography>
                    {product.ingredients && product.ingredients.length > 0 ? (
                        <List>
                            {product.ingredients.map((ingredient, index) => (
                                <ListItem key={index} divider={index < product.ingredients.length - 1}>
                                    <ListItemText primary={ingredient.title || ingredient.name} />
                                </ListItem>
                            ))}
                        </List>
                    ) : (
                        <Typography variant="body2" color="text.secondary">
                            Ingredient information is being processed...
                        </Typography>
                    )}
                </Paper>

                {/* Allergens Section */}
                <Paper sx={{ p: 3 }}>
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
                                <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold' }}>
                                    Detected Allergens ({uniqueAllergens.length})
                                </Typography>
                                {uniqueAllergens.length > 0 ? (
                                    <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
                                        {uniqueAllergens.map((allergen, index) => (
                                            <Chip
                                                key={allergen.id || index}
                                                label={allergen.name}
                                                color="error"
                                                variant="outlined"
                                                icon={<Warning />}
                                            />
                                        ))}
                                    </Stack>
                                ) : (
                                    <Typography variant="body2" color="text.secondary">
                                        No allergens detected in this product.
                                    </Typography>
                                )}
                            </>
                        );
                    })()}
                </Paper>

                {/* AI Processing Note */}
                <Alert severity="info" icon={<Info />}>
                    <Typography variant="body2">
                        <strong>AI Processing:</strong> Allergen information is automatically extracted from ingredient photos using AI.
                        Always verify with the actual product label and consult healthcare professionals for severe allergies.
                    </Typography>
                </Alert>
            </Stack>
        </Container>
    );
};

export default ProductDetail; 
