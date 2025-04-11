export const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function getRooms() {
  try {
    const response = await fetch(`${API_URL}/rooms/`);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error('Rooms fetch error:', error);
    throw error;
  }
}

export async function getRoomDetails(roomCode: string) {
  const res = await fetch(`${API_URL}/rooms/${roomCode}`);
  if (!res.ok) throw new Error('Failed to get room');
  return res.json();
}

export async function searchSongs(query: string) {
  const res = await fetch(`${API_URL}/songs/search?q=${encodeURIComponent(query)}`);
  if (!res.ok) throw new Error("Failed to search songs");
  return res.json();
}
