export type Person = {
    id: number; 
    name: string;
    instrument: string;
    role: string;
  };
  
  export type Song = {
    id: number;
    name: string;
    singer: string;
    content: Array<Array<{ lyrics: string; chords?: string }>>;
  };
  
  export type RoomDetails = {
    room_code: string;
    current_song_id: number | null;
    people: Person[];
  };