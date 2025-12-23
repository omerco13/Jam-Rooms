from sqlalchemy.orm import Session
from app.dal.room_dal import RoomDAL
from app.constants import ROOM_COLORS
from typing import Optional


class RoomBLL:
    def __init__(self, db: Session):
        self.room_dal = RoomDAL(db)

    def get_available_room_name(self):
        """Find an available color room name"""
        existing_rooms = {room.room_code for room in self.room_dal.get_all_rooms()}
        for color in ROOM_COLORS:
            room_name = f"{color} Room"
            if room_name not in existing_rooms:
                return room_name
        return None  # All colors are taken

    def create_room(self, room_code: str, admin_name: str, password: str):
        return self.room_dal.create_room(room_code, admin_name, password)

    def verify_password(self, room_code: str, password: str) -> bool:
        """Verify if the password matches the room password"""
        room = self.room_dal.get_room_by_code(room_code)
        return room is not None and room.password == password

    def get_room(self, room_code: str):
        return self.room_dal.get_room_by_code(room_code)

    def get_all_rooms(self):
        return self.room_dal.get_all_rooms()

    def update_current_song(self, room_code: str, song_id: Optional[int]):
        room = self.room_dal.get_room_by_code(room_code)
        if room:
            room.current_song_id = song_id
            self.room_dal.commit()

    def clear_current_song(self, room_code: str):
        room = self.room_dal.get_room_by_code(room_code)
        if room:
            room.current_song_id = None
            self.room_dal.commit()

    def delete_room(self, room_code: str):
        room = self.room_dal.get_room_by_code(room_code)
        if room:
            self.room_dal.delete_room(room)

    