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

// Store active rooms and players
const rooms = new Map();
const players = new Map();

// Generate random room code
function generateRoomCode() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

// Socket connection handling
io.on('connection', (socket) => {
  console.log('✅ User connected:', socket.id);

  // Create a new room
  socket.on('create-room', (data) => {
    const roomCode = generateRoomCode();
    const room = {
      code: roomCode,
      host: socket.id,
      players: [{
        id: socket.id,
        username: data.username,
        isHost: true,
        connected: true,
        ready: false,
        score: 0
      }],
      gameState: 'waiting',
      maxPlayers: 4,
      rounds: data.rounds || 5,
      currentRound: 0,
      scores: {}
    };

    rooms.set(roomCode, room);
    players.set(socket.id, { roomCode, username: data.username });
    
    socket.join(roomCode);
    socket.emit('room-created', room);
    console.log(`🎮 Room created: ${roomCode} by ${data.username}`);
    console.log(`👥 Players in room:`, room.players.map(p => p.username));
  });

  // Join existing room
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

    if (room.gameState !== 'waiting') {
      socket.emit('error', 'Game already in progress');
      return;
    }

    // Check if username already exists
    if (room.players.some(p => p.username === username)) {
      socket.emit('error', 'Username already taken in this room');
      return;
    }

    const player = {
      id: socket.id,
      username,
      isHost: false,
      connected: true,
      ready: false,
      score: 0
    };

    room.players.push(player);
    players.set(socket.id, { roomCode, username });
    
    socket.join(roomCode);
    
    // Send room data to the joining player
    socket.emit('room-joined', room);
    
    // Broadcast to ALL players in the room (including the new one)
    io.to(roomCode).emit('room-updated', room);
    
    console.log(`👤 Player ${username} joined room ${roomCode}`);
    console.log(`👥 All players in room ${roomCode}:`, room.players.map(p => p.username));
  });

  // Start game
  socket.on('start-game', (roomCode) => {
    const room = rooms.get(roomCode);
    if (room && room.host === socket.id && room.players.length >= 2) {
      room.gameState = 'starting';
      initializeGame(room);
      io.to(roomCode).emit('game-started', room);
      console.log(`🚀 Game started in room ${roomCode}`);
    }
  });

  // Player reveals their role
  socket.on('reveal-role', (roomCode) => {
    const room = rooms.get(roomCode);
    if (room) {
      const player = room.players.find(p => p.id === socket.id);
      if (player) {
        player.revealed = true;
        io.to(roomCode).emit('player-revealed', {
          playerId: socket.id,
          allRevealed: room.players.every(p => p.revealed)
        });

        // If all players revealed, move to guessing phase
        if (room.players.every(p => p.revealed)) {
          room.gameState = 'guessing';
          io.to(roomCode).emit('all-roles-revealed', room);
        }
      }
    }
  });

  // Mantri guesses the Chor
  socket.on('mantri-guess', (roomCode, guessedPlayerId) => {
    const room = rooms.get(roomCode);
    if (room && room.gameState === 'guessing') {
      const mantri = room.players.find(p => p.role === 'mantri');
      if (mantri && mantri.id === socket.id) {
        processGuess(room, guessedPlayerId);
        io.to(roomCode).emit('guess-processed', room);
        
        // Move to next round after a delay
        setTimeout(() => {
          if (room.currentRound < room.rounds) {
            startNewRound(room);
            io.to(roomCode).emit('next-round-started', room);
          } else {
            room.gameState = 'finished';
            io.to(roomCode).emit('game-finished', room);
          }
        }, 5000);
      }
    }
  });

  // Request room update
  socket.on('request-room-update', (roomCode) => {
    const room = rooms.get(roomCode);
    if (room) {
      socket.emit('room-updated', room);
    }
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    console.log('❌ User disconnected:', socket.id);
    const player = players.get(socket.id);
    if (player) {
      const room = rooms.get(player.roomCode);
      if (room) {
        room.players = room.players.filter(p => p.id !== socket.id);
        
        if (room.players.length === 0) {
          rooms.delete(player.roomCode);
          console.log(`🗑️ Room ${player.roomCode} deleted (empty)`);
        } else {
          // Update remaining players
          io.to(player.roomCode).emit('room-updated', room);
        }
      }
      players.delete(socket.id);
    }
  });
});

function initializeGame(room) {
  // Initialize scores
  room.players.forEach(player => {
    room.scores[player.id] = 0;
  });
  startNewRound(room);
}

function startNewRound(room) {
  room.currentRound++;
  room.gameState = 'role-assignment';
  
  // Assign roles randomly
  const roles = ['raja', 'mantri', 'chor', 'sipahi'];
  const availableRoles = roles.slice(0, room.players.length);
  const shuffledRoles = [...availableRoles].sort(() => Math.random() - 0.5);
  
  room.players.forEach((player, index) => {
    player.role = shuffledRoles[index];
    player.revealed = false;
  });

  room.mantriGuess = null;
  room.roundResult = null;
  
  console.log(`🔄 Round ${room.currentRound} started in room ${room.code}`);
  console.log(`🎭 Roles: ${room.players.map(p => `${p.username}: ${p.role}`).join(', ')}`);
}

function processGuess(room, guessedPlayerId) {
  const chor = room.players.find(p => p.role === 'chor');
  const mantri = room.players.find(p => p.role === 'mantri');
  const raja = room.players.find(p => p.role === 'raja');
  const sipahi = room.players.find(p => p.role === 'sipahi');

  const isCorrect = chor.id === guessedPlayerId;

  // Calculate scores
  if (isCorrect) {
    room.scores[mantri.id] += 800;
    room.scores[raja.id] += 1000;
    room.scores[sipahi.id] += 500;
    room.scores[chor.id] += 0;
  } else {
    room.scores[mantri.id] += 0;
    room.scores[raja.id] += 1000;
    room.scores[chor.id] += 1200; // Chor gets bonus if not caught
    room.scores[sipahi.id] += 500;
  }

  room.roundResult = {
    isCorrect,
    guessedPlayerId,
    actualChorId: chor.id,
    scores: { ...room.scores }
  };

  room.gameState = 'round-result';
}

// Basic route to check if server is running
app.get('/', (req, res) => {
  res.json({ 
    message: 'Raja Mantri Chor Sipahi Server is running!',
    activeRooms: rooms.size,
    activePlayers: players.size
  });
});

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🎯 Server running on http://localhost:${PORT}`);
});