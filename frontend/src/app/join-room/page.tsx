'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { getOrConnectSocket } from '@/utils/socket';
import {
  Container, Box, Typography, Button, FormControl, InputLabel,
  Select, MenuItem, Paper, TextField
} from '@mui/material';
import { getRooms } from '@/utils/api';
import { InstrumentSelect } from '@/components/InstrumentSelect';

export default function JoinRoomPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [instrument, setInstrument] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [password, setPassword] = useState('');
  const [availableRooms, setAvailableRooms] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');


  const handleJoinedRoom = useCallback((data: { user_id: number }) => {
    router.push(
      `/room/${roomCode}?user_id=${data.user_id}&instrument=${instrument}&name=${encodeURIComponent(name)}`
    );
  }, [name, instrument, roomCode, router]);

  const handleError = useCallback((data: { message: string }) => {
    setError(data.message);
  }, []);

  const handleJoinRoom = () => {
    setError(''); // Clear previous errors
    const socket = getOrConnectSocket();
    socket.emit('join_room', {
      room_code: roomCode,
      name,
      instrument,
      password,
    });
  };


  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const data = await getRooms();
        setAvailableRooms(data.rooms);
      } catch (err) {
        console.error('Error fetching rooms:', err);
        setError('Failed to load available rooms. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    fetchRooms();
  }, []);


  useEffect(() => {
    const socket = getOrConnectSocket();
    socket.on('joined_room', handleJoinedRoom);
    socket.on('error', handleError);
    return () => {
      socket.off('joined_room', handleJoinedRoom);
      socket.off('error', handleError);
    };
  }, [handleJoinedRoom, handleError]);

  return (
    <Container maxWidth="sm">
      <Box sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        gap: 4
      }}>
        <Paper sx={{ p: 4 }}>
          <Typography variant="h4" component="h1" align="center" gutterBottom>
            Join a Room
          </Typography>

          <Typography variant="body1" align="center" color="text.secondary" sx={{ mb: 4 }}>
            Enter your details and join a room
          </Typography>

          {error && (
            <Typography color="error" align="center" sx={{ mb: 3 }}>
              {error}
            </Typography>
          )}

          <TextField
            fullWidth
            label="Enter your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            sx={{ mb: 4 }}
          />

          <InstrumentSelect
            value={instrument}
            onChange={setInstrument}
            label="Select your instrument"
            sx={{ mb: 4 }}
          />

          <FormControl fullWidth sx={{ mb: 4 }}>
            <InputLabel>Select a room</InputLabel>
            <Select
              value={roomCode}
              label="Select a room"
              onChange={(e) => setRoomCode(e.target.value)}
              disabled={loading}
            >
              <MenuItem value="">
                <em>-- Choose a Room --</em>
              </MenuItem>
              {availableRooms.map((code) => (
                <MenuItem key={code} value={code}>
                  {code}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            fullWidth
            label="Room Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            sx={{ mb: 4 }}
            helperText="Enter the password for this room"
          />

          <Button
            variant="contained"
            color="primary"
            size="large"
            fullWidth
            onClick={handleJoinRoom}
            disabled={!instrument || !roomCode || !name || !password}
            sx={{ py: 2 }}
          >
            Join Room
          </Button>
        </Paper>
      </Box>
    </Container>
  );
}
