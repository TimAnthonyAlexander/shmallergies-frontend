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
  Fab
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
  Dialpad
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

  // Initialize camera and scanner
  useEffect(() => {
    initializeCamera();
    return () => {
      stopScanning();
    };
  }, []);

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
              1. Stellen Sie sicher, dass die Seite über HTTPS läuft<br/>
              2. Klicken Sie auf das Kamera-Symbol in der Adressleiste<br/>
              3. Wählen Sie "Zulassen" für Kamera-Zugriff<br/>
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
              Zu Produkten
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
            Scanner aktiv
          </Typography>
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

        {/* Manual Entry FAB */}
        <Fab
          color="primary"
          aria-label="add"
          sx={{
            position: 'absolute',
            bottom: '45vh',
            right: 16,
            zIndex: 10
          }}
          onClick={handleManualEntryOpen}
        >
          <Dialpad />
        </Fab>
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
                          <Button 
                            variant="text" 
                            size="small" 
                            startIcon={<Add />} 
                            onClick={() => navigate(`/upload?upc=${scannedProduct.upcCode}`)}
                            sx={{ 
                              mt: 0.5, 
                              color: '#4caf50', 
                              p: 0, 
                              fontWeight: 500,
                              '&:hover': { backgroundColor: 'transparent' }
                            }}
                          >
                            Produkt hinzufügen
                          </Button>
                        </>
                      )}
                    </Box>
                    
                    {scannedProduct.product ? (
                      <IconButton
                        size="small"
                        onClick={() => navigate(`/products/${scannedProduct.product!.id}`)}
                        sx={{ color: 'text.secondary' }}
                      >
                        <Inventory />
                      </IconButton>
                    ) : (
                      <IconButton
                        size="small"
                        onClick={() => navigate(`/upload?upc=${scannedProduct.upcCode}`)}
                        sx={{ color: '#4caf50' }}
                      >
                        <Add />
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
      
      {/* Manual Entry Dialog */}
      <Dialog open={isManualEntryOpen} onClose={handleManualEntryClose}>
        <DialogTitle>Barcode manuell eingeben</DialogTitle>
        <DialogContent>
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
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleManualEntryClose}>Abbrechen</Button>
          <Button onClick={handleManualEntrySubmit} variant="contained">Suchen</Button>
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