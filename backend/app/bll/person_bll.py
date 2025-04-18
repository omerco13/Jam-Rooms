from sqlalchemy.orm import Session
from app.dal.person_dal import PersonDAL


class PersonBLL:
    def __init__(self, db: Session):
        self.person_dal = PersonDAL(db)

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