import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box,
    Container,
    Typography,
    Button,
    IconButton,
    Alert,
    Stack,
    Slide,
    CircularProgress,
    Card,
    CardContent,
    Snackbar,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Fab,
    Badge,
    Paper
} from '@mui/material';
import {
    Close,
    CameraAlt,
    Warning,
    CheckCircle,
    Info,
    Refresh,
    FlashOn,
    FlashOff,
    Cameraswitch,
    Inventory,
    ShoppingCart,
    Add,
    Dialpad,
    History,
    DeleteOutline
} from '@mui/icons-material';
import {
    BrowserMultiFormatReader,
    NotFoundException,
    DecodeHintType,
    BarcodeFormat
} from '@zxing/library';
import { apiClient } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';
import type { Product, ProductSafetyCheck } from '../types';
// LoadingSpinner not used in camera scanner - removed to fix build warnings

interface ScannedProduct {
    upcCode: string;
    product: Product | null;
    safetyCheck: ProductSafetyCheck | null;
    timestamp: number;
    isLoading: boolean;
    error?: string;
}

const STORAGE_KEY = 'shmallergies_scanned_products';

const CameraScanner: React.FC = () => {
    const navigate = useNavigate();
    const { isAuthenticated } = useAuth();
    const videoRef = useRef<HTMLVideoElement>(null);
    const codeReader = useRef<BrowserMultiFormatReader | null>(null);
    const scanningRef = useRef<boolean>(false);

    const [isScanning, setIsScanning] = useState(false);
    const [cameraPermission, setCameraPermission] = useState<'granted' | 'denied' | 'prompt'>('prompt');
    const [hasFlash, setHasFlash] = useState(false);
    const [flashEnabled, setFlashEnabled] = useState(false);
    const [currentDevice, setCurrentDevice] = useState<string>('');
    const [availableDevices, setAvailableDevices] = useState<MediaDeviceInfo[]>([]);
    const [scannedProducts, setScannedProducts] = useState<ScannedProduct[]>([]);
    const [lastScannedCode, setLastScannedCode] = useState<string>('');
    const [scanCount, setScanCount] = useState(0);
    const [showSuccessSnackbar, setShowSuccessSnackbar] = useState(false);
    const [showWarningSnackbar, setShowWarningSnackbar] = useState(false);
    const [scanActive, setScanActive] = useState(false);
    const scanIntervalRef = useRef<number | null>(null);
    const [isManualEntryOpen, setIsManualEntryOpen] = useState(false);
    const [manualBarcode, setManualBarcode] = useState('');
    const [manualBarcodeError, setManualBarcodeError] = useState('');
    const [hasAllergicProducts, setHasAllergicProducts] = useState(false);
    const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);

    // Initialize camera and scanner
    useEffect(() => {
        initializeCamera();
        return () => {
            stopScanning();
        };
    }, []);

    // Load scanned products from localStorage on component mount
    useEffect(() => {
        const storedProducts = localStorage.getItem(STORAGE_KEY);
        if (storedProducts) {
            try {
                const parsedProducts = JSON.parse(storedProducts) as ScannedProduct[];
                setScannedProducts(parsedProducts);
                
                // Check if any products are allergic to set the indicator
                const hasAllergic = parsedProducts.some(
                    product => product.safetyCheck && !product.safetyCheck.is_safe
                );
                setHasAllergicProducts(hasAllergic);
            } catch (error) {
                console.error('Error parsing stored products:', error);
            }
        }
    }, []);

    // Save scanned products to localStorage whenever they change
    useEffect(() => {
        if (scannedProducts.length > 0) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(scannedProducts));
        }
    }, [scannedProducts]);

    const initializeCamera = async () => {
        try {
            // Check if we're in a secure context (HTTPS)
            if (!window.isSecureContext) {
                throw new Error('Camera access requires a secure context (HTTPS). Please use HTTPS or localhost.');
            }

            // Check if MediaDevices API is available
            if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                throw new Error('Camera API not supported in this browser.');
            }

            // First check permission state if available
            if ('permissions' in navigator) {
                try {
                    const permission = await navigator.permissions.query({ name: 'camera' as PermissionName });
                    if (permission.state === 'denied') {
                        setCameraPermission('denied');
                        return;
                    }
                } catch (permissionError) {
                    // Permission API might not be available, continue with getUserMedia
                    console.warn('Permission API not available:', permissionError);
                }
            }

            // Request camera permission with optimized constraints for performance
            const stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    facingMode: 'environment', // Prefer back camera
                    width: { ideal: 640 },     // Lower resolution for better performance
                    height: { ideal: 480 },
                    frameRate: { ideal: 15 }   // Lower frame rate for better performance
                }
            });
            setCameraPermission('granted');

            // Stop the test stream
            stream.getTracks().forEach(track => track.stop());

            // Get available devices
            const devices = await navigator.mediaDevices.enumerateDevices();
            const videoDevices = devices.filter(device => device.kind === 'videoinput');
            setAvailableDevices(videoDevices);

            // Use back camera if available (usually has better quality for scanning)
            const backCamera = videoDevices.find(device =>
                device.label.toLowerCase().includes('back') ||
                device.label.toLowerCase().includes('rear') ||
                device.label.toLowerCase().includes('environment')
            );
            setCurrentDevice(backCamera?.deviceId || videoDevices[0]?.deviceId || '');

            // Initialize ZXing reader with optimized hints
            const hints = new Map();
            // Prioritize common product barcode formats for better performance
            hints.set(DecodeHintType.POSSIBLE_FORMATS, [
                BarcodeFormat.EAN_13,
                BarcodeFormat.EAN_8,
                BarcodeFormat.UPC_A,
                BarcodeFormat.UPC_E,
                BarcodeFormat.CODE_128,
                BarcodeFormat.CODE_39,
            ]);
            // Improve speed with these hints
            hints.set(DecodeHintType.TRY_HARDER, false);
            hints.set(DecodeHintType.ASSUME_GS1, false);

            codeReader.current = new BrowserMultiFormatReader(hints);

            // Start scanning
            await startScanning();

        } catch (error) {
            console.error('Camera initialization failed:', error);
            setCameraPermission('denied');

            // Provide more specific error information
            if (error instanceof Error) {
                if (error.name === 'NotAllowedError') {
                    console.error('Camera permission denied by user');
                } else if (error.name === 'NotFoundError') {
                    console.error('No camera found');
                } else if (error.name === 'NotSupportedError') {
                    console.error('Camera not supported');
                } else if (error.name === 'NotReadableError') {
                    console.error('Camera is already in use');
                }
            }
        }
    };

    const startScanning = async () => {
        if (!codeReader.current || !videoRef.current || scanningRef.current) return;

        try {
            setIsScanning(true);
            scanningRef.current = true;

            // Start video stream first
            await codeReader.current.decodeFromVideoDevice(
                currentDevice || null,
                videoRef.current,
                (result, error) => {
                    if (result) {
                        const scannedCode = result.getText();
                        handleBarcodeDetected(scannedCode);

                        // Show visual feedback for successful scan
                        setScanActive(true);
                        setTimeout(() => setScanActive(false), 300);
                    }
                    if (error && !(error instanceof NotFoundException)) {
                        console.error('Scanning error:', error);
                    }
                }
            );

            // Check for flash capability
            const stream = videoRef.current.srcObject as MediaStream;
            if (stream) {
                const track = stream.getVideoTracks()[0];
                const capabilities = track.getCapabilities() as any;
                setHasFlash(!!(capabilities && capabilities.torch));

                // Set optimal camera settings for scanning
                try {
                    await track.applyConstraints({
                        advanced: [{
                            focusMode: 'continuous',
                            exposureMode: 'continuous',
                            whiteBalanceMode: 'continuous'
                        } as any]
                    });
                } catch (e) {
                    console.warn('Could not apply optimal camera settings:', e);
                }
            }

            // Visual scanning pulse to show scanner is active
            const pulseScan = () => {
                setScanActive(true);
                setTimeout(() => setScanActive(false), 150);
            };

            // Create a scanning pulse every 2 seconds to show activity
            scanIntervalRef.current = window.setInterval(pulseScan, 2000);

        } catch (error) {
            console.error('Failed to start scanning:', error);
            setIsScanning(false);
            scanningRef.current = false;
        }
    };

    const stopScanning = () => {
        if (codeReader.current) {
            codeReader.current.reset();
        }
        scanningRef.current = false;
        setIsScanning(false);

        if (scanIntervalRef.current) {
            clearInterval(scanIntervalRef.current);
            scanIntervalRef.current = null;
        }
    };

    const handleBarcodeDetected = useCallback(async (upcCode: string) => {
        // Prevent duplicate scans of the same code within 3 seconds
        if (upcCode === lastScannedCode) return;

        setLastScannedCode(upcCode);
        setScanCount(prev => prev + 1);

        // Add to scanned products list
        const newScannedProduct: ScannedProduct = {
            upcCode,
            product: null,
            safetyCheck: null,
            timestamp: Date.now(),
            isLoading: true
        };

        setScannedProducts(prev => [newScannedProduct, ...prev.slice(0, 19)]); // Keep last 20 scans

        // Clear the last scanned code after 3 seconds
        setTimeout(() => {
            setLastScannedCode('');
        }, 3000);

        try {
            // Look up product by UPC
            const productResponse = await apiClient.getProductByUpc(upcCode);
            const product = productResponse.product;

            let safetyCheck: ProductSafetyCheck | null = null;

            // Check safety if user is authenticated
            if (isAuthenticated && product) {
                try {
                    safetyCheck = await apiClient.checkProductSafety(product.id);
                } catch (error) {
                    console.error('Safety check failed:', error);
                }
            }

            // Update the scanned product
            setScannedProducts(prev => {
                const updatedProducts = prev.map(item =>
                    item.upcCode === upcCode
                        ? { ...item, product, safetyCheck, isLoading: false }
                        : item
                );
                
                // Save to localStorage
                localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedProducts));
                
                return updatedProducts;
            });

            // Update allergic products indicator
            if (safetyCheck && !safetyCheck.is_safe) {
                setHasAllergicProducts(true);
            }

            // Show appropriate feedback
            if (safetyCheck) {
                if (safetyCheck.is_safe) {
                    setShowSuccessSnackbar(true);
                } else {
                    setShowWarningSnackbar(true);
                }
            }

        } catch (error) {
            console.error('Product lookup failed:', error);
            setScannedProducts(prev => {
                const updatedProducts = prev.map(item =>
                    item.upcCode === upcCode
                        ? { ...item, isLoading: false, error: 'Product not found' }
                        : item
                );
                
                // Save to localStorage
                localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedProducts));
                
                return updatedProducts;
            });
        }
    }, [lastScannedCode, isAuthenticated]);

    const toggleFlash = async () => {
        if (!videoRef.current) return;

        const stream = videoRef.current.srcObject as MediaStream;
        if (stream) {
            const track = stream.getVideoTracks()[0];
            try {
                await track.applyConstraints({
                    advanced: [{ torch: !flashEnabled } as any]
                });
                setFlashEnabled(!flashEnabled);
            } catch (error) {
                console.warn('Flash control not supported:', error);
            }
        }
    };

    const switchCamera = async () => {
        if (availableDevices.length <= 1) return;

        const currentIndex = availableDevices.findIndex(device => device.deviceId === currentDevice);
        const nextIndex = (currentIndex + 1) % availableDevices.length;
        const nextDevice = availableDevices[nextIndex];

        stopScanning();
        setCurrentDevice(nextDevice.deviceId);

        // Restart scanning with new device
        setTimeout(() => {
            startScanning();
        }, 100);
    };

    const getSafetyColor = (safetyCheck: ProductSafetyCheck | null): string => {
        if (!safetyCheck) return '#f5f5f5';
        return safetyCheck.is_safe ? '#e8f5e9' : '#ffebee';
    };

    const getSafetyBorderColor = (safetyCheck: ProductSafetyCheck | null): string => {
        if (!safetyCheck) return '#e0e0e0';
        return safetyCheck.is_safe ? '#4caf50' : '#f44336';
    };

    const getSafetyIcon = (safetyCheck: ProductSafetyCheck | null) => {
        if (!safetyCheck) return <Info color="disabled" />;
        return safetyCheck.is_safe ?
            <CheckCircle sx={{ color: '#4caf50' }} /> :
            <Warning sx={{ color: '#f44336' }} />;
    };

    const handleManualEntryOpen = () => {
        setIsManualEntryOpen(true);
        setManualBarcode('');
        setManualBarcodeError('');
    };

    const handleManualEntryClose = () => {
        setIsManualEntryOpen(false);
    };

    const handleManualEntrySubmit = () => {
        // Validate the input
        if (!manualBarcode.trim()) {
            setManualBarcodeError('Bitte geben Sie einen Barcode ein');
            return;
        }

        // Check if input contains only digits
        if (!/^\d+$/.test(manualBarcode.trim())) {
            setManualBarcodeError('Der Barcode sollte nur aus Zahlen bestehen');
            return;
        }

        // Process the barcode as if it was scanned
        handleBarcodeDetected(manualBarcode.trim());
        handleManualEntryClose();
    };

    const handleHistoryModalOpen = () => {
        setIsHistoryModalOpen(true);
    };

    const handleHistoryModalClose = () => {
        setIsHistoryModalOpen(false);
    };

    // Function to clear scan history
    const handleClearHistory = () => {
        setScannedProducts([]);
        setHasAllergicProducts(false);
        localStorage.removeItem(STORAGE_KEY);
        handleHistoryModalClose();
    };

    if (cameraPermission === 'denied') {
        return (
            <Container maxWidth="sm" sx={{ py: 8, textAlign: 'center' }}>
                <Stack spacing={4}>
                    <CameraAlt sx={{ fontSize: 64, color: '#ccc', mx: 'auto' }} />
                    <Typography variant="h5" gutterBottom>
                        Kamera-Zugriff erforderlich
                    </Typography>
                    <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                        Bitte erlauben Sie den Zugriff auf Ihre Kamera, um Barcodes zu scannen.
                    </Typography>

                    {/* Firefox-specific instructions */}
                    <Alert severity="info" sx={{ textAlign: 'left' }}>
                        <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
                            Für Firefox-Browser:
                        </Typography>
                        <Typography variant="body2" component="div">
                            1. Stellen Sie sicher, dass die Seite über HTTPS läuft<br />
                            2. Klicken Sie auf das Kamera-Symbol in der Adressleiste<br />
                            3. Wählen Sie "Zulassen" für Kamera-Zugriff<br />
                            4. Laden Sie die Seite neu, falls nötig
                        </Typography>
                    </Alert>

                    <Stack direction="row" spacing={2} justifyContent="center">
                        <Button
                            variant="contained"
                            onClick={initializeCamera}
                            startIcon={<Refresh />}
                        >
                            Erneut versuchen
                        </Button>
                        <Button
                            variant="outlined"
                            onClick={() => navigate('/products')}
                        >
                            To Products
                        </Button>
                    </Stack>
                </Stack>
            </Container>
        );
    }

    return (
        <Box sx={{
            minHeight: '100vh',
            backgroundColor: '#000',
            position: 'relative',
            overflow: 'hidden'
        }}>
            {/* Camera View */}
            <Box sx={{
                position: 'relative',
                width: '100%',
                height: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
            }}>
                <video
                    ref={videoRef}
                    style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                    }}
                    autoPlay
                    playsInline
                    muted
                />

                {/* Scanning Overlay */}
                <Box sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    pointerEvents: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}>
                    {/* Scanning Frame */}
                    <Box sx={{
                        width: '80%',
                        maxWidth: 300,
                        aspectRatio: '3/2',
                        border: '3px solid #fff',
                        borderRadius: 2,
                        position: 'relative',
                        boxShadow: '0 0 0 9999px rgba(0,0,0,0.3)',
                        transition: 'box-shadow 0.2s ease, border 0.2s ease',
                        ...(scanActive && {
                            border: '3px solid #4caf50',
                            boxShadow: '0 0 0 9999px rgba(0,0,0,0.4), 0 0 20px rgba(76,175,80,0.5)'
                        })
                    }}>
                        {/* Corner indicators */}
                        {[
                            { top: -3, left: -3 },
                            { top: -3, right: -3 },
                            { bottom: -3, left: -3 },
                            { bottom: -3, right: -3 }
                        ].map((position, index) => (
                            <Box
                                key={index}
                                sx={{
                                    position: 'absolute',
                                    width: 20,
                                    height: 20,
                                    border: '3px solid #4caf50',
                                    borderRadius: 1,
                                    ...position,
                                    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                                    ...(scanActive && {
                                        transform: 'scale(1.2)',
                                        boxShadow: '0 0 10px rgba(76,175,80,0.7)'
                                    })
                                }}
                            />
                        ))}

                        {/* Scanning line animation */}
                        {isScanning && (
                            <Box sx={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                right: 0,
                                height: 2,
                                background: 'linear-gradient(90deg, transparent, #4caf50, transparent)',
                                animation: 'scanLine 1.5s linear infinite',
                                '@keyframes scanLine': {
                                    '0%': { transform: 'translateY(0)' },
                                    '100%': { transform: 'translateY(200px)' }
                                }
                            }}
                            />
                        )}
                    </Box>

                    {/* Scanning indicator text */}
                    <Typography
                        variant="caption"
                        sx={{
                            position: 'absolute',
                            bottom: '40%',
                            left: '50%',
                            transform: 'translateX(-50%)',
                            color: 'white',
                            backgroundColor: 'rgba(0,0,0,0.5)',
                            px: 2,
                            py: 0.5,
                            borderRadius: 1,
                            fontWeight: 500
                        }}
                    >
                        Scanning
                    </Typography>

                    {/* Manual Entry FAB - Moved below scanner rectangle */}
                    <Fab
                        color="primary"
                        aria-label="manual entry"
                        size="medium"
                        sx={{
                            position: 'absolute',
                            bottom: '35%',
                            left: '50%',
                            transform: 'translateX(-50%)',
                            zIndex: 10,
                            boxShadow: '0 4px 10px rgba(0,0,0,0.25)',
                            mt: 4
                        }}
                        onClick={handleManualEntryOpen}
                    >
                        <Dialpad />
                    </Fab>
                </Box>

                {/* Top Controls */}
                <Box sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    p: 2,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    background: 'linear-gradient(180deg, rgba(0,0,0,0.7) 0%, transparent 100%)',
                    zIndex: 10
                }}>
                    <IconButton
                        onClick={() => navigate(-1)}
                        sx={{ color: 'white', backgroundColor: 'rgba(0,0,0,0.5)' }}
                    >
                        <Close />
                    </IconButton>

                    <Typography variant="h6" sx={{ color: 'white', fontWeight: 500 }}>
                        Barcode Scanner
                    </Typography>

                    <Stack direction="row" spacing={1}>
                        {hasFlash && (
                            <IconButton
                                onClick={toggleFlash}
                                sx={{ color: flashEnabled ? '#ffc107' : 'white', backgroundColor: 'rgba(0,0,0,0.5)' }}
                            >
                                {flashEnabled ? <FlashOn /> : <FlashOff />}
                            </IconButton>
                        )}

                        {availableDevices.length > 1 && (
                            <IconButton
                                onClick={switchCamera}
                                sx={{ color: 'white', backgroundColor: 'rgba(0,0,0,0.5)' }}
                            >
                                <Cameraswitch />
                            </IconButton>
                        )}
                    </Stack>
                </Box>

                {/* Scan Counter */}
                <Box sx={{
                    position: 'absolute',
                    top: 80,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    backgroundColor: 'rgba(0,0,0,0.7)',
                    color: 'white',
                    px: 2,
                    py: 1,
                    borderRadius: 2,
                    zIndex: 10
                }}>
                    <Typography variant="body2">
                        {scanCount} Product{scanCount !== 1 ? 's' : ''} scanned
                    </Typography>
                </Box>
            </Box>

            {/* Bottom Area - Redesigned to be more modern and simple */}
            <Paper
                elevation={24}
                sx={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    borderTopLeftRadius: 20,
                    borderTopRightRadius: 20,
                    background: 'rgba(255,255,255,0.95)',
                    backdropFilter: 'blur(10px)',
                    p: 2,
                    pt: 3,
                    zIndex: 10,
                    transition: 'all 0.3s ease',
                    boxShadow: '0 -5px 25px rgba(0,0,0,0.15)'
                }}
            >
                {scannedProducts.length > 0 ? (
                    <>
                        <Stack
                            direction="row"
                            justifyContent="space-between"
                            alignItems="center"
                            spacing={2}
                            sx={{ mb: 1 }}
                        >
                            <Typography
                                variant="subtitle1"
                                sx={{
                                    fontWeight: 600,
                                    color: 'text.primary',
                                    flexGrow: 1
                                }}
                            >
                                Last Scan
                            </Typography>

                            <Fab
                                color="secondary"
                                aria-label="history"
                                size="small"
                                onClick={handleHistoryModalOpen}
                                sx={{
                                    boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                                    backgroundColor: hasAllergicProducts ? 'error.main' : 'secondary.main',
                                }}
                            >
                                <Badge
                                    color="error"
                                    variant="dot"
                                    invisible={!hasAllergicProducts}
                                    overlap="circular"
                                >
                                    <History sx={{ color: 'white' }} />
                                </Badge>
                            </Fab>
                        </Stack>

                        <Slide direction="up" in timeout={300}>
                            <Card sx={{
                                backgroundColor: 'white',
                                borderRadius: 2,
                                position: 'relative',
                                overflow: 'visible',
                                mb: hasAllergicProducts ? 2 : 0,
                                '&:before': scannedProducts[0].safetyCheck && {
                                    content: '""',
                                    position: 'absolute',
                                    left: 0,
                                    top: 0,
                                    bottom: 0,
                                    width: 8,
                                    backgroundColor: scannedProducts[0].safetyCheck?.is_safe ? '#4caf50' : '#f44336',
                                    borderTopLeftRadius: 8,
                                    borderBottomLeftRadius: 8
                                }
                            }}>
                                <CardContent sx={{ py: 2, pl: 3, '&:last-child': { pb: 2 } }}>
                                    <Stack direction="row" spacing={2} alignItems="center">
                                        <Box sx={{ flexShrink: 0 }}>
                                            {scannedProducts[0].isLoading ? (
                                                <CircularProgress size={24} color="primary" />
                                            ) : (
                                                getSafetyIcon(scannedProducts[0].safetyCheck)
                                            )}
                                        </Box>

                                        <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                                            {scannedProducts[0].isLoading ? (
                                                <Typography variant="body2" color="text.secondary">
                                                    Searching for product...
                                                </Typography>
                                            ) : scannedProducts[0].product ? (
                                                <>
                                                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                                                        {scannedProducts[0].product.name}
                                                    </Typography>
                                                    <Typography variant="body2" color="text.secondary" sx={{ fontFamily: 'monospace', fontSize: '0.75rem' }}>
                                                        {scannedProducts[0].upcCode}
                                                    </Typography>
                                                    {scannedProducts[0].safetyCheck && !scannedProducts[0].safetyCheck.is_safe && (
                                                        <Typography variant="body2" sx={{ color: '#d32f2f', fontWeight: 500, mt: 0.5 }}>
                                                            Allergens: {scannedProducts[0].safetyCheck.potential_conflicts.join(', ')}
                                                        </Typography>
                                                    )}
                                                </>
                                            ) : (
                                                <>
                                                    <Typography variant="body2" color="text.secondary">
                                                        Product could not be found
                                                    </Typography>
                                                    <Typography variant="body2" color="text.secondary" sx={{ fontFamily: 'monospace', fontSize: '0.75rem' }}>
                                                        {scannedProducts[0].upcCode}
                                                    </Typography>
                                                    <Button
                                                        variant="text"
                                                        size="small"
                                                        startIcon={<Add />}
                                                        onClick={() => navigate(`/upload?upc=${scannedProducts[0].upcCode}`)}
                                                        sx={{
                                                            mt: 0.5,
                                                            color: '#4caf50',
                                                            p: 0,
                                                            fontWeight: 500,
                                                            '&:hover': { backgroundColor: 'transparent' }
                                                        }}
                                                    >
                                                        Add Product
                                                    </Button>
                                                </>
                                            )}
                                        </Box>

                                        {scannedProducts[0].product ? (
                                            <IconButton
                                                size="small"
                                                onClick={() => navigate(`/products/${scannedProducts[0].product!.id}`)}
                                                sx={{
                                                    color: 'primary.main',
                                                    backgroundColor: 'rgba(25, 118, 210, 0.08)',
                                                    '&:hover': {
                                                        backgroundColor: 'rgba(25, 118, 210, 0.12)',
                                                    }
                                                }}
                                            >
                                                <Inventory />
                                            </IconButton>
                                        ) : (
                                            <IconButton
                                                size="small"
                                                onClick={() => navigate(`/upload?upc=${scannedProducts[0].upcCode}`)}
                                                sx={{
                                                    color: '#4caf50',
                                                    backgroundColor: 'rgba(76, 175, 80, 0.08)',
                                                    '&:hover': {
                                                        backgroundColor: 'rgba(76, 175, 80, 0.12)',
                                                    }
                                                }}
                                            >
                                                <Add />
                                            </IconButton>
                                        )}
                                    </Stack>
                                </CardContent>
                            </Card>
                        </Slide>

                        {/* Allergic Products Warning */}
                        {hasAllergicProducts && (
                            <Alert
                                severity="warning"
                                icon={<Warning sx={{ fontSize: '1.2rem' }} />}
                                sx={{
                                    borderRadius: 2,
                                    '& .MuiAlert-message': {
                                        fontSize: '0.875rem',
                                        display: 'flex',
                                        alignItems: 'center'
                                    }
                                }}
                            >
                                You have scanned products with potential allergens.
                            </Alert>
                        )}
                    </>
                ) : (
                    <Box sx={{ textAlign: 'center', py: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <ShoppingCart sx={{ fontSize: 48, color: 'rgba(0,0,0,0.2)', mb: 2 }} />
                        <Typography variant="body1" sx={{ color: 'text.secondary', mb: 2 }}>
                            Scan a barcode to get started
                        </Typography>
                        <Fab
                            color="secondary"
                            aria-label="history"
                            size="small"
                            onClick={handleHistoryModalOpen}
                            sx={{
                                mt: 1
                            }}
                        >
                            <History />
                        </Fab>
                    </Box>
                )}
            </Paper>

            {/* Scan History Modal */}
            <Dialog
                open={isHistoryModalOpen}
                onClose={handleHistoryModalClose}
                fullWidth
                maxWidth="sm"
                PaperProps={{
                    sx: {
                        borderRadius: 3,
                        overflow: 'hidden'
                    }
                }}
            >
                <DialogTitle sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    px: 3,
                    py: 2,
                    backgroundColor: 'background.paper',
                    borderBottom: '1px solid rgba(0,0,0,0.08)'
                }}>
                    <Stack direction="row" spacing={1} alignItems="center">
                        <History fontSize="small" color="action" />
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>Scan History</Typography>
                    </Stack>
                    <Stack direction="row" spacing={1}>
                        {scannedProducts.length > 0 && (
                            <IconButton 
                                size="small" 
                                onClick={handleClearHistory}
                                color="error"
                                title="Clear history"
                            >
                                <DeleteOutline />
                            </IconButton>
                        )}
                        <IconButton size="small" onClick={handleHistoryModalClose}>
                            <Close />
                        </IconButton>
                    </Stack>
                </DialogTitle>
                <DialogContent sx={{ p: 0 }}>
                    <Stack spacing={0} divider={<Box sx={{ borderBottom: '1px solid rgba(0,0,0,0.06)' }} />}>
                        {scannedProducts.length > 0 ? scannedProducts.map((scannedProduct, index) => (
                            <Box
                                key={scannedProduct.upcCode + scannedProduct.timestamp}
                                sx={{
                                    p: 2,
                                    borderLeft: '4px solid',
                                    borderLeftColor: scannedProduct.safetyCheck ?
                                        (scannedProduct.safetyCheck.is_safe ? '#4caf50' : '#f44336') :
                                        'transparent',
                                    backgroundColor: index % 2 === 0 ? 'rgba(0,0,0,0.02)' : 'transparent',
                                    transition: 'background-color 0.2s ease'
                                }}
                            >
                                <Stack direction="row" spacing={2} alignItems="center">
                                    <Box sx={{ flexShrink: 0 }}>
                                        {scannedProduct.isLoading ? (
                                            <CircularProgress size={24} />
                                        ) : (
                                            getSafetyIcon(scannedProduct.safetyCheck)
                                        )}
                                    </Box>

                                    <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                                        {scannedProduct.isLoading ? (
                                            <Typography variant="body2" color="text.secondary">
                                                Product is being searched...
                                            </Typography>
                                        ) : scannedProduct.product ? (
                                            <>
                                                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                                                    {scannedProduct.product.name}
                                                </Typography>
                                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.5 }}>
                                                    <Typography variant="body2" color="text.secondary" sx={{ fontFamily: 'monospace', fontSize: '0.75rem' }}>
                                                        {scannedProduct.upcCode}
                                                    </Typography>
                                                    <Typography variant="caption" color="text.secondary">
                                                        {new Date(scannedProduct.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </Typography>
                                                </Box>
                                                {scannedProduct.safetyCheck && !scannedProduct.safetyCheck.is_safe && (
                                                    <Typography variant="body2" sx={{ color: '#d32f2f', fontWeight: 500, mt: 0.5 }}>
                                                        Allergens: {scannedProduct.safetyCheck.potential_conflicts.join(', ')}
                                                    </Typography>
                                                )}
                                            </>
                                        ) : (
                                            <>
                                                <Typography variant="body2" color="text.secondary">
                                                    Could not find product
                                                </Typography>
                                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.5 }}>
                                                    <Typography variant="body2" color="text.secondary" sx={{ fontFamily: 'monospace', fontSize: '0.75rem' }}>
                                                        {scannedProduct.upcCode}
                                                    </Typography>
                                                    <Typography variant="caption" color="text.secondary">
                                                        {new Date(scannedProduct.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </Typography>
                                                </Box>
                                            </>
                                        )}
                                    </Box>

                                    {scannedProduct.product ? (
                                        <IconButton
                                            size="small"
                                            onClick={() => {
                                                navigate(`/products/${scannedProduct.product!.id}`);
                                                handleHistoryModalClose();
                                            }}
                                            sx={{
                                                color: 'primary.main',
                                                backgroundColor: 'rgba(25, 118, 210, 0.08)',
                                                '&:hover': {
                                                    backgroundColor: 'rgba(25, 118, 210, 0.12)',
                                                }
                                            }}
                                        >
                                            <Inventory fontSize="small" />
                                        </IconButton>
                                    ) : (
                                        <IconButton
                                            size="small"
                                            onClick={() => {
                                                navigate(`/upload?upc=${scannedProduct.upcCode}`);
                                                handleHistoryModalClose();
                                            }}
                                            sx={{
                                                color: '#4caf50',
                                                backgroundColor: 'rgba(76, 175, 80, 0.08)',
                                                '&:hover': {
                                                    backgroundColor: 'rgba(76, 175, 80, 0.12)',
                                                }
                                            }}
                                        >
                                            <Add fontSize="small" />
                                        </IconButton>
                                    )}
                                </Stack>
                            </Box>
                        )) : (
                            <Box sx={{ textAlign: 'center', py: 6 }}>
                                <ShoppingCart sx={{ fontSize: 48, color: 'rgba(0,0,0,0.2)', mb: 2 }} />
                                <Typography variant="body1" color="text.secondary">
                                    No products scanned yet.
                                </Typography>
                            </Box>
                        )}
                    </Stack>
                </DialogContent>
            </Dialog>

            {/* Manual Entry Dialog */}
            <Dialog
                open={isManualEntryOpen}
                onClose={handleManualEntryClose}
                PaperProps={{
                    sx: {
                        borderRadius: 3,
                        overflow: 'hidden'
                    }
                }}
            >
                <DialogTitle sx={{
                    borderBottom: '1px solid rgba(0,0,0,0.08)',
                    px: 3,
                    py: 2,
                }}>
                    <Stack direction="row" spacing={1} alignItems="center">
                        <Dialpad fontSize="small" color="action" />
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>Barcode manuell eingeben</Typography>
                    </Stack>
                </DialogTitle>
                <DialogContent sx={{ p: 3, pt: 3 }}>
                    <TextField
                        autoFocus
                        margin="dense"
                        id="barcode"
                        label="Barcode"
                        type="text"
                        fullWidth
                        variant="outlined"
                        value={manualBarcode}
                        onChange={(e) => setManualBarcode(e.target.value)}
                        error={!!manualBarcodeError}
                        helperText={manualBarcodeError}
                        autoComplete="off"
                        inputProps={{
                            inputMode: 'numeric',
                            pattern: '[0-9]*'
                        }}
                        onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                                handleManualEntrySubmit();
                            }
                        }}
                        sx={{
                            mt: 0
                        }}
                    />
                </DialogContent>
                <DialogActions sx={{ px: 3, py: 2, borderTop: '1px solid rgba(0,0,0,0.08)' }}>
                    <Button
                        onClick={handleManualEntryClose}
                        sx={{ fontWeight: 500 }}
                    >
                        Abbrechen
                    </Button>
                    <Button
                        onClick={handleManualEntrySubmit}
                        variant="contained"
                        disableElevation
                    >
                        Suchen
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Success Snackbar */}
            <Snackbar
                open={showSuccessSnackbar}
                autoHideDuration={2000}
                onClose={() => setShowSuccessSnackbar(false)}
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            >
                <Alert severity="success" onClose={() => setShowSuccessSnackbar(false)} sx={{ mt: 10 }}>
                    ✅ Product is safe to use!
                </Alert>
            </Snackbar>

            {/* Warning Snackbar */}
            <Snackbar
                open={showWarningSnackbar}
                autoHideDuration={3000}
                onClose={() => setShowWarningSnackbar(false)}
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            >
                <Alert severity="warning" onClose={() => setShowWarningSnackbar(false)} sx={{ mt: 10 }}>
                    ⚠️ Attention! This product may contain allergens.
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default CameraScanner; 
