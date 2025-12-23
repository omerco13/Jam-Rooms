import socketio
import os
from dotenv import load_dotenv
from urllib.parse import unquote
from app.database import db_session
from app.bll.room_bll import RoomBLL
from app.bll.person_bll import PersonBLL
from app.bll.song_bll import SongBLL

load_dotenv()

# Get CORS origins from environment variable
cors_origins = os.getenv("CORS_ORIGINS", "http://localhost:3000").split(",")

sio = socketio.AsyncServer(
    async_mode='asgi',
    cors_allowed_origins=cors_origins
)

async def emit_full_room_update(room_code: str):
    with db_session() as db:
        room = RoomBLL(db).get_room(room_code)
        people = PersonBLL(db).get_participants_by_room(room_code)
        participants = [
            {"id": p.id, "name": p.name, "instrument": p.instrument, "role": p.role}
            for p in people
        ]
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

    await sio.emit("participants_updated", {
        "room_code": room.room_code,
        "current_song_id": room.current_song_id,
        "people": participants,
        "current_song": current_song
    }, room=room_code)

@sio.event
async def join_room(sid, room_data):
    room_code = unquote(room_data.get("room_code"))
    user_id = room_data.get("user_id")
    name = room_data.get("name")
    instrument = room_data.get("instrument")
    password = room_data.get("password")

    with db_session() as db:
        room_bll = RoomBLL(db)

        # Check if room exists
        room = room_bll.get_room(room_code)
        if not room:
            await sio.emit("error", {"message": "Room not found"}, to=sid)
            return

        # If user_id exists, they're reconnecting (admin or returning participant)
        existing_person = PersonBLL(db).get_person_by_id(user_id) if user_id else None

        if existing_person:
            # Reconnecting user - no password needed
            user_id = existing_person.id
        else:
            # New participant - verify password
            if not password or not room_bll.verify_password(room_code, password):
                await sio.emit("error", {"message": "Incorrect password"}, to=sid)
                return

            # Create new participant
            new_person = PersonBLL(db).add_person(
                name=name, instrument=instrument, room_code=room_code, role="participant"
            )
            user_id = new_person.id

    # IMPORTANT: Enter room and emit OUTSIDE db_session to avoid connection issues
    await sio.enter_room(sid, room_code)
    await sio.emit("joined_room", {"user_id": user_id}, to=sid)
    await emit_full_room_update(room_code)

@sio.event
async def leave_room(sid, room_data):
    room_code = unquote(room_data.get("room_code"))
    person_id = room_data.get("user_id")

    await sio.leave_room(sid, room_code)

    with db_session() as db:
        PersonBLL(db).remove_person(person_id)
    await emit_full_room_update(room_code)

@sio.event
async def select_song(sid, song_data):
    room_code = unquote(song_data.get('room_code'))
    user_id = song_data.get('user_id')
    song = song_data.get('song')

    if not song or not room_code:
        await sio.emit('error', {'message': 'Missing song or room code'}, to=sid)
        return

    # Authorization check: only admin can select songs
    with db_session() as db:
        person_bll = PersonBLL(db)
        if not user_id or not person_bll.is_admin(user_id, room_code):
            await sio.emit('error', {'message': 'Unauthorized: Only admin can select songs'}, to=sid)
            return

        RoomBLL(db).update_current_song(room_code, song.get("id"))

    await sio.emit('song_selected', {'song': song}, room=room_code)

@sio.event
async def close_room(sid, room_data):
    room_code = room_data.get('room_code') if isinstance(room_data, dict) else room_data
    room_code = unquote(room_code)
    user_id = room_data.get('user_id') if isinstance(room_data, dict) else None

    if not room_code:
        await sio.emit('error', {'message': 'Missing room code'}, to=sid)
        return

    # Authorization check: only admin can close room
    with db_session() as db:
        person_bll = PersonBLL(db)
        if not user_id or not person_bll.is_admin(user_id, room_code):
            await sio.emit('error', {'message': 'Unauthorized: Only admin can close room'}, to=sid)
            return

        PersonBLL(db).remove_all_by_room(room_code)
        RoomBLL(db).delete_room(room_code)

    await sio.emit('room_closed', {}, room=room_code)

@sio.event
async def close_song(sid, room_data):
    room_code = room_data.get('room_code') if isinstance(room_data, dict) else room_data
    room_code = unquote(room_code)
    user_id = room_data.get('user_id') if isinstance(room_data, dict) else None

    if not room_code:
        await sio.emit('error', {'message': 'Missing room code'}, to=sid)
        return

    # Authorization check: only admin can close song
    with db_session() as db:
        person_bll = PersonBLL(db)
        if not user_id or not person_bll.is_admin(user_id, room_code):
            await sio.emit('error', {'message': 'Unauthorized: Only admin can close song'}, to=sid)
            return

        RoomBLL(db).clear_current_song(room_code)

    await sio.emit('song_over', {}, room=room_code)
