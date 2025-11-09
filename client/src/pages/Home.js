import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useSocket } from '../contexts/SocketContext';

const Home = () => {
  const [username, setUsername] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [rounds, setRounds] = useState(10);
  const [addBots, setAddBots] = useState(false);
  const [botCount, setBotCount] = useState(1);
  const [botDifficulty, setBotDifficulty] = useState('smart');
  const navigate = useNavigate();
  const { socket } = useSocket();

  const handleCreateRoom = () => {
    if (!username.trim()) {
      alert('Please enter your name!');
      return;
    }
    
    setIsCreating(true);
    socket.emit('create-room', {
      username: username,
      rounds: rounds,
      addBots: addBots,
      botCount: botCount,
      botDifficulty: botDifficulty
    });
  };

  const handleJoinRoom = () => {
    if (!username.trim() || !roomCode.trim()) {
      alert('Please enter your name and room code!');
      return;
    }
    
    socket.emit('join-room', {
      roomCode: roomCode.toUpperCase(),
      username: username
    });
  };

  // Listen for room creation/join success
  React.useEffect(() => {
    if (!socket) return;

    const handleRoomCreated = (room) => {
      navigate(`/lobby/${room.code}`);
    };

    const handleRoomJoined = (room) => {
      navigate(`/lobby/${room.code}`);
    };

    const handleError = (error) => {
      alert(error);
      setIsCreating(false);
    };

    socket.on('room-created', handleRoomCreated);
    socket.on('room-joined', handleRoomJoined);
    socket.on('error', handleError);

    return () => {
      socket.off('room-created', handleRoomCreated);
      socket.off('room-joined', handleRoomJoined);
      socket.off('error', handleError);
    };
  }, [socket, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={i}
            initial={{
              x: Math.random() * window.innerWidth,
              y: Math.random() * window.innerHeight,
              opacity: 0.1,
            }}
            animate={{
              y: [null, Math.random() * window.innerHeight],
              x: [null, Math.random() * window.innerWidth],
            }}
            transition={{
              duration: 15 + Math.random() * 10,
              repeat: Infinity,
              ease: "linear",
            }}
            className="absolute text-4xl opacity-20"
          >
            {["👑", "💼", "⚔️", "🕵️", "🎴"][Math.floor(Math.random() * 5)]}
          </motion.div>
        ))}
      </div>

      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8">
        {/* Logo and Title Section - Horizontal Layout */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, type: "spring" }}
          className="flex items-center justify-center gap-4 mb-4"
        >
          <motion.div
            animate={{
              rotate: [0, 5, -5, 0],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            <img
              src="/logo.png"
              alt="Rajamantri Logo"
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-full border-4 border-amber-400 shadow-2xl object-cover"
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
          </motion.div>
          
          <div className="text-left">
            <motion.h1
              animate={{
                textShadow: [
                  "0 0 15px rgba(251, 191, 36, 0.5)",
                  "0 0 25px rgba(251, 191, 36, 0.8)",
                  "0 0 15px rgba(251, 191, 36, 0.5)",
                ],
              }}
              transition={{ duration: 2, repeat: Infinity }}
              className="text-3xl sm:text-4xl font-black bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-300 bg-clip-text text-transparent"
            >
              RAJAMANTRI
            </motion.h1>
            <p className="text-sm sm:text-base text-blue-200">
              A Game of Royal Deception 👑
            </p>
          </div>
        </motion.div>

        {/* Username Input - Compact */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="w-full max-w-md mb-4"
        >
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/20 shadow-xl">
            <label className="block text-white font-semibold mb-2 text-center text-sm">
              🎮 Enter Your Name
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Your awesome name..."
              className="w-full px-4 py-2 text-base border-2 border-amber-400 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-white text-gray-800 placeholder-gray-400 font-semibold shadow-lg"
            />
          </div>
        </motion.div>

        {/* Main Grid - Create Room (Left) & Join Room (Right) */}
        <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
          {/* LEFT SIDE - CREATE ROOM */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, type: "spring" }}
            className="bg-gradient-to-br from-amber-500/20 to-orange-600/20 backdrop-blur-md rounded-2xl p-4 sm:p-5 border-2 border-amber-400/50 shadow-2xl"
          >
            <div className="flex items-center gap-4 mb-4">
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <img
                  src="/create-room.png"
                  alt="Create Room"
                  className="w-20 h-20 drop-shadow-xl"
                  onError={(e) => {
                    e.target.innerHTML = '<div class="text-5xl">👑</div>';
                  }}
                />
              </motion.div>
              <div className="text-left flex-1">
                <h2 className="text-2xl font-black text-white mb-1">
                  Create Room
                </h2>
                <p className="text-amber-200 text-xs">
                  Start a new game and invite friends
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {/* Round Selection */}
              <div>
                <label className="block text-white font-bold mb-2 flex items-center justify-center text-sm">
                  <span className="mr-1 text-lg">🎯</span>
                  Number of Rounds
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[10, 15, 20, 25].map((round) => (
                    <motion.button
                      key={round}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setRounds(round)}
                      className={`py-2 px-2 rounded-lg font-bold text-base transition-all shadow-lg ${
                        rounds === round
                          ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white ring-2 ring-white/50'
                          : 'bg-white/20 text-white hover:bg-white/30'
                      }`}
                    >
                      {round}
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Bot Options */}
              <div className="bg-blue-500/20 backdrop-blur-sm rounded-xl p-3 border border-blue-400/30">
                <label className="flex items-center space-x-2 mb-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={addBots}
                    onChange={(e) => setAddBots(e.target.checked)}
                    className="w-4 h-4 text-amber-600 focus:ring-amber-500 rounded"
                  />
                  <span className="text-white font-bold text-sm flex items-center">
                    <span className="mr-1">🤖</span>
                    Add AI Players
                  </span>
                </label>

                {addBots && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-2"
                  >
                    {/* Bot Count */}
                    <div>
                      <label className="block text-white/90 font-medium mb-1 text-xs">
                        Number of AI Players
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        {[1, 2, 3].map((count) => (
                          <motion.button
                            key={count}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setBotCount(count)}
                            className={`py-1.5 px-2 rounded-lg font-bold text-sm transition-all ${
                              botCount === count
                                ? 'bg-blue-500 text-white ring-2 ring-white'
                                : 'bg-white/20 text-white hover:bg-white/30'
                            }`}
                          >
                            {count}
                          </motion.button>
                        ))}
                      </div>
                    </div>

                    {/* Bot Difficulty */}
                    <div>
                      <label className="block text-white/90 font-medium mb-1 text-xs">
                        AI Difficulty
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        {[
                          { value: 'smart', label: 'Hard', emoji: '🔥' },
                          { value: 'random', label: 'Medium', emoji: '⚡' },
                          { value: 'novice', label: 'Easy', emoji: '🌱' },
                        ].map((difficulty) => (
                          <motion.button
                            key={difficulty.value}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setBotDifficulty(difficulty.value)}
                            className={`py-1.5 px-2 rounded-lg font-bold text-xs transition-all ${
                              botDifficulty === difficulty.value
                                ? 'bg-green-500 text-white ring-2 ring-white'
                                : 'bg-white/20 text-white hover:bg-white/30'
                            }`}
                          >
                            <div className="text-sm">{difficulty.emoji}</div>
                            <div className="text-xs">{difficulty.label}</div>
                          </motion.button>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Create Button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleCreateRoom}
                disabled={isCreating}
                className="w-full bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-white py-3 px-4 rounded-xl font-black text-base hover:from-amber-600 hover:to-orange-700 transition-all shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed border-2 border-amber-300"
              >
                {isCreating ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Creating...
                  </span>
                ) : (
                  <span className="flex items-center justify-center">
                    <span className="mr-2">🎮</span>
                    Create New Room
                  </span>
                )}
              </motion.button>

              <div className="text-center text-white/70 text-xs">
                <p>🎯 {rounds} Rounds • 4 Players</p>
                {addBots && (
                  <p className="text-blue-300 mt-0.5">
                    🤖 {botCount} AI • {botDifficulty === 'smart' ? 'Hard' : botDifficulty === 'random' ? 'Medium' : 'Easy'}
                  </p>
                )}
              </div>
            </div>
          </motion.div>

          {/* RIGHT SIDE - JOIN ROOM */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, type: "spring" }}
            className="bg-gradient-to-br from-green-500/20 to-emerald-600/20 backdrop-blur-md rounded-2xl p-4 sm:p-5 border-2 border-green-400/50 shadow-2xl"
          >
            <div className="flex items-center gap-4 mb-4">
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <img
                  src="/join-room.png"
                  alt="Join Room"
                  className="w-20 h-20 drop-shadow-xl"
                  onError={(e) => {
                    e.target.innerHTML = '<div class="text-5xl">🎴</div>';
                  }}
                />
              </motion.div>
              <div className="text-left flex-1">
                <h2 className="text-2xl font-black text-white mb-1">
                  Join Room
                </h2>
                <p className="text-green-200 text-xs">
                  Enter a room code to join friends
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {/* Visual instruction */}
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/20">
                <div className="text-center space-y-2">
                  <motion.div
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="text-3xl"
                  >
                    🔑
                  </motion.div>
                  <p className="text-white font-medium text-sm">
                    Got a room code from a friend?
                  </p>
                  <p className="text-white/70 text-xs">
                    Enter the 6-character code below!
                  </p>
                </div>
              </div>

              {/* Room Code Input */}
              <div>
                <label className="block text-white font-bold mb-2 text-center text-sm">
                  🎯 Room Code
                </label>
                <input
                  type="text"
                  value={roomCode}
                  onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                  placeholder="ABC123"
                  maxLength={6}
                  className="w-full px-4 py-3 text-xl sm:text-2xl text-center font-black border-2 border-green-400 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white text-gray-800 placeholder-gray-400 shadow-lg uppercase tracking-widest"
                />
                <p className="text-white/60 text-xs text-center mt-1">
                  6-character code (e.g., ABC123)
                </p>
              </div>

              {/* Join Button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleJoinRoom}
                className="w-full bg-gradient-to-r from-green-500 via-emerald-500 to-green-600 text-white py-3 px-4 rounded-xl font-black text-base hover:from-green-600 hover:to-emerald-700 transition-all shadow-2xl border-2 border-green-300"
              >
                <span className="flex items-center justify-center">
                  <span className="mr-2">🚀</span>
                  Join Room
                </span>
              </motion.button>

              {/* Info */}
              <div className="bg-green-500/20 backdrop-blur-sm rounded-lg p-2.5 border border-green-400/30">
                <div className="flex items-start space-x-2">
                  <span className="text-lg">💡</span>
                  <div className="text-xs text-white/90">
                    <p className="font-bold mb-0.5">Quick Tips:</p>
                    <ul className="space-y-0.5 text-white/70">
                      <li>• Ask friend for room code</li>
                      <li>• Enter your name above</li>
                      <li>• Join before game starts</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-8 text-center text-blue-200"
        >
          <p className="text-sm font-medium">
            Real-time Multiplayer • Up to 4 Players • AI Support
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            onClick={() => window.location.href = '/showcase'}
            className="mt-3 text-amber-300 hover:text-amber-200 text-sm font-bold underline"
          >
            🎨 View Animation Showcase
          </motion.button>
        </motion.div>
      </div>
    </div>
  );
};

export default Home;