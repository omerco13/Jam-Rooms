'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  Container, Box, Typography, Button, FormControl, InputLabel,
  Select, MenuItem, Paper, TextField
} from '@mui/material';
import { socketManager } from '@/utils/socket';

const instruments = ['Guitar', 'Piano', 'Bass', 'Drums', 'Singer'];
const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function CreateRoomPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [instrument, setInstrument] = useState('');

  const handleRoomCreated = useCallback((data: { room_code: string; user_id: number }) => {
      router.push(
        `/room/${data.room_code}?user_id=${data.user_id}&instrument=${instrument}&name=${encodeURIComponent(name)}`
      );
    },
    [name, instrument, router]
  );

  useEffect(() => {
    const socket = socketManager.getSocket() ?? socketManager.connect();
    socket.on('room_created', handleRoomCreated);
    return () => {
      socket.off('room_created', handleRoomCreated);
    };
  }, [handleRoomCreated]);

  const handleCreateRoom = async () => {
    const socket = socketManager.getSocket() ?? socketManager.connect();
    const sid = socket?.id;

    try {
      const response = await fetch(`${API_URL}/rooms/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, instrument, sid }),
      });

      if (!response.ok) throw new Error('Failed to create room');
    } catch (error) {

      alert('Something went wrong while creating the room.');
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
            <TextField
              label="Your Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              fullWidth
              required
            />

            <FormControl fullWidth required>
              <InputLabel>Instrument</InputLabel>
              <Select value={instrument} onChange={(e) => setInstrument(e.target.value)}>
                {instruments.map((inst) => (
                  <MenuItem key={inst} value={inst}>
                    {inst}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Button
              variant="contained"
              onClick={handleCreateRoom}
              disabled={!name || !instrument}
              sx={{ py: 1.5 }}
            >
              Create Room
            </Button>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
}
