import { useEffect, useRef } from 'react';
import { socketManager } from '@/utils/socket';
import { getRoomDetails } from '@/utils/api';

export function useRoomSocket({
  code,
  onRoomData,
  onSongSelected,
  onRoomClosed,
}: {
  code: string;
  onRoomData: (room: any) => void;
  onSongSelected: () => void;
  onRoomClosed: () => void;
}) {
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const socket = socketManager.getSocket() ?? socketManager.connect();

    const handleParticipantsUpdated = () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(async () => {
        try {
          const data = await getRoomDetails(code);
          onRoomData(data);
        } catch (err) {
          console.error('Error updating participants:', err);
        }
      }, 200);
    };

    const handleSongSelected = () => {
      onSongSelected();
    };

    const handleRoomClosed = () => {
      onRoomClosed();
    };

    socket.on('participants_updated', handleParticipantsUpdated);
    socket.on('song_selected', handleSongSelected);
    socket.on('close_room', handleRoomClosed);

    return () => {
      socket.off('participants_updated', handleParticipantsUpdated);
      socket.off('song_selected', handleSongSelected);
      socket.off('close_room', handleRoomClosed);
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [code]);
}
