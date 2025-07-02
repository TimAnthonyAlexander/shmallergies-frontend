import React from 'react';
import { Alert, AlertTitle, Box, IconButton, List, ListItem, ListItemText, Typography } from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';

interface ErrorMessageProps {
  message: string;
  errors?: Record<string, string[]>;
  onDismiss?: () => void;
  sx?: object;
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({ 
  message, 
  errors, 
  onDismiss, 
  sx = {} 
}) => {
  return (
    <Alert 
      severity="error" 
      sx={{ ...sx }}
      action={
        onDismiss && (
          <IconButton
            aria-label="close"
            color="inherit"
            size="small"
            onClick={onDismiss}
          >
            <CloseIcon fontSize="inherit" />
          </IconButton>
        )
      }
    >
      <AlertTitle>{message}</AlertTitle>
      {errors && Object.keys(errors).length > 0 && (
        <Box sx={{ mt: 1 }}>
          {Object.entries(errors).map(([field, fieldErrors]) => (
            <Box key={field} sx={{ mb: 1 }}>
              <Typography variant="body2" sx={{ fontWeight: 'bold', textTransform: 'capitalize' }}>
                {field}:
              </Typography>
              <List dense sx={{ py: 0 }}>
                {fieldErrors.map((error, index) => (
                  <ListItem key={index} sx={{ py: 0, px: 1 }}>
                    <ListItemText 
                      primary={`• ${error}`} 
                      primaryTypographyProps={{ variant: 'body2' }}
                    />
                  </ListItem>
                ))}
              </List>
            </Box>
          ))}
        </Box>
      )}
    </Alert>
  );
};

export default ErrorMessage; 