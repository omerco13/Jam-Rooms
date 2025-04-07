'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { socketManager } from '@/utils/socket';
import {
  Container, Box, Typography, Button, FormControl, InputLabel,
  Select, MenuItem, Paper, TextField
} from '@mui/material';


const instruments = ['Guitar', 'Piano', 'Bass', 'Drums', 'Singer'];
const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function JoinRoomPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [instrument, setInstrument] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [availableRooms, setAvailableRooms] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);


  const handleJoinedRoom = useCallback((data: { user_id: number }) => {
    router.push(
      `/room/${roomCode}?user_id=${data.user_id}&instrument=${instrument}&name=${encodeURIComponent(name)}`
    );
  }, [name, instrument, roomCode, router]);


  const handleJoinRoom = () => {
    const socket = socketManager.getSocket() ?? socketManager.connect();
    socket.emit('join_room', {
      room_code: roomCode,
      name,
      instrument,
    });
  };


  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const response = await fetch(`${API_URL}/rooms/`);
        const data = await response.json();
        setAvailableRooms(data.rooms);
      } catch (error) {
        console.error('Error fetching rooms:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchRooms();
  }, []);


  useEffect(() => {
    const socket = socketManager.getSocket() ?? socketManager.connect();
    socket.on('joined_room', handleJoinedRoom);
    return () => {
      socket.off('joined_room', handleJoinedRoom);
    };
  }, [handleJoinedRoom]);

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

          <TextField
            fullWidth
            label="Enter your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            sx={{ mb: 4 }}
          />

          <FormControl fullWidth sx={{ mb: 4 }}>
            <InputLabel>Select your instrument</InputLabel>
            <Select
              value={instrument}
              label="Select your instrument"
              onChange={(e) => setInstrument(e.target.value)}
            >
              {instruments.map((inst) => (
                <MenuItem key={inst} value={inst}>
                  {inst}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

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
          
          <Button
            variant="contained"
            color="primary"
            size="large"
            fullWidth
            onClick={handleJoinRoom}
            disabled={!instrument || !roomCode || !name}
            sx={{ py: 2 }}
          >
            Join Room
          </Button>
        </Paper>
      </Box>
    </Container>
  );
}
