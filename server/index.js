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

// Bot player names and personalities
const BOT_NAMES = [
  'RajaBot', 'MantriMaster', 'ChorAI', 'SipahiBot',
  'RoyalAI', 'StrategyBot', 'GameMaster', 'SmartPlayer'
];

const BOT_PERSONALITIES = {
  SMART: 'smart',      // 70% correct guesses
  RANDOM: 'random',    // 25% correct guesses  
  NOVICE: 'novice'     // 10% correct guesses
};

// Generate random room code
function generateRoomCode() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

// Create computer player
function createComputerPlayer(room, index, personality = BOT_PERSONALITIES.SMART) {
  const usedNames = room.players.map(p => p.username);
  const availableNames = BOT_NAMES.filter(name => !usedNames.includes(name));
  const botName = availableNames[index] || `AI_Player_${index + 1}`;
  
  return {
    id: `bot-${Date.now()}-${index}`,
    username: botName,
    isHost: false,
    connected: true,
    ready: true,
    score: 0,
    isBot: true,
    personality: personality,
    revealed: false
  };
}

// Bot reveals role automatically
function botRevealRole(room, botPlayer) {
  const delay = 1000 + (Math.random() * 3000); // 1-4 seconds delay
  
  setTimeout(() => {
    botPlayer.revealed = true;
    
    // Notify all players
    io.to(room.code).emit('player-revealed', {
      playerId: botPlayer.id,
      allRevealed: room.players.every(p => p.revealed)
    });

    // System message
    const systemMessage = {
      id: Date.now().toString(),
      username: 'System',
      message: `${botPlayer.username} revealed their role`,
      type: 'system',
      timestamp: new Date().toLocaleTimeString(),
      playerId: 'system'
    };
    room.chatMessages.push(systemMessage);
    io.to(room.code).emit('new-chat-message', systemMessage);

    // If all revealed, move to guessing phase
    if (room.players.every(p => p.revealed)) {
      room.gameState = 'guessing';
      
      const mantri = room.players.find(p => p.role === 'mantri');
      const systemMessage = {
        id: Date.now().toString(),
        username: 'System',
        message: `All roles revealed! ${mantri.username} (Mantri), find the Chor!`,
        type: 'system',
        timestamp: new Date().toLocaleTimeString(),
        playerId: 'system'
      };
      room.chatMessages.push(systemMessage);
      io.to(room.code).emit('new-chat-message', systemMessage);
      
      io.to(room.code).emit('all-roles-revealed', room);
      
      // If Mantri is bot, auto-guess
      if (mantri.isBot) {
        botMakeGuess(room, mantri);
      }
    }
  }, delay);
}

// Bot makes intelligent call to Sipahi
function botCallSipahi(room, mantriBot) {
  const thinkingTime = 2000 + (Math.random() * 3000); // 2-5 seconds
  
  setTimeout(() => {
    // Send bot thinking message
    const thinkingMessage = {
      id: Date.now().toString(),
      username: 'System',
      message: `${mantriBot.username} is thinking... 🤔`,
      type: 'system',
      timestamp: new Date().toLocaleTimeString(),
      playerId: 'system'
    };
    room.chatMessages.push(thinkingMessage);
    io.to(room.code).emit('new-chat-message', thinkingMessage);

    // Small delay before calling Sipahi
    setTimeout(() => {
      mantriCallSipahi(room, mantriBot);
    }, 1500);
  }, thinkingTime);
}

// Bot Sipahi makes intelligent guess
function botSipahiGuess(room, sipahiBot) {
  const thinkingTime = 2000 + (Math.random() * 5000); // 2-7 seconds
  
  setTimeout(() => {
    const chor = room.players.find(p => p.role === 'chor');
    const possibleTargets = room.players.filter(p => 
      p.role === 'raja' || p.role === 'chor'
    );
    
    let guessedPlayerId;
    let guessAccuracy;

    // Different strategies based on bot personality
    switch (sipahiBot.personality) {
      case BOT_PERSONALITIES.SMART:
        guessAccuracy = 0.7; // 70% accurate
        break;
      case BOT_PERSONALITIES.RANDOM:
        guessAccuracy = 0.25; // 25% accurate
        break;
      case BOT_PERSONALITIES.NOVICE:
        guessAccuracy = 0.1; // 10% accurate
        break;
      default:
        guessAccuracy = 0.5;
    }

    const shouldGuessCorrectly = Math.random() < guessAccuracy;
    
    if (shouldGuessCorrectly && chor) {
      guessedPlayerId = chor.id;
    } else {
      // Random guess
      guessedPlayerId = getRandomTarget(possibleTargets);
    }

    // Ensure we have a valid target
    if (!guessedPlayerId && possibleTargets.length > 0) {
      guessedPlayerId = getRandomTarget(possibleTargets);
    }

    const guessedPlayer = room.players.find(p => p.id === guessedPlayerId);
    
    if (guessedPlayer) {
      // Send bot thinking message
      const thinkingMessage = {
        id: Date.now().toString(),
        username: 'System',
        message: `${sipahiBot.username} is analyzing... 🤔`,
        type: 'system',
        timestamp: new Date().toLocaleTimeString(),
        playerId: 'system'
      };
      room.chatMessages.push(thinkingMessage);
      io.to(room.code).emit('new-chat-message', thinkingMessage);

      // Small delay before actual guess
      setTimeout(() => {
        sipahiGuess(room, sipahiBot, guessedPlayerId);
      }, 1500);
    }
  }, thinkingTime);
}

// Helper function to get random target
function getRandomTarget(possibleTargets) {
  if (possibleTargets.length === 0) return null;
  const randomIndex = Math.floor(Math.random() * possibleTargets.length);
  return possibleTargets[randomIndex].id;
}

// Schedule next round
function scheduleNextRound(room) {
  setTimeout(() => {
    if (room.currentRound < room.rounds) {
      startNewRound(room);
      io.to(room.code).emit('next-round-started', room);
    } else {
      room.gameState = 'finished';
      
      // Calculate winner
      const winner = room.players.reduce((prev, current) => 
        (room.scores[current.id] > room.scores[prev.id]) ? current : prev
      );
      
      const winnerMessage = {
        id: Date.now().toString(),
        username: 'System',
        message: `Game Over! ${winner.username} wins with ${room.scores[winner.id]} points! 🎉`,
        type: 'system',
        timestamp: new Date().toLocaleTimeString(),
        playerId: 'system'
      };
      room.chatMessages.push(winnerMessage);
      io.to(room.code).emit('new-chat-message', winnerMessage);
      
      io.to(room.code).emit('game-finished', room);
    }
  }, 5000);
}

// Bot sends occasional chat messages
function botSendChatMessage(room, botPlayer) {
  if (Math.random() < 0.3) { // 30% chance to send message
    const messages = [
      "This is fun! 🎮",
      "Good game everyone!",
      "I think I know who the Chor is... 🤔",
      "Let's see how this round goes!",
      "Interesting roles this round!",
      "The King looks suspicious 👀",
      "I'm watching everyone carefully!",
      "This is getting exciting!",
      "Nice move!",
      "Let me think about this...",
      "The plot thickens!",
      "I have a theory...",
      "This is a challenging round!",
      "Well played!",
      "The game is afoot! 🕵️"
    ];
    
    const randomMessage = messages[Math.floor(Math.random() * messages.length)];
    const delay = 3000 + (Math.random() * 10000); // 3-13 seconds
    
    setTimeout(() => {
      const chatMessage = {
        id: Date.now().toString(),
        username: botPlayer.username,
        message: randomMessage,
        type: 'player',
        timestamp: new Date().toLocaleTimeString(),
        playerId: botPlayer.id
      };
      
      room.chatMessages.push(chatMessage);
      io.to(room.code).emit('new-chat-message', chatMessage);
    }, delay);
  }
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
        score: 0,
        isBot: false
      }],
      gameState: 'waiting',
      maxPlayers: 4,
      rounds: data.rounds || 5,
      currentRound: 0,
      scores: {},
      chatMessages: [],
      addBots: data.addBots || false,
      botCount: data.botCount || 0,
      botDifficulty: data.botDifficulty || 'smart'
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
      score: 0,
      isBot: false
    };

    room.players.push(player);
    players.set(socket.id, { roomCode, username });
    
    socket.join(roomCode);
    
    // Send room data to the joining player
    socket.emit('room-joined', room);
    
    // Broadcast to ALL players in the room (including the new one)
    io.to(roomCode).emit('room-updated', room);
    
    // Send system message about player joining
    const systemMessage = {
      id: Date.now().toString(),
      username: 'System',
      message: `${username} joined the game`,
      type: 'system',
      timestamp: new Date().toLocaleTimeString(),
      playerId: 'system'
    };
    room.chatMessages.push(systemMessage);
    io.to(roomCode).emit('new-chat-message', systemMessage);
    
    console.log(`👤 Player ${username} joined room ${roomCode}`);
    console.log(`👥 All players in room ${roomCode}:`, room.players.map(p => p.username));
  });

  // Start game
  socket.on('start-game', (roomCode) => {
    const room = rooms.get(roomCode);
    if (room && room.host === socket.id && room.players.length >= 2) {
      room.gameState = 'starting';
      
      // Add bots if enabled
      if (room.addBots && room.players.length < 4) {
        const botsNeeded = Math.min(4 - room.players.length, room.botCount || 2);
        
        for (let i = 0; i < botsNeeded; i++) {
          const personality = room.botDifficulty || BOT_PERSONALITIES.SMART;
          const botPlayer = createComputerPlayer(room, i, personality);
          room.players.push(botPlayer);
          
          // Send system message
          const systemMessage = {
            id: Date.now().toString(),
            username: 'System',
            message: `${botPlayer.username} (AI - ${personality}) joined the game`,
            type: 'system',
            timestamp: new Date().toLocaleTimeString(),
            playerId: 'system'
          };
          room.chatMessages.push(systemMessage);
          io.to(roomCode).emit('new-chat-message', systemMessage);
        }
        
        console.log(`🤖 Added ${botsNeeded} bots to room ${roomCode}`);
      }
      
      // Send system message
      const systemMessage = {
        id: Date.now().toString(),
        username: 'System',
        message: 'Game started! Roles are being assigned...',
        type: 'system',
        timestamp: new Date().toLocaleTimeString(),
        playerId: 'system'
      };
      room.chatMessages.push(systemMessage);
      io.to(roomCode).emit('new-chat-message', systemMessage);
      
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

        // Send system message about role reveal
        const systemMessage = {
          id: Date.now().toString(),
          username: 'System',
          message: `${player.username} revealed their role`,
          type: 'system',
          timestamp: new Date().toLocaleTimeString(),
          playerId: 'system'
        };
        room.chatMessages.push(systemMessage);
        io.to(roomCode).emit('new-chat-message', systemMessage);

        // If all players revealed, move to guessing phase
        if (room.players.every(p => p.revealed)) {
          room.gameState = 'guessing';
          
          const mantri = room.players.find(p => p.role === 'mantri');
          const systemMessage = {
            id: Date.now().toString(),
            username: 'System',
            message: `All roles revealed! ${mantri.username} (Mantri), call the Sipahi!`,
            type: 'system',
            timestamp: new Date().toLocaleTimeString(),
            playerId: 'system'
          };
          room.chatMessages.push(systemMessage);
          io.to(roomCode).emit('new-chat-message', systemMessage);
          
          io.to(roomCode).emit('all-roles-revealed', room);
          
          // If Mantri is bot, auto-call Sipahi
          if (mantri.isBot) {
            botCallSipahi(room, mantri);
          }
        }
      }
    }
  });

  // Mantri calls Sipahi
  socket.on('mantri-call-sipahi', (roomCode) => {
    console.log('🔔 Server received mantri-call-sipahi event');
    console.log('Room code:', roomCode);
    console.log('Socket ID:', socket.id);
    
    const room = rooms.get(roomCode);
    console.log('Room found:', !!room);
    
    if (!room) {
      console.error('❌ Room not found!');
      return;
    }
    
    console.log('Room game state:', room.gameState);
    
    if (room.gameState !== 'guessing') {
      console.error('❌ Wrong game state! Expected "guessing", got:', room.gameState);
      return;
    }
    
    const mantri = room.players.find(p => p.role === 'mantri');
    console.log('Mantri found:', !!mantri);
    console.log('Mantri ID:', mantri?.id);
    console.log('Socket ID matches:', mantri?.id === socket.id);
    
    if (mantri && mantri.id === socket.id) {
      console.log('✅ Calling mantriCallSipahi function');
      mantriCallSipahi(room, mantri);
    } else {
      console.error('❌ Mantri validation failed!');
    }
  });

  // Sipahi guesses the Chor
  socket.on('sipahi-guess', (roomCode, guessedPlayerId) => {
    const room = rooms.get(roomCode);
    if (room && room.gameState === 'sipahi-guessing') {
      const sipahi = room.players.find(p => p.role === 'sipahi');
      if (sipahi && sipahi.id === socket.id) {
        sipahiGuess(room, sipahi, guessedPlayerId);
      }
    }
  });

  // Handle chat messages
  socket.on('send-chat-message', (data) => {
    const { roomCode, message, username } = data;
    const room = rooms.get(roomCode);
    
    if (room) {
      const player = room.players.find(p => p.id === socket.id);
      const safeUsername = username || player?.username || 'Unknown Player';
      
      const chatMessage = {
        id: Date.now().toString(),
        username: safeUsername,
        message: message || '',
        type: 'player',
        timestamp: new Date().toLocaleTimeString(),
        playerId: socket.id
      };
      
      room.chatMessages.push(chatMessage);
      
      // Broadcast to all players in the room
      io.to(roomCode).emit('new-chat-message', chatMessage);
      console.log(`💬 ${safeUsername} in ${roomCode}: ${message}`);
    }
  });

  // Handle emoji reactions
  socket.on('send-emoji', (data) => {
    const { roomCode, emoji, username } = data;
    const room = rooms.get(roomCode);
    
    if (room) {
      const player = room.players.find(p => p.id === socket.id);
      const safeUsername = username || player?.username || 'Unknown Player';
      
      const emojiMessage = {
        id: Date.now().toString(),
        username: safeUsername,
        emoji: emoji || '❓',
        type: 'emoji',
        timestamp: new Date().toLocaleTimeString(),
        playerId: socket.id
      };
      
      room.chatMessages.push(emojiMessage);
      io.to(roomCode).emit('new-chat-message', emojiMessage);
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
        const disconnectedPlayer = room.players.find(p => p.id === socket.id);
        room.players = room.players.filter(p => p.id !== socket.id);
        
        if (room.players.length === 0) {
          rooms.delete(player.roomCode);
          console.log(`🗑️ Room ${player.roomCode} deleted (empty)`);
        } else {
          // Send system message about player leaving
          if (disconnectedPlayer) {
            const systemMessage = {
              id: Date.now().toString(),
              username: 'System',
              message: `${disconnectedPlayer.username} left the game`,
              type: 'system',
              timestamp: new Date().toLocaleTimeString(),
              playerId: 'system'
            };
            room.chatMessages.push(systemMessage);
            io.to(player.roomCode).emit('new-chat-message', systemMessage);
          }
          
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
    player.score = 0;
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
  
  // Send system message about new round
  const systemMessage = {
    id: Date.now().toString(),
    username: 'System',
    message: `Round ${room.currentRound} started! Reveal your roles.`,
    type: 'system',
    timestamp: new Date().toLocaleTimeString(),
    playerId: 'system'
  };
  room.chatMessages.push(systemMessage);
  io.to(room.code).emit('new-chat-message', systemMessage);
  
  // Auto-reveal bot players' roles and schedule chat messages
  room.players.forEach(player => {
    if (player.isBot) {
      botRevealRole(room, player);
      botSendChatMessage(room, player);
    }
  });
  
  console.log(`🔄 Round ${room.currentRound} started in room ${room.code}`);
  console.log(`🎭 Roles: ${room.players.map(p => `${p.username}: ${p.role}`).join(', ')}`);
}

// Mantri calls Sipahi
function mantriCallSipahi(room, mantri) {
  room.gameState = 'sipahi-guessing';
  
  const sipahi = room.players.find(p => p.role === 'sipahi');
  
  // Send system message
  const callMessage = {
    id: Date.now().toString(),
    username: mantri.username,
    message: `calls "Sipahi Sipahi Chor ko pakdo!"`,
    type: 'mantri-call',
    timestamp: new Date().toLocaleTimeString(),
    playerId: mantri.id,
    highlighted: true
  };
  room.chatMessages.push(callMessage);
  io.to(room.code).emit('new-chat-message', callMessage);
  
  // System message for Sipahi assignment
  const sipahiMessage = {
    id: (Date.now() + 1).toString(),
    username: 'System',
    message: `Sipahi is ${sipahi.username}`,
    type: 'system',
    timestamp: new Date().toLocaleTimeString(),
    playerId: 'system',
    highlighted: true
  };
  room.chatMessages.push(sipahiMessage);
  io.to(room.code).emit('new-chat-message', sipahiMessage);
  
  io.to(room.code).emit('mantri-called-sipahi', { mantriId: mantri.id, sipahiId: sipahi.id });
  
  // If Sipahi is bot, auto-guess
  if (sipahi.isBot) {
    botSipahiGuess(room, sipahi);
  }
}

// Sipahi makes a guess
function sipahiGuess(room, sipahi, guessedPlayerId) {
  const guessedPlayer = room.players.find(p => p.id === guessedPlayerId);
  
  // Send system message about Sipahi's selection
  const guessMessage = {
    id: Date.now().toString(),
    username: 'System',
    message: `Sipahi selected ${guessedPlayer.username} as Chor`,
    type: 'system',
    timestamp: new Date().toLocaleTimeString(),
    playerId: 'system'
  };
  room.chatMessages.push(guessMessage);
  io.to(room.code).emit('new-chat-message', guessMessage);
  
  io.to(room.code).emit('sipahi-guessed', { sipahiId: sipahi.id, guessedPlayerId });
  
  // Wait 5 seconds before processing result
  setTimeout(() => {
    processGuess(room, guessedPlayerId);
    io.to(room.code).emit('guess-processed', room);
    
    // Move to next round
    scheduleNextRound(room);
  }, 5000);
}

// UPDATED processGuess function with new scoring system
function processGuess(room, guessedPlayerId) {
  const chor = room.players.find(p => p.role === 'chor');
  const mantri = room.players.find(p => p.role === 'mantri');
  const raja = room.players.find(p => p.role === 'raja');
  const sipahi = room.players.find(p => p.role === 'sipahi');

  const isCorrect = chor.id === guessedPlayerId;

  // Store old scores for comparison
  const oldScores = { ...room.scores };

  // Calculate scores based on new rules
  // Raja always gets 1000
  room.scores[raja.id] += 1000;
  raja.score += 1000;
  
  // Mantri always gets 800
  room.scores[mantri.id] += 800;
  mantri.score += 800;
  
  if (isCorrect) {
    // Sipahi guessed correctly
    room.scores[sipahi.id] += 500;
    room.scores[chor.id] += 0;
    sipahi.score += 500;
  } else {
    // Sipahi guessed wrong
    room.scores[sipahi.id] += 0;
    room.scores[chor.id] += 500;
    chor.score += 500;
  }

  room.roundResult = {
    isCorrect,
    guessedPlayerId,
    actualChorId: chor.id,
    scores: { ...room.scores },
    oldScores: oldScores // Include old scores for comparison
  };

  room.gameState = 'round-result';
  
  // Send system message with round result
  const guessedPlayer = room.players.find(p => p.id === guessedPlayerId);
  let resultMessage;
  if (isCorrect) {
    resultMessage = `Correct! ${guessedPlayer.username} was the Chor! 🎯\n` +
                   `Raja: +1000, Mantri: +800, Sipahi: +500, Chor: 0`;
  } else {
    resultMessage = `Wrong! ${guessedPlayer.username} was not the Chor. The real Chor was ${chor.username}!\n` +
                   `Raja: +1000, Mantri: +800, Sipahi: 0, Chor: +500`;
  }
  
  const systemMessage = {
    id: Date.now().toString(),
    username: 'System',
    message: resultMessage,
    type: 'system',
    timestamp: new Date().toLocaleTimeString(),
    playerId: 'system'
  };
  room.chatMessages.push(systemMessage);
  io.to(room.code).emit('new-chat-message', systemMessage);
}

// Basic route to check if server is running
app.get('/', (req, res) => {
  res.json({ 
    message: 'Raja Mantri Chor Sipahi Server is running!',
    activeRooms: rooms.size,
    activePlayers: players.size,
    version: '1.0.0'
  });
});

// Get room info
app.get('/room/:roomCode', (req, res) => {
  const room = rooms.get(req.params.roomCode.toUpperCase());
  if (room) {
    res.json({
      code: room.code,
      players: room.players.map(p => ({
        username: p.username,
        isHost: p.isHost,
        score: p.score,
        isBot: p.isBot || false
      })),
      gameState: room.gameState,
      currentRound: room.currentRound,
      rounds: room.rounds
    });
  } else {
    res.status(404).json({ error: 'Room not found' });
  }
});

// Get all active rooms (for debugging)
app.get('/rooms', (req, res) => {
  const roomList = Array.from(rooms.values()).map(room => ({
    code: room.code,
    players: room.players.length,
    gameState: room.gameState,
    currentRound: room.currentRound
  }));
  res.json({ rooms: roomList });
});

// Start server
const PORT = process.env.PORT || 5001;
server.listen(PORT, () => {
  console.log(`🎯 Server running on http://localhost:${PORT}`);
  console.log(`📊 API endpoints available:`);
  console.log(`   GET /              - Server status`);
  console.log(`   GET /rooms         - List all active rooms`);
  console.log(`   GET /room/:code    - Get room info`);
});