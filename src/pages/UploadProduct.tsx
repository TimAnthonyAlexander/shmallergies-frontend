import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
    Box,
    TextField,
    Button,
    Typography,
    Alert,
    Container,
    Stack,
    Card,
    CardMedia,
    IconButton,
    Fade,
    Slide
} from '@mui/material';
import {
    Upload,
    QrCode,
    Image as ImageIcon,
    CheckCircle,
    Close,
    ArrowUpward
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
    const location = useLocation();

    // Parse UPC code from URL parameters if provided
    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const upcFromUrl = params.get('upc');
        if (upcFromUrl) {
            setUpcCode(formatUPC(upcFromUrl));
        }
    }, [location.search]);

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
        return /^\d*$/.test(upc);
    };

    const formatUPC = (value: string) => {
        // Remove non-digits and limit to 12 characters
        return value.replace(/\D/g, '').slice(0, 14);
    };

    const handleUPCChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const formatted = formatUPC(e.target.value);
        setUpcCode(formatted);
    };

    const removeImage = () => {
        setIngredientImage(null);
        setPreviewUrl('');
    };

    const isFormValid = name && upcCode && ingredientImage && validateUPC(upcCode);

    return (
        <Box sx={{
            minHeight: '100vh',
            backgroundColor: '#fefefe'
        }}>
            <Container maxWidth="sm" sx={{ py: { xs: 6, md: 12 } }}>
                <Stack spacing={8}>
                    {/* Header */}
                    <Box sx={{ textAlign: 'center' }}>
                        <Typography
                            variant="h1"
                            sx={{
                                fontSize: { xs: '2.25rem', md: '2.75rem' },
                                fontWeight: 300,
                                letterSpacing: '-0.02em',
                                color: '#000',
                                mb: 3,
                                lineHeight: 1.1
                            }}
                        >
                            Add Product
                        </Typography>
                        <Typography
                            variant="body1"
                            sx={{
                                color: '#666',
                                fontSize: '1.1rem',
                                fontWeight: 300,
                                lineHeight: 1.5,
                                maxWidth: '400px',
                                mx: 'auto'
                            }}
                        >
                            {upcCode ? 'Product not found. Add it to our database!' : 'Share a product to help others discover safe options'}
                        </Typography>
                    </Box>

                    {/* Success Message */}
                    <Fade in={!!success}>
                        <Box>
                            {success && (
                                <Alert
                                    severity="success"
                                    icon={<CheckCircle />}
                                    onClose={() => setSuccess('')}
                                    sx={{
                                        backgroundColor: '#f8fdf8',
                                        border: '1px solid #e8f5e8',
                                        borderRadius: 2,
                                        '& .MuiAlert-message': {
                                            color: '#2e7d32',
                                            fontSize: '0.95rem'
                                        }
                                    }}
                                >
                                    {success}
                                </Alert>
                            )}
                        </Box>
                    </Fade>

                    {/* Error Message */}
                    {error && (
                        <Fade in={!!error}>
                            <Box>
                                <ErrorMessage
                                    message={error.message}
                                    errors={error.errors}
                                    onDismiss={() => setError(null)}
                                />
                            </Box>
                        </Fade>
                    )}

                    {/* Upload Form */}
                    <Box component="form" onSubmit={handleSubmit}>
                        <Stack spacing={6}>
                            {/* Product Name */}
                            <Box>
                                <Typography
                                    variant="body2"
                                    sx={{
                                        color: '#333',
                                        mb: 2,
                                        fontSize: '0.9rem',
                                        fontWeight: 500,
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.5px'
                                    }}
                                >
                                    Product Name
                                </Typography>
                                <TextField
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    required
                                    fullWidth
                                    placeholder="Enter product name"
                                    variant="outlined"
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            backgroundColor: '#fff',
                                            borderRadius: 1,
                                            fontSize: '1.1rem',
                                            fontWeight: 300,
                                            '& fieldset': {
                                                borderColor: '#e0e0e0',
                                                borderWidth: 1
                                            },
                                            '&:hover fieldset': {
                                                borderColor: '#bdbdbd'
                                            },
                                            '&.Mui-focused fieldset': {
                                                borderColor: '#000',
                                                borderWidth: 1
                                            }
                                        },
                                        '& .MuiInputBase-input': {
                                            py: 2.5,
                                            px: 2
                                        }
                                    }}
                                />
                            </Box>

                            {/* UPC Code */}
                            <Box>
                                <Typography
                                    variant="body2"
                                    sx={{
                                        color: '#333',
                                        mb: 2,
                                        fontSize: '0.9rem',
                                        fontWeight: 500,
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.5px'
                                    }}
                                >
                                    UPC Code
                                </Typography>
                                <TextField
                                    value={upcCode}
                                    onChange={handleUPCChange}
                                    required
                                    fullWidth
                                    placeholder="barcode"
                                    variant="outlined"
                                    error={upcCode !== '' && !validateUPC(upcCode)}
                                    helperText={
                                        upcCode && !validateUPC(upcCode)
                                            ? 'Must be valid'
                                            : ''
                                    }
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            backgroundColor: '#fff',
                                            borderRadius: 1,
                                            fontSize: '1.1rem',
                                            fontWeight: 300,
                                            fontFamily: 'monospace',
                                            '& fieldset': {
                                                borderColor: upcCode && !validateUPC(upcCode) ? '#d32f2f' : '#e0e0e0',
                                                borderWidth: 1
                                            },
                                            '&:hover fieldset': {
                                                borderColor: upcCode && !validateUPC(upcCode) ? '#d32f2f' : '#bdbdbd'
                                            },
                                            '&.Mui-focused fieldset': {
                                                borderColor: upcCode && !validateUPC(upcCode) ? '#d32f2f' : '#000',
                                                borderWidth: 1
                                            }
                                        },
                                        '& .MuiInputBase-input': {
                                            py: 2.5,
                                            px: 2
                                        },
                                        '& .MuiFormHelperText-root': {
                                            fontSize: '0.8rem',
                                            mt: 1,
                                            ml: 0
                                        }
                                    }}
                                />
                            </Box>

                            {/* Ingredient Image Upload */}
                            <Box>
                                <Typography
                                    variant="body2"
                                    sx={{
                                        color: '#333',
                                        mb: 3,
                                        fontSize: '0.9rem',
                                        fontWeight: 500,
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.5px'
                                    }}
                                >
                                    Ingredient List Photo
                                </Typography>

                                {/* Image Preview */}
                                {previewUrl && (
                                    <Slide direction="up" in={!!previewUrl}>
                                        <Card
                                            sx={{
                                                mb: 4,
                                                position: 'relative',
                                                borderRadius: 2,
                                                overflow: 'hidden',
                                                boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
                                            }}
                                        >
                                            <CardMedia
                                                component="img"
                                                height="280"
                                                image={previewUrl}
                                                alt="Ingredient preview"
                                                sx={{ objectFit: 'cover' }}
                                            />
                                            <IconButton
                                                onClick={removeImage}
                                                sx={{
                                                    position: 'absolute',
                                                    top: 12,
                                                    right: 12,
                                                    backgroundColor: 'rgba(0,0,0,0.7)',
                                                    color: 'white',
                                                    width: 32,
                                                    height: 32,
                                                    '&:hover': {
                                                        backgroundColor: 'rgba(0,0,0,0.8)',
                                                    }
                                                }}
                                                size="small"
                                            >
                                                <Close sx={{ fontSize: 18 }} />
                                            </IconButton>
                                        </Card>
                                    </Slide>
                                )}

                                {/* Upload Area */}
                                <Box
                                    component="label"
                                    sx={{
                                        display: 'block',
                                        width: '100%',
                                        border: '2px dashed #e0e0e0',
                                        borderRadius: 2,
                                        p: 6,
                                        textAlign: 'center',
                                        backgroundColor: '#fafafa',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s ease',
                                        boxSizing: 'border-box',
                                        '&:hover': {
                                            borderColor: '#bdbdbd',
                                            backgroundColor: '#f5f5f5',
                                        }
                                    }}
                                >
                                    <input
                                        type="file"
                                        accept="image/jpeg,image/png,image/jpg,image/gif,image/heic,image/heif"
                                        required
                                        style={{ display: 'none' }}
                                        onChange={handleImageChange}
                                    />
                                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                        <ImageIcon sx={{ fontSize: 48, color: '#ccc', mb: 2 }} />
                                        <Typography
                                            variant="body1"
                                            sx={{
                                                color: '#666',
                                                fontSize: '1rem',
                                                fontWeight: 300,
                                                mb: 1,
                                                textAlign: 'center'
                                            }}
                                        >
                                            {upcCode 
                                                ? 'Bitte nehmen Sie ein Foto der Zutatenliste auf' 
                                                : 'Drop image here or'}{' '}
                                            <Typography
                                                component="span"
                                                sx={{
                                                    color: '#000',
                                                    fontWeight: 400,
                                                    textDecoration: 'underline'
                                                }}
                                            >
                                                {upcCode ? 'Kamera öffnen' : 'browse'}
                                            </Typography>
                                        </Typography>
                                        <Typography
                                            variant="body2"
                                            sx={{
                                                color: '#999',
                                                fontSize: '0.85rem',
                                                textAlign: 'center'
                                            }}
                                        >
                                            PNG, JPG, HEIC up to 2MB
                                        </Typography>
                                    </Box>
                                </Box>
                            </Box>

                            {/* AI Processing Note */}
                            <Box
                                sx={{
                                    py: 3,
                                    px: 4,
                                    backgroundColor: '#f8f9fa',
                                    borderRadius: 2,
                                    borderLeft: '4px solid #e9ecef'
                                }}
                            >
                                <Typography
                                    variant="body2"
                                    sx={{
                                        color: '#495057',
                                        fontSize: '0.9rem',
                                        lineHeight: 1.6,
                                        fontWeight: 300
                                    }}
                                >
                                    AI will automatically extract allergen information from your ingredient photo.
                                    Results appear within minutes of upload.
                                </Typography>
                            </Box>

                            {/* Submit Button */}
                            <Box sx={{ pt: 2 }}>
                                <Button
                                    type="submit"
                                    variant="contained"
                                    size="large"
                                    fullWidth
                                    disabled={isLoading || !isFormValid}
                                    startIcon={
                                        isLoading ? (
                                            <LoadingSpinner size="small" />
                                        ) : (
                                            <ArrowUpward sx={{ fontSize: 20 }} />
                                        )
                                    }
                                    sx={{
                                        backgroundColor: '#000',
                                        color: '#fff',
                                        py: 2,
                                        fontSize: '1rem',
                                        fontWeight: 400,
                                        textTransform: 'none',
                                        borderRadius: 1,
                                        boxShadow: 'none',
                                        transition: 'all 0.2s ease',
                                        '&:hover': {
                                            backgroundColor: '#333',
                                            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                                            transform: 'translateY(-1px)'
                                        },
                                        '&:active': {
                                            transform: 'translateY(0)'
                                        },
                                        '&:disabled': {
                                            backgroundColor: '#f5f5f5',
                                            color: '#bbb',
                                            transform: 'none',
                                            boxShadow: 'none'
                                        }
                                    }}
                                >
                                    {isLoading ? 'Processing...' : 'Upload Product'}
                                </Button>
                            </Box>
                        </Stack>
                    </Box>

                    {/* Tips */}
                    <Box sx={{ pt: 4 }}>
                        <Typography
                            variant="body2"
                            sx={{
                                color: '#999',
                                fontSize: '0.85rem',
                                textAlign: 'center',
                                lineHeight: 1.6,
                                fontWeight: 300
                            }}
                        >
                            Ensure ingredients are clearly visible and well-lit for accurate AI processing.
                            <br />
                            Photos with crisp text yield the best allergen detection results.
                        </Typography>
                    </Box>
                </Stack>
            </Container>
        </Box>
    );
};

export default UploadProduct; 
