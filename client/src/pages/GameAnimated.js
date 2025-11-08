import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useSocket } from "../contexts/SocketContext";
import GameBoard from "../components/GameBoard";
import AnimatedCard from "../components/AnimatedCard";
import ScorePopup from "../components/ScorePopup";
import RoleRevealAnimation from "../components/RoleRevealAnimation";
import CardDeck from "../components/CardDeck";
import Chat from "../components/Chat";

const GameAnimated = () => {
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
  const [showRoleReveal, setShowRoleReveal] = useState(false);
  const [showScorePopup, setShowScorePopup] = useState(false);
  const [scoreChanges, setScoreChanges] = useState([]);
  const [isDistributingCards, setIsDistributingCards] = useState(false);

  // Timer effect
  useEffect(() => {
    let interval;
    if (isTimerRunning && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else if (timer === 0 && isTimerRunning) {
      setIsTimerRunning(false);
      if (myRole === "mantri") {
        const currentPlayer = players.find((p) => p.id === socket.id);
        if (currentPlayer && !currentPlayer.isBot) {
          const possibleTargets = players.filter(
            (p) => p.role !== "mantri" && p.role !== "raja" && p.id !== socket.id
          );
          if (possibleTargets.length > 0) {
            const randomIndex = Math.floor(Math.random() * possibleTargets.length);
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

    const handleGameStarted = (roomData) => {
      setPlayers(roomData.players || []);
      setCurrentRound(roomData.currentRound || 1);
      setGameState(roomData.gameState || "role-assignment");
      setScores(roomData.scores || {});
      setShowRoundResult(false);
      setIsDistributingCards(true);

      const myPlayer = roomData.players.find((p) => p.id === socket.id);
      if (myPlayer) {
        setMyRole(myPlayer.role);
        setCurrentUsername(myPlayer.username);
      }

      // Hide card distribution after animation
      setTimeout(() => {
        setIsDistributingCards(false);
      }, 3000);
    };

    const handlePlayerRevealed = (data) => {
      setPlayers((prev) =>
        prev.map((player) =>
          player.id === data.playerId ? { ...player, revealed: true } : player
        )
      );

      // Show role reveal animation for current player
      if (data.playerId === socket.id) {
        setShowRoleReveal(true);
        setTimeout(() => {
          setShowRoleReveal(false);
        }, 7000);
      }
    };

    const handleAllRolesRevealed = (roomData) => {
      setGameState("guessing");
    };

    const handleGuessProcessed = (roomData) => {
      setGameState("round-result");
      const oldScores = { ...scores };
      setScores(roomData.scores || {});
      setRoundResult(roomData.roundResult);
      setShowRoundResult(true);

      // Calculate score changes for popup
      const changes = players.map((player) => {
        const oldScore = oldScores[player.id] || 0;
        const newScore = roomData.scores[player.id] || 0;
        const points = newScore - oldScore;

        return {
          playerId: player.id,
          playerName: player.username,
          role: player.role,
          icon: getRoleIcon(player.role),
          points: points,
        };
      }).filter(c => c.points !== 0);

      setScoreChanges(changes);
      setShowScorePopup(true);

      setPlayers((prev) =>
        prev.map((player) => ({
          ...player,
          score: roomData.scores[player.id] || player.score,
        }))
      );

      setTimeout(() => {
        setShowRoundResult(false);
      }, 5000);
    };

    const handleNextRoundStarted = (roomData) => {
      setPlayers(roomData.players || []);
      setCurrentRound(roomData.currentRound || 1);
      setGameState("role-assignment");
      setMyRole(null);
      setShowRoundResult(false);
      setIsDistributingCards(true);

      const myPlayer = roomData.players.find((p) => p.id === socket.id);
      if (myPlayer) {
        setMyRole(myPlayer.role);
      }

      setTimeout(() => {
        setIsDistributingCards(false);
      }, 3000);
    };

    socket.on("game-started", handleGameStarted);
    socket.on("player-revealed", handlePlayerRevealed);
    socket.on("all-roles-revealed", handleAllRolesRevealed);
    socket.on("guess-processed", handleGuessProcessed);
    socket.on("next-round-started", handleNextRoundStarted);

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

  // Calculate player positions for card deck animation
  const getPlayerPositions = () => {
    return players.map((_, index) => {
      const angle = (index * Math.PI * 2) / players.length;
      return {
        x: Math.cos(angle) * 200,
        y: Math.sin(angle) * 200,
      };
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 text-white p-2 sm:p-4 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            initial={{
              x: Math.random() * window.innerWidth,
              y: Math.random() * window.innerHeight,
            }}
            animate={{
              y: [null, Math.random() * window.innerHeight],
              x: [null, Math.random() * window.innerWidth],
            }}
            transition={{
              duration: 10 + Math.random() * 20,
              repeat: Infinity,
              ease: "linear",
            }}
            className="absolute text-4xl opacity-20"
          >
            {["🎴", "👑", "💼", "⚔️", "🕵️"][Math.floor(Math.random() * 5)]}
          </motion.div>
        ))}
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
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

        {/* Header with Scoreboard */}
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="bg-gradient-to-r from-blue-900/80 to-purple-900/80 backdrop-blur-md rounded-3xl p-3 sm:p-6 mb-4 lg:mb-8 border-2 border-blue-500/30 shadow-2xl"
        >
          <div className="flex flex-col space-y-3 lg:space-y-0 lg:flex-row lg:justify-between lg:items-center">
            {/* Game Info */}
            <div className="text-center lg:text-left">
              <motion.h1
                animate={{
                  textShadow: [
                    "0 0 20px rgba(251, 191, 36, 0.5)",
                    "0 0 40px rgba(251, 191, 36, 0.8)",
                    "0 0 20px rgba(251, 191, 36, 0.5)",
                  ],
                }}
                transition={{ duration: 2, repeat: Infinity }}
                className="text-2xl sm:text-3xl lg:text-5xl font-black mb-2 bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-300 bg-clip-text text-transparent"
              >
                👑 RAJAMANTRI 👑
              </motion.h1>
              <div className="flex flex-wrap justify-center lg:justify-start items-center gap-2 text-xs sm:text-sm">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="flex items-center space-x-1 bg-gradient-to-r from-amber-500 to-orange-500 px-3 py-2 rounded-full shadow-lg"
                >
                  <span className="font-bold">Room:</span>
                  <span className="bg-white/20 px-2 py-1 rounded-full font-mono">
                    {roomCode}
                  </span>
                </motion.div>
                <motion.div
                  animate={{
                    scale: [1, 1.05, 1],
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="flex items-center space-x-1 bg-gradient-to-r from-green-500 to-emerald-500 px-3 py-2 rounded-full shadow-lg"
                >
                  <span className="text-xl">⚔️</span>
                  <span className="font-bold">Round {currentRound}</span>
                </motion.div>
              </div>
            </div>

            {/* Live Scoreboard */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200 }}
              className="bg-gradient-to-br from-purple-900/80 to-blue-900/80 backdrop-blur-sm rounded-2xl p-4 border-2 border-purple-500/30 shadow-xl"
            >
              <h3 className="text-lg font-black text-center mb-3 text-amber-300 flex items-center justify-center space-x-2">
                <span>🏆</span>
                <span>LEADERBOARD</span>
                <span>🏆</span>
              </h3>
              <div className="grid grid-cols-1 gap-2 min-w-[280px]">
                {players
                  .sort((a, b) => (scores[b.id] || 0) - (scores[a.id] || 0))
                  .map((player, index) => (
                    <motion.div
                      key={player.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      whileHover={{ scale: 1.02 }}
                      className={`flex items-center justify-between p-3 rounded-xl ${
                        player.id === socket.id
                          ? "bg-gradient-to-r from-amber-500/30 to-orange-500/30 border-2 border-amber-400"
                          : "bg-white/10 border border-white/10"
                      } backdrop-blur-sm shadow-lg`}
                    >
                      <div className="flex items-center space-x-3">
                        {index < 3 && (
                          <motion.span
                            animate={{ rotate: [0, 10, -10, 0] }}
                            transition={{ duration: 2, repeat: Infinity }}
                            className="text-2xl"
                          >
                            {index === 0 ? "🥇" : index === 1 ? "🥈" : "🥉"}
                          </motion.span>
                        )}
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold shadow-lg ${
                            player.isBot
                              ? "bg-gradient-to-br from-green-500 to-emerald-600"
                              : "bg-gradient-to-br from-blue-500 to-purple-600"
                          }`}
                        >
                          {player.username[0]}
                        </div>
                        <div>
                          <div className="font-bold text-white flex items-center space-x-1">
                            <span>{player.username}</span>
                            {player.id === socket.id && (
                              <span className="text-yellow-300">👑</span>
                            )}
                            {player.isBot && <span className="text-xs">🤖</span>}
                          </div>
                          {player.revealed && (
                            <div className="text-xs text-amber-300">
                              {getRoleIcon(player.role)} {player.role?.toUpperCase()}
                            </div>
                          )}
                        </div>
                      </div>
                      <motion.div
                        animate={{
                          scale: [1, 1.1, 1],
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                        }}
                        className="bg-gradient-to-r from-amber-500 to-yellow-500 px-4 py-2 rounded-xl font-black text-lg shadow-lg"
                      >
                        {scores[player.id] || 0}
                      </motion.div>
                    </motion.div>
                  ))}
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* Timer Banner */}
        <AnimatePresence>
          {isTimerRunning && (
            <motion.div
              initial={{ opacity: 0, y: -50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -50 }}
              className="fixed top-20 sm:top-24 left-1/2 transform -translate-x-1/2 z-50 w-[90%] max-w-md"
            >
              <motion.div
                animate={{
                  scale: [1, 1.05, 1],
                }}
                transition={{ duration: 1, repeat: Infinity }}
                className="bg-gradient-to-r from-red-600 via-orange-500 to-red-600 rounded-2xl px-6 py-4 shadow-2xl border-4 border-white/30"
              >
                <div className="flex items-center justify-center space-x-4">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    className="text-3xl"
                  >
                    ⏰
                  </motion.div>
                  <div className="text-white font-bold text-lg">
                    Mantri Timer
                  </div>
                  <motion.div
                    animate={{
                      scale: [1, 1.2, 1],
                    }}
                    transition={{ duration: 0.5, repeat: Infinity }}
                    className={`text-4xl font-black ${getTimerColor()}`}
                  >
                    {timer}s
                  </motion.div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Round Result Popup */}
        <AnimatePresence>
          {showRoundResult && roundResult && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            >
              <motion.div
                initial={{ y: 50, rotateX: -30 }}
                animate={{ y: 0, rotateX: 0 }}
                className="bg-gradient-to-br from-blue-900 via-purple-900 to-blue-900 rounded-3xl p-8 w-full max-w-md border-4 border-amber-400 shadow-2xl relative overflow-hidden"
              >
                {/* Animated background */}
                <motion.div
                  animate={{
                    rotate: 360,
                  }}
                  transition={{
                    duration: 20,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                  className="absolute inset-0 opacity-10"
                >
                  <div className="text-9xl">🎴</div>
                </motion.div>

                <div className="relative z-10 text-center">
                  <motion.h2
                    animate={{
                      scale: [1, 1.1, 1],
                      rotate: [0, 5, -5, 0],
                    }}
                    transition={{ duration: 1, repeat: Infinity }}
                    className="text-4xl font-black text-amber-300 mb-4"
                  >
                    {roundResult.isCorrect ? "🎯 CORRECT!" : "❌ WRONG!"}
                  </motion.h2>

                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 mb-6 border border-white/20">
                    <p className="text-lg text-white mb-2">
                      <span className="font-bold text-blue-300">Mantri</span> guessed{" "}
                      <span className="font-bold text-red-300">
                        {players.find((p) => p.id === roundResult.guessedPlayerId)?.username}
                      </span>
                    </p>
                    <p className="text-lg text-white">
                      Real <span className="font-bold text-red-400">Chor</span>:{" "}
                      <span className="font-bold text-green-300">
                        {players.find((p) => p.id === roundResult.actualChorId)?.username}
                      </span>
                    </p>
                  </div>

                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.5 }}
                    className="text-amber-200"
                  >
                    Next round starting soon...
                  </motion.div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Game Area */}
          <div
            className={`lg:col-span-2 ${isChatOpen ? "hidden lg:block" : "block"}`}
          >
            {/* Card Distribution Animation */}
            <AnimatePresence>
              {isDistributingCards && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="mb-6"
                >
                  <CardDeck
                    cards={players}
                    isDistributing={true}
                    playerPositions={getPlayerPositions()}
                    onDistribute={() => setIsDistributingCards(false)}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Game Board */}
            {!isDistributingCards && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: "spring" }}
              >
                <GameBoard
                  players={players}
                  currentPlayer={getCurrentPlayer()}
                  onRevealRole={handleRevealRole}
                  roundNumber={currentRound}
                  gameState={gameState}
                />
              </motion.div>
            )}

            {/* Mantri Guessing Interface */}
            {gameState === "guessing" && isMantri() && (
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6 bg-gradient-to-br from-red-900/50 to-pink-900/50 backdrop-blur-sm rounded-3xl p-6 border-2 border-red-500/30"
              >
                <h3 className="text-3xl font-black text-center mb-6 text-yellow-400">
                  🕵️ FIND THE CHOR! 🕵️
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {players
                    .filter((player) => player.role !== "mantri" && player.role !== "raja")
                    .map((player) => (
                      <motion.button
                        key={player.id}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleMantriGuess(player.id)}
                        className="bg-gradient-to-r from-red-600 to-pink-700 hover:from-red-700 hover:to-pink-800 text-white py-4 px-6 rounded-2xl font-bold text-lg shadow-xl transition-all duration-200 border-2 border-red-500/50"
                      >
                        <div className="flex items-center justify-center space-x-3">
                          <span className="text-3xl">🎯</span>
                          <div className="text-left">
                            <div>{player.username}</div>
                            {player.isBot && (
                              <div className="text-xs text-green-300">🤖 AI Player</div>
                            )}
                          </div>
                        </div>
                      </motion.button>
                    ))}
                </div>
              </motion.div>
            )}
          </div>

          {/* Chat */}
          <div
            className={`lg:col-span-1 ${
              isChatOpen ? "fixed inset-0 z-50 bg-black/50 p-4 lg:static lg:bg-transparent lg:p-0" : "hidden lg:block"
            }`}
          >
            <Chat roomCode={roomCode} currentUsername={currentUsername} />
          </div>
        </div>
      </div>

      {/* Role Reveal Animation */}
      <RoleRevealAnimation
        show={showRoleReveal}
        role={myRole}
        onComplete={() => setShowRoleReveal(false)}
      />

      {/* Score Popup */}
      <ScorePopup
        changes={scoreChanges}
        visible={showScorePopup}
        onComplete={() => setShowScorePopup(false)}
      />
    </div>
  );
};

export default GameAnimated;
