import React, { useState } from 'react';
import { motion } from 'framer-motion';

const RoleCard = ({ player, isCurrentPlayer, onReveal }) => {
  const [isFlipped, setIsFlipped] = useState(false);

  const handleClick = () => {
    if (!isCurrentPlayer || isFlipped || !player) return;
    setIsFlipped(true);
    onReveal();
  };

  const getRoleIcon = (role) => {
    const icons = {
      raja: '👑',
      mantri: '💼', 
      chor: '🕵️',
      sipahi: '⚔️'
    };
    return icons[role] || '❓';
  };

  const getRoleColor = (role) => {
    const colors = {
      raja: 'from-yellow-400 to-yellow-600',
      mantri: 'from-blue-400 to-blue-600',
      chor: 'from-red-400 to-red-600', 
      sipahi: 'from-green-400 to-green-600'
    };
    return colors[role] || 'from-gray-400 to-gray-600';
  };

  if (!player) {
    return (
      <div className="w-32 h-48 bg-gray-300 rounded-xl flex items-center justify-center">
        <p className="text-gray-600">No player</p>
      </div>
    );
  }

  return (
    <motion.div
      className="w-32 h-48 cursor-pointer perspective"
      whileHover={!isFlipped && isCurrentPlayer ? { scale: 1.05 } : {}}
      onClick={handleClick}
    >
      <motion.div
        className="relative w-full h-full preserve-3d"
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* Card Back */}
        {!isFlipped && (
          <motion.div
            className="absolute w-full h-full backface-hidden bg-gradient-to-br from-amber-400 to-amber-600 rounded-xl shadow-2xl flex items-center justify-center border-4 border-amber-300"
            whileHover={isCurrentPlayer ? { rotate: 2 } : {}}
          >
            <div className="text-center text-amber-800">
              <div className="text-4xl mb-2">🎴</div>
              <div className="font-bold text-lg">Tap to Reveal</div>
              {isCurrentPlayer && (
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="text-sm mt-2 text-amber-700"
                >
                  Your Card
                </motion.div>
              )}
            </div>
          </motion.div>
        )}

        {/* Card Front */}
        {isFlipped && (
          <motion.div
            className="absolute w-full h-full backface-hidden rounded-xl shadow-2xl flex items-center justify-center border-4 rotate-y-180"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className={`bg-gradient-to-br ${getRoleColor(player.role)} w-full h-full rounded-lg flex flex-col items-center justify-center text-white p-4 text-center`}>
              <div className="text-5xl mb-4">{getRoleIcon(player.role)}</div>
              <div className="text-xl font-bold uppercase tracking-wide">
                {player.role}
              </div>
              <div className="text-sm mt-2 opacity-90">
                {player.role === 'raja' && 'The Royal Ruler'}
                {player.role === 'mantri' && 'The Minister'} 
                {player.role === 'chor' && 'The Thief'}
                {player.role === 'sipahi' && 'The Soldier'}
              </div>
            </div>
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  );
};

export default RoleCard;