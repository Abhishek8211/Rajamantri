import React from 'react';
import { motion } from 'framer-motion';
import AnimatedCard from './AnimatedCard';

const PlayerPosition = ({ 
  player, 
  position,
  isCurrentPlayer,
  onRevealRole,
  showCard = true 
}) => {
  const positions = {
    bottom: 'bottom-8 left-1/2 -translate-x-1/2',
    top: 'top-8 left-1/2 -translate-x-1/2',
    left: 'left-8 top-1/2 -translate-y-1/2',
    right: 'right-8 top-1/2 -translate-y-1/2',
  };

  const namePositions = {
    bottom: 'top-[-3rem]',
    top: 'bottom-[-3rem]',
    left: 'right-[-8rem]',
    right: 'left-[-8rem]',
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: 'spring', stiffness: 200 }}
      className={`absolute ${positions[position]} z-10`}
    >
      {/* Player card */}
      <div className="relative">
        {showCard && (
          <AnimatedCard
            role={player.role}
            isRevealed={player.revealed}
            onReveal={onRevealRole}
            isCurrentPlayer={isCurrentPlayer}
            size="normal"
          />
        )}

        {/* Player nameplate */}
        <motion.div
          className={`absolute ${namePositions[position]} left-1/2 -translate-x-1/2 whitespace-nowrap`}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div
            className={`${
              isCurrentPlayer
                ? 'bg-gradient-to-r from-amber-500 to-orange-500'
                : player.isBot
                ? 'bg-gradient-to-r from-green-500 to-emerald-600'
                : 'bg-gradient-to-r from-blue-500 to-purple-600'
            } px-6 py-3 rounded-2xl shadow-2xl border-2 border-white/30 backdrop-blur-sm`}
          >
            <div className="flex items-center space-x-3">
              {/* Avatar */}
              <motion.div
                animate={{
                  rotate: [0, 5, -5, 0],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
                className="w-10 h-10 bg-white/30 rounded-full flex items-center justify-center text-white font-bold text-lg"
              >
                {player.username?.[0]?.toUpperCase() || '?'}
              </motion.div>

              {/* Name & status */}
              <div>
                <div className="font-bold text-white flex items-center space-x-2">
                  <span>{player.username}</span>
                  {isCurrentPlayer && <span className="text-yellow-300">👑</span>}
                  {player.isBot && <span className="text-xs">🤖</span>}
                </div>
                <div className="text-xs text-white/80">
                  Score: <span className="font-bold">{player.score || 0}</span>
                </div>
              </div>

              {/* Connection status */}
              <motion.div
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.7, 1, 0.7],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                }}
                className={`w-3 h-3 rounded-full ${
                  player.connected ? 'bg-green-400' : 'bg-red-400'
                } shadow-lg`}
              />
            </div>
          </div>
        </motion.div>

        {/* Role indicator (if revealed) */}
        {player.revealed && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', delay: 0.5 }}
            className="absolute -top-4 -right-4 w-12 h-12 bg-white rounded-full shadow-xl flex items-center justify-center text-2xl border-4 border-purple-500"
          >
            {player.role === 'raja' && '👑'}
            {player.role === 'mantri' && '💼'}
            {player.role === 'chor' && '🕵️'}
            {player.role === 'sipahi' && '⚔️'}
          </motion.div>
        )}

        {/* Waiting indicator */}
        {!player.revealed && (
          <motion.div
            animate={{
              scale: [1, 1.1, 1],
              opacity: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
            }}
            className="absolute -bottom-8 left-1/2 -translate-x-1/2"
          >
            <div className="bg-blue-500/80 text-white px-3 py-1 rounded-full text-xs font-bold">
              Waiting...
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

const GameBoard = ({ 
  players = [],
  currentPlayer,
  onRevealRole,
  roundNumber = 1,
  gameState = 'role-assignment' 
}) => {
  // Position players around the board
  const getPlayerPosition = (index, total) => {
    const positions = ['bottom', 'left', 'top', 'right'];
    return positions[index] || 'bottom';
  };

  return (
    <div className="relative w-full h-[600px] bg-gradient-to-br from-purple-900/50 to-blue-900/50 rounded-3xl border-4 border-purple-500/30 shadow-2xl overflow-hidden backdrop-blur-sm">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="grid grid-cols-8 grid-rows-8 h-full">
          {[...Array(64)].map((_, i) => (
            <div key={i} className="border border-white/20" />
          ))}
        </div>
      </div>

      {/* Center stage */}
      <div className="absolute inset-0 flex items-center justify-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200 }}
          className="relative"
        >
          {/* Main center circle */}
          <motion.div
            animate={{
              rotate: 360,
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: 'linear',
            }}
            className="w-64 h-64 rounded-full border-4 border-dashed border-purple-400/30"
          />

          {/* Inner circle */}
          <motion.div
            animate={{
              rotate: -360,
            }}
            transition={{
              duration: 15,
              repeat: Infinity,
              ease: 'linear',
            }}
            className="absolute inset-8 rounded-full border-4 border-dotted border-blue-400/30"
          />

          {/* Center content */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <motion.div
              animate={{
                scale: [1, 1.1, 1],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
              }}
              className="text-6xl mb-2"
            >
              {gameState === 'role-assignment' && '🎴'}
              {gameState === 'guessing' && '🤔'}
              {gameState === 'round-result' && '🎉'}
            </motion.div>

            <div className="bg-gradient-to-r from-purple-600 to-blue-600 px-6 py-3 rounded-2xl shadow-xl border-2 border-white/30">
              <div className="text-white text-center">
                <div className="text-sm font-medium opacity-90">Round</div>
                <div className="text-3xl font-black">{roundNumber}</div>
              </div>
            </div>

            {gameState === 'role-assignment' && (
              <motion.div
                animate={{
                  y: [0, -10, 0],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                }}
                className="mt-4 text-white text-center"
              >
                <div className="text-lg font-bold">Reveal Your Roles!</div>
                <div className="text-sm opacity-80">Tap your card</div>
              </motion.div>
            )}

            {gameState === 'guessing' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-4 text-white text-center"
              >
                <div className="text-lg font-bold">Mantri is thinking...</div>
                <div className="text-sm opacity-80">Who is the Chor? 🕵️</div>
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Players positioned around the board */}
      {players.map((player, index) => {
        const isCurrentPlayer = player.id === currentPlayer?.id;
        const position = getPlayerPosition(index, players.length);

        return (
          <PlayerPosition
            key={player.id}
            player={player}
            position={position}
            isCurrentPlayer={isCurrentPlayer}
            onRevealRole={onRevealRole}
            showCard={gameState === 'role-assignment' || player.revealed}
          />
        );
      })}

      {/* Round info overlay */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="absolute top-4 left-1/2 -translate-x-1/2"
      >
        <div className="bg-gradient-to-r from-amber-500 to-orange-500 px-6 py-2 rounded-full shadow-xl border-2 border-white/30">
          <div className="flex items-center space-x-4 text-white">
            <span className="font-bold">Round {roundNumber}</span>
            <span className="text-xs bg-white/20 px-2 py-1 rounded-full">
              {gameState.replace('-', ' ').toUpperCase()}
            </span>
          </div>
        </div>
      </motion.div>

      {/* Game instructions overlay */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="absolute bottom-4 left-1/2 -translate-x-1/2 text-center"
      >
        <div className="bg-black/50 backdrop-blur-sm px-6 py-3 rounded-2xl border border-white/20">
          <div className="text-white text-sm">
            {gameState === 'role-assignment' && (
              <span>👆 Click your card to reveal your role</span>
            )}
            {gameState === 'guessing' && (
              <span>⏳ Mantri is identifying the Chor...</span>
            )}
            {gameState === 'round-result' && (
              <span>🎊 Round complete! Next round starting soon...</span>
            )}
          </div>
        </div>
      </motion.div>

      {/* Particle effects */}
      {gameState === 'round-result' && (
        <>
          {[...Array(15)].map((_, i) => (
            <motion.div
              key={i}
              initial={{
                x: '50%',
                y: '50%',
                scale: 0,
                opacity: 1,
              }}
              animate={{
                x: `${50 + (Math.random() - 0.5) * 100}%`,
                y: `${50 + (Math.random() - 0.5) * 100}%`,
                scale: 1,
                opacity: 0,
              }}
              transition={{
                duration: 2,
                delay: Math.random() * 0.5,
                repeat: Infinity,
                repeatDelay: 1,
              }}
              className="absolute text-3xl"
            >
              {['✨', '⭐', '🌟', '💫', '🎉'][Math.floor(Math.random() * 5)]}
            </motion.div>
          ))}
        </>
      )}
    </div>
  );
};

export default GameBoard;
