import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useSocket } from "../contexts/SocketContext";

const Lobby = () => {
  const { roomCode } = useParams();
  const navigate = useNavigate();
  const { socket } = useSocket();
  const [players, setPlayers] = useState([]);
  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!socket) {
      console.log("❌ Socket not available");
      return;
    }

    console.log("✅ Setting up socket listeners for room:", roomCode);

    // Handle initial room data
    const handleRoomCreated = (roomData) => {
      console.log("🎮 Room created data:", roomData);
      setRoom(roomData);
      setPlayers(roomData.players || []);
      setLoading(false);
    };

    const handleRoomJoined = (roomData) => {
      console.log("👤 Room joined data:", roomData);
      setRoom(roomData);
      setPlayers(roomData.players || []);
      setLoading(false);
    };

    // Handle room updates (when players join/leave)
    const handleRoomUpdated = (roomData) => {
      console.log("🔄 Room updated:", roomData);
      setRoom(roomData);
      setPlayers(roomData.players || []);
      setLoading(false);
    };

    // Handle player joining
    const handlePlayerJoined = (player) => {
      console.log("🟢 Player joined:", player);
      setPlayers((prev) => {
        // Avoid duplicates
        if (prev.find((p) => p.id === player.id)) return prev;
        return [...prev, player];
      });
    };

    // Handle errors
    const handleError = (error) => {
      console.log("❌ Socket error:", error);
      alert(error);
      setLoading(false);
    };

    // Handle game start
    const handleGameStarted = (roomData) => {
      console.log("🚀 Game started, navigating to game room");
      navigate(`/game/${roomCode}`);
    };

    // Set up all listeners
    socket.on("room-created", handleRoomCreated);
    socket.on("room-joined", handleRoomJoined);
    socket.on("room-updated", handleRoomUpdated);
    socket.on("player-joined", handlePlayerJoined);
    socket.on("error", handleError);
    socket.on("game-started", handleGameStarted);

    // Request room update when component mounts
    socket.emit("request-room-update", roomCode);

    // Cleanup function
    return () => {
      console.log("🧹 Cleaning up socket listeners");
      socket.off("room-created", handleRoomCreated);
      socket.off("room-joined", handleRoomJoined);
      socket.off("room-updated", handleRoomUpdated);
      socket.off("player-joined", handlePlayerJoined);
      socket.off("error", handleError);
      socket.off("game-started", handleGameStarted);
    };
  }, [socket, roomCode, navigate]);

  const handleStartGame = () => {
    console.log("🎯 Starting game for room:", roomCode);
    socket.emit("start-game", roomCode);
  };

  const copyRoomCode = () => {
    navigator.clipboard.writeText(roomCode);
    alert("Room code copied to clipboard!");
  };

  // Debug: Log current state
  useEffect(() => {
    console.log("📊 Current players:", players);
    console.log("📊 Current room:", room);
  }, [players, room]);

  const currentPlayer = players.find((p) => p.id === socket?.id);
  const isHost = currentPlayer?.isHost;
  const humanPlayers = players.filter((p) => !p.isBot);
  const botPlayers = players.filter((p) => p.isBot);

  // Get planned bot count from room settings
  const plannedBotCount = room?.addBots ? room?.botCount || 0 : 0;
  const actualBotCount = botPlayers.length;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
        <div className="bg-white/10 backdrop-blur-md border-2 border-white/20 rounded-xl shadow-2xl p-6 max-w-md w-full text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-amber-400 mx-auto mb-3"></div>
          <h2 className="text-lg font-bold text-white mb-2">
            Loading Room...
          </h2>
          <p className="text-white/80 text-sm">Room: {roomCode}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-3">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white/10 backdrop-blur-md border-2 border-white/20 rounded-xl shadow-2xl p-4 sm:p-5 max-w-4xl w-full"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 flex items-center justify-center">
              <span className="text-xl">👑</span>
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-white">Game Lobby</h1>
              {room && (
                <p className="text-white/70 text-xs">
                  {room.rounds} Rounds • {humanPlayers.length} Human{humanPlayers.length !== 1 ? "s" : ""} • {plannedBotCount} AI
                </p>
              )}
            </div>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={copyRoomCode}
            className="bg-amber-500 hover:bg-amber-600 text-white px-3 py-2 rounded-lg font-mono font-bold text-sm sm:text-base shadow-lg"
          >
            📋 {roomCode}
          </motion.button>
        </div>

        {/* Players Section */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <span>👥</span> Players ({players.length}/4)
            </h2>
            {plannedBotCount > 0 && (
              <span className="text-xs text-blue-300 bg-blue-500/20 px-2 py-1 rounded-full">
                +{plannedBotCount} AI on start
              </span>
            )}
          </div>

          {players.length === 0 ? (
            <div className="text-center py-6 bg-white/5 rounded-lg">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-400 mx-auto mb-2"></div>
              <p className="text-white/70 text-sm">Waiting for players...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
              {players.map((player, index) => (
                <motion.div
                  key={player.id}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`bg-white/10 backdrop-blur-sm rounded-lg p-3 border-2 ${
                    player.id === socket?.id
                      ? "border-amber-400 bg-amber-500/20"
                      : player.isBot
                      ? "border-blue-400 bg-blue-500/20"
                      : "border-white/30"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm ${
                        player.isBot ? "bg-blue-500" : "bg-gradient-to-r from-amber-500 to-orange-500"
                      }`}
                    >
                      {player.isBot ? "🤖" : player.username[0].toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-white text-sm truncate">
                        {player.username}
                      </p>
                      <div className="flex gap-1 flex-wrap">
                        {player.isHost && (
                          <span className="text-xs bg-amber-500 text-white px-1.5 py-0.5 rounded">
                            👑 Host
                          </span>
                        )}
                        {player.id === socket?.id && (
                          <span className="text-xs bg-green-500 text-white px-1.5 py-0.5 rounded">
                            You
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Action Section */}
        <div className="space-y-2">
          {isHost ? (
            <>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleStartGame}
                disabled={humanPlayers.length < 2}
                className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white py-3 px-6 rounded-lg font-black text-base hover:from-green-600 hover:to-emerald-700 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed border-2 border-green-300"
              >
                <span className="flex items-center justify-center gap-2">
                  <span>🚀</span>
                  Start Game ({humanPlayers.length} Human{humanPlayers.length !== 1 ? "s" : ""})
                </span>
              </motion.button>
              {humanPlayers.length < 2 && (
                <p className="text-red-300 text-xs text-center">
                  ⚠️ Need at least 2 human players to start
                </p>
              )}
            </>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-blue-500/20 backdrop-blur-sm border border-blue-400/30 text-white py-3 px-4 rounded-lg text-center"
            >
              <p className="font-bold text-sm">
                ⏳ Waiting for {players.find((p) => p.isHost)?.username} to start...
              </p>
            </motion.div>
          )}

          {/* Info Banner */}
          <div className="bg-white/5 backdrop-blur-sm border border-white/20 rounded-lg p-2 text-center">
            <p className="text-white/80 text-xs">
              💡 Share room code <span className="font-bold text-amber-300">{roomCode}</span> with friends!
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Lobby;
