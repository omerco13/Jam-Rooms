'use client';

import { socketManager } from '@/utils/socket';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useRef, useEffect, useState } from 'react';
import { Container, Box, Paper, Typography, Button } from '@mui/material';
import { Person, Song} from '@/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function LivePage() {
  const { code } = useParams();
  const searchParams = useSearchParams();
  const userIdParam = searchParams.get('user_id');
  const instrumentParam = searchParams.get('instrument');
  const userNameParam = searchParams.get('name');
  const router = useRouter();

  const [song, setSong] = useState<Song | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const isRedirectingRef = useRef(false);

  const redirectToRoom = () => {
    router.push(
      `/room/${code}?user_id=${userIdParam}&instrument=${instrumentParam}&name=${encodeURIComponent(userNameParam ?? '')}`
    );
  };

  const handleStopLive = () => {
    if (isRedirectingRef.current) return;

    isRedirectingRef.current = true;
    const socket = socketManager.getSocket() ?? socketManager.connect();
    socket?.emit('close_song', code);
    localStorage.removeItem('selectedSongId');
    redirectToRoom();
  };

  const fetchRole = async () => {

    try {
      const res = await fetch(`${API_URL}/rooms/${code}?user_id=${userIdParam}`);
      const data = await res.json();
      const me = data.people.find((p: Person) => String(p.id) === userIdParam);
      setIsAdmin(me?.role === 'admin');
    } catch (err) {
      console.error('Failed to fetch room:', err);
    }
  };

 

  useEffect(() => {
    const songId = localStorage.getItem('selectedSongId');
    if (!songId) {
      redirectToRoom();
      return;
    }
  
    async function fetchSong() {
      try {
        const res = await fetch(`${API_URL}/songs/${songId}`);
        if (!res.ok) {
          throw new Error('Song not found');
        }
        const data = await res.json();
        setSong(data);
      } catch (err) {
        console.error('Failed to fetch song:', err);
        redirectToRoom();
      }
    }
  
    fetchSong();
  }, []);

  useEffect(() => {
    fetchRole();
  }, [code, userIdParam]);

  useEffect(() => {
    const socket = socketManager.getSocket() ?? socketManager.connect();

    const handleSongOver = () => {
      if (isRedirectingRef.current) return;
      isRedirectingRef.current = true;
      localStorage.removeItem('selectedSongId');
      redirectToRoom();
    };

    socket.on('song_over', handleSongOver);

    return () => {
      socket.off('song_over', handleSongOver);
      isRedirectingRef.current = false;
    };
  }, [code, router]);

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
