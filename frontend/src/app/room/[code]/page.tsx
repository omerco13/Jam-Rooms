'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {Container, Box, Typography, Button, Paper, TextField} from '@mui/material';
import { useRoomSocket } from '@/hooks/useRoomSocket';
import { useRoomParams } from '@/hooks/useRoomParams';
import { getOrConnectSocket, socketManager } from '@/utils/socket';
import { Song, RoomDetails } from '@/types';
import { getRoomDetails } from '@/utils/api';
import { searchSongs } from '@/utils/api';
import { ErrorMessage } from '@/components/ErrorMessage';
import { LoadingSpinner } from '@/components/LoadingSpinner';

export default function RoomPage() {
  const { code } = useParams();
  const router = useRouter();
  const { userId: parsedUserId, userName, instrument, isValid, error: paramError } = useRoomParams();

  const [room, setRoom] = useState<RoomDetails | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Song[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);

  const goToLivePage = useCallback(() => {
    router.push(`/room/${code}/live?user_id=${parsedUserId}&instrument=${instrument}&name=${encodeURIComponent(userName ?? '')}`);
  }, [code, parsedUserId, instrument, userName, router]);

  const handleRoomData = useCallback((data: RoomDetails) => {
    setRoom(data);
    const me = data.people.find((p) => p.id === parsedUserId);
    setIsAdmin(me?.role === 'admin');
  }, [parsedUserId]);

  const handleSongSelected = useCallback(() => {
    goToLivePage();
  }, [goToLivePage]);

  const handleRoomClosed = useCallback(() => {
    socketManager.leaveRoomTracking(code as string);
    router.push('/');
  }, [code, router]);

  const handleSearch = useCallback(async () => {
    if (!query.trim()) return;

    setSearchLoading(true);
    setError('');
    try {
      const data = await searchSongs(query);
      setResults(data.results);
    } catch (err) {
      setError('Failed to search songs');
    } finally {
      setSearchLoading(false);
    }
  }, [query]);

  const selectSong = useCallback((song: Song) => {
    const socket = getOrConnectSocket();

    socket.emit('select_song', {
      room_code: code,
      user_id: parsedUserId,
      name: userName,
      song: {
        id: song.id,
        name: song.name,
        singer: song.singer,
        content: song.content,
      },
    });
    // Don't navigate here - let the socket event handle it
  }, [code, parsedUserId, userName]);

  const handleLeaveRoom = useCallback(() => {
    const socket = getOrConnectSocket();
    socket.emit('leave_room', { room_code: code, user_id: parsedUserId });
    socketManager.leaveRoomTracking(code as string);
    router.push('/');
  }, [code, parsedUserId, router]);

  const adminPanel = useMemo(() => (
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
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          disabled={searchLoading}
        />
        <Button variant="contained" onClick={handleSearch} disabled={searchLoading || !query.trim()}>
          {searchLoading ? 'Searching...' : 'Search'}
        </Button>
      </Box>

      {results.map((song) => (
        <Paper
          key={song.id}
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
          onClick={() => getOrConnectSocket()?.emit('close_room', { room_code: code, user_id: parsedUserId })}
        >
          Close Room
        </Button>
      </Box>
    </>
  ), [query, searchLoading, results, selectSong, handleSearch, code, parsedUserId]);

  const participantPanel = useMemo(() => (
    <Box sx={{ textAlign: 'center', py: 4 }}>
      <Typography>🎵 Waiting for the next song...</Typography>
      <Button variant="contained" color="error" onClick={handleLeaveRoom} sx={{ mt: 2 }}>
        Leave Room
      </Button>
    </Box>
  ), [handleLeaveRoom]);

  useEffect(() => {
    const fetchInitialRoom = async () => {
      try {
        const data = await getRoomDetails(code as string);
        handleRoomData(data);
      } catch (err) {
        console.error('Failed to fetch room:', err);
        setError('Failed to load room details');
      } finally {
        setLoading(false);
      }
    };

    fetchInitialRoom();
  }, [code, handleRoomData]);

  useRoomSocket({
    code: code as string,
    userId: parsedUserId,
    userName: userName as string,
    instrument: instrument as string,
    onRoomData: handleRoomData,
    onSongSelected: handleSongSelected,
    onRoomClosed: handleRoomClosed,
  });

  useEffect(() => {
    if (room?.current_song_id) {
      goToLivePage();
    }
  }, [room?.current_song_id, goToLivePage]);

  // Check for parameter validation errors
  if (!isValid && paramError) {
    return <ErrorMessage message={paramError} />;
  }

  if (loading) {
    return <LoadingSpinner message="Loading room..." />;
  }

  if (error) {
    return <ErrorMessage message={error} />;
  }

  if (!room) return null;
  
  return (
    <Container maxWidth="sm">
      <Box sx={{ py: 6 }}>
        <Paper sx={{ p: 4 }}>
          <Typography variant="h4" align="center" gutterBottom>
            The {room.room_code}
          </Typography>
  
          <Typography variant="h6" gutterBottom>
            Participants
          </Typography>
  
          {room.people.map((person) => (
            <Paper key={person.id} sx={{ p: 2, my: 1 }}>
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
