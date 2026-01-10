'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Container, Box, Typography, Button, Paper, TextField
} from '@mui/material';
import { InstrumentSelect } from '@/components/InstrumentSelect';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function CreateRoomPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [instrument, setInstrument] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleCreateRoom = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${API_URL}/rooms/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, instrument, password }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || 'Failed to create room');
      }

      const data = await response.json();
      router.push(
        `/room/${data.room_code}?user_id=${data.user_id}&instrument=${instrument}&name=${encodeURIComponent(name)}`
      );
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Something went wrong while creating the room.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <Paper sx={{ p: 4, width: '100%' }}>
          <Typography variant="h4" align="center" gutterBottom>
            Create a New Room
          </Typography>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {error && (
              <Typography color="error" align="center">
                {error}
              </Typography>
            )}

            <TextField
              label="Your Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              fullWidth
              required
              disabled={loading}
            />

            <InstrumentSelect
              value={instrument}
              onChange={setInstrument}
              required
              disabled={loading}
            />

            <TextField
              label="Room Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              fullWidth
              required
              disabled={loading}
            />

            <Button
              variant="contained"
              onClick={handleCreateRoom}
              disabled={!name || !instrument || !password || loading}
              sx={{ py: 1.5 }}
            >
              {loading ? 'Creating...' : 'Create Room'}
            </Button>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
}
