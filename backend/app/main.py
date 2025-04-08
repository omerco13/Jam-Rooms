import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))


from fastapi import FastAPI, HTTPException, Depends, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from app.models import Room, Person, Song
from app.schemas import CreateRoomRequest
from app.database import get_db
from sqlalchemy.orm import Session
from app.song_search import search_songs_by_query
import socketio
from app.socket_manager import sio
import eventlet
import eventlet.wsgi

app = FastAPI()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "https://jam-rooms.vercel.app"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/rooms/")
async def create_room(request: CreateRoomRequest, db: Session = Depends(get_db)):
    import random, string
    from app.socket_manager import sio
    room_code = ''.join(random.choices(string.ascii_uppercase + string.digits, k=6))
    new_room = Room(room_code=room_code, admin=request.name)
    db.add(new_room)
    db.commit()
    db.refresh(new_room)
    new_person = Person(name=request.name, instrument=request.instrument, room_code=room_code, role='admin')
    db.add(new_person)
    db.commit()

    if request.sid:
        await sio.enter_room(request.sid, room_code)
        await sio.emit("room_created", {
            "room_code": room_code,
            "user_id": new_person.id,
        }, to=request.sid)

    return {"room_code": room_code}

@app.get("/rooms/")
def get_rooms(db: Session = Depends(get_db)):
    rooms = db.query(Room).all()
    return {"rooms": [room.room_code for room in rooms]}

@app.get("/rooms/{room_code}")
def get_room_details(
    room_code: str,
    db: Session = Depends(get_db),
    user_id: int = Query(None)
):
    room = db.query(Room).filter(Room.room_code == room_code).first()
    if not room:
        raise HTTPException(status_code=404, detail="Room not found")
    participants = db.query(Person).filter(Person.room_code == room_code).all()
    people = [{"id": p.id, "name": p.name, "instrument": p.instrument, "role": p.role} for p in participants]
    me = None
    if user_id:
        person = db.query(Person).filter(Person.id == user_id, Person.room_code == room_code).first()
        if person:
            me = {
                "id": person.id,
                "name": person.name,
                "instrument": person.instrument,
                "role": person.role
            }
    current_song = None
    if room.current_song_id:
        song = db.query(Song).filter(Song.id == room.current_song_id).first()
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
        "me": me,
        "current_song": current_song
    }

@app.get("/songs/search")
def search_songs(q: str):
    results = search_songs_by_query(q)
    return JSONResponse(content={"results": results})

@app.get("/")
def read_root():
    return {"message": "Welcome to JaMoveo API"}

app = socketio.WSGIApp(sio, other_asgi_app=app)

if __name__ == "__main__":
    import os
    port = int(os.environ.get("PORT", 10000))
    eventlet.wsgi.server(eventlet.listen(('0.0.0.0', port)), app)

