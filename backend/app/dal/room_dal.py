from sqlalchemy.orm import Session
from app.tables import Room
from typing import Optional


class RoomDAL:
    def __init__(self, db: Session):
        self.db = db

    def create_room(self, room_code: str, admin_name: str) -> Room:
        new_room = Room(room_code=room_code, admin=admin_name)
        self.db.add(new_room)
        self.db.commit()
        self.db.refresh(new_room)
        return new_room

    def get_room_by_code(self, room_code: str) -> Optional[Room]:
        return self.db.query(Room).filter(Room.room_code == room_code).first()

    def get_all_rooms(self) -> list[Room]:
        return self.db.query(Room).all()
        
    def delete_room(self, room: Room) -> None:
            self.db.delete(room)
            self.db.commit()

    def commit(self):
        self.db.commit()


    