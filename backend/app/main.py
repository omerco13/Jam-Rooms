from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from app.tables import Song
from app.models import CreateRoomRequest
from app.database import get_db
from sqlalchemy.orm import Session
from app.bll.song_bll import SongBLL
from app.bll.room_bll import RoomBLL
from app.bll.person_bll import PersonBLL
import socketio
from app.socket_manager import sio
import random, string
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
            "http://localhost:3000",
            "https://jam-rooms.vercel.app",
            "https://jam-rooms-omer-cohens-projects.vercel.app",
            "https://jam-rooms-a4a29jfdu-omer-cohens-projects.vercel.app",
            "https://jam-rooms-git-main-omer-cohens-projects.vercel.app"
        ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/rooms/")
async def create_room(request: CreateRoomRequest, db: Session = Depends(get_db)):
    room_code = ''.join(random.choices(string.ascii_uppercase + string.digits, k=6))
    RoomBLL(db).create_room(room_code, request.name)
    new_person = PersonBLL(db).add_person(
    name=request.name, instrument=request.instrument, room_code=room_code, role="admin"
    )

    if request.sid:
        await sio.enter_room(request.sid, room_code)
        await sio.emit("room_created", {
            "room_code": room_code,
            "user_id": new_person.id,
        }, to=request.sid)
    return {"room_code": room_code}

@app.get("/rooms/")
def get_rooms(db: Session = Depends(get_db)):
    rooms = RoomBLL(db).get_all_rooms()
    return {"rooms": [room.room_code for room in rooms]}

@app.get("/rooms/{room_code}")
def get_room_details(room_code: str, db: Session = Depends(get_db)):
    room = RoomBLL(db).get_room(room_code)
    participants = PersonBLL(db).get_participants_by_room(room_code)
    people = [{"id": p.id, "name": p.name, "instrument": p.instrument, "role": p.role} for p in participants]
    current_song = None
    if room.current_song_id:
        song = SongBLL(db).get_song_by_id(room.current_song_id)
        if song:
            current_song = {
                "id": song.id,
                "name": song.name,
                "singer": song.singer,
                "content": song.content
            }
    return {
        "room_code": room.room_code,
        "current_song_id": room.current_song_id,
        "people": people,
        "current_song": current_song
    }

@app.get("/songs/search")
def search_songs(q: str, db: Session = Depends(get_db)):
    songs = SongBLL(db).search_songs(q)
    results = [
        {
            "id": song.id,
            "name": song.name,
            "singer": song.singer,
            "content": song.content
        }
        for song in songs
    ]
    return JSONResponse(content={"results": results})

@app.get("/songs/{song_id}")
def get_song_by_id(song_id: int, db: Session = Depends(get_db)):
    song = SongBLL(db).get_song_by_id(song_id)
    return {
        "id": song.id,
        "name": song.name,
        "singer": song.singer,
        "content": song.content
    }

@app.get("/")
def read_root():
    return {"message": "Welcome to JaMoveo API"}

app = socketio.ASGIApp(sio, other_asgi_app=app)

