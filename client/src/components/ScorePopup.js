import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const ScorePopup = ({ changes = [], visible = false, onComplete }) => {
  return (
    <AnimatePresence>
      {visible && changes.length > 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.5 }}
          className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none"
        >
          <div className="relative">
            {/* Explosion effect */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 3, opacity: 0 }}
              transition={{ duration: 0.8 }}
              className="absolute inset-0 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500"
            />

            {/* Main score container */}
            <div className="relative bg-gradient-to-br from-purple-900 to-blue-900 rounded-3xl p-8 shadow-2xl border-4 border-yellow-400">
              <motion.h2
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="text-4xl font-black text-center mb-6 text-yellow-400"
              >
                🎉 SCORE UPDATE 🎉
              </motion.h2>

              <div className="space-y-3 min-w-[300px]">
                {changes.map((change, index) => (
                  <motion.div
                    key={change.playerId}
                    initial={{ x: -100, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: index * 0.15 }}
                    className="relative overflow-hidden"
                  >
                    {/* Background glow */}
                    <motion.div
                      animate={{
                        opacity: [0.3, 0.6, 0.3],
                      }}
                      transition={{
                        duration: 1.5,
                        repeat: Infinity,
                      }}
                      className={`absolute inset-0 rounded-xl ${
                        change.points > 0 ? 'bg-green-500' : 'bg-red-500'
                      } opacity-30`}
                    />

                    {/* Score card */}
                    <div className="relative bg-white/10 backdrop-blur-sm rounded-xl p-4 flex items-center justify-between border-2 border-white/20">
                      {/* Player info */}
                      <div className="flex items-center space-x-3">
                        <motion.div
                          animate={{
                            rotate: change.points > 0 ? [0, 360] : [0, -360],
                          }}
                          transition={{ duration: 0.8 }}
                          className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl ${
                            change.points > 0
                              ? 'bg-gradient-to-br from-green-400 to-green-600'
                              : 'bg-gradient-to-br from-red-400 to-red-600'
                          }`}
                        >
                          {change.icon}
                        </motion.div>
                        <div>
                          <div className="font-bold text-white text-lg">
                            {change.playerName}
                          </div>
                          <div className="text-xs text-gray-300">
                            {change.role?.toUpperCase()}
                          </div>
                        </div>
                      </div>

                      {/* Points animation */}
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: [0, 1.5, 1] }}
                        transition={{ delay: index * 0.15 + 0.2 }}
                        className={`font-black text-3xl ${
                          change.points > 0 ? 'text-green-400' : 'text-red-400'
                        }`}
                      >
                        {change.points > 0 ? '+' : ''}
                        {change.points}
                      </motion.div>
                    </div>

                    {/* Flying points particles */}
                    {change.points !== 0 && (
                      <>
                        {[...Array(5)].map((_, i) => (
                          <motion.div
                            key={i}
                            initial={{
                              x: 0,
                              y: 0,
                              scale: 1,
                              opacity: 1,
                            }}
                            animate={{
                              x: (Math.random() - 0.5) * 200,
                              y: -100 - Math.random() * 50,
                              scale: 0,
                              opacity: 0,
                            }}
                            transition={{
                              delay: index * 0.15 + 0.3 + i * 0.05,
                              duration: 0.8,
                            }}
                            className={`absolute right-4 top-1/2 text-xl ${
                              change.points > 0 ? 'text-green-400' : 'text-red-400'
                            }`}
                          >
                            {change.points > 0 ? '✨' : '💥'}
                          </motion.div>
                        ))}
                      </>
                    )}
                  </motion.div>
                ))}
              </div>

              {/* Auto-close indicator */}
              <motion.div
                initial={{ width: '100%' }}
                animate={{ width: '0%' }}
                transition={{ duration: 3, ease: 'linear' }}
                onAnimationComplete={onComplete}
                className="h-2 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full mt-6 overflow-hidden"
              >
                <div className="h-full w-full bg-white/50" />
              </motion.div>
            </div>

            {/* Floating confetti */}
            {changes.some((c) => c.points > 0) && (
              <>
                {[...Array(20)].map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{
                      x: 0,
                      y: 0,
                      rotate: 0,
                      opacity: 1,
                    }}
                    animate={{
                      x: (Math.random() - 0.5) * 400,
                      y: Math.random() * -300 - 100,
                      rotate: Math.random() * 720,
                      opacity: 0,
                    }}
                    transition={{
                      delay: Math.random() * 0.5,
                      duration: 1.5,
                      ease: 'easeOut',
                    }}
                    className="absolute top-0 left-1/2 text-2xl"
                  >
                    {['🎉', '✨', '⭐', '🌟', '💫'][Math.floor(Math.random() * 5)]}
                  </motion.div>
                ))}
              </>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ScorePopup;
