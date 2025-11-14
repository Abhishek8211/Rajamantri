import React from "react";
import { motion, AnimatePresence } from "framer-motion";

const ConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  playerName,
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9998]"
            onClick={onClose}
          />

          {/* Modal */}
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
              className="bg-gradient-to-br from-slate-800 via-slate-900 to-slate-800 rounded-3xl shadow-2xl border-2 border-red-500/30 max-w-md w-full overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header with animated icon */}
              <div className="bg-gradient-to-r from-red-500 to-red-600 p-6">
                <div className="flex items-center gap-4">
                  <motion.div
                    initial={{ rotate: 0, scale: 1 }}
                    animate={{
                      rotate: [0, -10, 10, -10, 10, 0],
                      scale: [1, 1.2, 1.2, 1.2, 1.2, 1],
                    }}
                    transition={{ duration: 0.6, delay: 0.1 }}
                    className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center text-3xl backdrop-blur-sm"
                  >
                    ⚠️
                  </motion.div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-white">{title}</h3>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-6 space-y-4">
                <p className="text-gray-300 text-base leading-relaxed">
                  {message}
                </p>

                {playerName && (
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-gradient-to-r from-red-500/20 to-red-600/20 border-2 border-red-500/40 rounded-xl p-4"
                  >
                    <div className="flex items-center gap-3">
                      <div className="text-2xl">👤</div>
                      <div>
                        <p className="text-xs text-gray-400 font-medium">
                          Player to remove:
                        </p>
                        <p className="text-lg font-bold text-white">
                          {playerName}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}

                <p className="text-sm text-gray-400 italic">
                  This action cannot be undone.
                </p>
              </div>

              {/* Action buttons */}
              <div className="p-6 pt-0 flex gap-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={onClose}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-xl font-bold text-base shadow-lg hover:shadow-xl transition-all duration-200 border-2 border-gray-500/30"
                >
                  Cancel
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={onConfirm}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl font-bold text-base shadow-lg hover:shadow-xl transition-all duration-200 border-2 border-red-400/30"
                >
                  Remove
                </motion.button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};

export default ConfirmModal;
