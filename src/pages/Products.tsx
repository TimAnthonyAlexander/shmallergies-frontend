import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Box, 
  Container, 
  Typography, 
  Paper, 
  Stack,
  Button,
  TextField,
  Card,
  CardContent,
  CardMedia,
  Chip,
  Pagination,
  InputAdornment,
  Avatar
} from '@mui/material';
import { 
  Search, 
  Inventory as Package, 
  CalendarToday, 
  Visibility, 
  QrCode,
  Add
} from '@mui/icons-material';
import { apiClient } from '../lib/api';
import type { ProductSearchResult } from '../types';
import LoadingSpinner from '../components/UI/LoadingSpinner';
import ErrorMessage from '../components/UI/ErrorMessage';

const Products: React.FC = () => {
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
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Stack spacing={4}>
        {/* Header */}
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
            Products Database
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Search through our community-driven database of food products and their allergen information.
          </Typography>
        </Box>

        {/* Search Form */}
        <Paper sx={{ p: 3 }}>
          <Box component="form" onSubmit={handleSearch}>
            <Stack direction="row" spacing={2}>
              <TextField
                fullWidth
                placeholder="Search by product name or UPC code..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search />
                    </InputAdornment>
                  ),
                }}
              />
              <Button
                type="submit"
                variant="contained"
                disabled={isLoading}
                sx={{ minWidth: 120 }}
              >
                {isLoading ? <LoadingSpinner size="small" /> : 'Search'}
              </Button>
              {searchMode === 'search' && (
                <Button
                  onClick={clearSearch}
                  variant="outlined"
                  sx={{ minWidth: 80 }}
                >
                  Clear
                </Button>
              )}
            </Stack>
          </Box>
        </Paper>

        {/* Error Display */}
        {error && (
          <ErrorMessage message={error} onDismiss={() => setError('')} />
        )}

        {/* Results Info */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="body2" color="text.secondary">
            {searchMode === 'search' ? (
              <>Showing {products.length} search results for "{searchQuery}"</>
            ) : (
              <>Showing {products.length} of {total} products (Page {currentPage} of {totalPages})</>
            )}
          </Typography>
        </Box>

        {/* Products Grid */}
        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
            <LoadingSpinner size="large" />
          </Box>
        ) : products.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 6 }}>
            <Package sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              {searchMode === 'search' ? 'No products found' : 'No products available'}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              {searchMode === 'search' 
                ? 'Try adjusting your search terms or browse all products.'
                : 'Be the first to add a product to our database!'
              }
            </Typography>
            <Button
              component={Link}
              to="/upload"
              variant="contained"
              startIcon={<Add />}
            >
              Add Product
            </Button>
          </Box>
        ) : (
          <Box sx={{ 
            display: 'grid', 
            gridTemplateColumns: { 
              xs: '1fr', 
              sm: 'repeat(2, 1fr)', 
              lg: 'repeat(3, 1fr)' 
            }, 
            gap: 3 
          }}>
            {products.map((product) => (
              <Box key={product.id}>
                <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  {/* Product Image */}
                  {product.ingredient_image_url ? (
                    <CardMedia
                      component="img"
                      height="200"
                      image={product.ingredient_image_url}
                      alt={`${product.name} ingredients`}
                      sx={{ objectFit: 'cover' }}
                    />
                  ) : (
                    <Box 
                      sx={{ 
                        height: 200, 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        backgroundColor: 'grey.100'
                      }}
                    >
                      <Package sx={{ fontSize: 48, color: 'grey.400' }} />
                    </Box>
                  )}

                  {/* Product Info */}
                  <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                    <Typography variant="h6" component="h3" gutterBottom sx={{ 
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical'
                    }}>
                      {product.name}
                    </Typography>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <QrCode sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
                      <Typography variant="body2" color="text.secondary" sx={{ fontFamily: 'monospace' }}>
                        {product.upc_code}
                      </Typography>
                    </Box>

                    <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Package sx={{ fontSize: 16, mr: 0.5, color: 'text.secondary' }} />
                        <Typography variant="body2" color="text.secondary">
                          {product.ingredients_count} ingredients
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Box sx={{ 
                          width: 8, 
                          height: 8, 
                          borderRadius: '50%', 
                          backgroundColor: 'error.main',
                          mr: 0.5
                        }} />
                        <Typography variant="body2" color="text.secondary">
                          {product.allergens_count} allergens
                        </Typography>
                      </Box>
                    </Stack>

                    {product.matching_allergens && product.matching_allergens.length > 0 && (
                      <Box sx={{ mb: 2 }}>
                        <Stack direction="row" spacing={0.5} sx={{ flexWrap: 'wrap', gap: 0.5 }}>
                          {product.matching_allergens.map((allergen, index) => (
                            <Chip
                              key={index}
                              label={allergen}
                              size="small"
                              color="error"
                              variant="outlined"
                            />
                          ))}
                        </Stack>
                      </Box>
                    )}

                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <CalendarToday sx={{ fontSize: 12, mr: 0.5, color: 'text.secondary' }} />
                      <Typography variant="caption" color="text.secondary">
                        Added {formatDate(product.created_at)}
                      </Typography>
                    </Box>

                    <Box sx={{ mt: 'auto' }}>
                      <Button
                        component={Link}
                        to={`/products/${product.id}`}
                        variant="outlined"
                        fullWidth
                        startIcon={<Visibility />}
                      >
                        View Details
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Box>
            ))}
          </Box>
        )}

        {/* Pagination - only show for browsing mode */}
        {searchMode === 'browse' && totalPages > 1 && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <Paper sx={{ p: 2 }}>
              <Stack spacing={2} alignItems="center">
                <Typography variant="body2" color="text.secondary">
                  Showing page {currentPage} of {totalPages} ({total} total products)
                </Typography>
                <Pagination
                  count={totalPages}
                  page={currentPage}
                  onChange={handlePageChange}
                  color="primary"
                />
              </Stack>
            </Paper>
          </Box>
        )}
      </Stack>
    </Container>
  );
};

export default Products; 