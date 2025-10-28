import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useSocket } from '../contexts/SocketContext';
import RoleCard from '../components/RoleCard';

const Game = () => {
  const { roomCode } = useParams();
  const { socket } = useSocket();
  const [players, setPlayers] = useState([]);
  const [currentRound, setCurrentRound] = useState(1);
  const [gameState, setGameState] = useState('role-assignment');
  const [myRole, setMyRole] = useState(null);

  useEffect(() => {
    if (!socket) return;

    console.log('🎮 Setting up game listeners');

    const handleGameStarted = (roomData) => {
      console.log('🚀 Game started with data:', roomData);
      setPlayers(roomData.players || []);
      setCurrentRound(roomData.currentRound || 1);
      setGameState(roomData.gameState || 'role-assignment');
      
      // Find my role
      const myPlayer = roomData.players.find(p => p.id === socket.id);
      if (myPlayer) {
        setMyRole(myPlayer.role);
      }
    };

    const handlePlayerRevealed = (data) => {
      console.log('🎭 Player revealed:', data);
      setPlayers(prev => prev.map(player => 
        player.id === data.playerId 
          ? { ...player, revealed: true }
          : player
      ));
    };

    const handleAllRolesRevealed = (roomData) => {
      console.log('🎉 All roles revealed');
      setGameState('guessing');
    };

    socket.on('game-started', handleGameStarted);
    socket.on('player-revealed', handlePlayerRevealed);
    socket.on('all-roles-revealed', handleAllRolesRevealed);

    // Request game state when component mounts
    socket.emit('request-room-update', roomCode);

    return () => {
      socket.off('game-started', handleGameStarted);
      socket.off('player-revealed', handlePlayerRevealed);
      socket.off('all-roles-revealed', handleAllRolesRevealed);
    };
  }, [socket, roomCode]);

  const handleRevealRole = () => {
    socket.emit('reveal-role', roomCode);
  };

  const getRoleDescription = (role) => {
    const descriptions = {
      raja: 'You are the King! Wait for the Mantri to find the Chor.',
      mantri: 'You are the Minister! Find the Chor among the players.',
      chor: 'You are the Thief! Try to avoid being caught.',
      sipahi: 'You are the Soldier! Protect the kingdom.'
    };
    return descriptions[role] || '';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 to-blue-900 text-white p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2">Game Room: {roomCode}</h1>
          <p className="text-blue-200">Round {currentRound}</p>
          <p className="text-amber-300 font-semibold mt-2">
            {gameState === 'role-assignment' && '🎴 Reveal your role!'}
            {gameState === 'guessing' && '🤔 Mantri is guessing...'}
          </p>
        </div>

        {/* Player Roles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {players.map((player, index) => (
            <motion.div
              key={player.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`bg-blue-800 rounded-lg p-4 text-center border-2 ${
                player.id === socket.id ? 'border-amber-400' : 'border-blue-600'
              }`}
            >
              <div className="w-16 h-16 bg-amber-500 rounded-full flex items-center justify-center text-white font-bold text-xl mx-auto mb-2">
                {player.username[0].toUpperCase()}
              </div>
              <h3 className="font-semibold">
                {player.username}
                {player.id === socket.id && (
                  <span className="text-amber-300 ml-1">(You)</span>
                )}
              </h3>
              
              {player.role && (
                <div className="mt-2">
                  {player.revealed ? (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="text-amber-300 font-bold"
                    >
                      {player.role.toUpperCase()}
                    </motion.div>
                  ) : (
                    <div className="text-gray-400 text-sm">
                      Role hidden
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          ))}
        </div>

        {/* Game Content */}
        <div className="text-center">
          {gameState === 'role-assignment' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-blue-800 rounded-lg p-8 max-w-2xl mx-auto"
            >
              <h2 className="text-2xl font-bold mb-4">Reveal Your Role! 🎴</h2>
              <p className="text-blue-200 mb-6">
                Click on your card below to reveal your role for this round.
              </p>
              
              <div className="flex justify-center mb-6">
                <RoleCard
                  player={players.find(p => p.id === socket.id)}
                  isCurrentPlayer={true}
                  onReveal={handleRevealRole}
                />
              </div>

              {myRole && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-amber-100 text-amber-800 p-4 rounded-lg max-w-md mx-auto"
                >
                  <h3 className="font-bold text-lg mb-2">Your Role: {myRole.toUpperCase()}</h3>
                  <p className="text-sm">{getRoleDescription(myRole)}</p>
                </motion.div>
              )}
            </motion.div>
          )}

          {gameState === 'guessing' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-blue-800 rounded-lg p-8 max-w-2xl mx-auto"
            >
              <h2 className="text-2xl font-bold mb-4">Mantri is Guessing! 🤔</h2>
              <p className="text-blue-200">
                The Minister is trying to identify the Thief...
              </p>
              
              {myRole === 'mantri' && (
                <div className="mt-6">
                  <h3 className="text-xl font-bold text-amber-300 mb-4">
                    You are the MANTRI! Guess who is the CHOR:
                  </h3>
                  <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
                    {players
                      .filter(player => player.role !== 'mantri' && player.role !== 'raja')
                      .map(player => (
                        <motion.button
                          key={player.id}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="bg-red-600 hover:bg-red-700 py-3 px-6 rounded-lg font-semibold"
                        >
                          {player.username}
                        </motion.button>
                      ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </div>

        {/* Debug Info */}
        <div className="mt-8 text-center text-xs text-blue-300 bg-blue-900 p-3 rounded-lg max-w-md mx-auto">
          <p>Game State: {gameState}</p>
          <p>Your Role: {myRole || 'Not assigned'}</p>
          <p>Players: {players.length}</p>
          <p>Socket: {socket?.id ? 'Connected' : 'Disconnected'}</p>
        </div>
      </div>
    </div>
  );
};

export default Game;