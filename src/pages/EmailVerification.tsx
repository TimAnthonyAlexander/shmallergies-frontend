import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Box, 
  Paper, 
  Button, 
  Typography, 
  Container,
  Stack,
  Alert
} from '@mui/material';
import { EmailOutlined, CheckCircleOutlined } from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from '../components/UI/LoadingSpinner';
import ErrorMessage from '../components/UI/ErrorMessage';

interface LocationState {
  email?: string;
  fromSignup?: boolean;
}

const EmailVerification: React.FC = () => {
  const [isResending, setIsResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { resendVerificationEmail } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  
  const state = location.state as LocationState;
  const email = state?.email;
  const fromSignup = state?.fromSignup;

  const handleResendEmail = async () => {
    if (!email) return;
    
    setIsResending(true);
    setError(null);
    setResendSuccess(false);
    
    try {
      await resendVerificationEmail(email);
      setResendSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Failed to resend verification email');
    } finally {
      setIsResending(false);
    }
  };

  const handleGoToLogin = () => {
    navigate('/login');
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'background.default',
        py: 4
      }}
    >
      <Container maxWidth="sm">
        <Paper
          elevation={3}
          sx={{
            p: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center'
          }}
        >
          <Box
            sx={{
              width: 60,
              height: 60,
              borderRadius: '50%',
              backgroundColor: 'primary.main',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mb: 3
            }}
          >
            <EmailOutlined sx={{ color: 'white', fontSize: 32 }} />
          </Box>

          <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
            Verify Your Email
          </Typography>

          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            {fromSignup ? (
              <>
                Thanks for signing up! We've sent a verification email to{' '}
                <strong>{email}</strong>. Please check your inbox and click the verification link to activate your account.
              </>
            ) : (
              <>
                Your email address is not verified. Please check your inbox for a verification email or request a new one.
              </>
            )}
          </Typography>

          {resendSuccess && (
            <Alert 
              severity="success" 
              sx={{ width: '100%', mb: 3 }}
              icon={<CheckCircleOutlined />}
            >
              Verification email sent successfully! Please check your inbox.
            </Alert>
          )}

          {error && (
            <ErrorMessage 
              message={error}
              onDismiss={() => setError(null)}
              sx={{ width: '100%', mb: 3 }}
            />
          )}

          <Stack spacing={2} sx={{ width: '100%' }}>
            {email && (
              <Button
                variant="contained"
                size="large"
                onClick={handleResendEmail}
                disabled={isResending}
                sx={{ py: 1.5 }}
              >
                {isResending ? (
                  <>
                    <LoadingSpinner size="small" sx={{ mr: 1 }} />
                    Sending...
                  </>
                ) : (
                  'Resend Verification Email'
                )}
              </Button>
            )}

            <Button
              variant="outlined"
              size="large"
              onClick={handleGoToLogin}
              sx={{ py: 1.5 }}
            >
              Go to Login
            </Button>
          </Stack>

          <Box sx={{ mt: 3 }}>
            <Typography variant="body2" color="text.secondary">
              Already verified your email?{' '}
              <Link to="/login" style={{ textDecoration: 'none' }}>
                <Button variant="text" size="small">
                  Sign in here
                </Button>
              </Link>
            </Typography>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default EmailVerification; 