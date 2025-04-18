from sqlalchemy import Column, Integer, String, JSON, ForeignKey
from .database import Base

class Room(Base):
    __tablename__ = "rooms"
    id = Column(Integer, primary_key=True, index=True)
    room_code = Column(String, unique=True, index=True)
    admin = Column(String)
    current_song_id = Column(Integer, nullable=True)

class Song(Base):
    __tablename__ = "songs"
    id = Column(Integer, primary_key=True, index=True)
    singer = Column(String)
    name = Column(String)
    content = Column(JSON)

class Person(Base):
    __tablename__ = "people"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    instrument = Column(String)
    room_code = Column(String, ForeignKey('rooms.room_code'))
    role = Column(String) 


