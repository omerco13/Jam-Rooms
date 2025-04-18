# reset_db.py

from database import Base, engine
from tables import Room, Person, Song

print("🔄 Dropping all tables...")
Base.metadata.drop_all(bind=engine)

print("🧱 Recreating all tables...")
Base.metadata.create_all(bind=engine)

print("✅ Tables have been reset successfully.")