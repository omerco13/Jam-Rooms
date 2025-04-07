import { socketManager } from './socket';
import { Person } from '@/types';

export function registerRoomListeners({
  onParticipantsUpdated,
  onSongSelected,
}: {
  onParticipantsUpdated: (data: { participants: Person[] }) => void;
  onSongSelected: () => void;
}) {
  const socket = socketManager.getSocket() ?? socketManager.connect();

  const handleParticipants = (data: { participants: any[] }) => {
    onParticipantsUpdated(data);
  };

  const handleSong = () => {
    onSongSelected();
  };

  const handleSessionEnd = () => {
    localStorage.clear();
    window.location.href = '/';
  };

  const handleJoinRoom = (data: { user_id: number }) => {
    localStorage.setItem('user_id', String(data.user_id));
  };

  socket.on('participants_updated', handleParticipants);
  socket.on('song_selected', handleSong);
  socket.on('session_ended', handleSessionEnd);
  socket.on('joined_room', handleJoinRoom);

  return () => {
    socket.off('participants_updated', handleParticipants);
    socket.off('song_selected', handleSong);
    socket.off('session_ended', handleSessionEnd);
    socket.off('joined_room', handleJoinRoom);
  };
}
