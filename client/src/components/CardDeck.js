import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const CardDeck = ({ 
  cards = [],
  onDistribute,
  isDistributing = false,
  playerPositions = [] 
}) => {
  const [deckCards, setDeckCards] = useState(4);
  const [distributedCards, setDistributedCards] = useState([]);

  useEffect(() => {
    if (isDistributing && cards.length > 0) {
      distributeCards();
    }
  }, [isDistributing, cards]);

  const distributeCards = () => {
    cards.forEach((card, index) => {
      setTimeout(() => {
        setDistributedCards(prev => [...prev, { ...card, index }]);
        setDeckCards(prev => prev - 1);
      }, index * 500);
    });

    // Notify completion
    setTimeout(() => {
      onDistribute?.();
    }, cards.length * 500 + 1000);
  };

  const deckVariants = {
    shuffle: {
      rotate: [0, -5, 5, -5, 5, 0],
      y: [0, -10, 0],
      transition: {
        duration: 0.8,
        repeat: 3,
      },
    },
  };

  const cardInDeckVariants = {
    stacked: (index) => ({
      x: index * 2,
      y: index * -2,
      rotateZ: (index - 1.5) * 3,
      scale: 1 - index * 0.02,
    }),
  };

  const distributedCardVariants = {
    initial: {
      x: 0,
      y: 0,
      scale: 1,
      rotateZ: 0,
    },
    flying: (targetPosition) => ({
      x: targetPosition.x,
      y: targetPosition.y,
      scale: 0.8,
      rotateZ: 720,
      transition: {
        duration: 0.8,
        ease: 'easeInOut',
      },
    }),
  };

  return (
    <div className="relative flex items-center justify-center h-64">
      {/* Deck base */}
      <div className="absolute">
        <motion.div
          variants={deckVariants}
          animate={isDistributing ? 'shuffle' : 'idle'}
          className="relative"
        >
          {/* Deck cards stack */}
          {[...Array(deckCards)].map((_, index) => (
            <motion.div
              key={`deck-${index}`}
              custom={index}
              variants={cardInDeckVariants}
              animate="stacked"
              className="absolute w-32 h-48 bg-gradient-to-br from-amber-400 via-amber-500 to-orange-600 rounded-2xl border-4 border-amber-300 shadow-2xl"
              style={{
                top: 0,
                left: 0,
              }}
            >
              {/* Card back design */}
              <div className="relative w-full h-full overflow-hidden rounded-xl">
                <div className="absolute inset-0 opacity-20">
                  <div className="grid grid-cols-3 grid-rows-5 h-full">
                    {[...Array(15)].map((_, i) => (
                      <div key={i} className="flex items-center justify-center text-2xl">
                        🎴
                      </div>
                    ))}
                  </div>
                </div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <motion.div
                    animate={{
                      rotate: 360,
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
              </div>
            </motion.div>
          ))}

          {/* Deck label */}
          {deckCards > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute -bottom-12 left-1/2 transform -translate-x-1/2 whitespace-nowrap"
            >
              <div className="bg-amber-500 text-white px-4 py-2 rounded-full font-bold text-sm shadow-lg">
                {deckCards} Cards
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>

      {/* Distributed cards animations */}
      <AnimatePresence>
        {distributedCards.map((card) => {
          const targetPos = playerPositions[card.index] || { x: 0, y: 0 };
          
          return (
            <motion.div
              key={`distributed-${card.index}`}
              custom={targetPos}
              variants={distributedCardVariants}
              initial="initial"
              animate="flying"
              exit={{ opacity: 0 }}
              className="absolute w-32 h-48 pointer-events-none"
            >
              <div className="w-full h-full bg-gradient-to-br from-amber-400 via-amber-500 to-orange-600 rounded-2xl border-4 border-amber-300 shadow-2xl">
                <div className="relative w-full h-full overflow-hidden rounded-xl">
                  <div className="absolute inset-0 opacity-20">
                    <div className="grid grid-cols-3 grid-rows-5 h-full">
                      {[...Array(15)].map((_, i) => (
                        <div key={i} className="flex items-center justify-center text-2xl">
                          🎴
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center text-6xl">
                    🎴
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>

      {/* Toss animation text */}
      {isDistributing && (
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: -100 }}
          exit={{ opacity: 0 }}
          className="absolute top-0 text-center"
        >
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              rotate: [0, 10, -10, 0],
            }}
            transition={{
              duration: 1,
              repeat: Infinity,
            }}
            className="text-4xl font-black text-amber-400 drop-shadow-lg"
          >
            ✨ CARDS IN THE AIR! ✨
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default CardDeck;
