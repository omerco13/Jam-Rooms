# JaMoveo - Real-time Collaborative Music Session App

JaMoveo is a web application that allows musicians to create or join virtual jam sessions. The admin controls the session flow and displays songs with lyrics and chords for participants.

## Features

- Create and join virtual jam rooms
- Real-time synchronization between participants
- Song search functionality
- Display lyrics and chords based on instrument type
- Auto-scroll functionality for lyrics
- High-contrast, readable display
- Modern, responsive design

## Getting Started

### Prerequisites

- Node.js 18+ for the frontend
- Python 3.8+ for the backend
- PostgreSQL database

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/ja-moveo.git
   cd ja-moveo
   ```

2. Install frontend dependencies:
   ```bash
   npm install
   ```

3. Install backend dependencies:
   ```bash
   cd backend
   pip install -r requirements.txt
   ```

4. Set up environment variables:
   - Create a `.env.local` file in the root directory:
     ```
     NEXT_PUBLIC_API_URL=http://localhost:8000
     ```
   - Create a `.env` file in the `backend` directory:
     ```
     DATABASE_URL=postgresql://user:password@localhost:5432/jamoveo
     ```

5. Start the development servers:
   - Frontend:
     ```bash
     npm run dev
     ```
   - Backend:
     ```bash
     cd backend
     uvicorn app.main:app --reload
     ```

## How to Use

### Creating a Room

1. Visit the homepage
2. Select your instrument from the dropdown menu
3. Click "Create Room"
4. Share the generated room code with other participants

### Joining a Room

1. Visit the homepage
2. Select your instrument from the dropdown menu
3. Enter the room code in the "Enter Room Code" field
4. Click "Join Room"

### Admin Controls in the Room

As an admin, you have access to:
- Song search functionality
- Song selection for all participants
- Session management (ending the session)
- Auto-scroll toggle for lyrics

### Participant View

As a participant, you can:
- View the currently selected song
- See lyrics and chords (if applicable to your instrument)
- Use the auto-scroll feature
- See other participants in the room

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
