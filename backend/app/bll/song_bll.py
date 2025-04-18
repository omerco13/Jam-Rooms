from sqlalchemy.orm import Session
from app.dal.song_dal import SongDAL


class SongBLL:
    def __init__(self, db: Session):
        self.song_dal = SongDAL(db)

    def search_songs(self, query: str):
        return self.song_dal.search_songs(query)
    
    def get_song_by_id(self, song_id: int):
        return self.song_dal.get_song_by_id(song_id)