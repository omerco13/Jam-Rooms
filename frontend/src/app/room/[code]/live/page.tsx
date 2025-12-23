'use client';

import { getOrConnectSocket } from '@/utils/socket';
import { getRoomDetails } from '@/utils/api';
import { useParams, useRouter } from 'next/navigation';
import { useRef, useEffect, useState } from 'react';
import { Container, Box, Paper, Typography, Button } from '@mui/material';
import { Person, Song} from '@/types';
import { useRoomParams } from '@/hooks/useRoomParams';
import { ErrorMessage } from '@/components/ErrorMessage';
import { LoadingSpinner } from '@/components/LoadingSpinner';

export default function LivePage() {
  const { code } = useParams();
  const router = useRouter();
  const { userId: parsedUserId, userName: userNameParam, instrument: instrumentParam, isValid, error: paramError } = useRoomParams();

  const [song, setSong] = useState<Song | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const isRedirectingRef = useRef(false);

  // Check for parameter validation errors
  if (!isValid && paramError) {
    return <ErrorMessage message={paramError} maxWidth="md" />;
  }

  const redirectToRoom = () => {
    router.push(
      `/room/${code}?user_id=${parsedUserId}&instrument=${instrumentParam}&name=${encodeURIComponent(userNameParam ?? '')}`
    );
  };

  const handleStopLive = () => {
    if (isRedirectingRef.current) return;

    isRedirectingRef.current = true;
    const socket = getOrConnectSocket();
    socket?.emit('close_song', { room_code: code, user_id: parsedUserId });
    redirectToRoom();
  };

  // Fetch room data to get current song and admin role
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const data = await getRoomDetails(code as string);

        // If no song is selected, redirect back to room
        if (!data.current_song) {
          console.log('[LivePage] No current song, redirecting to room');
          redirectToRoom();
          return;
        }

        // Set song and admin status
        setSong(data.current_song);

        const me = data.people.find((p: Person) => p.id === parsedUserId);
        setIsAdmin(me?.role === 'admin');
      } catch (err) {
        console.error('Failed to fetch initial data:', err);
        redirectToRoom();
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, []);

  useEffect(() => {
    const socket = getOrConnectSocket();

    const handleSongOver = () => {
      if (isRedirectingRef.current) return;
      isRedirectingRef.current = true;
      redirectToRoom();
    };

    socket.on('song_over', handleSongOver);

    return () => {
      socket.off('song_over', handleSongOver);
      isRedirectingRef.current = false;
    };
  }, [code, router]);

  if (loading) {
    return <LoadingSpinner message="Loading song..." maxWidth="md" />;
  }

  if (!song) {
    return null;
  }
  

  return (
    <Container maxWidth="md">
      <Box sx={{ py: 6 }}>
        <Paper sx={{ p: 4 }}>
          <Typography variant="h4" align="center" gutterBottom>
            {song.name.replace(/_/g, ' ')} - {song.singer}
          </Typography>

          {isAdmin && (
            <Box sx={{ textAlign: 'center', mb: 4 }}>
              <Button
                variant="contained"
                color="error"
                onClick={handleStopLive}
                disabled={isRedirectingRef.current}
              >
                Stop Live
              </Button>
            </Box>
          )}

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {song.content.map((line, idx) => (
              <Box
                key={idx}
                sx={{
                  display: 'flex',
                  gap: 2,
                  flexWrap: 'wrap',
                  justifyContent: 'center',
                }}
              >
                {line.map((chunk, i) => (
                  <Box key={i} sx={{ textAlign: 'center', mx: 1 }}>
                    <Box sx={{ minHeight: 32, textAlign: 'center' }}>
                      {instrumentParam !== 'Singer' ? (
                        <Typography
                          variant="body2"
                          color="primary"
                          sx={{ fontWeight: 500, height: 20 }}
                        >
                          {chunk.chords ?? '\u00A0'}
                        </Typography>
                      ) : (
                        <Box sx={{ height: 20 }} />
                      )}
                      <Typography variant="h6">{chunk.lyrics}</Typography>
                    </Box>
                  </Box>
                ))}
              </Box>
            ))}
          </Box>
        </Paper>
      </Box>
    </Container>
  );
}
