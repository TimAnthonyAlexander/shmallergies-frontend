import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Box, Container, Typography, Stack, Button, TextField, Pagination, InputAdornment, Fab, Chip } from '@mui/material';
import { Search, Inventory as Package, QrCode, Add, QrCodeScanner } from '@mui/icons-material';
import { API_DOMAIN, apiClient } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';
import type { ProductSearchResult } from '../types';
import LoadingSpinner from '../components/UI/LoadingSpinner';
import ErrorMessage from '../components/UI/ErrorMessage';

const Products: React.FC = () => {
    const { isAuthenticated } = useAuth();
    const [products, setProducts] = useState<ProductSearchResult[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string>('');
    const [searchMode, setSearchMode] = useState<'search' | 'browse'>('browse');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);

    // Load initial products
    useEffect(() => {
        loadProducts();
    }, [currentPage]);

    const loadProducts = async () => {
        setIsLoading(true);
        setError('');

        try {
            const response = await apiClient.getProducts(currentPage, 15);
            setProducts(response.data);
            setTotalPages(response.last_page);
            setTotal(response.total);
            setSearchMode('browse');
        } catch (err: any) {
            setError(err.message || 'Failed to load products');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!searchQuery.trim()) {
            loadProducts();
            return;
        }

        setIsLoading(true);
        setError('');

        try {
            const response = await apiClient.searchProducts(searchQuery, 20);
            setProducts(response.products);
            setTotal(response.total);
            setSearchMode('search');
            setCurrentPage(1);
        } catch (err: any) {
            setError(err.message || 'Search failed');
        } finally {
            setIsLoading(false);
        }
    };

    const clearSearch = () => {
        setSearchQuery('');
        setCurrentPage(1);
        loadProducts();
    };

    const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
        setCurrentPage(value);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString();
    };

    return (
        <Box sx={{
            minHeight: '100vh',
            backgroundColor: '#fafafa',
            py: { xs: 4, md: 8 }
        }}>
            <Container maxWidth="xl" sx={{ px: { xs: 3, md: 6 } }}>
                <Stack spacing={{ xs: 6, md: 10 }}>
                    {/* Header */}
                    <Box sx={{
                        textAlign: 'center',
                        maxWidth: 680,
                        mx: 'auto',
                        px: 2
                    }}>
                        <Typography
                            variant="h1"
                            sx={{
                                fontSize: { xs: '2.5rem', md: '3.5rem' },
                                fontWeight: 300,
                                letterSpacing: '-0.04em',
                                color: '#1a1a1a',
                                mb: 3,
                                lineHeight: 1.1
                            }}
                        >
                            Products
                        </Typography>
                        <Typography
                            variant="h5"
                            sx={{
                                fontSize: { xs: '1.1rem', md: '1.3rem' },
                                fontWeight: 400,
                                color: '#666666',
                                lineHeight: 1.5,
                                maxWidth: 500,
                                mx: 'auto'
                            }}
                        >
                            Discover and explore our curated database of food products with detailed allergen information
                        </Typography>
                    </Box>

                    {/* Search */}
                    <Box sx={{
                        maxWidth: 720,
                        mx: 'auto',
                        width: '100%'
                    }}>
                        <Box component="form" onSubmit={handleSearch}>
                            <Box sx={{
                                display: 'flex',
                                gap: 2,
                                alignItems: 'stretch'
                            }}>
                                <TextField
                                    fullWidth
                                    placeholder="Search products or UPC codes"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            backgroundColor: '#ffffff',
                                            border: '1px solid #e0e0e0',
                                            borderRadius: '12px',
                                            fontSize: '1rem',
                                            fontWeight: 400,
                                            py: 0.5,
                                            '& fieldset': {
                                                border: 'none'
                                            },
                                            '&:hover': {
                                                borderColor: '#d0d0d0',
                                                transition: 'border-color 0.2s ease'
                                            },
                                            '&.Mui-focused': {
                                                borderColor: '#333333',
                                                boxShadow: '0 0 0 3px rgba(51, 51, 51, 0.05)'
                                            }
                                        },
                                        '& .MuiInputBase-input': {
                                            py: 2
                                        }
                                    }}
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <Search sx={{ color: '#999999', fontSize: 20 }} />
                                            </InputAdornment>
                                        ),
                                    }}
                                />
                                <Button
                                    type="submit"
                                    disabled={isLoading}
                                    sx={{
                                        backgroundColor: '#1a1a1a',
                                        color: '#ffffff',
                                        borderRadius: '12px',
                                        px: 4,
                                        py: 2,
                                        fontSize: '0.95rem',
                                        fontWeight: 500,
                                        textTransform: 'none',
                                        minWidth: 100,
                                        boxShadow: 'none',
                                        '&:hover': {
                                            backgroundColor: '#333333',
                                            boxShadow: 'none',
                                            transition: 'background-color 0.2s ease'
                                        },
                                        '&:disabled': {
                                            backgroundColor: '#e0e0e0',
                                            color: '#999999'
                                        }
                                    }}
                                >
                                    {isLoading ? <LoadingSpinner size="small" /> : 'Search'}
                                </Button>
                                {searchMode === 'search' && (
                                    <Button
                                        onClick={clearSearch}
                                        sx={{
                                            color: '#666666',
                                            borderRadius: '12px',
                                            px: 3,
                                            fontSize: '0.95rem',
                                            fontWeight: 500,
                                            textTransform: 'none',
                                            '&:hover': {
                                                backgroundColor: 'rgba(0, 0, 0, 0.04)',
                                                transition: 'background-color 0.2s ease'
                                            }
                                        }}
                                    >
                                        Clear
                                    </Button>
                                )}
                            </Box>
                        </Box>
                    </Box>

                    {/* Error Display */}
                    {error && (
                        <Box sx={{ maxWidth: 720, mx: 'auto', width: '100%' }}>
                            <ErrorMessage message={error} onDismiss={() => setError('')} />
                        </Box>
                    )}

                    {/* Results Info & Actions */}
                    <Box sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        maxWidth: 1400,
                        mx: 'auto',
                        width: '100%',
                        px: 1
                    }}>
                        <Typography
                            variant="body2"
                            sx={{
                                color: '#666666',
                                fontSize: '0.9rem',
                                fontWeight: 400
                            }}
                        >
                            {searchMode === 'search' ? (
                                <>{products.length} results for "{searchQuery}"</>
                            ) : (
                                <>{products.length} of {total} products</>
                            )}
                        </Typography>

                        <Button
                            component={Link}
                            to="/upload"
                            startIcon={<Add sx={{ fontSize: 18 }} />}
                            sx={{
                                color: '#666666',
                                fontSize: '0.9rem',
                                fontWeight: 500,
                                textTransform: 'none',
                                '&:hover': {
                                    backgroundColor: 'rgba(0, 0, 0, 0.04)',
                                    transition: 'background-color 0.2s ease'
                                }
                            }}
                        >
                            Add Product
                        </Button>
                    </Box>

                    {/* Products Grid */}
                    {isLoading ? (
                        <Box sx={{
                            display: 'flex',
                            justifyContent: 'center',
                            py: { xs: 8, md: 12 }
                        }}>
                            <LoadingSpinner size="large" />
                        </Box>
                    ) : products.length === 0 ? (
                        <Box sx={{
                            textAlign: 'center',
                            py: { xs: 8, md: 12 },
                            maxWidth: 480,
                            mx: 'auto'
                        }}>
                            <Box sx={{
                                width: 64,
                                height: 64,
                                borderRadius: '50%',
                                backgroundColor: '#f5f5f5',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                mx: 'auto',
                                mb: 4
                            }}>
                                <Package sx={{ fontSize: 28, color: '#cccccc' }} />
                            </Box>
                            <Typography
                                variant="h5"
                                sx={{
                                    fontSize: '1.4rem',
                                    fontWeight: 400,
                                    color: '#1a1a1a',
                                    mb: 2,
                                    lineHeight: 1.3
                                }}
                            >
                                {searchMode === 'search' ? 'No matches found' : 'No products yet'}
                            </Typography>
                            <Typography
                                variant="body1"
                                sx={{
                                    color: '#666666',
                                    mb: 5,
                                    lineHeight: 1.6,
                                    fontSize: '1rem'
                                }}
                            >
                                {searchMode === 'search'
                                    ? 'Try adjusting your search or browse all products'
                                    : 'Be the first to contribute to our product database'
                                }
                            </Typography>
                            <Button
                                component={Link}
                                to="/upload"
                                sx={{
                                    backgroundColor: '#1a1a1a',
                                    color: '#ffffff',
                                    borderRadius: '12px',
                                    px: 6,
                                    py: 1.5,
                                    fontSize: '1rem',
                                    fontWeight: 500,
                                    textTransform: 'none',
                                    boxShadow: 'none',
                                    '&:hover': {
                                        backgroundColor: '#333333',
                                        boxShadow: 'none',
                                        transition: 'background-color 0.2s ease'
                                    }
                                }}
                            >
                                Add First Product
                            </Button>
                        </Box>
                    ) : (
                        <Box sx={{
                            maxWidth: 1400,
                            mx: 'auto',
                            width: '100%'
                        }}>
                            <Box sx={{
                                display: 'grid',
                                gridTemplateColumns: {
                                    xs: '1fr',
                                    sm: 'repeat(2, 1fr)',
                                    md: 'repeat(3, 1fr)',
                                    lg: 'repeat(4, 1fr)'
                                },
                                gap: { xs: 3, md: 4 }
                            }}>
                                {products.map((product) => (
                                    <Box
                                        key={product.id}
                                        component={Link}
                                        to={`/products/${product.id}`}
                                        sx={{
                                            cursor: 'pointer',
                                            textDecoration: 'none',
                                            transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                                            '&:hover': {
                                                transform: 'translateY(-2px)',
                                                '& .product-card': {
                                                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)'
                                                }
                                            }
                                        }}
                                    >
                                        <Box
                                            className="product-card"
                                            sx={{
                                                backgroundColor: '#ffffff',
                                                borderRadius: '16px',
                                                overflow: 'hidden',
                                                border: '1px solid #e8e8e8',
                                                transition: 'box-shadow 0.2s ease',
                                                height: '100%',
                                                display: 'flex',
                                                flexDirection: 'column'
                                            }}
                                        >
                                            {/* Product Image */}
                                            <Box sx={{ position: 'relative', overflow: 'hidden' }}>
                                                {product.ingredient_image_url ? (
                                                    <Box
                                                        component="img"
                                                        src={API_DOMAIN + product.ingredient_image_url}
                                                        alt={`${product.name} ingredients`}
                                                        sx={{
                                                            width: '100%',
                                                            height: 240,
                                                            objectFit: 'cover',
                                                            transition: 'transform 0.3s ease'
                                                        }}
                                                    />
                                                ) : (
                                                    <Box
                                                        sx={{
                                                            height: 240,
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            backgroundColor: '#f8f8f8'
                                                        }}
                                                    >
                                                        <Package sx={{ fontSize: 48, color: '#d0d0d0' }} />
                                                    </Box>
                                                )}
                                            </Box>

                                            {/* Product Info */}
                                            <Box sx={{
                                                p: { xs: 3, md: 4 },
                                                flexGrow: 1,
                                                display: 'flex',
                                                flexDirection: 'column'
                                            }}>
                                                <Typography
                                                    variant="h6"
                                                    sx={{
                                                        fontSize: '1.1rem',
                                                        fontWeight: 500,
                                                        color: '#1a1a1a',
                                                        lineHeight: 1.4,
                                                        mb: 2,
                                                        overflow: 'hidden',
                                                        textOverflow: 'ellipsis',
                                                        display: '-webkit-box',
                                                        WebkitLineClamp: 2,
                                                        WebkitBoxOrient: 'vertical'
                                                    }}
                                                >
                                                    {product.name}
                                                </Typography>

                                                <Box sx={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    mb: 3,
                                                    py: 1,
                                                    px: 2,
                                                    backgroundColor: '#f8f8f8',
                                                    borderRadius: '8px'
                                                }}>
                                                    <QrCode sx={{ fontSize: 14, mr: 1, color: '#999999' }} />
                                                    <Typography
                                                        variant="body2"
                                                        sx={{
                                                            fontFamily: 'SF Mono, Monaco, monospace',
                                                            fontSize: '0.85rem',
                                                            color: '#666666',
                                                            fontWeight: 500
                                                        }}
                                                    >
                                                        {product.upc_code}
                                                    </Typography>
                                                </Box>

                                                <Box sx={{
                                                    display: 'flex',
                                                    gap: 3,
                                                    mb: 3
                                                }}>
                                                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                        <Box sx={{
                                                            width: 6,
                                                            height: 6,
                                                            borderRadius: '50%',
                                                            backgroundColor: '#4caf50',
                                                            mr: 1
                                                        }} />
                                                        <Typography
                                                            variant="caption"
                                                            sx={{
                                                                color: '#666666',
                                                                fontSize: '0.8rem',
                                                                fontWeight: 500
                                                            }}
                                                        >
                                                            {product.ingredients_count} ingredients
                                                        </Typography>
                                                    </Box>
                                                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                        <Box sx={{
                                                            width: 6,
                                                            height: 6,
                                                            borderRadius: '50%',
                                                            backgroundColor: '#ff5722',
                                                            mr: 1
                                                        }} />
                                                        <Typography
                                                            variant="caption"
                                                            sx={{
                                                                color: '#666666',
                                                                fontSize: '0.8rem',
                                                                fontWeight: 500
                                                            }}
                                                        >
                                                            {product.allergens_count} allergens
                                                        </Typography>
                                                    </Box>
                                                </Box>

                                                {product.matching_allergens && product.matching_allergens.length > 0 && (
                                                    <Box sx={{ mb: 3 }}>
                                                        <Stack direction="row" spacing={0.5} sx={{ flexWrap: 'wrap', gap: 0.5 }}>
                                                            {product.matching_allergens.slice(0, 3).map((allergen, index) => (
                                                                <Chip
                                                                    key={index}
                                                                    label={allergen}
                                                                    size="small"
                                                                    sx={{
                                                                        backgroundColor: '#fff3e0',
                                                                        color: '#e65100',
                                                                        fontSize: '0.75rem',
                                                                        fontWeight: 500,
                                                                        border: '1px solid #ffcc02',
                                                                        height: 24
                                                                    }}
                                                                />
                                                            ))}
                                                            {product.matching_allergens.length > 3 && (
                                                                <Chip
                                                                    label={`+${product.matching_allergens.length - 3}`}
                                                                    size="small"
                                                                    sx={{
                                                                        backgroundColor: '#f5f5f5',
                                                                        color: '#666666',
                                                                        fontSize: '0.75rem',
                                                                        fontWeight: 500,
                                                                        height: 24
                                                                    }}
                                                                />
                                                            )}
                                                        </Stack>
                                                    </Box>
                                                )}

                                                <Box sx={{ mt: 'auto' }}>
                                                    <Typography
                                                        variant="caption"
                                                        sx={{
                                                            color: '#999999',
                                                            fontSize: '0.8rem'
                                                        }}
                                                    >
                                                        Added {formatDate(product.created_at)}
                                                    </Typography>
                                                </Box>
                                            </Box>
                                        </Box>
                                    </Box>
                                ))}
                            </Box>
                        </Box>
                    )}

                    {/* Pagination */}
                    {searchMode === 'browse' && totalPages > 1 && (
                        <Box sx={{
                            display: 'flex',
                            justifyContent: 'center',
                            mt: { xs: 6, md: 8 }
                        }}>
                            <Box sx={{
                                backgroundColor: '#ffffff',
                                borderRadius: '16px',
                                border: '1px solid #e8e8e8',
                                p: 4
                            }}>
                                <Stack spacing={3} alignItems="center">
                                    <Typography
                                        variant="body2"
                                        sx={{
                                            color: '#666666',
                                            fontSize: '0.9rem'
                                        }}
                                    >
                                        Page {currentPage} of {totalPages} — {total} total products
                                    </Typography>
                                    <Pagination
                                        count={totalPages}
                                        page={currentPage}
                                        onChange={handlePageChange}
                                        sx={{
                                            '& .MuiPaginationItem-root': {
                                                borderRadius: '8px',
                                                border: 'none',
                                                color: '#666666',
                                                fontWeight: 500,
                                                '&.Mui-selected': {
                                                    backgroundColor: '#1a1a1a',
                                                    color: '#ffffff',
                                                    '&:hover': {
                                                        backgroundColor: '#333333'
                                                    }
                                                },
                                                '&:hover': {
                                                    backgroundColor: 'rgba(0, 0, 0, 0.04)'
                                                }
                                            }
                                        }}
                                    />
                                </Stack>
                            </Box>
                        </Box>
                    )}
                </Stack>
            </Container>

            {/* Scanner Floating Action Button */}
            {isAuthenticated && (
                <Fab
                    component={Link}
                    to="/scanner"
                    sx={{
                        position: 'fixed',
                        bottom: 24,
                        right: 24,
                        backgroundColor: 'primary.main',
                        color: 'white',
                        width: 64,
                        height: 64,
                        boxShadow: '0 4px 20px rgba(37, 99, 235, 0.3)',
                        '&:hover': {
                            backgroundColor: 'primary.dark',
                            boxShadow: '0 6px 24px rgba(37, 99, 235, 0.4)',
                            transform: 'translateY(-2px)'
                        },
                        transition: 'all 0.3s ease',
                        zIndex: 1000
                    }}
                    aria-label="Open camera scanner"
                >
                    <QrCodeScanner sx={{ fontSize: 28 }} />
                </Fab>
            )}
        </Box>
    );
};

export default Products; 
