import socketio
from app.database import db_session
from app.models import Room, Person

sio = socketio.AsyncServer(
    async_mode='asgi',
    cors_allowed_origins=[
        "http://localhost:3000",
        "https://jam-rooms.vercel.app",
        "https://jam-rooms-omer-cohens-projects.vercel.app",
        "https://jam-rooms-a4a29jfdu-omer-cohens-projects.vercel.app"
    ]
)

@sio.event
async def join_room(sid, room_data):
    room_code = room_data.get("room_code")
    name = room_data.get("name")
    instrument = room_data.get("instrument")

    await sio.enter_room(sid, room_code)
    print(f"[ROOM DEBUG] {sid} joined {room_code}. Current rooms: {sio.rooms(sid)}")
    with db_session() as db:
        
        print(f"[INFO] Adding new person: {name} to room {room_code}")
        new_person = Person(name=name, instrument=instrument, room_code=room_code, role='participant')
        db.add(new_person)
        db.commit()
        db.refresh(new_person)
        user_id = new_person.id

        await sio.emit("joined_room", {"user_id": user_id}, to=sid)
        people = db.query(Person).filter_by(room_code=room_code).all()
        participants = [{"name": p.name, "instrument": p.instrument, "role": p.role} for p in people]

    await sio.emit("participants_updated", {"participants": participants}, room=room_code)

@sio.event
async def leave_room(sid, room_data):
    room_code = room_data.get("room_code")
    name = room_data.get("name")
    print(f"[LEAVE_ROOM] {name} (socket {sid}) is leaving {room_code}")
    await sio.leave_room(sid, room_code)

    with db_session() as db:
        person = db.query(Person).filter_by(name=name, room_code=room_code).first()
        if person:
            db.delete(person)
            db.commit()
            print(f"[INFO] Removed {name} from room {room_code}")
        else:
            print(f"[WARN] Tried to remove {name}, but they weren't found in DB")

        people = db.query(Person).filter_by(room_code=room_code).all()
        participants = [{"name": p.name, "instrument": p.instrument, "role": p.role} for p in people]
    await sio.emit("participants_updated", {"participants": participants}, room=room_code)

@sio.event
async def select_song(sid, song_data): # can i delete the sid?
    room_code = song_data.get('room_code')
    song = song_data.get('song')
    name = song_data.get('name')

    if not (room_code and song and name): # can i remove room_code and name?
        return

    with db_session() as db:
        room = db.query(Room).filter(Room.room_code == room_code).first()

        if room and room.admin == name:
            room.current_song_id = song.get('id') if song.get('id') else None
            db.commit()

    await sio.emit('song_selected', {'song': song}, room=room_code)

@sio.event
async def close_room(sid, room_code):
    with db_session() as db:
        room = db.query(Room).filter(Room.room_code == room_code).first()
        if room:
            db.query(Person).filter(Person.room_code == room_code).delete()
            db.delete(room)
            db.commit()
    await sio.emit('close_room', {}, room=room_code)

@sio.event
async def close_song(sid, room_code): # change to end song
    with db_session() as db:
        room = db.query(Room).filter(Room.room_code == room_code).first()
        if room:
            room.current_song_id = None # delete the if 
            db.commit()
    await sio.emit('song_over', {}, room=room_code)

    
