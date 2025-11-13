import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const Toast = ({ message, type = "error", onClose, duration = 5000 }) => {
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(onClose, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  const icons = {
    error: "❌",
    warning: "⚠️",
    success: "✅",
    info: "ℹ️",
  };

  const colors = {
    error: "from-red-500 to-red-600",
    warning: "from-amber-500 to-orange-600",
    success: "from-green-500 to-emerald-600",
    info: "from-blue-500 to-indigo-600",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -100, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -50, scale: 0.9 }}
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
      className="fixed top-8 left-1/2 transform -translate-x-1/2 z-[9999] max-w-md w-full mx-4"
    >
      <div
        className={`bg-gradient-to-r ${colors[type]} text-white rounded-2xl shadow-2xl border-2 border-white/30 overflow-hidden backdrop-blur-lg`}
      >
        <div className="relative p-6 pr-14">
          <div className="flex items-start gap-4">
            <motion.div
              initial={{ rotate: 0, scale: 1 }}
              animate={{ rotate: [0, -10, 10, -10, 0], scale: [1, 1.3, 1] }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-4xl flex-shrink-0"
            >
              {icons[type]}
            </motion.div>
            <div className="flex-1 min-w-0">
              <p className="text-base font-bold leading-snug break-words">
                {message}
              </p>
            </div>
          </div>

          {/* Close button */}
          <motion.button
            whileHover={{ scale: 1.1, rotate: 90 }}
            whileTap={{ scale: 0.9 }}
            onClick={onClose}
            className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
          >
            <span className="text-white text-2xl leading-none font-light">
              ×
            </span>
          </motion.button>

          {/* Progress bar */}
          {duration > 0 && (
            <motion.div
              initial={{ scaleX: 1 }}
              animate={{ scaleX: 0 }}
              transition={{ duration: duration / 1000, ease: "linear" }}
              className="absolute bottom-0 left-0 h-1.5 bg-white/50 origin-left rounded-full"
              style={{ width: "100%" }}
            />
          )}
        </div>
      </div>
    </motion.div>
  );
};

const ToastContainer = ({ toasts, removeToast }) => {
  return (
    <AnimatePresence mode="popLayout">
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          onClose={() => removeToast(toast.id)}
          duration={toast.duration}
        />
      ))}
    </AnimatePresence>
  );
};

export { Toast, ToastContainer };
export default Toast;
