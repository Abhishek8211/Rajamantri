import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useSocket } from '../contexts/SocketContext';

const Home = () => {
  const [username, setUsername] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [rounds, setRounds] = useState(5);
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
    <div className="min-h-screen flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full"
      >
        <div className="text-center mb-8">
          <motion.h1
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            className="text-4xl font-bold text-amber-800 mb-2"
          >
            👑 Raja Mantri Chor Sipahi
          </motion.h1>
          <p className="text-gray-600">A Game of Royal Deception</p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Your Name
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your name"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            />
          </div>

          {/* Round Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Number of Rounds
            </label>
            <div className="flex space-x-2">
              {[10, 15, 20, 25].map((round) => (
                <motion.button
                  key={round}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setRounds(round)}
                  className={`flex-1 py-2 px-3 rounded-lg font-semibold transition-colors ${
                    rounds === round
                      ? 'bg-amber-500 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {round}
                </motion.button>
              ))}
            </div>
          </div>

          {/* Bot Options */}
          <div className="space-y-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center justify-between">
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={addBots}
                  onChange={(e) => setAddBots(e.target.checked)}
                  className="w-4 h-4 text-amber-600 focus:ring-amber-500"
                />
                <span className="text-sm font-medium text-gray-700">
                  Add AI Players 🤖
                </span>
              </label>
            </div>

            {addBots && (
              <div className="space-y-3 pl-7">
                {/* Bot Count */}
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-2">
                    Number of AI Players
                  </label>
                  <div className="flex space-x-2">
                    {[1, 2, 3].map((count) => (
                      <motion.button
                        key={count}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setBotCount(count)}
                        className={`flex-1 py-1 px-2 rounded text-xs font-semibold transition-colors ${
                          botCount === count
                            ? 'bg-blue-500 text-white'
                            : 'bg-blue-200 text-blue-700 hover:bg-blue-300'
                        }`}
                      >
                        {count}
                      </motion.button>
                    ))}
                  </div>
                </div>

                {/* Bot Difficulty */}
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-2">
                    AI Difficulty
                  </label>
                  <div className="flex space-x-2">
                    {[
                      { value: 'smart', label: 'Smart', desc: '70% win' },
                      { value: 'random', label: 'Medium', desc: '25% win' },
                      { value: 'novice', label: 'Easy', desc: '10% win' }
                    ].map((difficulty) => (
                      <motion.button
                        key={difficulty.value}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setBotDifficulty(difficulty.value)}
                        className={`flex-1 py-1 px-2 rounded text-xs font-semibold transition-colors ${
                          botDifficulty === difficulty.value
                            ? 'bg-green-500 text-white'
                            : 'bg-green-200 text-green-700 hover:bg-green-300'
                        }`}
                        title={difficulty.desc}
                      >
                        {difficulty.label}
                      </motion.button>
                    ))}
                  </div>
                </div>

                <p className="text-xs text-blue-600">
                  🤖 AI players will join automatically to fill empty spots
                </p>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleCreateRoom}
              disabled={isCreating}
              className="w-full bg-amber-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-amber-700 transition-colors disabled:opacity-50"
            >
              {isCreating ? 'Creating Room...' : 'Create New Room'}
            </motion.button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Or</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Room Code
              </label>
              <input
                type="text"
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                placeholder="Enter room code"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent uppercase"
              />
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleJoinRoom}
              className="w-full bg-green-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-green-700 transition-colors"
            >
              Join Room
            </motion.button>
          </div>
        </div>

        <div className="mt-8 text-center text-sm text-gray-500">
          <p>Up to 4 players • {rounds} rounds • Real-time multiplayer</p>
          {addBots && (
            <p className="text-blue-600">
              🤖 {botCount} AI player{botCount > 1 ? 's' : ''} ({botDifficulty} difficulty)
            </p>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default Home;