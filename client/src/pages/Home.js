import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useSocket } from '../contexts/SocketContext';

const Home = () => {
  const [username, setUsername] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [isCreating, setIsCreating] = useState(false);
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
      rounds: 5
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
          <p>Up to 4 players • Real-time multiplayer • Royal strategy game</p>
        </div>
      </motion.div>
    </div>
  );
};

export default Home;