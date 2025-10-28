// server/index.js
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');

const app = express();
const server = http.createServer(app);

const io = socketIo(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

app.use(cors());
app.use(express.json());

const rooms = new Map();
const players = new Map();

function generateRoomCode() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

io.on('connection', (socket) => {
  console.log('✅ User connected:', socket.id);

  // Create room
  socket.on('create-room', (data) => {
    const roomCode = generateRoomCode();
    const room = {
      code: roomCode,
      host: socket.id,
      players: [{
        id: socket.id,
        username: data.username,
        isHost: true,
        connected: true
      }],
      gameState: 'waiting',
      maxPlayers: 4,
      rounds: 5,
      currentRound: 0
    };

    rooms.set(roomCode, room);
    players.set(socket.id, { roomCode, username: data.username });
    
    socket.join(roomCode);
    socket.emit('room-created', room);
    console.log(`🎮 Room created: ${roomCode}`);
  });

  // Join room
  socket.on('join-room', (data) => {
    const { roomCode, username } = data;
    const room = rooms.get(roomCode);

    if (!room) {
      socket.emit('error', 'Room not found');
      return;
    }

    if (room.players.length >= room.maxPlayers) {
      socket.emit('error', 'Room is full');
      return;
    }

    const player = {
      id: socket.id,
      username,
      isHost: false,
      connected: true
    };

    room.players.push(player);
    players.set(socket.id, { roomCode, username });
    
    socket.join(roomCode);
    socket.emit('room-joined', room);
    socket.to(roomCode).emit('player-joined', player);
  });

  // Start game
  socket.on('start-game', (roomCode) => {
    const room = rooms.get(roomCode);
    if (room && room.host === socket.id) {
      room.gameState = 'playing';
      
      // Assign roles
      const roles = ['raja', 'mantri', 'chor', 'sipahi'];
      const availableRoles = roles.slice(0, room.players.length);
      const shuffledRoles = [...availableRoles].sort(() => Math.random() - 0.5);
      
      room.players.forEach((player, index) => {
        player.role = shuffledRoles[index];
      });

      room.currentRound = 1;
      
      io.to(roomCode).emit('game-started', room);
    }
  });

  socket.on('disconnect', () => {
    console.log('❌ User disconnected:', socket.id);
  });
});

app.get('/', (req, res) => {
  res.json({ message: 'Server is running!' });
});

const PORT = 5000;
server.listen(PORT, () => {
  console.log(`🎯 Server running on http://localhost:${PORT}`);
});