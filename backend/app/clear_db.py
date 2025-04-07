import sys
import os
from sqlalchemy.orm import Session

# ✅ Add backend/app to sys.path so we can import modules properly
sys.path.append(os.path.dirname(__file__))

from database import SessionLocal, Base, engine

from models import Room, Person

print("🔄 Connecting to database:", engine.url)

# Optional: drop and recreate all tables
# print("Dropping all tables...")
# Base.metadata.drop_all(bind=engine)
# print("Recreating all tables...")
# Base.metadata.create_all(bind=engine)

# ✅ Instead, delete data from tables
print("🧹 Deleting all data from Room and Person tables...")
db: Session = SessionLocal()
db.query(Person).delete()
db.query(Room).delete()
db.commit()
db.close()

print("✅ Database has been cleared.")