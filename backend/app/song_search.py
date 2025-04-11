import json
import os
from typing import List, Dict, Any

def load_songs() -> List[Dict[str, Any]]:
    songs_path = os.path.join(os.path.dirname(__file__), "songs.JSON")
    with open(songs_path, "r", encoding="utf-8") as f:
        songs = json.load(f)
    for i, song in enumerate(songs):
        song["id"] = i + 1
    return songs

def search_songs_by_query(query: str) -> List[Dict[str, Any]]:
    songs = load_songs()
    query = query.lower()

    exact_matches = [
        song for song in songs
        if query in song["name"].lower() or query in song["singer"].lower()
    ]

    partial_matches = [
        song for song in songs
        if (query not in song["name"].lower() and query not in song["singer"].lower()) and
        (any(word in song["name"].lower() for word in query.split()) or
         any(word in song["singer"].lower() for word in query.split()))
    ]
    return exact_matches + partial_matches


# from sqlalchemy.orm import Session
# from app.models import Song

# def search_songs_from_db(db: Session, query: str):
#     query = f"%{query.lower()}%"
#     results = db.query(Song).filter(
#         (Song.name.ilike(query)) | (Song.singer.ilike(query))
#     ).all()

#     return [ {
#         "id": song.id,
#         "name": song.name,
#         "singer": song.singer,
#         "content": song.content
#     } for song in results ]

