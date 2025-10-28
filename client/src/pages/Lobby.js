import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useSocket } from '../contexts/SocketContext';

const Lobby = () => {
  const { roomCode } = useParams();
  const navigate = useNavigate();
  const { socket } = useSocket();
  const [players, setPlayers] = useState([]);
  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!socket) {
      console.log('❌ Socket not available');
      return;
    }

    console.log('✅ Setting up socket listeners for room:', roomCode);

    // Handle initial room data
    const handleRoomCreated = (roomData) => {
      console.log('🎮 Room created data:', roomData);
      setRoom(roomData);
      setPlayers(roomData.players || []);
      setLoading(false);
    };

    const handleRoomJoined = (roomData) => {
      console.log('👤 Room joined data:', roomData);
      setRoom(roomData);
      setPlayers(roomData.players || []);
      setLoading(false);
    };

    // Handle room updates (when players join/leave)
    const handleRoomUpdated = (roomData) => {
      console.log('🔄 Room updated:', roomData);
      setRoom(roomData);
      setPlayers(roomData.players || []);
      setLoading(false);
    };

    // Handle player joining
    const handlePlayerJoined = (player) => {
      console.log('🟢 Player joined:', player);
      setPlayers(prev => {
        // Avoid duplicates
        if (prev.find(p => p.id === player.id)) return prev;
        return [...prev, player];
      });
    };

    // Handle errors
    const handleError = (error) => {
      console.log('❌ Socket error:', error);
      alert(error);
      setLoading(false);
    };

    // Handle game start
    const handleGameStarted = (roomData) => {
      console.log('🚀 Game started, navigating to game room');
      navigate(`/game/${roomCode}`);
    };

    // Set up all listeners
    socket.on('room-created', handleRoomCreated);
    socket.on('room-joined', handleRoomJoined);
    socket.on('room-updated', handleRoomUpdated);
    socket.on('player-joined', handlePlayerJoined);
    socket.on('error', handleError);
    socket.on('game-started', handleGameStarted);

    // Request room update when component mounts
    socket.emit('request-room-update', roomCode);

    // Cleanup function
    return () => {
      console.log('🧹 Cleaning up socket listeners');
      socket.off('room-created', handleRoomCreated);
      socket.off('room-joined', handleRoomJoined);
      socket.off('room-updated', handleRoomUpdated);
      socket.off('player-joined', handlePlayerJoined);
      socket.off('error', handleError);
      socket.off('game-started', handleGameStarted);
    };
  }, [socket, roomCode, navigate]);

  const handleStartGame = () => {
    console.log('🎯 Starting game for room:', roomCode);
    socket.emit('start-game', roomCode);
  };

  const copyRoomCode = () => {
    navigator.clipboard.writeText(roomCode);
    alert('Room code copied to clipboard!');
  };

  // Debug: Log current state
  useEffect(() => {
    console.log('📊 Current players:', players);
    console.log('📊 Current room:', room);
  }, [players, room]);

  const currentPlayer = players.find(p => p.id === socket?.id);
  const isHost = currentPlayer?.isHost;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Loading Room...</h2>
          <p className="text-gray-600">Connecting to room: {roomCode}</p>
          <p className="text-sm text-gray-500 mt-2">Socket: {socket?.id ? 'Connected' : 'Connecting...'}</p>
        </div>
      </div>
    );
  }

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
          {room && (
            <p className="text-gray-600 mt-2">
              Rounds: {room.rounds} • {players.length}/4 Players
            </p>
          )}
          {/* Debug info */}
          <div className="mt-2 text-xs text-gray-500 bg-gray-100 p-2 rounded">
            <p>Socket: {socket?.id ? `Connected (${socket.id})` : 'Disconnected'}</p>
            <p>Players visible: {players.length}</p>
            <p>Your ID: {socket?.id}</p>
          </div>
        </div>

        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">
            Players ({players.length}/4)
          </h2>
          
          {players.length === 0 ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500 mx-auto mb-4"></div>
              <p className="text-gray-500">Waiting for players to join...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {players.map((player, index) => (
                <motion.div
                  key={player.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`bg-gray-50 rounded-lg p-4 flex items-center space-x-3 border-2 ${
                    player.id === socket?.id ? 'border-amber-400 bg-amber-50' : 'border-gray-200'
                  }`}
                >
                  <div className="w-12 h-12 bg-amber-500 rounded-full flex items-center justify-center text-white font-semibold text-lg">
                    {player.username[0].toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-800">
                      {player.username}
                      {player.id === socket?.id && (
                        <span className="text-amber-600 ml-2">(You)</span>
                      )}
                    </p>
                    <div className="flex space-x-2 mt-1">
                      {player.isHost && (
                        <span className="text-xs bg-amber-500 text-white px-2 py-1 rounded-full">Host</span>
                      )}
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        player.connected ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
                      }`}>
                        {player.connected ? 'Online' : 'Offline'}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">ID: {player.id.substring(0, 8)}...</p>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        <div className="text-center">
          {isHost ? (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleStartGame}
              disabled={players.length < 2}
              className="bg-green-600 text-white py-3 px-8 rounded-lg font-semibold text-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Start Game ({players.length}/4 players)
            </motion.button>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-blue-100 text-blue-800 py-3 px-6 rounded-lg"
            >
              <p className="font-semibold">Waiting for host to start the game...</p>
              <p className="text-sm mt-1">Host: {players.find(p => p.isHost)?.username}</p>
            </motion.div>
          )}
          
          {players.length < 2 && (
            <p className="text-red-500 text-sm mt-2">Need at least 2 players to start</p>
          )}
        </div>

        <div className="mt-8 text-center text-sm text-gray-500">
          <p>Share the room code with your friends to invite them!</p>
          <p className="mt-1">Make sure all players are connected to see each other.</p>
        </div>

        {/* Debug controls */}
        <div className="mt-6 text-center">
          <button
            onClick={() => socket.emit('request-room-update', roomCode)}
            className="text-xs bg-gray-200 text-gray-700 px-3 py-1 rounded"
          >
            Refresh Room Data
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default Lobby;