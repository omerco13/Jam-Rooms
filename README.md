# Jam Rooms - Real-Time Collaborative Music Platform

A real-time web application that allows musicians to collaborate remotely. Users can create rooms, join sessions with passwords, and play songs together with synchronized lyrics and chords.

## Features

- **Color-Coded Rooms**: Create and join rooms with unique color names (up to 10 concurrent rooms)
- **Password Protection**: Secure rooms with password authentication
- **Real-Time Synchronization**: All participants see song selections instantly via WebSocket
- **Song Library**: Search and select from a database of songs with lyrics and chords
- **Role-Based Access**: Admin controls for room management and song selection
- **Responsive Design**: Works on desktop and mobile devices

## Tech Stack

### Frontend
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe development
- **Socket.IO Client** - Real-time communication
- **Tailwind CSS** - Styling

### Backend
- **FastAPI** - Modern Python web framework
- **Socket.IO** - WebSocket server for real-time features
- **SQLAlchemy** - ORM for database management
- **PostgreSQL** - Relational database
- **Alembic** - Database migrations

## Live Demo

🌐 **[View Live Application](https://jam-rooms.vercel.app)** *(Add your actual URL after deployment)*

## Screenshots

*(You can add screenshots here after deployment)*

## Local Development

### Prerequisites
- Python 3.9+
- Node.js 18+
- PostgreSQL

### Backend Setup

```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt

# Create .env file
echo "DATABASE_URL=postgresql://user:password@localhost/jamrooms" > .env

# Run migrations
cd app
alembic upgrade head
cd ..

# Start server
uvicorn app.main:app --reload
```

### Frontend Setup

```bash
cd frontend
npm install

# Create .env file
echo "NEXT_PUBLIC_API_URL=http://localhost:8000" > .env
echo "NEXT_PUBLIC_SOCKET_URL=http://localhost:8000" >> .env

# Start development server
npm run dev
```

Visit `http://localhost:3000` to see the application.

## Project Structure

```
jam-rooms/
├── backend/
│   ├── app/
│   │   ├── bll/          # Business Logic Layer
│   │   ├── dal/          # Data Access Layer
│   │   ├── alembic/      # Database migrations
│   │   ├── models.py     # Pydantic models
│   │   ├── tables.py     # SQLAlchemy models
│   │   ├── main.py       # FastAPI app
│   │   ├── socket_manager.py  # Socket.IO events
│   │   └── database.py   # Database configuration
│   └── requirements.txt
├── frontend/
│   └── src/
│       ├── app/          # Next.js pages
│       ├── components/   # React components
│       ├── hooks/        # Custom React hooks
│       ├── types/        # TypeScript types
│       └── utils/        # Utility functions
└── README.md
```

## Architecture

The application follows a three-layer architecture:

1. **Presentation Layer** (Frontend): Next.js with React components
2. **Business Logic Layer** (BLL): Handles business rules and validation
3. **Data Access Layer** (DAL): Database operations and queries

Real-time features are powered by Socket.IO with rooms-based broadcasting.

## API Endpoints

### REST API
- `POST /rooms/` - Create a new room
- `GET /rooms/{room_code}` - Get room details
- `GET /songs/search` - Search songs by name or artist
- `GET /songs/{song_id}` - Get song by ID

### Socket.IO Events
- `join_room` - Join a room with password
- `leave_room` - Leave current room
- `select_song` - Admin selects a song (broadcasts to all)
- `close_room` - Admin closes the room
- `close_song` - Admin closes current song

## Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions.

## Future Enhancements

- [ ] Video chat integration
- [ ] User accounts and authentication
- [ ] Custom song uploads
- [ ] Recording sessions
- [ ] Mobile app (React Native)

## License

MIT License - feel free to use this project for your portfolio!

## Contact

**Your Name**
[LinkedIn](https://linkedin.com/in/yourprofile) | [GitHub](https://github.com/yourusername) | [Email](mailto:your.email@example.com)

---

*Built as part of my software engineering portfolio*
