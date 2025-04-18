from typing import List, Optional
from pydantic import BaseModel

class CreateRoomRequest(BaseModel):
    name: str
    instrument: str
    sid: Optional[str] = None # can i remove it?

class JoinRoomRequest(BaseModel):
    name: str
    instrument: str

class PersonResponse(BaseModel):
    id: int
    name: str
    instrument: str
    role: str

    class Config:
        from_attributes = True

class RoomResponse(BaseModel):
    room_code: str
    admin: str
    current_song_id: Optional[int] = None
    people: List[PersonResponse] = []

    class Config:
        from_attributes = True

class SongSelection(BaseModel):
    title: str
    artist: str
    lyrics: str
    chords: str
