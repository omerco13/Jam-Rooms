from sqlalchemy.orm import Session
from app.tables import Song
from typing import List


class SongDAL:
    def __init__(self, db: Session):
        self.db = db

    def search_songs(self, query: str) -> List[Song]:
        pattern = f"%{query.lower()}%"
        return self.db.query(Song).filter(
            (Song.name.ilike(pattern)) | (Song.singer.ilike(pattern))
        ).all()
    
    def get_song_by_id(self, song_id: int):
        return self.db.query(Song).filter(Song.id == song_id).first()