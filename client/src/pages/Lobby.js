import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useSocket } from "../contexts/SocketContext";
import { ToastContainer } from "../components/Toast";
import ConfirmModal from "../components/ConfirmModal";

const Lobby = () => {
  const { roomCode } = useParams();
  const navigate = useNavigate();
  const { socket } = useSocket();
  const [players, setPlayers] = useState([]);
  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toasts, setToasts] = useState([]);
  const [botCount, setBotCount] = useState(0);
  const [showBotControls, setShowBotControls] = useState(false);
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    playerId: null,
    playerName: "",
  });

  const addToast = useCallback((message, type = "error", duration = 5000) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type, duration }]);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

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
      addToast(error, "error");
      setLoading(false);
    };

    // Handle game start
    const handleGameStarted = (roomData) => {
      console.log("🚀 Game started, navigating to game room");
      navigate(`/game/${roomCode}`);
    };

    // Handle being kicked from room
    const handleKickedFromRoom = (data) => {
      console.log("👋 Kicked from room:", data.message);
      addToast(data.message, "error", 4000);
      setTimeout(() => {
        navigate("/");
      }, 2000);
    };

    // Set up all listeners
    socket.on("room-created", handleRoomCreated);
    socket.on("room-joined", handleRoomJoined);
    socket.on("room-updated", handleRoomUpdated);
    socket.on("player-joined", handlePlayerJoined);
    socket.on("error", handleError);
    socket.on("game-started", handleGameStarted);
    socket.on("kicked-from-room", handleKickedFromRoom);

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
      socket.off("kicked-from-room", handleKickedFromRoom);
    };
  }, [socket, roomCode, navigate, addToast]);

  const handleStartGame = () => {
    console.log("🎯 Starting game for room:", roomCode);
    socket.emit("start-game", roomCode);
  };

  const handleAddBots = () => {
    if (botCount < 1 || botCount > 3) {
      addToast("Please select between 1-3 bots", "warning");
      return;
    }

    const humanCount = humanPlayers.length;
    const totalPlayers = humanCount + botCount;

    if (totalPlayers > 4) {
      addToast(
        `Cannot add ${botCount} bots. Maximum 4 players total. (Currently: ${humanCount} humans)`,
        "warning"
      );
      return;
    }

    // Update room settings
    socket.emit("update-bot-settings", {
      roomCode,
      addBots: true,
      botCount: botCount,
      botDifficulty: "smart",
    });

    addToast(
      `✅ ${botCount} bot(s) will join when game starts!`,
      "success",
      3000
    );
    setShowBotControls(false);
  };

  const handleRemoveBots = () => {
    socket.emit("update-bot-settings", {
      roomCode,
      addBots: false,
      botCount: 0,
    });

    addToast("🗑️ Bot settings removed", "info", 3000);
    setBotCount(0);
  };

  const handleRemovePlayer = (playerId, playerName) => {
    if (!isHost) {
      addToast("Only the host can remove players", "error");
      return;
    }

    if (playerId === socket?.id) {
      addToast("You cannot remove yourself", "error");
      return;
    }

    // Open confirmation modal
    setConfirmModal({
      isOpen: true,
      playerId,
      playerName,
    });
  };

  const confirmRemovePlayer = () => {
    const { playerId, playerName } = confirmModal;

    if (playerId && playerName) {
      socket.emit("remove-player", {
        roomCode,
        playerId,
      });
      addToast(`✅ ${playerName} has been removed`, "success", 3000);
    }

    // Close modal
    setConfirmModal({ isOpen: false, playerId: null, playerName: "" });
  };

  const copyRoomCode = () => {
    navigator.clipboard.writeText(roomCode);
    addToast(`📋 Room code ${roomCode} copied!`, "success", 2000);
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
          <h2 className="text-lg font-bold text-white mb-2">Loading Room...</h2>
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
              <h1 className="text-xl sm:text-2xl font-black text-white">
                Game Lobby
              </h1>
              {room && (
                <p className="text-white/70 text-xs">
                  {room.rounds} Rounds • {humanPlayers.length} Human
                  {humanPlayers.length !== 1 ? "s" : ""} • {plannedBotCount} AI
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
                        player.isBot
                          ? "bg-blue-500"
                          : "bg-gradient-to-r from-amber-500 to-orange-500"
                      }`}
                    >
                      {player.isBot ? "🤖" : player.username[0].toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-white text-sm truncate">
                        {player.username}
                      </p>
                      <div className="flex gap-1 flex-wrap items-center">
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
                    {/* Remove button (Host only, can't remove self) */}
                    {isHost && player.id !== socket?.id && (
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() =>
                          handleRemovePlayer(player.id, player.username)
                        }
                        className="w-7 h-7 rounded-full bg-red-500/80 hover:bg-red-600 flex items-center justify-center transition-colors"
                        title={`Remove ${player.username}`}
                      >
                        <span className="text-white text-lg leading-none">
                          ×
                        </span>
                      </motion.button>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Bot Controls Section (Host Only) */}
        {isHost && players.length < 4 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 flex justify-center"
          >
            <div className="max-w-md w-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 backdrop-blur-sm border border-blue-400/30 rounded-xl p-4 shadow-lg">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <span className="text-lg">🤖</span>
                  <span>AI Players</span>
                </h3>
                {plannedBotCount > 0 && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleRemoveBots}
                    className="text-xs bg-red-500/80 hover:bg-red-600 text-white px-2.5 py-1 rounded-lg font-semibold"
                  >
                    🗑️ Remove
                  </motion.button>
                )}
              </div>

              <AnimatePresence>
                {!showBotControls ? (
                  <motion.button
                    key="add-bots-btn"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => setShowBotControls(true)}
                    className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white py-2.5 rounded-lg font-bold text-sm transition-all shadow-md"
                  >
                    {plannedBotCount > 0
                      ? `✏️ Modify Bots (Current: ${plannedBotCount})`
                      : "➕ Add AI Players"}
                  </motion.button>
                ) : (
                  <motion.div
                    key="bot-controls"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-4"
                  >
                    <div>
                      <label className="text-white text-xs font-semibold mb-2 block text-center">
                        Select Number of Bots
                      </label>
                      <div className="flex gap-2 justify-center">
                        {[1, 2, 3].map((num) => (
                          <motion.button
                            key={num}
                            whileHover={{ scale: 1.08 }}
                            whileTap={{ scale: 0.92 }}
                            onClick={() => setBotCount(num)}
                            disabled={humanPlayers.length + num > 4}
                            className={`w-16 h-16 rounded-xl font-bold text-lg transition-all shadow-md ${
                              botCount === num
                                ? "bg-gradient-to-br from-amber-400 to-amber-600 text-white scale-105 ring-2 ring-amber-300"
                                : humanPlayers.length + num > 4
                                ? "bg-gray-600/50 text-gray-400 cursor-not-allowed"
                                : "bg-white/20 text-white hover:bg-white/30"
                            }`}
                          >
                            <div className="flex flex-col items-center gap-1">
                              <span className="text-2xl">🤖</span>
                              <span className="text-xs">{num}</span>
                            </div>
                          </motion.button>
                        ))}
                      </div>
                      <p className="text-white/70 text-xs mt-3 text-center bg-white/10 rounded-lg py-1.5 px-3">
                        Total: {humanPlayers.length} human
                        {humanPlayers.length !== 1 ? "s" : ""} + {botCount} bot
                        {botCount !== 1 ? "s" : ""} ={" "}
                        <span className="font-bold text-amber-300">
                          {humanPlayers.length + botCount}/4
                        </span>
                      </p>
                    </div>

                    <div className="flex gap-2">
                      <motion.button
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={handleAddBots}
                        disabled={botCount < 1}
                        className="flex-1 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-white py-2.5 rounded-lg font-bold text-sm transition-all shadow-md"
                      >
                        ✅ Confirm
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => setShowBotControls(false)}
                        className="flex-1 bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white py-2.5 rounded-lg font-bold text-sm transition-all shadow-md"
                      >
                        ❌ Cancel
                      </motion.button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}

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
                  Start Game ({humanPlayers.length} Human
                  {humanPlayers.length !== 1 ? "s" : ""})
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
                ⏳ Waiting for {players.find((p) => p.isHost)?.username} to
                start...
              </p>
            </motion.div>
          )}

          {/* Info Banner */}
          <div className="bg-white/5 backdrop-blur-sm border border-white/20 rounded-lg p-2 text-center">
            <p className="text-white/80 text-xs">
              💡 Share room code{" "}
              <span className="font-bold text-amber-300">{roomCode}</span> with
              friends!
            </p>
          </div>
        </div>
      </motion.div>

      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} removeToast={removeToast} />

      {/* Confirmation Modal */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() =>
          setConfirmModal({ isOpen: false, playerId: null, playerName: "" })
        }
        onConfirm={confirmRemovePlayer}
        title="Remove Player?"
        message="Are you sure you want to remove this player from the lobby?"
        playerName={confirmModal.playerName}
      />
    </div>
  );
};

export default Lobby;
