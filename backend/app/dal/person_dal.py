from sqlalchemy.orm import Session
from app.tables import Person
from typing import Optional


class PersonDAL:
    def __init__(self, db: Session):
        self.db = db

    def add_person(self, name: str, instrument: str, room_code: str, role: str) -> Person:
        new_person = Person(
            name=name, instrument=instrument, room_code=room_code, role=role
        )
        self.db.add(new_person)
        self.db.commit()
        self.db.refresh(new_person)
        return new_person
    
    def get_person_by_id(self, person_id: int) -> Optional[Person]:
        return self.db.query(Person).filter_by(id = person_id).first()

    def get_participants_by_room(self, room_code: str) -> list[Person]:
        return self.db.query(Person).filter(Person.room_code == room_code).all()
    
    def delete_person(self, person: Person):
        self.db.delete(person)
        self.db.commit()
    
    def remove_all_by_room(self, room_code: str) -> None:
        self.db.query(Person).filter(Person.room_code == room_code).delete()
        self.db.commit()


    

