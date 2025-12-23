from sqlalchemy.orm import Session
from app.dal.person_dal import PersonDAL


class PersonBLL:
    def __init__(self, db: Session):
        self.person_dal = PersonDAL(db)

    def get_person_by_id(self, user_id: int):
        return self.person_dal.get_person_by_id(user_id)

    def add_person(self, name: str, instrument: str, room_code: str, role: str):
        return self.person_dal.add_person(name, instrument, room_code, role)

    def get_participants_by_room(self, room_code: str):
        return self.person_dal.get_participants_by_room(room_code)

    def remove_person(self, person_id:int):
        person = self.person_dal.get_person_by_id(person_id)
        if person:
            self.person_dal.delete_person(person)
            return True
        return False

    def remove_all_by_room(self, room_code: str):
        return self.person_dal.remove_all_by_room(room_code)

    def is_admin(self, user_id: int, room_code: str) -> bool:
        """Check if a user is the admin of a specific room"""
        person = self.person_dal.get_person_by_id(user_id)
        if not person:
            return False
        return person.role == 'admin' and person.room_code == room_code

    def is_in_room(self, user_id: int, room_code: str) -> bool:
        """Check if a user is a participant in a specific room"""
        person = self.person_dal.get_person_by_id(user_id)
        if not person:
            return False
        return person.room_code == room_code