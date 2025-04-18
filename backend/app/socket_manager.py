import socketio
from app.database import db_session
from app.bll.room_bll import RoomBLL
from app.bll.person_bll import PersonBLL


sio = socketio.AsyncServer(
    async_mode='asgi',
    cors_allowed_origins=[
        "http://localhost:3000",
        "https://jam-rooms.vercel.app",
        "https://jam-rooms-omer-cohens-projects.vercel.app",
        "https://jam-rooms-a4a29jfdu-omer-cohens-projects.vercel.app",
        "https://jam-rooms-git-main-omer-cohens-projects.vercel.app"
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
        new_person = PersonBLL(db).add_person(
            name=name, instrument=instrument, room_code=room_code, role="participant"
        )
        user_id = new_person.id

        await sio.emit("joined_room", {"user_id": user_id}, to=sid)
        people = PersonBLL(db).get_participants_by_room(room_code)
        participants = [{"name": p.name, "instrument": p.instrument, "role": p.role} for p in people]

    await sio.emit("participants_updated", {"participants": participants}, room=room_code)

@sio.event
async def leave_room(sid, room_data):
    room_code = room_data.get("room_code")
    person_id = room_data.get("user_id")
    print(f"[LEAVE_ROOM] user_id={person_id} (socket {sid}) is leaving {room_code}")
    await sio.leave_room(sid, room_code)

    with db_session() as db:
        PersonBLL(db).remove_person(person_id)
        people = PersonBLL(db).get_participants_by_room(room_code)
        participants = [{"name": p.name, "instrument": p.instrument, "role": p.role} for p in people]
    await sio.emit("participants_updated", {"participants": participants}, room=room_code)

@sio.event
async def select_song(sid, song_data):
    room_code = song_data.get('room_code')
    song = song_data.get('song')
    if not song:
        return
    with db_session() as db:
        RoomBLL(db).update_current_song(room_code, song.get("id"))
    await sio.emit('song_selected', {'song': song}, room=room_code)

@sio.event
async def close_room(sid, room_code):
    with db_session() as db:
        PersonBLL(db).remove_all_by_room(room_code)
        RoomBLL(db).delete_room(room_code)
    await sio.emit('close_room', {}, room=room_code)

@sio.event
async def close_song(sid, room_code):
    with db_session() as db:
        RoomBLL(db).clear_current_song(room_code)
    await sio.emit('song_over', {}, room=room_code)

    
