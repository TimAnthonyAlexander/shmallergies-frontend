import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Box, 
  Paper, 
  TextField, 
  Button, 
  Typography, 
  Alert,
  Container,
  Stack,
  InputAdornment,
  Card,
  CardMedia,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import { 
  Upload, 
  Inventory as Package, 
  QrCode, 
  Image as ImageIcon, 
  CheckCircle,
  Close,
  Info,
  Circle
} from '@mui/icons-material';
import { apiClient } from '../lib/api';
import type { ApiError } from '../lib/api';
import LoadingSpinner from '../components/UI/LoadingSpinner';
import ErrorMessage from '../components/UI/ErrorMessage';

const UploadProduct: React.FC = () => {
  const [name, setName] = useState('');
  const [upcCode, setUpcCode] = useState('');
  const [ingredientImage, setIngredientImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);
  const [success, setSuccess] = useState<string>('');

  const navigate = useNavigate();

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIngredientImage(file);
      
      // Create preview URL
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess('');

    try {
      const formData = new FormData();
      formData.append('name', name);
      formData.append('upc_code', upcCode);
      if (ingredientImage) {
        formData.append('ingredient_image', ingredientImage);
      }

      const response = await apiClient.createProduct(formData);
      setSuccess('Product uploaded successfully! AI processing will extract allergen information automatically.');
      
      // Reset form
      setName('');
      setUpcCode('');
      setIngredientImage(null);
      setPreviewUrl('');
      
      // Redirect to product page after 2 seconds
      setTimeout(() => {
        navigate(`/products/${response.product.id}`);
      }, 2000);
      
    } catch (err) {
      setError(err as ApiError);
    } finally {
      setIsLoading(false);
    }
  };

  const validateUPC = (upc: string) => {
    // Basic UPC validation - should be 12 digits
    return /^\d{12}$/.test(upc);
  };

  const formatUPC = (value: string) => {
    // Remove non-digits and limit to 12 characters
    return value.replace(/\D/g, '').slice(0, 12);
  };

  const handleUPCChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatUPC(e.target.value);
    setUpcCode(formatted);
  };

  const removeImage = () => {
    setIngredientImage(null);
    setPreviewUrl('');
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Stack spacing={4}>
        {/* Header */}
        <Box sx={{ textAlign: 'center' }}>
          <Box 
            sx={{ 
              display: 'flex', 
              justifyContent: 'center', 
              mb: 2 
            }}
          >
            <Box
              sx={{
                width: 48,
                height: 48,
                borderRadius: '50%',
                backgroundColor: 'primary.main',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Upload sx={{ color: 'white' }} />
            </Box>
          </Box>
          <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
            Add New Product
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Help build our community database by uploading product information and ingredient photos.
          </Typography>
        </Box>

        {/* Success Message */}
        {success && (
          <Alert 
            severity="success" 
            icon={<CheckCircle />}
            onClose={() => setSuccess('')}
          >
            {success}
          </Alert>
        )}

        {/* Error Message */}
        {error && (
          <ErrorMessage
            message={error.message}
            errors={error.errors}
            onDismiss={() => setError(null)}
          />
        )}

        {/* Upload Form */}
        <Paper elevation={1} sx={{ p: 4 }}>
          <Box component="form" onSubmit={handleSubmit}>
            <Stack spacing={3}>
              {/* Product Name */}
              <TextField
                label="Product Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                fullWidth
                placeholder="Enter product name (e.g., Coca Cola Classic)"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Package />
                    </InputAdornment>
                  ),
                }}
              />

              {/* UPC Code */}
              <TextField
                label="UPC Code"
                value={upcCode}
                onChange={handleUPCChange}
                required
                fullWidth
                placeholder="Enter 12-digit UPC code"
                error={upcCode !== '' && !validateUPC(upcCode)}
                helperText={
                  upcCode && !validateUPC(upcCode) 
                    ? 'UPC code must be exactly 12 digits'
                    : 'The barcode number found on the product packaging'
                }
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <QrCode />
                    </InputAdornment>
                  ),
                  sx: { fontFamily: 'monospace' }
                }}
              />

              {/* Ingredient Image Upload */}
              <Box>
                <Typography variant="subtitle1" gutterBottom>
                  Ingredient List Photo *
                </Typography>
                
                {/* Image Preview */}
                {previewUrl && (
                  <Card sx={{ mb: 2, maxWidth: 400, position: 'relative' }}>
                    <CardMedia
                      component="img"
                      height="200"
                      image={previewUrl}
                      alt="Ingredient preview"
                      sx={{ objectFit: 'cover' }}
                    />
                    <IconButton
                      onClick={removeImage}
                      sx={{
                        position: 'absolute',
                        top: 8,
                        right: 8,
                        backgroundColor: 'error.main',
                        color: 'white',
                        '&:hover': {
                          backgroundColor: 'error.dark',
                        }
                      }}
                      size="small"
                    >
                      <Close />
                    </IconButton>
                  </Card>
                )}

                {/* Upload Area */}
                <Paper
                  variant="outlined"
                  sx={{
                    p: 4,
                    textAlign: 'center',
                    border: '2px dashed',
                    borderColor: 'grey.300',
                    backgroundColor: 'grey.50',
                    cursor: 'pointer',
                    '&:hover': {
                      borderColor: 'grey.400',
                      backgroundColor: 'grey.100',
                    }
                  }}
                  component="label"
                >
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/jpg,image/gif"
                    required
                    style={{ display: 'none' }}
                    onChange={handleImageChange}
                  />
                  <ImageIcon sx={{ fontSize: 48, color: 'grey.400', mb: 1 }} />
                  <Typography variant="body1" gutterBottom>
                    <Typography component="span" sx={{ color: 'primary.main', fontWeight: 'medium' }}>
                      Upload a file
                    </Typography>
                    {' or drag and drop'}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    PNG, JPG, GIF up to 2MB
                  </Typography>
                </Paper>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  Take a clear photo of the ingredient list on the product packaging. Our AI will automatically detect allergens.
                </Typography>
              </Box>

              {/* AI Processing Info */}
              <Alert severity="info" icon={<Info />}>
                <Typography variant="subtitle2" gutterBottom>
                  AI-Powered Allergen Detection
                </Typography>
                <Typography variant="body2">
                  After uploading, our AI will automatically process the ingredient image to identify potential allergens. 
                  This helps create accurate allergen profiles for the community.
                </Typography>
              </Alert>

              {/* Submit Button */}
              <Box sx={{ display: 'flex', justifyContent: 'center', pt: 2 }}>
                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  disabled={isLoading || !name || !upcCode || !ingredientImage || !validateUPC(upcCode)}
                                     startIcon={isLoading ? <LoadingSpinner size="small" /> : <Upload />}
                  sx={{ px: 4, py: 1.5 }}
                >
                  {isLoading ? 'Uploading...' : 'Upload Product'}
                </Button>
              </Box>
            </Stack>
          </Box>
        </Paper>

        {/* Tips */}
        <Paper elevation={0} sx={{ p: 3, backgroundColor: 'grey.50' }}>
          <Typography variant="h6" gutterBottom>
            Tips for Better Results
          </Typography>
          <List dense>
            <ListItem>
              <ListItemIcon>
                <Circle sx={{ fontSize: 6, color: 'primary.main' }} />
              </ListItemIcon>
              <ListItemText 
                primary="Take photos in good lighting with clear, readable text"
                primaryTypographyProps={{ variant: 'body2' }}
              />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <Circle sx={{ fontSize: 6, color: 'primary.main' }} />
              </ListItemIcon>
              <ListItemText 
                primary="Ensure the entire ingredient list is visible in the photo"
                primaryTypographyProps={{ variant: 'body2' }}
              />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <Circle sx={{ fontSize: 6, color: 'primary.main' }} />
              </ListItemIcon>
              <ListItemText 
                primary="Use the product's official name as it appears on packaging"
                primaryTypographyProps={{ variant: 'body2' }}
              />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <Circle sx={{ fontSize: 6, color: 'primary.main' }} />
              </ListItemIcon>
              <ListItemText 
                primary="Double-check the UPC code for accuracy"
                primaryTypographyProps={{ variant: 'body2' }}
              />
            </ListItem>
          </List>
        </Paper>
      </Stack>
    </Container>
  );
};

export default UploadProduct; 