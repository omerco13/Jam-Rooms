export const API_URL = process.env.NEXT_PUBLIC_API_URL;

if (!API_URL) {
  throw new Error("NEXTPUBLIC_API_URL is not defined.");
}


// ✅ Gets all rooms
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


// ✅ Gets full details of a single room
export async function getRoomDetails(roomCode: string) {
  const res = await fetch(`${API_URL}/rooms/${roomCode}`);
  if (!res.ok) throw new Error('Failed to get room');
  return res.json();
}


// ✅ Searches songs by query
export async function searchSongs(query: string) {
  const res = await fetch(`${API_URL}/songs/search?q=${encodeURIComponent(query)}`);
  if (!res.ok) throw new Error("Failed to search songs");
  return res.json();
}
