from typing import List, Optional
from pydantic import BaseModel

class CreateRoomRequest(BaseModel):
    name: str
    instrument: str
    password: str

class CreateRoomResponse(BaseModel):
    room_code: str
    user_id: int

class JoinRoomRequest(BaseModel):
    name: str
    instrument: str
    password: str

class PersonResponse(BaseModel):
    id: int
    name: str
    instrument: str
    role: str

    class Config:
        from_attributes = True

class SongResponse(BaseModel):
    id: int
    name: str
    singer: str
    content: list

    class Config:
        from_attributes = True

class RoomDetailsResponse(BaseModel):
    room_code: str
    current_song_id: Optional[int] = None
    people: List[PersonResponse]
    current_song: Optional[SongResponse] = None

class SearchSongsResponse(BaseModel):
    results: List[SongResponse]
