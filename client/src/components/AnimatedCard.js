import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const AnimatedCard = ({ 
  role, 
  isRevealed, 
  onReveal, 
  isCurrentPlayer,
  position = 'center',
  animate = true,
  size = 'normal' // 'small', 'normal', 'large'
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const getRoleData = (role) => {
    const roleData = {
      raja: {
        icon: '👑',
        title: 'RAJA',
        subtitle: 'The King',
        points: 1000,
        gradient: 'from-yellow-400 via-yellow-500 to-yellow-600',
        shadow: 'shadow-yellow-500/50',
        glow: 'rgba(250, 204, 21, 0.5)',
        pattern: '🌟',
      },
      mantri: {
        icon: '💼',
        title: 'MANTRI',
        subtitle: 'The Minister',
        points: 800,
        gradient: 'from-blue-400 via-blue-500 to-blue-600',
        shadow: 'shadow-blue-500/50',
        glow: 'rgba(59, 130, 246, 0.5)',
        pattern: '📜',
      },
      sipahi: {
        icon: '⚔️',
        title: 'SIPAHI',
        subtitle: 'The Soldier',
        points: 500,
        gradient: 'from-green-400 via-green-500 to-green-600',
        shadow: 'shadow-green-500/50',
        glow: 'rgba(34, 197, 94, 0.5)',
        pattern: '🛡️',
      },
      chor: {
        icon: '🕵️',
        title: 'CHOR',
        subtitle: 'The Thief',
        points: 0,
        gradient: 'from-red-400 via-red-500 to-red-600',
        shadow: 'shadow-red-500/50',
        glow: 'rgba(239, 68, 68, 0.5)',
        pattern: '💰',
      },
    };
    return roleData[role] || roleData.chor;
  };

  const getSizeClasses = () => {
    const sizes = {
      small: 'w-24 h-36',
      normal: 'w-32 h-48',
      large: 'w-40 h-60',
    };
    return sizes[size];
  };

  const roleData = getRoleData(role);

  const cardVariants = {
    initial: {
      scale: 0.8,
      opacity: 0,
      rotateY: 0,
    },
    tossing: {
      y: [-300, -200, -150],
      rotateZ: [0, 360, 720],
      rotateX: [0, 180, 360],
      transition: {
        duration: 1.5,
        ease: 'easeOut',
      },
    },
    landed: {
      y: 0,
      scale: 1,
      opacity: 1,
      rotateZ: 0,
      rotateX: 0,
      transition: {
        type: 'spring',
        stiffness: 200,
        damping: 15,
      },
    },
    flip: {
      rotateY: 180,
      transition: {
        duration: 0.6,
        ease: 'easeInOut',
      },
    },
    hover: {
      y: -10,
      scale: 1.05,
      rotateZ: isHovered ? 5 : 0,
      transition: {
        type: 'spring',
        stiffness: 300,
      },
    },
  };

  const glowVariants = {
    idle: {
      boxShadow: `0 0 20px ${roleData.glow}, 0 0 40px ${roleData.glow}`,
    },
    active: {
      boxShadow: [
        `0 0 20px ${roleData.glow}`,
        `0 0 60px ${roleData.glow}, 0 0 100px ${roleData.glow}`,
        `0 0 20px ${roleData.glow}`,
      ],
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: 'easeInOut',
      },
    },
  };

  return (
    <div className="perspective-1000">
      <motion.div
        className={`relative ${getSizeClasses()} preserve-3d cursor-pointer`}
        variants={cardVariants}
        initial="initial"
        animate={
          !animate ? 'landed' :
          isRevealed ? ['tossing', 'landed', 'flip'] : 
          isHovered ? 'hover' : 'landed'
        }
        whileHover={!isRevealed && isCurrentPlayer ? 'hover' : {}}
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
        onClick={isCurrentPlayer && !isRevealed ? onReveal : undefined}
        style={{
          transformStyle: 'preserve-3d',
        }}
      >
        {/* Card Back - Unflipped State */}
        <motion.div
          className={`absolute inset-0 ${getSizeClasses()} backface-hidden rounded-2xl overflow-hidden`}
          style={{
            backfaceVisibility: 'hidden',
            transform: 'rotateY(0deg)',
          }}
        >
          <div className="relative w-full h-full bg-gradient-to-br from-amber-400 via-amber-500 to-orange-600 rounded-2xl border-4 border-amber-300 shadow-2xl overflow-hidden">
            {/* Decorative pattern */}
            <div className="absolute inset-0 opacity-20">
              <div className="grid grid-cols-3 grid-rows-5 h-full">
                {[...Array(15)].map((_, i) => (
                  <div key={i} className="flex items-center justify-center text-2xl">
                    🎴
                  </div>
                ))}
              </div>
            </div>

            {/* Center logo */}
            <div className="absolute inset-0 flex items-center justify-center">
              <motion.div
                animate={{
                  rotate: [0, 360],
                  scale: [1, 1.1, 1],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: 'linear',
                }}
                className="text-6xl"
              >
                🎴
              </motion.div>
            </div>

            {/* Corner ornaments */}
            <div className="absolute top-2 left-2 text-amber-900 font-bold text-xs">♦</div>
            <div className="absolute top-2 right-2 text-amber-900 font-bold text-xs">♦</div>
            <div className="absolute bottom-2 left-2 text-amber-900 font-bold text-xs">♦</div>
            <div className="absolute bottom-2 right-2 text-amber-900 font-bold text-xs">♦</div>

            {/* Interactive hint */}
            {isCurrentPlayer && !isRevealed && (
              <motion.div
                className="absolute bottom-4 left-1/2 transform -translate-x-1/2"
                animate={{
                  y: [0, -5, 0],
                  opacity: [0.7, 1, 0.7],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                }}
              >
                <div className="bg-amber-900/80 text-amber-100 px-3 py-1 rounded-full text-xs font-bold">
                  TAP ME!
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>

        {/* Card Front - Revealed State */}
        <motion.div
          className={`absolute inset-0 ${getSizeClasses()} backface-hidden rounded-2xl overflow-hidden`}
          style={{
            backfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
          }}
          variants={glowVariants}
          animate={isRevealed ? 'active' : 'idle'}
        >
          <div className={`relative w-full h-full bg-gradient-to-br ${roleData.gradient} rounded-2xl border-4 border-white shadow-2xl overflow-hidden`}>
            {/* Background pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="grid grid-cols-4 grid-rows-6 h-full">
                {[...Array(24)].map((_, i) => (
                  <div key={i} className="flex items-center justify-center text-xl">
                    {roleData.pattern}
                  </div>
                ))}
              </div>
            </div>

            {/* Shine effect */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-tr from-transparent via-white to-transparent opacity-0"
              animate={{
                x: ['-100%', '200%'],
                opacity: [0, 0.3, 0],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                repeatDelay: 1,
              }}
            />

            {/* Card content */}
            <div className="relative h-full flex flex-col items-center justify-between p-4 text-white">
              {/* Top points */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3, type: 'spring' }}
                className="bg-white/30 backdrop-blur-sm px-3 py-1 rounded-full font-bold text-sm"
              >
                {roleData.points} pts
              </motion.div>

              {/* Center icon */}
              <motion.div
                className="flex flex-col items-center"
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ 
                  delay: 0.4, 
                  type: 'spring',
                  stiffness: 200 
                }}
              >
                <motion.div
                  className="text-7xl mb-2"
                  animate={{
                    scale: [1, 1.1, 1],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                  }}
                >
                  {roleData.icon}
                </motion.div>
                
                {/* Role title */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="text-center"
                >
                  <div className="font-black text-2xl tracking-wider drop-shadow-lg">
                    {roleData.title}
                  </div>
                  <div className="text-xs font-medium opacity-90 mt-1">
                    {roleData.subtitle}
                  </div>
                </motion.div>
              </motion.div>

              {/* Bottom decoration */}
              <motion.div
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ delay: 0.5 }}
                className="w-full h-1 bg-white/50 rounded-full"
              />
            </div>

            {/* Corner mini icons */}
            <div className="absolute top-2 left-2 text-2xl opacity-70">{roleData.icon}</div>
            <div className="absolute top-2 right-2 text-2xl opacity-70 transform rotate-180">{roleData.icon}</div>
            <div className="absolute bottom-2 left-2 text-2xl opacity-70 transform rotate-180">{roleData.icon}</div>
            <div className="absolute bottom-2 right-2 text-2xl opacity-70">{roleData.icon}</div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default AnimatedCard;
