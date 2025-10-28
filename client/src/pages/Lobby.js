import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useSocket } from '../contexts/SocketContext';

const Lobby = () => {
  const { roomCode } = useParams();
  const navigate = useNavigate();
  const { socket } = useSocket();
  const [room, setRoom] = useState(null);
  const [players, setPlayers] = useState([]);

  useEffect(() => {
    if (!socket) return;

    // Listen for room updates
    socket.on('player-joined', (player) => {
      setPlayers(prev => [...prev, player]);
    });

    socket.on('player-left', (playerId) => {
      setPlayers(prev => prev.filter(p => p.id !== playerId));
    });

    socket.on('game-started', (roomData) => {
      navigate(`/game/${roomCode}`);
    });

    return () => {
      socket.off('player-joined');
      socket.off('player-left');
      socket.off('game-started');
    };
  }, [socket, roomCode, navigate]);

  const handleStartGame = () => {
    socket.emit('start-game', roomCode);
  };

  const copyRoomCode = () => {
    navigator.clipboard.writeText(roomCode);
    alert('Room code copied to clipboard!');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl shadow-2xl p-8 max-w-2xl w-full"
      >
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Game Lobby</h1>
          <div className="flex items-center justify-center space-x-2">
            <p className="text-gray-600">Room Code:</p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={copyRoomCode}
              className="bg-amber-100 text-amber-800 px-4 py-2 rounded-lg font-mono font-bold text-lg"
            >
              {roomCode}
            </motion.button>
          </div>
        </div>

        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">Players ({players.length}/4)</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {players.map((player, index) => (
              <motion.div
                key={player.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-gray-50 rounded-lg p-4 flex items-center space-x-3 border-2 border-gray-200"
              >
                <div className="w-10 h-10 bg-amber-500 rounded-full flex items-center justify-center text-white font-semibold">
                  {player.username[0].toUpperCase()}
                </div>
                <div>
                  <p className="font-semibold text-gray-800">{player.username}</p>
                  {player.isHost && (
                    <span className="text-xs bg-amber-500 text-white px-2 py-1 rounded-full">Host</span>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="text-center">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleStartGame}
            disabled={players.length < 2}
            className="bg-green-600 text-white py-3 px-8 rounded-lg font-semibold text-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Start Game ({players.length}/4 players)
          </motion.button>
          {players.length < 2 && (
            <p className="text-red-500 text-sm mt-2">Need at least 2 players to start</p>
          )}
        </div>

        <div className="mt-8 text-center text-sm text-gray-500">
          <p>Share the room code with your friends to invite them!</p>
        </div>
      </motion.div>
    </div>
  );
};

export default Lobby;