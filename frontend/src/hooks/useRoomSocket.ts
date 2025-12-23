'use client';

import { useEffect } from 'react';
import { getOrConnectSocket, socketManager } from '@/utils/socket';
import { RoomDetails, Song } from '@/types';

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
  onRoomData: (room: RoomDetails) => void;
  onSongSelected: (song: Song) => void;
  onRoomClosed: () => void;
}) {
  useEffect(() => {
    const socket = getOrConnectSocket();

    const handleConnect = () => {
      // Only emit join_room if we haven't joined this room yet
      // Backend will handle deduplication if we somehow emit multiple times
      if (!socketManager.hasJoinedRoom(code)) {
        console.log(`[useRoomSocket] Emitting join_room for ${code}`);
        socket.emit('join_room', {
          room_code: code,
          user_id: userId,
          name: userName,
          instrument: instrument,
        });
        socketManager.markRoomAsJoined(code);
      } else {
        console.log(`[useRoomSocket] Already joined room ${code}, skipping`);
      }
    };

    // If already connected, join immediately
    if (socket.connected) {
      handleConnect();
    }

    socket.on('connect', handleConnect);

    const handleParticipantsUpdated = (data: RoomDetails) => {
      onRoomData(data);
    };

    const handleSongSelected = (data: { song: Song }) => {
      onSongSelected(data.song);
    };

    const handleRoomClosed = () => {
      onRoomClosed();
    };

    const handleError = (data: { message: string }) => {
      console.error(`[useRoomSocket] Socket error for room ${code}:`, data.message);
      // Only show errors that are relevant to this room
      // Don't show "Room not found" as it might be a timing issue
      if (data.message !== 'Room not found') {
        console.warn('[useRoomSocket] Showing alert:', data.message);
      }
    };

    socket.on('participants_updated', handleParticipantsUpdated);
    socket.on('song_selected', handleSongSelected);
    socket.on('room_closed', handleRoomClosed);
    socket.on('error', handleError);

    return () => {
      socket.off('connect', handleConnect);
      socket.off('participants_updated', handleParticipantsUpdated);
      socket.off('song_selected', handleSongSelected);
      socket.off('room_closed', handleRoomClosed);
      socket.off('error', handleError);
    };
  }, [code, userId, userName, instrument, onRoomData, onSongSelected, onRoomClosed]);
}

