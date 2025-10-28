import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useSocket } from '../contexts/SocketContext';

const Game = () => {
  const { roomCode } = useParams();
  const { socket } = useSocket();
  const [gameState, setGameState] = useState(null);
  const [players, setPlayers] = useState([]);

  useEffect(() => {
    if (!socket) return;

    socket.on('game-update', (gameData) => {
      setGameState(gameData);
      setPlayers(gameData.players || []);
    });

    // Request game state
    socket.emit('join-game', roomCode);

    return () => {
      socket.off('game-update');
    };
  }, [socket, roomCode]);

  if (!gameState) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 to-blue-900">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 border-4 border-amber-500 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 to-blue-900 text-white p-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2">Game Room: {roomCode}</h1>
          <p className="text-blue-200">Round {gameState.currentRound} of {gameState.rounds}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {players.map((player, index) => (
            <motion.div
              key={player.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-blue-800 rounded-lg p-4 text-center border-2 border-blue-600"
            >
              <div className="w-16 h-16 bg-amber-500 rounded-full flex items-center justify-center text-white font-bold text-xl mx-auto mb-2">
                {player.username[0].toUpperCase()}
              </div>
              <h3 className="font-semibold">{player.username}</h3>
              {player.role && (
                <motion.p
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="text-amber-300 font-bold mt-1"
                >
                  {player.role.toUpperCase()}
                </motion.p>
              )}
            </motion.div>
          ))}
        </div>

        <div className="text-center">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-blue-800 rounded-lg p-6 inline-block"
          >
            <h2 className="text-2xl font-bold mb-4">Game Starting Soon!</h2>
            <p className="text-blue-200">Roles will be assigned when all players are ready</p>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Game;