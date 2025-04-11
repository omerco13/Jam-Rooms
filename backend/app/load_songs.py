from models import Song
from database import db_session
import json
import os

json_path = os.path.join(os.path.dirname(__file__), "songs.JSON")
with open(json_path, "r", encoding="utf-8") as f:
    songs = json.load(f)

with db_session() as db:
    for song in songs:
        new_song = Song(
            name=song["name"],
            singer=song["singer"],
            content=song["content"]
        )
        db.add(new_song)
    db.commit()