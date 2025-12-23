'use client';

import { Container, Box, Typography, Button } from '@mui/material';
import { useRouter } from 'next/navigation';

interface ErrorMessageProps {
  message: string;
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  showHomeButton?: boolean;
}

export function ErrorMessage({ message, maxWidth = 'sm', showHomeButton = true }: ErrorMessageProps) {
  const router = useRouter();

  return (
    <Container maxWidth={maxWidth}>
      <Box sx={{ py: 6, textAlign: 'center' }}>
        <Typography color="error">{message}</Typography>
        {showHomeButton && (
          <Button onClick={() => router.push('/')} sx={{ mt: 2 }}>
            Go Home
          </Button>
        )}
      </Box>
    </Container>
  );
}
