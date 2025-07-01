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
  Snackbar
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
  ShoppingCart
} from '@mui/icons-material';
import { BrowserMultiFormatReader, NotFoundException } from '@zxing/library';
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

  // Initialize camera and scanner
  useEffect(() => {
    initializeCamera();
    return () => {
      stopScanning();
    };
  }, []);

  const initializeCamera = async () => {
    try {
      // Request camera permission
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
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
        device.label.toLowerCase().includes('rear')
      );
      setCurrentDevice(backCamera?.deviceId || videoDevices[0]?.deviceId || '');
      
      // Initialize ZXing reader
      codeReader.current = new BrowserMultiFormatReader();
      
      // Start scanning
      await startScanning();
      
    } catch (error) {
      console.error('Camera initialization failed:', error);
      setCameraPermission('denied');
    }
  };

  const startScanning = async () => {
    if (!codeReader.current || !videoRef.current || scanningRef.current) return;
    
    try {
      setIsScanning(true);
      scanningRef.current = true;
      
      // Start continuous scanning
      await codeReader.current.decodeFromVideoDevice(
        currentDevice || null,
        videoRef.current,
        (result, error) => {
          if (result) {
            const scannedCode = result.getText();
            handleBarcodeDetected(scannedCode);
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
      }
      
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
    
    setScannedProducts(prev => [newScannedProduct, ...prev.slice(0, 9)]); // Keep last 10 scans
    
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
      setScannedProducts(prev => 
        prev.map(item => 
          item.upcCode === upcCode 
            ? { ...item, product, safetyCheck, isLoading: false }
            : item
        )
      );
      
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
      setScannedProducts(prev => 
        prev.map(item => 
          item.upcCode === upcCode 
            ? { ...item, isLoading: false, error: 'Product not found' }
            : item
        )
      );
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

  if (cameraPermission === 'denied') {
    return (
      <Container maxWidth="sm" sx={{ py: 8, textAlign: 'center' }}>
        <Stack spacing={4}>
          <CameraAlt sx={{ fontSize: 64, color: '#ccc', mx: 'auto' }} />
          <Typography variant="h5" gutterBottom>
            Kamera-Zugriff erforderlich
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Bitte erlauben Sie den Zugriff auf Ihre Kamera, um Barcodes zu scannen.
          </Typography>
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
            Zu Produkten
          </Button>
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
            boxShadow: '0 0 0 9999px rgba(0,0,0,0.3)'
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
                  ...position
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
                animation: 'scanLine 2s linear infinite',
                '@keyframes scanLine': {
                  '0%': { transform: 'translateY(0)' },
                  '100%': { transform: 'translateY(200px)' }
                }
              }}
              />
            )}
          </Box>
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
            {scanCount} Produkt{scanCount !== 1 ? 'e' : ''} gescannt
          </Typography>
        </Box>
      </Box>
      
      {/* Scanned Products List */}
      <Box sx={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        maxHeight: '40vh',
        overflowY: 'auto',
        background: 'linear-gradient(0deg, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.7) 100%)',
        p: 2,
        zIndex: 10
      }}>
        <Stack spacing={2}>
          {scannedProducts.map((scannedProduct, index) => (
            <Slide key={scannedProduct.upcCode + scannedProduct.timestamp} direction="up" in timeout={300}>
              <Card sx={{
                backgroundColor: getSafetyColor(scannedProduct.safetyCheck),
                border: `2px solid ${getSafetyBorderColor(scannedProduct.safetyCheck)}`,
                borderRadius: 2,
                opacity: index === 0 ? 1 : 0.8,
                transform: `scale(${index === 0 ? 1 : 0.95})`,
                transition: 'all 0.3s ease'
              }}>
                <CardContent sx={{ py: 2, '&:last-child': { pb: 2 } }}>
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
                          Produkt wird gesucht...
                        </Typography>
                      ) : scannedProduct.product ? (
                        <>
                          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                            {scannedProduct.product.name}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ fontFamily: 'monospace' }}>
                            {scannedProduct.upcCode}
                          </Typography>
                          {scannedProduct.safetyCheck && !scannedProduct.safetyCheck.is_safe && (
                            <Typography variant="body2" sx={{ color: '#d32f2f', fontWeight: 500, mt: 0.5 }}>
                              Allergene: {scannedProduct.safetyCheck.potential_conflicts.join(', ')}
                            </Typography>
                          )}
                        </>
                      ) : (
                        <>
                          <Typography variant="body2" color="text.secondary">
                            Produkt nicht gefunden
                          </Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ fontFamily: 'monospace' }}>
                            {scannedProduct.upcCode}
                          </Typography>
                        </>
                      )}
                    </Box>
                    
                    {scannedProduct.product && (
                      <IconButton
                        size="small"
                        onClick={() => navigate(`/products/${scannedProduct.product!.id}`)}
                        sx={{ color: 'text.secondary' }}
                      >
                        <Inventory />
                      </IconButton>
                    )}
                  </Stack>
                </CardContent>
              </Card>
            </Slide>
          ))}
          
          {scannedProducts.length === 0 && (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <ShoppingCart sx={{ fontSize: 48, color: 'rgba(255,255,255,0.3)', mb: 2 }} />
              <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                Scannen Sie einen Barcode, um zu beginnen
              </Typography>
            </Box>
          )}
        </Stack>
      </Box>
      
      {/* Success Snackbar */}
      <Snackbar
        open={showSuccessSnackbar}
        autoHideDuration={2000}
        onClose={() => setShowSuccessSnackbar(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert severity="success" onClose={() => setShowSuccessSnackbar(false)} sx={{ mt: 10 }}>
          ✅ Produkt ist sicher für Sie!
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
          ⚠️ Achtung: Enthält Allergene!
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default CameraScanner; 