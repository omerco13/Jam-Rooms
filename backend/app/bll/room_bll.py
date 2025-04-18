from sqlalchemy.orm import Session
from app.dal.room_dal import RoomDAL
from typing import Optional


class RoomBLL:
    def __init__(self, db: Session):
        self.room_dal = RoomDAL(db)

    def create_room(self, room_code: str, admin_name: str):
        return self.room_dal.create_room(room_code, admin_name)

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

    