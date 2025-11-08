import React, { useState } from 'react';
import { motion } from 'framer-motion';
import AnimatedCard from '../components/AnimatedCard';
import ScorePopup from '../components/ScorePopup';
import RoleRevealAnimation from '../components/RoleRevealAnimation';
import CardDeck from '../components/CardDeck';

const AnimationShowcase = () => {
  const [selectedDemo, setSelectedDemo] = useState('cards');
  const [showScorePopup, setShowScorePopup] = useState(false);
  const [showRoleReveal, setShowRoleReveal] = useState(false);
  const [revealedCard, setRevealedCard] = useState(null);
  const [isDistributing, setIsDistributing] = useState(false);

  const roles = ['raja', 'mantri', 'sipahi', 'chor'];

  const mockScoreChanges = [
    {
      playerId: '1',
      playerName: 'Player 1',
      role: 'raja',
      icon: '👑',
      points: 1000,
    },
    {
      playerId: '2',
      playerName: 'Player 2',
      role: 'mantri',
      icon: '💼',
      points: 800,
    },
    {
      playerId: '3',
      playerName: 'Player 3',
      role: 'sipahi',
      icon: '⚔️',
      points: -500,
    },
    {
      playerId: '4',
      playerName: 'Player 4',
      role: 'chor',
      icon: '🕵️',
      points: 500,
    },
  ];

  const mockPlayers = roles.map((role, i) => ({
    id: i,
    role,
    username: `Player ${i + 1}`,
  }));

  const playerPositions = [
    { x: 0, y: -200 },
    { x: 200, y: 0 },
    { x: 0, y: 200 },
    { x: -200, y: 0 },
  ];

  const demos = [
    { id: 'cards', name: '🎴 Animated Cards', icon: '🎴' },
    { id: 'reveal', name: '✨ Role Reveal', icon: '✨' },
    { id: 'scores', name: '📊 Score Popup', icon: '📊' },
    { id: 'deck', name: '🃏 Card Deck', icon: '🃏' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 text-white p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-center mb-8"
        >
          <h1 className="text-5xl font-black mb-4 bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-300 bg-clip-text text-transparent">
            🎮 Animation Showcase
          </h1>
          <p className="text-xl text-blue-200">
            Rajamantri - UNO Style Card Game Animations
          </p>
        </motion.div>

        {/* Demo Selector */}
        <div className="flex justify-center gap-4 mb-8 flex-wrap">
          {demos.map((demo, index) => (
            <motion.button
              key={demo.id}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSelectedDemo(demo.id)}
              className={`px-6 py-3 rounded-2xl font-bold text-lg transition-all ${
                selectedDemo === demo.id
                  ? 'bg-gradient-to-r from-amber-500 to-orange-500 shadow-xl scale-110'
                  : 'bg-white/10 backdrop-blur-sm hover:bg-white/20'
              }`}
            >
              <span className="mr-2">{demo.icon}</span>
              {demo.name}
            </motion.button>
          ))}
        </div>

        {/* Demo Content */}
        <motion.div
          key={selectedDemo}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/5 backdrop-blur-sm rounded-3xl p-8 border border-white/10"
        >
          {/* Animated Cards Demo */}
          {selectedDemo === 'cards' && (
            <div>
              <h2 className="text-3xl font-bold mb-6 text-center text-amber-300">
                🎴 Animated Card Components
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 justify-items-center">
                {roles.map((role, index) => (
                  <div key={role} className="flex flex-col items-center space-y-4">
                    <motion.div
                      initial={{ opacity: 0, y: 50 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.2 }}
                    >
                      <AnimatedCard
                        role={role}
                        isRevealed={revealedCard === role}
                        onReveal={() => setRevealedCard(role)}
                        isCurrentPlayer={true}
                        size="normal"
                        animate={true}
                      />
                    </motion.div>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setRevealedCard(revealedCard === role ? null : role)}
                      className="bg-gradient-to-r from-blue-500 to-purple-600 px-4 py-2 rounded-lg font-bold"
                    >
                      {revealedCard === role ? 'Reset' : 'Reveal'}
                    </motion.button>
                  </div>
                ))}
              </div>
              <div className="mt-8 text-center text-blue-200">
                <p className="mb-2">✨ Click "Reveal" or tap the cards to see the flip animation</p>
                <p>Features: 3D flip, glow effects, particle explosions</p>
              </div>
            </div>
          )}

          {/* Role Reveal Demo */}
          {selectedDemo === 'reveal' && (
            <div>
              <h2 className="text-3xl font-bold mb-6 text-center text-amber-300">
                ✨ Full Screen Role Reveal Animation
              </h2>
              <div className="text-center space-y-6">
                <p className="text-xl text-blue-200 mb-8">
                  Multi-stage cinematic reveal sequence
                </p>
                <div className="grid grid-cols-2 gap-4 max-w-2xl mx-auto mb-8">
                  {roles.map((role, index) => (
                    <motion.button
                      key={role}
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.1 }}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        setShowRoleReveal(true);
                        setTimeout(() => setShowRoleReveal(false), 8000);
                      }}
                      className="bg-gradient-to-r from-purple-600 to-pink-600 px-8 py-6 rounded-2xl font-bold text-xl"
                    >
                      Reveal {role.toUpperCase()}
                    </motion.button>
                  ))}
                </div>
                <div className="bg-blue-900/50 backdrop-blur-sm rounded-xl p-6 max-w-2xl mx-auto">
                  <h3 className="font-bold text-lg mb-3 text-amber-300">Sequence Stages:</h3>
                  <ul className="space-y-2 text-left">
                    <li>🎴 <strong>Cards Flying</strong> - Cards toss in the air</li>
                    <li>🔀 <strong>Shuffle</strong> - Dramatic shuffling effect</li>
                    <li>🎯 <strong>Reveal</strong> - 3D card flip with role</li>
                    <li>📋 <strong>Details</strong> - Full role information & stats</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Score Popup Demo */}
          {selectedDemo === 'scores' && (
            <div>
              <h2 className="text-3xl font-bold mb-6 text-center text-amber-300">
                📊 Score Update Animation
              </h2>
              <div className="text-center space-y-6">
                <p className="text-xl text-blue-200 mb-8">
                  Animated score changes with particles and confetti
                </p>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => {
                    setShowScorePopup(true);
                    setTimeout(() => setShowScorePopup(false), 4000);
                  }}
                  className="bg-gradient-to-r from-green-500 to-emerald-600 px-12 py-6 rounded-2xl font-bold text-2xl shadow-2xl"
                >
                  🎉 Show Score Popup
                </motion.button>
                <div className="bg-blue-900/50 backdrop-blur-sm rounded-xl p-6 max-w-2xl mx-auto mt-8">
                  <h3 className="font-bold text-lg mb-3 text-amber-300">Features:</h3>
                  <ul className="space-y-2 text-left">
                    <li>💥 <strong>Explosion Effect</strong> - Dynamic entrance</li>
                    <li>📈 <strong>Score Changes</strong> - Color-coded +/- indicators</li>
                    <li>✨ <strong>Flying Particles</strong> - Sparkles and stars</li>
                    <li>🎊 <strong>Confetti</strong> - Celebration for winners</li>
                    <li>⏱️ <strong>Auto-dismiss</strong> - Progress timer bar</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Card Deck Demo */}
          {selectedDemo === 'deck' && (
            <div>
              <h2 className="text-3xl font-bold mb-6 text-center text-amber-300">
                🃏 Card Deck & Distribution
              </h2>
              <div className="text-center space-y-6">
                <p className="text-xl text-blue-200 mb-8">
                  Shuffle and distribute cards to players
                </p>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => {
                    setIsDistributing(true);
                    setTimeout(() => setIsDistributing(false), 3000);
                  }}
                  disabled={isDistributing}
                  className={`px-12 py-6 rounded-2xl font-bold text-2xl shadow-2xl ${
                    isDistributing
                      ? 'bg-gray-600 cursor-not-allowed'
                      : 'bg-gradient-to-r from-red-500 to-pink-600'
                  }`}
                >
                  {isDistributing ? '🔄 Distributing...' : '🎴 Start Distribution'}
                </motion.button>
                <div className="min-h-[400px] flex items-center justify-center">
                  <CardDeck
                    cards={mockPlayers}
                    isDistributing={isDistributing}
                    playerPositions={playerPositions}
                    onDistribute={() => setIsDistributing(false)}
                  />
                </div>
                <div className="bg-blue-900/50 backdrop-blur-sm rounded-xl p-6 max-w-2xl mx-auto">
                  <h3 className="font-bold text-lg mb-3 text-amber-300">Animation Flow:</h3>
                  <ul className="space-y-2 text-left">
                    <li>🎴 <strong>Stacked Deck</strong> - Cards arranged in 3D stack</li>
                    <li>🔀 <strong>Shuffle</strong> - Deck shakes and rotates</li>
                    <li>✈️ <strong>Distribution</strong> - Cards fly to player positions</li>
                    <li>🎯 <strong>Sequential</strong> - One card at a time (500ms delay)</li>
                  </ul>
                </div>
              </div>
            </div>
          )}
        </motion.div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center mt-8 text-blue-200"
        >
          <p className="text-sm">
            Built with ❤️ using React, Framer Motion & Tailwind CSS
          </p>
          <p className="text-xs mt-2 opacity-70">
            All animations use GPU-accelerated transforms for smooth 60fps performance
          </p>
        </motion.div>
      </div>

      {/* Animated overlays */}
      <RoleRevealAnimation
        show={showRoleReveal}
        role={roles[Math.floor(Math.random() * roles.length)]}
        onComplete={() => setShowRoleReveal(false)}
      />

      <ScorePopup
        changes={mockScoreChanges}
        visible={showScorePopup}
        onComplete={() => setShowScorePopup(false)}
      />
    </div>
  );
};

export default AnimationShowcase;
