import React from 'react';
import { CircularProgress, Box } from '@mui/material';

interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';
  sx?: object;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ size = 'medium', sx = {} }) => {
  const sizeMap = {
    small: 20,
    medium: 40,
    large: 60
  };

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', ...sx }}>
      <CircularProgress size={sizeMap[size]} />
    </Box>
  );
};

export default LoadingSpinner; 