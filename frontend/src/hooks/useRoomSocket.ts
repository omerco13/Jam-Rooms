'use client';

import { useEffect } from 'react';
import { socketManager } from '@/utils/socket';
import { RoomDetails } from '@/types';

export function useRoomSocket({
  code,
  userId,
  userName,
  instrument,
  onRoomData,
  onSongSelected,
  onRoomClosed,
}: {
  code: string;
  userId: number | null,
  userName: string,
  instrument: string,
  onRoomData: (room: any) => void;
  onSongSelected: () => void;
  onRoomClosed: () => void;
}) {
  useEffect(() => {
    const socket = socketManager.getSocket() ?? socketManager.connect();

    const handleConnect = () => {
      socket.emit('join_room', {
        room_code: code,
        user_id: userId,
        name: userName,
        instrument: instrument,
      });
    };
  
    socket.on('connect', handleConnect);

    const handleParticipantsUpdated = (data: RoomDetails) => {
      onRoomData(data);
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
      socket.off('connect', handleConnect);
      socket.off('participants_updated', handleParticipantsUpdated);
      socket.off('song_selected', handleSongSelected);
      socket.off('close_room', handleRoomClosed);
    };
  }, [code, userName, instrument]);
}

