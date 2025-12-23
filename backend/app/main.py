from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
import os
from dotenv import load_dotenv

from app.models import CreateRoomRequest, CreateRoomResponse, PersonResponse, SongResponse, RoomDetailsResponse, SearchSongsResponse
from app.database import get_db, engine

from app.bll.song_bll import SongBLL
from app.bll.room_bll import RoomBLL
from app.bll.person_bll import PersonBLL
from app.socket_manager import sio
import random, string
import socketio


from app.tables import Base, Song, Room, Person

load_dotenv()

app = FastAPI()

# Get CORS origins from environment variable
cors_origins = os.getenv("CORS_ORIGINS", "http://localhost:3000").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/rooms/", response_model=CreateRoomResponse)
def create_room(request: CreateRoomRequest, db: Session = Depends(get_db)):
    room_bll = RoomBLL(db)

    # Get an available color room name
    room_name = room_bll.get_available_room_name()
    if not room_name:
        raise HTTPException(status_code=503, detail="No available rooms. All color rooms are occupied.")

    # Create room with password
    room_bll.create_room(room_name, request.name, request.password)
    new_person = PersonBLL(db).add_person(
        name=request.name, instrument=request.instrument, room_code=room_name, role="admin"
    )
    return CreateRoomResponse(room_code=room_name, user_id=new_person.id)

@app.get("/rooms/")
def get_rooms(db: Session = Depends(get_db)):
    rooms = RoomBLL(db).get_all_rooms()
    return {"rooms": [room.room_code for room in rooms]}

@app.get("/rooms/{room_code}", response_model=RoomDetailsResponse)
def get_room_details(room_code: str, db: Session = Depends(get_db)):
    room = RoomBLL(db).get_room(room_code)
    participants = PersonBLL(db).get_participants_by_room(room_code)
    people = [PersonResponse.model_validate(p) for p in participants]
    current_song = None
    if room.current_song_id:
        song = SongBLL(db).get_song_by_id(room.current_song_id)
        if song:
            current_song = SongResponse.model_validate(song)
    return RoomDetailsResponse(
        room_code=room.room_code,
        current_song_id=room.current_song_id,
        people=people,
        current_song=current_song
    )

@app.get("/songs/search", response_model=SearchSongsResponse)
def search_songs(q: str, db: Session = Depends(get_db)):
    songs = SongBLL(db).search_songs(q)
    results = [SongResponse.model_validate(song) for song in songs]
    return SearchSongsResponse(results=results)

@app.get("/")
def read_root():
    return {"message": "Welcome to JaMoveo API"}

Base.metadata.create_all(bind=engine)
app = socketio.ASGIApp(sio, other_asgi_app=app, socketio_path="socket.io")

