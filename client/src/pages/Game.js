import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useSocket } from "../contexts/SocketContext";
import RoleCard from "../components/RoleCard";
import Chat from "../components/Chat";

const Game = () => {
  const { roomCode } = useParams();
  const { socket } = useSocket();
  const [players, setPlayers] = useState([]);
  const [currentRound, setCurrentRound] = useState(1);
  const [gameState, setGameState] = useState("role-assignment");
  const [myRole, setMyRole] = useState(null);
  const [currentUsername, setCurrentUsername] = useState("");
  const [scores, setScores] = useState({});
  const [timer, setTimer] = useState(10);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [showRoundResult, setShowRoundResult] = useState(false);
  const [roundResult, setRoundResult] = useState(null);
  const [isChatOpen, setIsChatOpen] = useState(false);

  // Timer effect
  useEffect(() => {
    let interval;
    if (isTimerRunning && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else if (timer === 0 && isTimerRunning) {
      setIsTimerRunning(false);
      // Auto-select random guess if Mantri doesn't choose and is human
      if (myRole === "mantri") {
        const currentPlayer = players.find((p) => p.id === socket.id);
        if (currentPlayer && !currentPlayer.isBot) {
          const possibleTargets = players.filter(
            (p) =>
              p.role !== "mantri" && p.role !== "raja" && p.id !== socket.id
          );
          if (possibleTargets.length > 0) {
            const randomIndex = Math.floor(
              Math.random() * possibleTargets.length
            );
            handleMantriGuess(possibleTargets[randomIndex].id);
          }
        }
      }
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, timer, myRole, players, socket]);

  // Start timer when guessing phase begins
  useEffect(() => {
    if (gameState === "guessing") {
      const mantri = players.find((p) => p.role === "mantri");
      if (mantri && !mantri.isBot) {
        setTimer(10);
        setIsTimerRunning(true);
      } else {
        setIsTimerRunning(false);
      }
    } else {
      setIsTimerRunning(false);
    }
  }, [gameState, players]);

  useEffect(() => {
    if (!socket) return;

    console.log("🎮 Setting up game listeners");

    const handleGameStarted = (roomData) => {
      console.log("🚀 Game started with data:", roomData);
      setPlayers(roomData.players || []);
      setCurrentRound(roomData.currentRound || 1);
      setGameState(roomData.gameState || "role-assignment");
      setScores(roomData.scores || {});
      setShowRoundResult(false);

      // Find my role and username
      const myPlayer = roomData.players.find((p) => p.id === socket.id);
      if (myPlayer) {
        setMyRole(myPlayer.role);
        setCurrentUsername(myPlayer.username);
      }
    };

    const handlePlayerRevealed = (data) => {
      console.log("🎭 Player revealed:", data);
      setPlayers((prev) =>
        prev.map((player) =>
          player.id === data.playerId ? { ...player, revealed: true } : player
        )
      );
    };

    const handleAllRolesRevealed = (roomData) => {
      console.log("🎉 All roles revealed");
      setGameState("guessing");
    };

    const handleGuessProcessed = (roomData) => {
      console.log("🎯 Guess processed:", roomData);
      setGameState("round-result");
      setScores(roomData.scores || {});
      setRoundResult(roomData.roundResult);
      setShowRoundResult(true);

      // Update player scores
      setPlayers((prev) =>
        prev.map((player) => ({
          ...player,
          score: roomData.scores[player.id] || player.score,
        }))
      );

      // Auto-hide round result after 5 seconds
      setTimeout(() => {
        setShowRoundResult(false);
      }, 5000);
    };

    const handleNextRoundStarted = (roomData) => {
      console.log("🔄 Next round started:", roomData);
      setPlayers(roomData.players || []);
      setCurrentRound(roomData.currentRound || 1);
      setGameState("role-assignment");
      setMyRole(null);
      setShowRoundResult(false);

      // Find my role for the new round
      const myPlayer = roomData.players.find((p) => p.id === socket.id);
      if (myPlayer) {
        setMyRole(myPlayer.role);
      }
    };

    socket.on("game-started", handleGameStarted);
    socket.on("player-revealed", handlePlayerRevealed);
    socket.on("all-roles-revealed", handleAllRolesRevealed);
    socket.on("guess-processed", handleGuessProcessed);
    socket.on("next-round-started", handleNextRoundStarted);

    // Request game state when component mounts
    socket.emit("request-room-update", roomCode);

    return () => {
      socket.off("game-started", handleGameStarted);
      socket.off("player-revealed", handlePlayerRevealed);
      socket.off("all-roles-revealed", handleAllRolesRevealed);
      socket.off("guess-processed", handleGuessProcessed);
      socket.off("next-round-started", handleNextRoundStarted);
    };
  }, [socket, roomCode]);

  const handleRevealRole = () => {
    socket.emit("reveal-role", roomCode);
  };

  const handleMantriGuess = (guessedPlayerId) => {
    setIsTimerRunning(false);
    socket.emit("mantri-guess", roomCode, guessedPlayerId);
  };

  const getRoleDescription = (role) => {
    const descriptions = {
      raja: "You are the King! Wait for the Mantri to find the Chor.",
      mantri: "You are the Minister! Find the Chor among the players.",
      chor: "You are the Thief! Try to avoid being caught.",
      sipahi: "You are the Soldier! Protect the kingdom.",
    };
    return descriptions[role] || "";
  };

  const getRoleIcon = (role) => {
    const icons = {
      raja: "👑",
      mantri: "💼",
      chor: "🕵️",
      sipahi: "⚔️",
    };
    return icons[role] || "❓";
  };

  const getCurrentPlayer = () => {
    return players.find((p) => p.id === socket.id);
  };

  const isMantri = () => {
    return myRole === "mantri";
  };

  const getTimerColor = () => {
    if (timer > 7) return "text-green-400";
    if (timer > 3) return "text-yellow-400";
    return "text-red-500";
  };

  const getTimerBgColor = () => {
    if (timer > 7) return "bg-green-500";
    if (timer > 3) return "bg-yellow-500";
    return "bg-red-500";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 to-blue-900 text-white p-2 sm:p-4">
      <div className="max-w-7xl mx-auto">
        {/* Mobile Chat Toggle Button */}
        <div className="lg:hidden fixed top-4 right-4 z-40">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsChatOpen(!isChatOpen)}
            className="bg-amber-500 text-white p-3 rounded-full shadow-lg border-2 border-amber-300"
          >
            {isChatOpen ? "✕" : "💬"}
          </motion.button>
        </div>

        {/* Header with Scoreboard - Mobile Optimized */}
        <div className="bg-blue-800/50 backdrop-blur-sm rounded-2xl p-3 sm:p-4 lg:p-6 mb-4 lg:mb-8 border border-blue-600/50">
          <div className="flex flex-col space-y-3 lg:space-y-0 lg:flex-row lg:justify-between lg:items-center">
            {/* Game Info */}
            <div className="text-center lg:text-left">
              <h1 className="text-xl sm:text-2xl lg:text-4xl font-bold mb-2 bg-gradient-to-r from-amber-300 to-yellow-400 bg-clip-text text-transparent">
                {window.innerWidth < 1024 ? roomCode : `Room: ${roomCode}`}
              </h1>
              <div className="flex flex-wrap justify-center lg:justify-start items-center gap-2 text-xs sm:text-sm">
                <div className="flex items-center space-x-1 bg-amber-500/20 px-2 py-1 rounded-full">
                  <span className="text-blue-200">Round</span>
                  <span className="bg-amber-500 text-white px-2 py-1 rounded-full font-bold text-sm">
                    {currentRound}
                  </span>
                </div>
                <div className="flex items-center space-x-1 bg-green-500/20 px-2 py-1 rounded-full">
                  <span className="text-blue-200">Players</span>
                  <span className="bg-green-500 text-white px-2 py-1 rounded-full font-bold text-sm">
                    {players.length}/4
                  </span>
                </div>
                <div className="flex items-center space-x-1 bg-purple-500/20 px-2 py-1 rounded-full">
                  <span className="text-blue-200">Your Role</span>
                  <span className="bg-purple-500 text-white px-2 py-1 rounded-full font-bold text-sm">
                    {myRole ? myRole.toUpperCase() : "..."}
                  </span>
                </div>
              </div>
            </div>

            {/* Live Scoreboard - Mobile Optimized */}
            <div className="bg-blue-900/80 rounded-xl p-3 sm:min-w-[280px] border border-blue-700/50">
              <h3 className="text-base sm:text-lg font-bold text-center mb-2 text-amber-300">
                🏆 Scores
              </h3>
              <div className="grid grid-cols-2 gap-1 sm:gap-2">
                {players
                  .sort((a, b) => (scores[b.id] || 0) - (scores[a.id] || 0))
                  .map((player, index) => (
                    <motion.div
                      key={player.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className={`flex items-center justify-between p-1 sm:p-2 rounded-lg ${
                        player.id === socket.id
                          ? "bg-amber-500/20 border border-amber-400/50"
                          : "bg-blue-800/50"
                      } ${player.isBot ? "border-green-400/50" : ""}`}
                    >
                      <div className="flex items-center space-x-1 sm:space-x-2">
                        <div
                          className={`w-4 h-4 sm:w-6 sm:h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                            player.isBot ? "bg-green-500" : "bg-amber-500"
                          }`}
                        >
                          {player.username[0]}
                        </div>
                        <span className="text-xs sm:text-sm font-medium truncate max-w-[60px] sm:max-w-[80px]">
                          {player.username}
                          {player.id === socket.id && " (You)"}
                        </span>
                      </div>
                      <div className="flex items-center space-x-1">
                        {index === 0 && players.length > 1 && (
                          <span className="text-yellow-400 text-xs">👑</span>
                        )}
                        <span className="bg-blue-700 px-1 sm:px-2 py-1 rounded text-xs sm:text-sm font-bold">
                          {scores[player.id] || 0}
                        </span>
                      </div>
                    </motion.div>
                  ))}
              </div>
            </div>
          </div>
        </div>

        {/* Timer Banner - Mobile Optimized */}
        <AnimatePresence>
          {isTimerRunning && (
            <motion.div
              initial={{ opacity: 0, y: -50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -50 }}
              className="fixed top-2 sm:top-4 left-1/2 transform -translate-x-1/2 z-50 w-[90%] max-w-md"
            >
              <div className="bg-gradient-to-r from-red-600 to-orange-500 rounded-full px-4 sm:px-8 py-3 sm:py-4 shadow-2xl border-2 border-white/20">
                <div className="flex items-center justify-between sm:justify-center sm:space-x-4">
                  <div className="text-white font-bold text-sm sm:text-lg">
                    ⏰{" "}
                    {window.innerWidth < 640 ? "Timer" : "Mantri Guess Timer"}
                  </div>
                  <div
                    className={`text-2xl sm:text-3xl font-black ${getTimerColor()} animate-pulse`}
                  >
                    {timer}s
                  </div>
                  <div className="w-12 sm:w-16 h-3 sm:h-4 bg-white/30 rounded-full overflow-hidden">
                    <motion.div
                      className={`h-full ${getTimerBgColor()} rounded-full`}
                      initial={{ width: "100%" }}
                      animate={{ width: `${(timer / 10) * 100}%` }}
                      transition={{ duration: 1 }}
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Round Result Popup - Mobile Optimized */}
        <AnimatePresence>
          {showRoundResult && roundResult && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-2 sm:p-4"
            >
              <motion.div
                initial={{ y: 50 }}
                animate={{ y: 0 }}
                className="bg-gradient-to-br from-blue-800 to-purple-900 rounded-2xl p-4 sm:p-6 md:p-8 w-full max-w-md border-2 border-amber-400/50 shadow-2xl mx-2"
              >
                <div className="text-center">
                  <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-amber-300 mb-3 sm:mb-4">
                    {roundResult.isCorrect ? "🎯 Correct!" : "❌ Wrong!"}
                  </h2>

                  <div className="bg-white/10 rounded-xl p-3 sm:p-4 mb-4 sm:mb-6">
                    <p className="text-sm sm:text-base md:text-lg text-white mb-2">
                      The{" "}
                      <span className="font-bold text-amber-300">Mantri</span>{" "}
                      guessed{" "}
                      <span className="font-bold text-red-300">
                        {
                          players.find(
                            (p) => p.id === roundResult.guessedPlayerId
                          )?.username
                        }
                      </span>
                    </p>
                    <p className="text-sm sm:text-base md:text-lg text-white">
                      Real <span className="font-bold text-red-400">Chor</span>:{" "}
                      <span className="font-bold text-green-300">
                        {
                          players.find((p) => p.id === roundResult.actualChorId)
                            ?.username
                        }
                      </span>
                    </p>
                  </div>

                  {/* Score Changes */}
                  <div className="bg-black/30 rounded-xl p-3 sm:p-4 mb-4 sm:mb-6">
                    <h3 className="text-lg sm:text-xl font-bold text-amber-300 mb-2 sm:mb-3">
                      Score Changes
                    </h3>
                    <div className="space-y-1 sm:space-y-2">
                      {players.map((player) => {
                        const oldScore =
                          (player.score || 0) -
                          (scores[player.id] - (player.score || 0));
                        const scoreChange = (scores[player.id] || 0) - oldScore;
                        if (scoreChange === 0) return null;

                        return (
                          <div
                            key={player.id}
                            className="flex justify-between items-center text-sm sm:text-base"
                          >
                            <span className="text-white truncate max-w-[120px]">
                              {player.username}
                            </span>
                            <span
                              className={`font-bold ${
                                scoreChange > 0
                                  ? "text-green-400"
                                  : "text-red-400"
                              }`}
                            >
                              {scoreChange > 0 ? "+" : ""}
                              {scoreChange}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.5 }}
                    className="text-amber-200 text-xs sm:text-sm"
                  >
                    Next round starting soon...
                  </motion.div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
          {/* Left Column - Game Area */}
          <div
            className={`lg:col-span-2 ${
              isChatOpen ? "hidden lg:block" : "block"
            }`}
          >
            {/* Player Roles Grid - Mobile Optimized */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-6 sm:mb-8">
              {players.map((player, index) => (
                <motion.div
                  key={player.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`bg-gradient-to-br from-blue-800 to-blue-900 rounded-xl p-3 sm:p-4 text-center border-2 relative overflow-hidden ${
                    player.id === socket.id
                      ? "border-amber-400 shadow-lg shadow-amber-400/20"
                      : "border-blue-600"
                  } ${player.isBot ? "border-green-400" : ""}`}
                >
                  {/* Bot Indicator */}
                  {player.isBot && (
                    <div className="absolute top-2 left-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full flex items-center space-x-1">
                      <span>AI</span>
                      <span>🤖</span>
                    </div>
                  )}

                  {/* Score Badge */}
                  <div className="absolute top-2 right-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs px-2 sm:px-3 py-1 rounded-full font-bold shadow-lg">
                    {scores[player.id] || 0}
                  </div>

                  {/* Online Indicator */}
                  <div className="absolute top-2 left-1/2 transform -translate-x-1/2">
                    <div
                      className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full ${
                        player.connected ? "bg-green-500" : "bg-red-500"
                      } shadow-lg`}
                    />
                  </div>

                  <div
                    className={`w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center text-white font-bold text-xl sm:text-2xl mx-auto mb-2 sm:mb-3 mt-4 sm:mt-4 shadow-lg ${
                      player.isBot
                        ? "bg-gradient-to-br from-green-500 to-emerald-600"
                        : "bg-gradient-to-br from-amber-500 to-orange-500"
                    }`}
                  >
                    {player.username[0].toUpperCase()}
                  </div>
                  <h3 className="font-semibold text-base sm:text-lg truncate px-2">
                    {player.username}
                    {player.id === socket.id && (
                      <span className="text-amber-300 ml-1">(You)</span>
                    )}
                  </h3>

                  {player.role && (
                    <div className="mt-2 sm:mt-3">
                      {player.revealed ? (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="bg-gradient-to-r from-amber-400 to-yellow-500 text-amber-900 px-3 sm:px-4 py-1 sm:py-2 rounded-full font-bold text-xs sm:text-sm shadow-lg"
                        >
                          <div className="flex items-center justify-center space-x-1 sm:space-x-2">
                            <span className="text-base sm:text-lg">
                              {getRoleIcon(player.role)}
                            </span>
                            <span>{player.role.toUpperCase()}</span>
                          </div>
                        </motion.div>
                      ) : (
                        <div className="bg-gray-700 text-gray-400 px-3 sm:px-4 py-1 sm:py-2 rounded-full text-xs sm:text-sm">
                          Role hidden
                        </div>
                      )}
                    </div>
                  )}
                </motion.div>
              ))}
            </div>

            {/* Game Content - Mobile Optimized */}
            <div className="text-center">
              {gameState === "role-assignment" && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="bg-gradient-to-br from-blue-800 to-purple-900 rounded-2xl p-4 sm:p-6 md:p-8 border border-blue-600/50 shadow-2xl"
                >
                  <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-amber-300 mb-3 sm:mb-4">
                    Reveal Your Role! 🎴
                  </h2>
                  <p className="text-blue-200 mb-4 sm:mb-6 text-sm sm:text-base md:text-lg">
                    Click your card to reveal your role
                  </p>

                  <div className="flex justify-center mb-6 sm:mb-8">
                    <RoleCard
                      player={getCurrentPlayer()}
                      isCurrentPlayer={true}
                      onReveal={handleRevealRole}
                    />
                  </div>

                  {myRole && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-gradient-to-r from-amber-400 to-yellow-500 text-amber-900 p-4 sm:p-6 rounded-2xl max-w-md mx-auto shadow-lg"
                    >
                      <h3 className="font-bold text-lg sm:text-xl md:text-2xl mb-2 sm:mb-3">
                        Your Role: {myRole.toUpperCase()}
                      </h3>
                      <p className="text-amber-800 font-medium text-sm sm:text-base">
                        {getRoleDescription(myRole)}
                      </p>
                    </motion.div>
                  )}

                  <div className="mt-4 sm:mt-6 text-blue-200">
                    <p className="text-sm sm:text-base md:text-lg">
                      Waiting for {players.filter((p) => !p.revealed).length}{" "}
                      player
                      {players.filter((p) => !p.revealed).length !== 1
                        ? "s"
                        : ""}
                      ...
                    </p>
                  </div>
                </motion.div>
              )}

              {gameState === "guessing" && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="bg-gradient-to-br from-blue-800 to-purple-900 rounded-2xl p-4 sm:p-6 md:p-8 border border-blue-600/50 shadow-2xl"
                >
                  <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-amber-300 mb-3 sm:mb-4">
                    Mantri is Guessing! 🤔
                  </h2>
                  <p className="text-blue-200 text-sm sm:text-base md:text-lg mb-4 sm:mb-6">
                    The Minister is trying to identify the Thief...
                  </p>

                  {isMantri() ? (
                    <div className="mt-4 sm:mt-6">
                      <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-amber-300 mb-4 sm:mb-6">
                        You are the{" "}
                        <span className="text-yellow-400">MANTRI</span>! Guess
                        the CHOR:
                      </h3>
                      <div className="grid grid-cols-1 gap-3 sm:gap-4 max-w-2xl mx-auto">
                        {players
                          .filter(
                            (player) =>
                              player.role !== "mantri" && player.role !== "raja"
                          )
                          .map((player) => (
                            <motion.button
                              key={player.id}
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => handleMantriGuess(player.id)}
                              className="bg-gradient-to-r from-red-600 to-pink-700 hover:from-red-700 hover:to-pink-800 text-white py-3 sm:py-4 px-4 sm:px-6 rounded-xl font-bold text-base sm:text-lg shadow-lg transition-all duration-200 border-2 border-red-500/50"
                            >
                              <div className="flex items-center justify-center space-x-2 sm:space-x-3">
                                <span className="text-xl sm:text-2xl">🕵️</span>
                                <span className="truncate">
                                  {player.username}
                                </span>
                                {player.isBot && (
                                  <span className="text-green-300">🤖</span>
                                )}
                              </div>
                            </motion.button>
                          ))}
                      </div>
                      {isTimerRunning && (
                        <div className="mt-4 sm:mt-6 text-yellow-300 text-sm sm:text-base md:text-lg">
                          ⏰ Time: <span className="font-bold">{timer}s</span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="mt-4 sm:mt-6">
                      <p className="text-amber-300 text-base sm:text-xl">
                        Waiting for{" "}
                        <strong className="text-yellow-400">
                          {players.find((p) => p.role === "mantri")?.username}
                        </strong>{" "}
                        to guess...
                      </p>
                      {players.find((p) => p.role === "mantri")?.isBot && (
                        <p className="text-green-300 mt-2 text-sm sm:text-base">
                          🤖 AI is thinking...
                        </p>
                      )}
                    </div>
                  )}
                </motion.div>
              )}

              {gameState === "round-result" && !showRoundResult && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="bg-gradient-to-br from-blue-800 to-purple-900 rounded-2xl p-4 sm:p-6 md:p-8 border border-blue-600/50 shadow-2xl"
                >
                  <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-amber-300 mb-3 sm:mb-4">
                    Round Complete! 🎉
                  </h2>
                  <p className="text-blue-200 text-sm sm:text-base md:text-lg">
                    Preparing for next round...
                  </p>
                  <div className="mt-4 sm:mt-6">
                    <div className="animate-spin rounded-full h-8 w-8 sm:h-12 sm:w-12 border-b-2 border-amber-500 mx-auto"></div>
                  </div>
                </motion.div>
              )}
            </div>
          </div>

          {/* Right Column - Chat - Mobile Optimized */}
          <div
            className={`lg:col-span-1 ${
              isChatOpen
                ? "fixed inset-0 z-50 bg-black/50 p-4 lg:static lg:bg-transparent lg:p-0"
                : "hidden lg:block"
            }`}
          >
            <div className={`${isChatOpen ? "h-full" : ""}`}>
              <Chat roomCode={roomCode} currentUsername={currentUsername} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Game;
