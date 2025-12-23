'use client';

import { Container, Box, Typography } from '@mui/material';

interface LoadingSpinnerProps {
  message?: string;
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
}

export function LoadingSpinner({ message = 'Loading...', maxWidth = 'sm' }: LoadingSpinnerProps) {
  return (
    <Container maxWidth={maxWidth}>
      <Box sx={{ py: 6, textAlign: 'center' }}>
        <Typography>{message}</Typography>
      </Box>
    </Container>
  );
}
