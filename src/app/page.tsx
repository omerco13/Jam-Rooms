'use client';

import { useRouter } from 'next/navigation';
import { Container, Box, Typography, Button } from '@mui/material';
import { MusicNote as MusicNoteIcon, Group as GroupIcon } from '@mui/icons-material';

export default function HomePage() {
    const router = useRouter();

    return (
        <Container maxWidth="sm">
            <Box sx={{ 
                minHeight: '100vh', 
                display: 'flex', 
                flexDirection: 'column', 
                justifyContent: 'center', 
                gap: 4 
            }}>
                <Typography variant="h2" component="h1" align="center" gutterBottom>
                    JaMoveo
                </Typography>

                <Typography variant="h5" align="center" color="text.secondary" sx={{ mb: 3 }}>
                    Create or join a jam session
                </Typography>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <Button
                        variant="contained"
                        color="primary"
                        size="large"
                        startIcon={<MusicNoteIcon />}
                        onClick={() => router.push('/create-room')}
                        sx={{ py: 2 }}
                    >
                        Create Room
                    </Button>

                    <Button
                        variant="outlined"
                        color="primary"
                        size="large"
                        startIcon={<GroupIcon />}
                        onClick={() => router.push('/join-room')}
                        sx={{ py: 2 }}
                    >
                        Join Room
                    </Button>
                </Box>
            </Box>
        </Container>
    );
}
