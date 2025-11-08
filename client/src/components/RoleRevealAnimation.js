import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const RoleRevealAnimation = ({ 
  show = false, 
  role = null,
  onComplete 
}) => {
  const [stage, setStage] = useState('cards-flying'); // cards-flying, shuffle, reveal, details

  useEffect(() => {
    if (!show) return;

    const timeline = [
      { stage: 'cards-flying', duration: 1500 },
      { stage: 'shuffle', duration: 2000 },
      { stage: 'reveal', duration: 1500 },
      { stage: 'details', duration: 2000 },
    ];

    let timeouts = [];
    let totalDuration = 0;

    timeline.forEach((step) => {
      timeouts.push(
        setTimeout(() => {
          setStage(step.stage);
        }, totalDuration)
      );
      totalDuration += step.duration;
    });

    timeouts.push(
      setTimeout(() => {
        onComplete?.();
      }, totalDuration)
    );

    return () => {
      timeouts.forEach((timeout) => clearTimeout(timeout));
    };
  }, [show, onComplete]);

  const getRoleData = (role) => {
    const data = {
      raja: {
        icon: '👑',
        title: 'RAJA',
        subtitle: 'The King',
        points: 1000,
        color: 'from-yellow-400 via-yellow-500 to-yellow-600',
        description: 'Rule the kingdom with wisdom. Wait for the Mantri to find the Chor!',
        power: 'Leadership & Authority',
      },
      mantri: {
        icon: '💼',
        title: 'MANTRI',
        subtitle: 'The Minister',
        points: 800,
        color: 'from-blue-400 via-blue-500 to-blue-600',
        description: 'Use your intelligence to identify the Chor among the players!',
        power: 'Detection & Strategy',
      },
      sipahi: {
        icon: '⚔️',
        title: 'SIPAHI',
        subtitle: 'The Soldier',
        points: 500,
        color: 'from-green-400 via-green-500 to-green-600',
        description: 'Guard the kingdom! Your fate depends on the Mantri\'s guess.',
        power: 'Protection & Defense',
      },
      chor: {
        icon: '🕵️',
        title: 'CHOR',
        subtitle: 'The Thief',
        points: 0,
        color: 'from-red-400 via-red-500 to-red-600',
        description: 'Stay hidden! If you\'re caught, you get no points. Stay clever!',
        power: 'Stealth & Deception',
      },
    };
    return data[role] || data.chor;
  };

  const roleData = getRoleData(role);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm"
        >
          {/* Stage 1: Cards Flying */}
          {stage === 'cards-flying' && (
            <div className="relative w-full h-full flex items-center justify-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="text-center"
              >
                <motion.div
                  animate={{
                    y: [0, -30, 0],
                    rotate: [0, 360],
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                  }}
                  className="text-9xl mb-8"
                >
                  🎴
                </motion.div>
                <motion.div
                  animate={{
                    scale: [1, 1.2, 1],
                  }}
                  transition={{
                    duration: 1,
                    repeat: Infinity,
                  }}
                  className="text-5xl font-black text-yellow-400"
                >
                  Cards in the Air!
                </motion.div>
              </motion.div>

              {/* Flying cards around */}
              {[...Array(8)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{
                    x: '50%',
                    y: '50%',
                  }}
                  animate={{
                    x: `${50 + Math.cos((i * Math.PI * 2) / 8) * 40}%`,
                    y: `${50 + Math.sin((i * Math.PI * 2) / 8) * 40}%`,
                    rotate: 360,
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: 'linear',
                  }}
                  className="absolute w-20 h-28 bg-gradient-to-br from-amber-400 to-orange-600 rounded-xl shadow-2xl text-4xl flex items-center justify-center"
                >
                  🎴
                </motion.div>
              ))}
            </div>
          )}

          {/* Stage 2: Shuffle Animation */}
          {stage === 'shuffle' && (
            <div className="relative">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="text-center"
              >
                <motion.div
                  animate={{
                    rotate: [0, 10, -10, 10, -10, 0],
                    y: [0, -20, 0],
                  }}
                  transition={{
                    duration: 0.5,
                    repeat: Infinity,
                  }}
                  className="text-9xl mb-8"
                >
                  🎴
                </motion.div>
                <motion.div
                  animate={{
                    opacity: [1, 0.5, 1],
                  }}
                  transition={{
                    duration: 0.8,
                    repeat: Infinity,
                  }}
                  className="text-4xl font-black text-purple-400"
                >
                  Shuffling...
                </motion.div>
              </motion.div>

              {/* Shuffle effect particles */}
              {[...Array(20)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{
                    x: 0,
                    y: 0,
                    opacity: 1,
                  }}
                  animate={{
                    x: (Math.random() - 0.5) * 400,
                    y: (Math.random() - 0.5) * 400,
                    opacity: 0,
                  }}
                  transition={{
                    duration: 1,
                    repeat: Infinity,
                    delay: Math.random() * 0.5,
                  }}
                  className="absolute top-1/2 left-1/2 text-2xl"
                >
                  ✨
                </motion.div>
              ))}
            </div>
          )}

          {/* Stage 3: Card Reveal */}
          {stage === 'reveal' && (
            <motion.div
              initial={{ scale: 0, rotateY: 0 }}
              animate={{ scale: 1, rotateY: 180 }}
              transition={{ duration: 1, type: 'spring' }}
              className="relative preserve-3d"
            >
              <div className="w-80 h-[480px] perspective-1000">
                <motion.div
                  style={{ transformStyle: 'preserve-3d' }}
                  className="relative w-full h-full"
                >
                  {/* Revealed card */}
                  <motion.div
                    style={{
                      backfaceVisibility: 'hidden',
                      transform: 'rotateY(180deg)',
                    }}
                    className={`absolute inset-0 bg-gradient-to-br ${roleData.color} rounded-3xl border-8 border-white shadow-2xl overflow-hidden`}
                  >
                    {/* Glow effect */}
                    <motion.div
                      animate={{
                        opacity: [0.3, 0.6, 0.3],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                      }}
                      className="absolute inset-0 bg-white/20"
                    />

                    {/* Content */}
                    <div className="relative h-full flex flex-col items-center justify-center p-8 text-white">
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.5, type: 'spring' }}
                        className="text-9xl mb-6"
                      >
                        {roleData.icon}
                      </motion.div>

                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.7 }}
                        className="text-center"
                      >
                        <div className="text-6xl font-black mb-2">
                          {roleData.title}
                        </div>
                        <div className="text-2xl opacity-90">
                          {roleData.subtitle}
                        </div>
                      </motion.div>

                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.9 }}
                        className="mt-8 bg-white/30 backdrop-blur-sm px-6 py-3 rounded-full text-3xl font-black"
                      >
                        {roleData.points} pts
                      </motion.div>
                    </div>
                  </motion.div>
                </motion.div>
              </div>

              {/* Explosion effect */}
              {[...Array(12)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ scale: 0, x: 0, y: 0 }}
                  animate={{
                    scale: [0, 1, 0],
                    x: Math.cos((i * Math.PI * 2) / 12) * 300,
                    y: Math.sin((i * Math.PI * 2) / 12) * 300,
                  }}
                  transition={{
                    duration: 1.5,
                    delay: 0.5,
                  }}
                  className="absolute top-1/2 left-1/2 text-5xl"
                >
                  ✨
                </motion.div>
              ))}
            </motion.div>
          )}

          {/* Stage 4: Role Details */}
          {stage === 'details' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="relative max-w-2xl mx-auto p-8"
            >
              <div className={`bg-gradient-to-br ${roleData.color} rounded-3xl p-8 border-8 border-white shadow-2xl`}>
                {/* Header */}
                <div className="text-center mb-6">
                  <motion.div
                    animate={{
                      scale: [1, 1.1, 1],
                      rotate: [0, 10, -10, 0],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                    }}
                    className="text-8xl mb-4"
                  >
                    {roleData.icon}
                  </motion.div>
                  <h2 className="text-5xl font-black text-white mb-2">
                    {roleData.title}
                  </h2>
                  <p className="text-2xl text-white/90">{roleData.subtitle}</p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <motion.div
                    initial={{ x: -50, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="bg-white/20 backdrop-blur-sm rounded-2xl p-4 text-center"
                  >
                    <div className="text-white/80 text-sm mb-1">Points</div>
                    <div className="text-4xl font-black text-white">
                      {roleData.points}
                    </div>
                  </motion.div>

                  <motion.div
                    initial={{ x: 50, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="bg-white/20 backdrop-blur-sm rounded-2xl p-4 text-center"
                  >
                    <div className="text-white/80 text-sm mb-1">Power</div>
                    <div className="text-lg font-bold text-white">
                      {roleData.power}
                    </div>
                  </motion.div>
                </div>

                {/* Description */}
                <motion.div
                  initial={{ y: 30, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="bg-white/30 backdrop-blur-sm rounded-2xl p-6 text-center"
                >
                  <p className="text-white text-xl font-medium leading-relaxed">
                    {roleData.description}
                  </p>
                </motion.div>

                {/* Ready indicator */}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 1, type: 'spring' }}
                  className="mt-6 text-center"
                >
                  <div className="bg-white text-gray-900 px-8 py-4 rounded-full text-2xl font-black inline-block">
                    GET READY! 🚀
                  </div>
                </motion.div>
              </div>

              {/* Floating particles */}
              {[...Array(15)].map((_, i) => (
                <motion.div
                  key={i}
                  animate={{
                    y: [0, -100, -200],
                    x: (Math.random() - 0.5) * 200,
                    opacity: [0, 1, 0],
                    scale: [0, 1, 0],
                  }}
                  transition={{
                    duration: 3,
                    delay: Math.random() * 2,
                    repeat: Infinity,
                  }}
                  className="absolute bottom-0 left-1/2 text-4xl"
                >
                  {['✨', '⭐', '🌟', '💫'][Math.floor(Math.random() * 4)]}
                </motion.div>
              ))}
            </motion.div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default RoleRevealAnimation;
