import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useSocket } from "../contexts/SocketContext";
import RoleCard from "../components/RoleCard";
import Chat from "../components/Chat";
import useSoundEffects from "../hooks/useSoundEffects";

const Game = () => {
  const { roomCode } = useParams();
  const { socket } = useSocket();
  
  // Sound effects hook
  const {
    playCardFlip,
    playCardShuffle,
    playCountdown,
    playCorrectGuess,
    playWrongGuess,
    playVictory,
    playChatNotification,
    playButtonClick,
    startBackgroundMusic,
    stopBackgroundMusic,
    toggleMute,
    isMuted,
  } = useSoundEffects();
  
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
  const [showScoresModal, setShowScoresModal] = useState(false);
  const [room, setRoom] = useState(null);
  const [roundHistory, setRoundHistory] = useState({});
  const [countdown, setCountdown] = useState(null);
  const [showCardAnimation, setShowCardAnimation] = useState(false);
  const [cardRevealed, setCardRevealed] = useState(false);
  const [mantriCalledSipahi, setMantriCalledSipahi] = useState(false);
  const [sipahiTimer, setSipahiTimer] = useState(120); // 2 minutes
  const [isSipahiTimerRunning, setIsSipahiTimerRunning] = useState(false);
  const [showWinner, setShowWinner] = useState(false);
  const [winner, setWinner] = useState(null);

  // Timer effect for Mantri
  useEffect(() => {
    let interval;
    if (isTimerRunning && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else if (timer === 0 && isTimerRunning) {
      setIsTimerRunning(false);
      // Auto-call Sipahi if Mantri doesn't choose and is human
      if (myRole === "mantri" && socket) {
        const currentPlayer = players.find((p) => p.id === socket.id);
        if (currentPlayer && !currentPlayer.isBot) {
          console.log("⏰ Timer expired, auto-calling Sipahi");
          socket.emit("mantri-call-sipahi", roomCode);
        }
      }
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, timer, myRole, players, socket, roomCode]);

  // Sipahi timer effect
  useEffect(() => {
    let interval;
    if (isSipahiTimerRunning && sipahiTimer > 0) {
      interval = setInterval(() => {
        setSipahiTimer((prev) => prev - 1);
      }, 1000);
    } else if (sipahiTimer === 0 && isSipahiTimerRunning) {
      setIsSipahiTimerRunning(false);
      // Auto-select random guess if Sipahi doesn't choose and is human
      if (myRole === "sipahi") {
        const currentPlayer = players.find((p) => p.id === socket.id);
        if (currentPlayer && !currentPlayer.isBot) {
          const possibleTargets = players.filter(
            (p) => p.role === "raja" || p.role === "chor"
          );
          if (possibleTargets.length > 0) {
            const randomIndex = Math.floor(
              Math.random() * possibleTargets.length
            );
            handleSipahiGuess(possibleTargets[randomIndex].id);
          }
        }
      }
    }
    return () => clearInterval(interval);
  }, [isSipahiTimerRunning, sipahiTimer, myRole, players, socket]);

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
      setRoom(roomData);
      setShowRoundResult(false);
      setCardRevealed(false);

      // 🔊 Start background music when game starts
      startBackgroundMusic();

      // Start countdown animation
      setCountdown(3);
      // 🔊 Play countdown sound
      playCountdown();
      
      const countdownInterval = setInterval(() => {
        setCountdown((prev) => {
          if (prev === 1) {
            clearInterval(countdownInterval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      // After countdown completes (3 + 1 seconds for "GO!"), show shuffle animation
      setTimeout(() => {
        setCountdown(null);
        setShowCardAnimation(true);
        // 🔊 Play card shuffle sound
        playCardShuffle();
        
        // Hide card animation after 3 seconds
        setTimeout(() => {
          setShowCardAnimation(false);
        }, 3000);
      }, 4000); // 3 seconds countdown + 1 second for "GO!"

      // Find username but don't reveal role yet
      const myPlayer = roomData.players.find((p) => p.id === socket.id);
      if (myPlayer) {
        setCurrentUsername(myPlayer.username);
        // Don't set myRole here - it will be set when card is revealed
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
      setMantriCalledSipahi(false);
    };

    const handleMantriCalledSipahi = (data) => {
      console.log("📢 Mantri called Sipahi:", data);
      setMantriCalledSipahi(true);
      setGameState("sipahi-guessing");
      setSipahiTimer(120);

      // Start timer for Sipahi if they're human
      const sipahi = players.find((p) => p.role === "sipahi");
      if (sipahi && !sipahi.isBot) {
        setIsSipahiTimerRunning(true);
      }
    };

    const handleSipahiGuessed = (data) => {
      console.log("🎯 Sipahi guessed:", data);
      setIsSipahiTimerRunning(false);
      setGameState("concluding-scores");

      // Wait 5 seconds before showing result
      setTimeout(() => {
        // Result will be handled by guess-processed event
      }, 5000);
    };

    const handleGuessProcessed = (roomData) => {
      console.log("🎯 Guess processed:", roomData);
      setGameState("round-result");
      setScores(roomData.scores || {});
      setRoundResult(roomData.roundResult);
      setShowRoundResult(true);
      setMantriCalledSipahi(false);

      // 🔊 Determine if Sipahi guessed correctly and play appropriate sound
      // Find Sipahi player and check their score change
      const sipahiPlayer = roomData.players.find(p => p.role === "sipahi");
      if (sipahiPlayer) {
        const scoreChange = (roomData.roundResult?.scores?.[sipahiPlayer.id] || 0) - 
                           (roomData.roundResult?.oldScores?.[sipahiPlayer.id] || 0);
        // Sipahi gets 500 if correct, 0 if wrong (Raja gets 1000, Mantri gets 800)
        if (scoreChange === 500) {
          playCorrectGuess();
        } else if (scoreChange === 0) {
          playWrongGuess();
        }
      }

      // Store round history
      setRoundHistory((prev) => ({
        ...prev,
        [currentRound]: roomData.roundResult,
      }));

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

    const handleGameFinished = (roomData) => {
      console.log("🎊 Game finished:", roomData);
      setScores(roomData.scores || {});

      // 🔊 Play victory sound
      playVictory();

      // Find the winner
      const sortedPlayers = roomData.players.sort(
        (a, b) => (roomData.scores[b.id] || 0) - (roomData.scores[a.id] || 0)
      );
      const winningPlayer = sortedPlayers[0];

      setWinner(winningPlayer);
      setShowWinner(true);
    };

    const handleNextRoundStarted = (roomData) => {
      console.log("🔄 Next round started:", roomData);
      setPlayers(roomData.players || []);
      setCurrentRound(roomData.currentRound || 1);
      setGameState("role-assignment");
      setMyRole(null);
      setShowRoundResult(false);
      setRoom(roomData); // Update room data
      setCardRevealed(false);

      // Start countdown animation for new round
      setCountdown(3);
      // 🔊 Play countdown sound for new round
      playCountdown();
      
      const countdownInterval = setInterval(() => {
        setCountdown((prev) => {
          if (prev === 1) {
            clearInterval(countdownInterval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      // After countdown completes (3 + 1 seconds for "GO!"), show shuffle animation
      setTimeout(() => {
        setCountdown(null);
        setShowCardAnimation(true);
        // 🔊 Play card shuffle sound for new round
        playCardShuffle();
        
        // Hide card animation after 3 seconds
        setTimeout(() => {
          setShowCardAnimation(false);
        }, 3000);
      }, 4000); // 3 seconds countdown + 1 second for "GO!"

      // Don't set myRole here - it will be set when card is revealed
    };

    const handleRoomUpdated = (roomData) => {
      console.log("🔄 Room updated:", roomData);
      setRoom(roomData);
      setPlayers(roomData.players || []);
      setCurrentRound(roomData.currentRound || 1);
      setGameState(roomData.gameState || "role-assignment");
      setScores(roomData.scores || {});

      // Find my role
      const myPlayer = roomData.players.find((p) => p.id === socket.id);
      if (myPlayer) {
        setMyRole(myPlayer.role);
        setCurrentUsername(myPlayer.username);
      }
    };

    socket.on("game-started", handleGameStarted);
    socket.on("player-revealed", handlePlayerRevealed);
    socket.on("all-roles-revealed", handleAllRolesRevealed);
    socket.on("mantri-called-sipahi", handleMantriCalledSipahi);
    socket.on("sipahi-guessed", handleSipahiGuessed);
    socket.on("guess-processed", handleGuessProcessed);
    socket.on("next-round-started", handleNextRoundStarted);
    socket.on("room-updated", handleRoomUpdated);
    socket.on("game-finished", handleGameFinished);

    // Request game state when component mounts
    socket.emit("request-room-update", roomCode);

    return () => {
      socket.off("game-started", handleGameStarted);
      socket.off("player-revealed", handlePlayerRevealed);
      socket.off("all-roles-revealed", handleAllRolesRevealed);
      socket.off("mantri-called-sipahi", handleMantriCalledSipahi);
      socket.off("sipahi-guessed", handleSipahiGuessed);
      socket.off("guess-processed", handleGuessProcessed);
      socket.off("next-round-started", handleNextRoundStarted);
      socket.off("room-updated", handleRoomUpdated);
      socket.off("game-finished", handleGameFinished);
    };
  }, [socket, roomCode, currentRound]);

  const handleRevealRole = () => {
    if (!cardRevealed) {
      setCardRevealed(true);
      // 🔊 Play card flip sound
      playCardFlip();
      
      // Find my role from players array and set it
      const myPlayer = players.find((p) => p.id === socket?.id);
      if (myPlayer && myPlayer.role) {
        setTimeout(() => {
          setMyRole(myPlayer.role);
          socket.emit("reveal-role", roomCode);
        }, 600); // Wait for flip animation
      }
    }
  };

  const getRoleCardImage = (role) => {
    const roleImages = {
      raja: "/card-raja.png",
      mantri: "/card-mantri.png",
      chor: "/card-chor.png",
      sipahi: "/card-sipahi.png",
    };
    return roleImages[role] || "/card-back.png";
  };

  const handleMantriCallSipahi = () => {
    console.log("🔔 Mantri calling Sipahi!");
    console.log("Socket connected:", socket?.connected);
    console.log("Room code:", roomCode);
    console.log("Game state:", gameState);
    console.log("My role:", myRole);

    if (!socket || !socket.connected) {
      console.error("❌ Socket not connected!");
      return;
    }

    if (!roomCode) {
      console.error("❌ No room code!");
      return;
    }

    // 🔊 Play button click sound
    playButtonClick();
    
    setIsTimerRunning(false);
    socket.emit("mantri-call-sipahi", roomCode);
    console.log("✅ Event emitted!");
  };

  const handleSipahiGuess = (guessedPlayerId) => {
    // 🔊 Play button click sound
    playButtonClick();
    
    setIsSipahiTimerRunning(false);
    socket.emit("sipahi-guess", roomCode, guessedPlayerId);
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

  const isSipahi = () => {
    return myRole === "sipahi";
  };

  const getSipahiTimerColor = () => {
    if (sipahiTimer > 90) return "text-green-400";
    if (sipahiTimer > 30) return "text-yellow-400";
    return "text-red-500";
  };

  const getSipahiTimerBgColor = () => {
    if (sipahiTimer > 90) return "bg-green-500";
    if (sipahiTimer > 30) return "bg-yellow-500";
    return "bg-red-500";
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
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
    <div className="h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 text-white flex flex-col overflow-hidden">
      {/* Enhanced Top Navbar */}
      <div className="bg-white/10 backdrop-blur-md border-b-2 border-white/20 px-4 py-3 flex-shrink-0">
        <div className="flex items-center justify-between gap-3">
          {/* Left: Logo + Title */}
          <div className="flex items-center gap-3">
            <img
              src="/logo.png"
              alt="RajaMantri Logo"
              className="w-10 h-10 rounded-full border-2 border-amber-400 object-cover"
              onError={(e) => {
                e.target.style.display = "none";
              }}
            />
            <div>
              <h1 className="text-base sm:text-lg font-black bg-gradient-to-r from-amber-300 to-yellow-400 bg-clip-text text-transparent leading-tight">
                RAJAMANTRI
              </h1>
            </div>
          </div>

          {/* Center: Room Details */}
          <div className="flex items-center gap-2 flex-wrap justify-center">
            {/* Room ID - Clickable to Copy */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                navigator.clipboard.writeText(roomCode);
                alert("Room code copied!");
              }}
              className="bg-amber-500/20 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-amber-400/30 hover:bg-amber-500/30 transition-all cursor-pointer"
            >
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-amber-200">Room:</span>
                <span className="text-sm text-amber-100 font-bold">
                  {roomCode}
                </span>
                <span className="text-xs">📋</span>
              </div>
            </motion.button>

            {/* Round */}
            <div className="bg-blue-500/20 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-blue-400/30 flex items-center gap-1.5">
              <span className="text-xs text-blue-200">Round:</span>
              <span className="text-sm font-bold text-white">
                {currentRound}/{room?.rounds || "?"}
              </span>
            </div>

            {/* Players */}
            <div className="bg-green-500/20 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-green-400/30 flex items-center gap-1.5">
              <span className="text-xs text-green-200">Players:</span>
              <span className="text-sm font-bold text-white">
                👥 {players.length}/4
              </span>
            </div>

            {/* Your Role */}
            <div className="bg-purple-500/20 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-purple-400/30 flex items-center gap-1.5">
              <span className="text-xs text-purple-200">Role:</span>
              <span className="text-sm font-bold text-white">
                {cardRevealed && myRole ? getRoleIcon(myRole) : "❓"}{" "}
                {cardRevealed && myRole ? myRole.toUpperCase() : "HIDDEN"}
              </span>
            </div>
          </div>

          {/* Right: Scores Button + Mute Button + Chat Toggle */}
          <div className="flex items-center gap-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowScoresModal(true)}
              className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white px-4 py-2 rounded-lg font-bold text-sm shadow-lg border border-amber-300 flex items-center gap-1.5"
            >
              <span>🏆</span>
              <span className="hidden sm:inline">Scores</span>
            </motion.button>

            {/* 🔊 Mute/Unmute Button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                playButtonClick();
                toggleMute();
              }}
              className={`${
                isMuted 
                  ? "bg-gray-500 hover:bg-gray-600" 
                  : "bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
              } text-white p-2 rounded-lg shadow-lg border ${
                isMuted ? "border-gray-300" : "border-purple-300"
              } flex items-center justify-center`}
              title={isMuted ? "Unmute Sound" : "Mute Sound"}
            >
              <span className="text-xl">
                {isMuted ? "🔇" : "🔊"}
              </span>
            </motion.button>

            {/* Chat Toggle for Mobile */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsChatOpen(!isChatOpen)}
              className="lg:hidden bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-lg shadow-lg border border-blue-300"
            >
              <span className="text-sm">{isChatOpen ? "✕" : "💬"}</span>
            </motion.button>
          </div>
        </div>
      </div>

      {/* Redesigned Scores Modal - Round-by-Round */}
      <AnimatePresence>
        {showScoresModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowScoresModal(false)}
            className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 overflow-y-auto"
          >
            <motion.div
              initial={{ scale: 0.8, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8, y: 50 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-gradient-to-br from-blue-900 to-purple-900 border-2 border-amber-400/50 rounded-xl p-4 sm:p-6 max-w-4xl w-full shadow-2xl my-4"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl sm:text-3xl font-black text-amber-300 flex items-center gap-2">
                  <span>🏆</span>
                  Score Board
                </h2>
                <button
                  onClick={() => setShowScoresModal(false)}
                  className="text-white/70 hover:text-white text-2xl"
                >
                  ✕
                </button>
              </div>

              {/* Scrollable Table Container */}
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-sm">
                  <thead>
                    <tr className="bg-white/10 border-b-2 border-amber-400/30">
                      <th className="text-left p-3 text-amber-300 font-bold sticky left-0 bg-blue-900/90 backdrop-blur-sm z-10">
                        Round
                      </th>
                      {players.map((player) => (
                        <th
                          key={player.id}
                          className={`p-3 text-center font-bold ${
                            player.id === socket?.id
                              ? "text-amber-300 bg-amber-500/20"
                              : "text-white"
                          }`}
                        >
                          <div className="flex flex-col items-center gap-1">
                            <div
                              className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold ${
                                player.isBot
                                  ? "bg-green-500"
                                  : "bg-gradient-to-r from-amber-500 to-orange-500"
                              }`}
                            >
                              {player.isBot
                                ? "🤖"
                                : player.username[0].toUpperCase()}
                            </div>
                            <span className="text-xs truncate max-w-[80px]">
                              {player.username}
                            </span>
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {Array.from(
                      { length: room?.rounds || 5 },
                      (_, i) => i + 1
                    ).map((round) => {
                      const roundData = roundHistory[round];
                      const isCurrentRound = round === currentRound;
                      const isCompletedRound = round < currentRound;

                      return (
                        <motion.tr
                          key={round}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: round * 0.05 }}
                          className={`border-b border-white/10 ${
                            isCurrentRound
                              ? "bg-green-500/10"
                              : "hover:bg-white/5"
                          }`}
                        >
                          <td className="p-3 sticky left-0 bg-blue-900/90 backdrop-blur-sm z-10">
                            <div className="flex items-center gap-2">
                              {isCurrentRound && (
                                <span className="text-green-300">▶</span>
                              )}
                              <span
                                className={`font-bold ${
                                  isCurrentRound
                                    ? "text-green-300"
                                    : isCompletedRound
                                    ? "text-white"
                                    : "text-gray-500"
                                }`}
                              >
                                Round {round}
                              </span>
                            </div>
                          </td>

                          {players.map((player) => {
                            let roundScore = 0;

                            if (roundData && isCompletedRound) {
                              // Calculate score based on actual round result
                              const oldScore =
                                roundData.oldScores?.[player.id] || 0;
                              const newScore =
                                roundData.scores?.[player.id] || 0;
                              roundScore = newScore - oldScore;
                            }

                            return (
                              <td
                                key={player.id}
                                className={`p-3 text-center font-bold ${
                                  player.id === socket?.id
                                    ? "bg-amber-500/10"
                                    : ""
                                }`}
                              >
                                {isCurrentRound ? (
                                  <span className="text-yellow-300 text-xl">
                                    ⏳
                                  </span>
                                ) : isCompletedRound ? (
                                  <span
                                    className={`text-lg ${
                                      roundScore > 0
                                        ? "text-green-400"
                                        : roundScore < 0
                                        ? "text-red-400"
                                        : "text-gray-400"
                                    }`}
                                  >
                                    {roundScore > 0 ? "+" : ""}
                                    {roundScore}
                                  </span>
                                ) : (
                                  <span className="text-gray-600">-</span>
                                )}
                              </td>
                            );
                          })}
                        </motion.tr>
                      );
                    })}

                    {/* Total Row */}
                    <tr className="bg-amber-500/20 border-t-2 border-amber-400/50">
                      <td className="p-3 sticky left-0 bg-amber-600/30 backdrop-blur-sm z-10">
                        <span className="font-black text-amber-300 text-lg">
                          TOTAL
                        </span>
                      </td>
                      {players.map((player) => (
                        <td
                          key={player.id}
                          className={`p-3 text-center ${
                            player.id === socket?.id ? "bg-amber-500/30" : ""
                          }`}
                        >
                          <span className="text-2xl font-black text-amber-300">
                            {scores[player.id] || 0}
                          </span>
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Legend */}
              <div className="mt-4 flex flex-wrap gap-3 justify-center text-xs">
                <div className="flex items-center gap-1 bg-white/10 px-3 py-1 rounded">
                  <span className="text-green-300">▶</span>
                  <span className="text-white">Current Round</span>
                </div>
                <div className="flex items-center gap-1 bg-white/10 px-3 py-1 rounded">
                  <span className="text-yellow-300">⏳</span>
                  <span className="text-white">In Progress</span>
                </div>
                <div className="flex items-center gap-1 bg-white/10 px-3 py-1 rounded">
                  <span className="text-green-400">+</span>
                  <span className="text-white">Points Gained</span>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <div className="flex-1 overflow-hidden p-3">
        <div className="h-full max-w-7xl mx-auto">
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
                      ⏰ {window.innerWidth < 640 ? "Timer" : "Mantri Timer"}
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

          {/* Sipahi Timer Banner */}
          <AnimatePresence>
            {isSipahiTimerRunning && (
              <motion.div
                initial={{ opacity: 0, y: -50 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -50 }}
                className="fixed top-2 sm:top-4 left-1/2 transform -translate-x-1/2 z-50 w-[90%] max-w-md"
              >
                <div className="bg-gradient-to-r from-purple-600 to-blue-500 rounded-full px-4 sm:px-8 py-3 sm:py-4 shadow-2xl border-2 border-white/20">
                  <div className="flex items-center justify-between sm:justify-center sm:space-x-4">
                    <div className="text-white font-bold text-sm sm:text-lg">
                      ⏰ {window.innerWidth < 640 ? "Timer" : "Sipahi Timer"}
                    </div>
                    <div
                      className={`text-2xl sm:text-3xl font-black ${getSipahiTimerColor()} animate-pulse`}
                    >
                      {formatTime(sipahiTimer)}
                    </div>
                    <div className="w-12 sm:w-16 h-3 sm:h-4 bg-white/30 rounded-full overflow-hidden">
                      <motion.div
                        className={`h-full ${getSipahiTimerBgColor()} rounded-full`}
                        initial={{ width: "100%" }}
                        animate={{ width: `${(sipahiTimer / 120) * 100}%` }}
                        transition={{ duration: 1 }}
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Winner Announcement - Beautiful */}
          <AnimatePresence>
            {showWinner && winner && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
              >
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  exit={{ scale: 0, rotate: 180 }}
                  transition={{ duration: 0.8, type: "spring", bounce: 0.5 }}
                  className="bg-gradient-to-br from-yellow-600 via-amber-500 to-orange-600 rounded-2xl p-6 sm:p-8 max-w-lg w-full border-4 border-yellow-300 shadow-2xl relative overflow-hidden"
                >
                  {/* Confetti Background Effect */}
                  <div className="absolute inset-0 opacity-20">
                    {[...Array(20)].map((_, i) => (
                      <motion.div
                        key={i}
                        initial={{
                          y: -100,
                          x: Math.random() * 100 + "%",
                          opacity: 1,
                        }}
                        animate={{
                          y: "100vh",
                          rotate: Math.random() * 360,
                          opacity: 0,
                        }}
                        transition={{
                          duration: 2 + Math.random() * 2,
                          delay: Math.random() * 1,
                          repeat: Infinity,
                        }}
                        className="absolute w-3 h-3 bg-white rounded-full"
                        style={{ left: Math.random() * 100 + "%" }}
                      />
                    ))}
                  </div>

                  <div className="text-center relative z-10">
                    {/* Trophy Animation */}
                    <motion.div
                      initial={{ scale: 0, y: -50 }}
                      animate={{ scale: 1, y: 0 }}
                      transition={{ delay: 0.3, type: "spring" }}
                      className="text-6xl sm:text-8xl mb-4"
                    >
                      🏆
                    </motion.div>

                    {/* Winner Title */}
                    <motion.h1
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 }}
                      className="text-3xl sm:text-5xl font-black text-white mb-6 drop-shadow-lg"
                    >
                      WINNER!
                    </motion.h1>

                    {/* Winner Card */}
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.7 }}
                      className="bg-white/20 backdrop-blur-md rounded-2xl p-4 mb-6 border-2 border-white/50"
                    >
                      <div className="flex flex-col items-center gap-4">
                        <div
                          className={`w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center text-2xl sm:text-3xl font-bold border-4 border-white shadow-xl ${
                            winner.isBot
                              ? "bg-green-500"
                              : "bg-gradient-to-r from-purple-600 to-pink-600"
                          }`}
                        >
                          {winner.isBot
                            ? "🤖"
                            : winner.username[0].toUpperCase()}
                        </div>
                        <div>
                          <p className="text-2xl sm:text-3xl font-black text-white mb-2">
                            {winner.username}
                          </p>
                          <p className="text-lg sm:text-xl font-bold text-yellow-200">
                            {scores[winner.id] || 0} Points
                          </p>
                        </div>
                      </div>
                    </motion.div>

                    {/* Other Players */}
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.9 }}
                      className="space-y-2"
                    >
                      {players
                        .filter((p) => p.id !== winner.id)
                        .sort(
                          (a, b) => (scores[b.id] || 0) - (scores[a.id] || 0)
                        )
                        .map((player, index) => (
                          <motion.div
                            key={player.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 1 + index * 0.1 }}
                            className="bg-white/10 backdrop-blur-sm rounded-lg p-3 flex items-center justify-between"
                          >
                            <div className="flex items-center gap-3">
                              <span className="text-white font-bold">
                                #{index + 2}
                              </span>
                              <div
                                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                                  player.isBot
                                    ? "bg-green-500"
                                    : "bg-gradient-to-r from-blue-500 to-purple-500"
                                }`}
                              >
                                {player.isBot
                                  ? "🤖"
                                  : player.username[0].toUpperCase()}
                              </div>
                              <span className="text-white font-bold">
                                {player.username}
                              </span>
                            </div>
                            <span className="text-yellow-200 font-bold text-lg">
                              {scores[player.id] || 0}
                            </span>
                          </motion.div>
                        ))}
                    </motion.div>

                    {/* Play Again Button */}
                    <motion.button
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 1.5 }}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => (window.location.href = "/")}
                      className="mt-6 bg-white text-amber-600 px-6 py-3 rounded-full font-black text-lg shadow-xl hover:bg-yellow-100 transition-all"
                    >
                      🏠 Back to Home
                    </motion.button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Score Popup Animation - Mobile Optimized */}
          <AnimatePresence>
            {showRoundResult && roundResult && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-2 sm:p-4"
              >
                <motion.div
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.5, opacity: 0 }}
                  transition={{ duration: 0.5, type: "spring" }}
                  className="bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 rounded-3xl p-6 sm:p-8 w-full max-w-lg border-4 border-amber-400 shadow-2xl mx-2"
                >
                  <div className="text-center">
                    {/* Animated Title */}
                    <motion.h2
                      initial={{ y: -20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.2 }}
                      className="text-3xl sm:text-4xl font-black text-amber-300 mb-6"
                    >
                      Round {currentRound} Complete! 🎉
                    </motion.h2>

                    {/* Score Cards with Animation */}
                    <div className="space-y-3 mb-6">
                      {players
                        .sort((a, b) => {
                          const aChange =
                            (roundResult.scores?.[a.id] || 0) -
                            (roundResult.oldScores?.[a.id] || 0);
                          const bChange =
                            (roundResult.scores?.[b.id] || 0) -
                            (roundResult.oldScores?.[b.id] || 0);
                          return bChange - aChange;
                        })
                        .map((player, index) => {
                          const scoreChange =
                            (roundResult.scores?.[player.id] || 0) -
                            (roundResult.oldScores?.[player.id] || 0);

                          return (
                            <motion.div
                              key={player.id}
                              initial={{ x: -100, opacity: 0 }}
                              animate={{ x: 0, opacity: 1 }}
                              transition={{ delay: 0.3 + index * 0.1 }}
                              className={`bg-white/10 backdrop-blur-sm rounded-xl p-4 border-2 ${
                                player.id === socket?.id
                                  ? "border-amber-400 bg-amber-500/20"
                                  : "border-white/20"
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <div
                                    className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${
                                      player.isBot
                                        ? "bg-green-500"
                                        : "bg-gradient-to-r from-amber-500 to-orange-500"
                                    }`}
                                  >
                                    {player.isBot
                                      ? "🤖"
                                      : player.username[0].toUpperCase()}
                                  </div>
                                  <div className="text-left">
                                    <p className="font-bold text-white text-lg">
                                      {player.username}
                                    </p>
                                    {player.revealed && (
                                      <p className="text-xs text-amber-300">
                                        {player.role.toUpperCase()}
                                      </p>
                                    )}
                                  </div>
                                </div>
                                <div className="text-right">
                                  <motion.p
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{
                                      delay: 0.5 + index * 0.1,
                                      type: "spring",
                                    }}
                                    className={`text-2xl font-black ${
                                      scoreChange > 0
                                        ? "text-green-400"
                                        : scoreChange < 0
                                        ? "text-red-400"
                                        : "text-gray-400"
                                    }`}
                                  >
                                    {scoreChange > 0 ? "+" : ""}
                                    {scoreChange}
                                  </motion.p>
                                  <p className="text-xs text-white/70">
                                    Total:{" "}
                                    {roundResult.scores?.[player.id] || 0}
                                  </p>
                                </div>
                              </div>
                            </motion.div>
                          );
                        })}
                    </div>

                    {/* Next Round Message */}
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.8 }}
                      className="text-amber-200 text-sm"
                    >
                      {currentRound < (room?.rounds || 5)
                        ? "Next round starting soon..."
                        : "Calculating final results..."}
                    </motion.div>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
            {/* Left Column - Game Area */}
            <div className="lg:col-span-2">
              {/* Game Content - Mobile Optimized */}
              <div className="text-center">
                {gameState === "role-assignment" && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="bg-gradient-to-br from-blue-800 to-purple-900 rounded-2xl p-4 sm:p-6 md:p-8 border border-blue-600/50 shadow-2xl"
                  >
                    {/* Countdown Animation */}
                    {countdown !== null && (
                      <motion.div
                        key={countdown}
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 2, opacity: 0 }}
                        className="mb-6"
                      >
                        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-amber-300 mb-4">
                          Round {currentRound} Starts In
                        </h2>
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: [0, 1.2, 1] }}
                          transition={{ duration: 0.5 }}
                          className="text-6xl sm:text-8xl md:text-9xl font-black text-white"
                        >
                          {countdown > 0 ? countdown : "GO!"}
                        </motion.div>
                      </motion.div>
                    )}

                    {/* Card Flying and Shuffle Animation */}
                    {showCardAnimation && (
                      <div className="mb-8 relative h-64 sm:h-80">
                        <motion.div
                          initial={{ y: -200, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          className="absolute inset-0 flex items-center justify-center"
                        >
                          {/* Multiple flying cards */}
                          {[...Array(5)].map((_, i) => (
                            <motion.img
                              key={i}
                              src="/card-back.png"
                              alt="Card"
                              initial={{
                                y: -300,
                                x: (i - 2) * 50,
                                rotate: Math.random() * 360,
                                opacity: 0,
                              }}
                              animate={{
                                y: [null, 50, 0],
                                x: [(i - 2) * 50, (i - 2) * 30, (i - 2) * 20],
                                rotate: [null, (i - 2) * 15, 0],
                                opacity: [0, 1, 0.8],
                              }}
                              transition={{
                                duration: 1.5,
                                delay: i * 0.1,
                                times: [0, 0.5, 1],
                              }}
                              className="absolute w-24 sm:w-32 h-auto"
                              style={{ zIndex: i }}
                            />
                          ))}
                        </motion.div>

                        {/* Shuffle effect */}
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: [0, 1.2, 1], rotate: [0, 360, 0] }}
                          transition={{ duration: 1.5, delay: 0.8 }}
                          className="absolute inset-0 flex items-center justify-center"
                        >
                          <div className="text-4xl sm:text-6xl text-amber-300 font-bold">
                            Shuffling...
                          </div>
                        </motion.div>
                      </div>
                    )}

                    {/* Card Reveal Section */}
                    {!countdown && !showCardAnimation && (
                      <>
                        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-amber-300 mb-3 sm:mb-4">
                          Reveal Your Role! 🎴
                        </h2>
                        <p className="text-blue-200 mb-4 sm:mb-6 text-sm sm:text-base md:text-lg">
                          Click your card to reveal your role
                        </p>

                        {/* Card with flip animation */}
                        <div className="flex justify-center mb-6 sm:mb-8 perspective-1000">
                          <motion.div
                            className="relative w-48 h-72 sm:w-56 sm:h-80 cursor-pointer"
                            style={{ transformStyle: "preserve-3d" }}
                            animate={{ rotateY: cardRevealed ? 180 : 0 }}
                            transition={{ duration: 0.6 }}
                            onClick={
                              !cardRevealed ? handleRevealRole : undefined
                            }
                            whileHover={!cardRevealed ? { scale: 1.05 } : {}}
                            whileTap={!cardRevealed ? { scale: 0.95 } : {}}
                          >
                            {/* Card Back */}
                            <motion.div
                              className="absolute inset-0 backface-hidden"
                              style={{ backfaceVisibility: "hidden" }}
                            >
                              <img
                                src="/card-back.png"
                                alt="Card Back"
                                className="w-full h-full object-cover rounded-2xl shadow-2xl border-4 border-amber-400/50"
                              />
                              {!cardRevealed && (
                                <motion.div
                                  animate={{ scale: [1, 1.1, 1] }}
                                  transition={{
                                    duration: 1.5,
                                    repeat: Infinity,
                                  }}
                                  className="absolute inset-0 flex items-center justify-center"
                                >
                                  <div className="bg-black/50 backdrop-blur-sm px-4 py-2 rounded-full text-white font-bold">
                                    Click to Reveal
                                  </div>
                                </motion.div>
                              )}
                            </motion.div>

                            {/* Card Front - Role Card */}
                            <motion.div
                              className="absolute inset-0 backface-hidden"
                              style={{
                                backfaceVisibility: "hidden",
                                transform: "rotateY(180deg)",
                              }}
                            >
                              <img
                                src={getRoleCardImage(myRole)}
                                alt={myRole}
                                className="w-full h-full object-cover rounded-2xl shadow-2xl border-4 border-amber-400"
                              />
                            </motion.div>
                          </motion.div>
                        </div>

                        <div className="mt-4 sm:mt-6 text-blue-200">
                          <p className="text-sm sm:text-base md:text-lg">
                            Waiting for{" "}
                            {players.filter((p) => !p.revealed).length} player
                            {players.filter((p) => !p.revealed).length !== 1
                              ? "s"
                              : ""}
                            ...
                          </p>
                        </div>
                      </>
                    )}
                  </motion.div>
                )}

                {gameState === "guessing" && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="bg-gradient-to-br from-blue-800 to-purple-900 rounded-2xl p-4 sm:p-6 md:p-8 border border-blue-600/50 shadow-2xl"
                  >
                    <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-amber-300 mb-3 sm:mb-4">
                      Mantri's Turn! 💼
                    </h2>
                    <p className="text-blue-200 text-sm sm:text-base md:text-lg mb-4 sm:mb-6">
                      The Minister will call the Soldier to catch the Thief...
                    </p>

                    {isMantri() ? (
                      <div className="mt-4 sm:mt-6">
                        <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-amber-300 mb-4 sm:mb-6">
                          You are the{" "}
                          <span className="text-yellow-400">MANTRI</span>!
                        </h3>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={handleMantriCallSipahi}
                          className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white py-4 px-8 rounded-xl font-bold text-lg sm:text-xl shadow-2xl transition-all duration-200 border-2 border-amber-400"
                        >
                          📢 Call: "Sipahi Sipahi Chor ko pakdo!"
                        </motion.button>
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
                          to call...
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

                {gameState === "sipahi-guessing" && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="bg-gradient-to-br from-blue-800 to-purple-900 rounded-2xl p-4 sm:p-6 md:p-8 border border-blue-600/50 shadow-2xl"
                  >
                    <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-amber-300 mb-3 sm:mb-4">
                      Sipahi's Turn! ⚔️
                    </h2>
                    <p className="text-blue-200 text-sm sm:text-base md:text-lg mb-4 sm:mb-6">
                      The Soldier must identify the Thief!
                    </p>

                    {isSipahi() ? (
                      <div className="mt-4 sm:mt-6">
                        <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-amber-300 mb-4 sm:mb-6">
                          You are the{" "}
                          <span className="text-red-400">SIPAHI</span>! Choose
                          the CHOR:
                        </h3>
                        <div className="grid grid-cols-1 gap-3 sm:gap-4 max-w-2xl mx-auto">
                          {players
                            .filter(
                              (player) =>
                                player.role === "raja" || player.role === "chor"
                            )
                            .map((player) => (
                              <motion.button
                                key={player.id}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => handleSipahiGuess(player.id)}
                                className="bg-gradient-to-r from-red-600 to-pink-700 hover:from-red-700 hover:to-pink-800 text-white py-3 sm:py-4 px-4 sm:px-6 rounded-xl font-bold text-base sm:text-lg shadow-lg transition-all duration-200 border-2 border-red-500/50"
                              >
                                <div className="flex items-center justify-center space-x-2 sm:space-x-3">
                                  <span className="text-xl sm:text-2xl">
                                    🕵️
                                  </span>
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
                        {isSipahiTimerRunning && (
                          <div className="mt-4 sm:mt-6 text-yellow-300 text-sm sm:text-base md:text-lg">
                            ⏰ Time:{" "}
                            <span className="font-bold">
                              {formatTime(sipahiTimer)}
                            </span>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="mt-4 sm:mt-6">
                        <p className="text-amber-300 text-base sm:text-xl">
                          Waiting for{" "}
                          <strong className="text-red-400">
                            {players.find((p) => p.role === "sipahi")?.username}
                          </strong>{" "}
                          to choose...
                        </p>
                        {players.find((p) => p.role === "sipahi")?.isBot && (
                          <p className="text-green-300 mt-2 text-sm sm:text-base">
                            🤖 AI is thinking...
                          </p>
                        )}
                      </div>
                    )}
                  </motion.div>
                )}

                {gameState === "concluding-scores" && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="bg-gradient-to-br from-blue-800 to-purple-900 rounded-2xl p-4 sm:p-6 md:p-8 border border-blue-600/50 shadow-2xl"
                  >
                    <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-amber-300 mb-3 sm:mb-4">
                      Calculating Scores... 🎲
                    </h2>
                    <p className="text-blue-200 text-sm sm:text-base md:text-lg">
                      Results coming soon...
                    </p>
                    <div className="mt-4 sm:mt-6">
                      <div className="animate-spin rounded-full h-8 w-8 sm:h-12 sm:w-12 border-b-2 border-amber-500 mx-auto"></div>
                    </div>
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
              onClick={(e) => {
                // Close chat overlay when clicking the backdrop on mobile
                if (isChatOpen && e.target === e.currentTarget) {
                  setIsChatOpen(false);
                }
              }}
            >
              <div className={`${isChatOpen ? "h-full" : ""}`}>
                <Chat
                  roomCode={roomCode}
                  currentUsername={currentUsername}
                  onClose={() => setIsChatOpen(false)}
                  isOpenFromParent={isChatOpen}
                  playChatNotification={playChatNotification}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Game;
