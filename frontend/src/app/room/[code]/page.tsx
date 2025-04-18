'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import {Container, Box, Typography, Button, Paper, TextField} from '@mui/material';
import { useRoomSocket } from '@/hooks/useRoomSocket';
import { socketManager } from '@/utils/socket';
import { Song, RoomDetails } from '@/types';
import { getRoomDetails } from '@/utils/api';
import { searchSongs } from '@/utils/api';

export default function RoomPage() {
  const { code } = useParams();
  const router = useRouter();
  const userId = useSearchParams().get('user_id');
  const userName = useSearchParams().get('name');
  const instrument = useSearchParams().get('instrument');

  const [room, setRoom] = useState<RoomDetails | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Song[]>([]);
  const [error, setError] = useState('');

  const goToLivePage = () => {
    router.push(`/room/${code}/live?user_id=${userId}&instrument=${instrument}&name=${encodeURIComponent(userName ?? '')}`);
  };

  const handleRoomData = (data: RoomDetails) => {
    setRoom(data);
    const me = data.people.find((p) => String(p.id) === userId);
    setIsAdmin(me?.role === 'admin');
  };
  
  const handleSongSelected = () => {
    goToLivePage();
  };
  
  const handleRoomClosed = () => {
    localStorage.clear();
    router.push('/');
  };

  async function handleSearch() {
    try {
      const data = await searchSongs(query);
      setResults(data.results);
    } catch (err) {
      setError('Failed to search songs');
    }
  }

  async function selectSong(song: Song) {
    const socket = socketManager.getSocket() ?? socketManager.connect();
    localStorage.setItem('selectedSongId', String(song.id));

    socket.emit('select_song', {
      room_code: code,
      name: userName,
      song: {
        id: song.id,
        name: song.name,
        singer: song.singer,
        content: song.content,
      },
    });
    goToLivePage();
  }

  function handleLeaveRoom() {
    const socket = socketManager.getSocket() ?? socketManager.connect();
    socket.emit('leave_room', { room_code: code, user_id: userId });
    localStorage.clear();
    router.push('/');
  }

  useEffect(() => {
    const fetchInitialRoom = async () => {
      try {
        const data = await getRoomDetails(code as string);
        handleRoomData(data);
      } catch (err) {
        console.error('Failed to fetch room:', err);
      }
    };

    fetchInitialRoom();
  }, [code]);

  useRoomSocket({
    code: code as string,
    onRoomData: handleRoomData,
    onSongSelected: handleSongSelected,
    onRoomClosed: handleRoomClosed,
  });

  useEffect(() => {
    if (room?.current_song_id) {
      goToLivePage();
    }
  }, [room?.current_song_id, code, router]);

  if (error) return <p style={{ color: 'red' }}>{error}</p>;
  if (!room) return <p>Loading room...</p>;

  const adminPanel = (
    <>
      <Typography variant="h6" gutterBottom>
        Search Songs
      </Typography>
  
      <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
        <TextField
          fullWidth
          placeholder="Search by name or artist"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <Button variant="contained" onClick={handleSearch}>
          Search
        </Button>
      </Box>
  
      {results.map((song, idx) => (
        <Paper
          key={idx}
          sx={{ p: 2, cursor: 'pointer', '&:hover': { backgroundColor: '#f5f5f5' } }}
          onClick={() => selectSong(song)}
        >
          <Typography>
            {song.name.replace(/_/g, ' ')} - {song.singer}
          </Typography>
        </Paper>
      ))}
  
      <Box sx={{ textAlign: 'center', mt: 4 }}>
        <Button
          variant="contained"
          color="error"
          onClick={() => socketManager.getSocket()?.emit('close_room', code)}
        >
          Close Room
        </Button>
      </Box>
    </>
  );
  
  const participantPanel = (
    <Box sx={{ textAlign: 'center', py: 4 }}>
      <Typography>🎵 Waiting for the next song...</Typography>
      <Button variant="contained" color="error" onClick={handleLeaveRoom} sx={{ mt: 2 }}>
        Leave Room
      </Button>
    </Box>
  );
  
  return (
    <Container maxWidth="sm">
      <Box sx={{ py: 6 }}>
        <Paper sx={{ p: 4 }}>
          <Typography variant="h4" align="center" gutterBottom>
            Room: {room.room_code}
          </Typography>
  
          <Typography variant="h6" gutterBottom>
            Participants
          </Typography>
  
          {room.people.map((person, idx) => (
            <Paper key={idx} sx={{ p: 2, my: 1 }}>
              <Typography variant="subtitle1">{person.name}</Typography>
              <Typography variant="body2" color="text.secondary">
                {person.instrument}
              </Typography>
            </Paper>
          ))}
  
          {isAdmin ? adminPanel : participantPanel}
        </Paper>
      </Box>
    </Container>
  );
}
