import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSocket } from "../contexts/SocketContext";

const Chat = ({ roomCode, currentUsername, onClose, isOpenFromParent }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [isOpen, setIsOpen] = useState(true);
  const messagesEndRef = useRef(null);
  const { socket } = useSocket();

  // Auto-expand when parent opens the chat
  useEffect(() => {
    if (isOpenFromParent) {
      setIsOpen(true);
    }
  }, [isOpenFromParent]);

  const emojis = [
    "😂",
    "😎",
    "😜",
    "😮",
    "🎉",
    "👑",
    "🕵️",
    "⚔️",
    "👍",
    "👎",
    "🔥",
    "❤️",
  ];

  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (message) => {
      console.log("📨 New message received:", message);
      setMessages((prev) => [...prev, message]);
    };

    socket.on("new-chat-message", handleNewMessage);

    return () => {
      socket.off("new-chat-message", handleNewMessage);
    };
  }, [socket]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const sendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !socket) return;

    console.log("📤 Sending message as:", currentUsername);

    socket.emit("send-chat-message", {
      roomCode,
      message: newMessage,
      username: currentUsername,
    });

    setNewMessage("");
  };

  const sendEmoji = (emoji) => {
    if (!socket) return;

    console.log("🎭 Sending emoji as:", currentUsername);

    socket.emit("send-emoji", {
      roomCode,
      emoji,
      username: currentUsername,
    });
  };

  // Safe username getter with better fallbacks
  const getSafeUsername = (message) => {
    if (!message) return "System";

    // Check different possible username properties
    const username = message.username || message.sender || message.playerName;

    if (username && username !== "undefined" && username !== "null") {
      return username;
    }

    // If no username found, try to identify by type
    if (message.type === "system") return "System";
    if (message.type === "emoji") return "Player";

    return "Player";
  };

  // Safe avatar initial
  const getAvatarInitial = (message) => {
    const username = getSafeUsername(message);
    return username[0]?.toUpperCase() || "P";
  };

  const getMessageColor = (type, username) => {
    if (type === "system") return "bg-blue-100 border-blue-300 text-blue-800";
    if (type === "emoji")
      return "bg-purple-100 border-purple-300 text-purple-800";

    const safeUsername = getSafeUsername({ username, type });
    return safeUsername === currentUsername
      ? "bg-green-100 border-green-300 text-gray-800"
      : "bg-white border-gray-300 text-gray-800";
  };

  const getMessageAlignment = (message) => {
    const username = getSafeUsername(message);
    return username === currentUsername ? "justify-end" : "justify-start";
  };

  const getAvatarColor = (message) => {
    const username = getSafeUsername(message);
    const colors = [
      "bg-red-500",
      "bg-blue-500",
      "bg-green-500",
      "bg-purple-500",
      "bg-pink-500",
      "bg-indigo-500",
      "bg-teal-500",
      "bg-orange-500",
    ];
    const index = username.charCodeAt(0) % colors.length;
    return colors[index];
  };

  const formatTime = (timestamp) => {
    return (
      timestamp ||
      new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    );
  };

  const isCurrentUser = (message) => {
    const username = getSafeUsername(message);
    return username === currentUsername;
  };

  return (
    <div
      className={`bg-white rounded-xl shadow-2xl ${
        isOpen ? "h-[500px] sm:h-[600px] lg:h-[calc(100vh-10rem)]" : "h-auto"
      } flex flex-col overflow-hidden transition-all duration-300`}
    >
      {/* Chat Header - Fixed */}
      <div
        className={`bg-gradient-to-r from-amber-500 to-amber-600 text-white p-3 sm:p-4 ${
          isOpen ? "rounded-t-xl" : "rounded-xl"
        } cursor-pointer flex justify-between items-center shadow-md flex-shrink-0`}
        onClick={() => {
          const newIsOpen = !isOpen;
          setIsOpen(newIsOpen);
          // On mobile, when minimizing the chat, close the overlay
          if (!newIsOpen && onClose && window.innerWidth < 1024) {
            onClose();
          }
        }}
      >
        <div className="flex items-center space-x-2">
          <h3 className="font-bold text-base sm:text-lg">💬 Game Chat</h3>
          <span className="text-xs sm:text-sm bg-amber-700 px-2 py-1 rounded-full shadow-sm">
            {messages.length}
          </span>
        </div>
        <motion.span
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="text-base sm:text-lg"
        >
          ▼
        </motion.span>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col flex-1 min-h-0 overflow-hidden"
          >
            {/* Messages Area - Scrollable */}
            <div
              className="flex-1 p-3 sm:p-4 overflow-y-auto bg-gradient-to-b from-gray-50 to-gray-100"
              style={{
                scrollbarWidth: "thin",
                scrollbarColor: "#f59e0b #e5e7eb",
              }}
            >
              {messages.length === 0 ? (
                <div className="text-center text-gray-500 py-8">
                  <div className="text-4xl mb-2">💬</div>
                  <p className="font-semibold">No messages yet</p>
                  <p className="text-sm">Start chatting with your friends!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {messages.map((message, index) => {
                    const username = getSafeUsername(message);
                    const isOwnMessage = isCurrentUser(message);

                    console.log(`📝 Rendering message ${index}:`, {
                      username,
                      isOwnMessage,
                      currentUsername,
                      message,
                    });

                    return (
                      <motion.div
                        key={message.id || `msg-${index}-${Date.now()}`}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`flex ${getMessageAlignment(
                          message
                        )} items-start space-x-2`}
                      >
                        {/* Avatar for other users (left side) */}
                        {!isOwnMessage && message.type !== "system" && (
                          <div
                            className={`w-8 h-8 ${getAvatarColor(
                              message
                            )} rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}
                          >
                            {getAvatarInitial(message)}
                          </div>
                        )}

                        <div
                          className={`max-w-[250px] sm:max-w-xs p-2 sm:p-3 rounded-lg border-2 ${getMessageColor(
                            message.type,
                            message.username
                          )}`}
                        >
                          {message.type === "emoji" ? (
                            <div className="text-center">
                              <div className="text-2xl">
                                {message.emoji || "❓"}
                              </div>
                              <p className="text-xs text-gray-600 mt-1">
                                {username} reacted
                              </p>
                            </div>
                          ) : message.type === "system" ? (
                            <>
                              <div className="flex items-center space-x-2 mb-1">
                                <span className="text-blue-600 text-sm">
                                  ⚡
                                </span>
                                <span className="font-semibold text-blue-700 text-sm">
                                  System
                                </span>
                              </div>
                              <p className="text-blue-800 text-sm">
                                {message.message || "System message"}
                              </p>
                              <p className="text-xs text-blue-600 mt-1">
                                {formatTime(message.timestamp)}
                              </p>
                            </>
                          ) : (
                            <>
                              {/* Message Header */}
                              <div className="flex justify-between items-start mb-2">
                                <div className="flex items-center space-x-2">
                                  <span
                                    className={`font-bold text-sm ${
                                      isOwnMessage
                                        ? "text-green-700"
                                        : "text-amber-700"
                                    }`}
                                  >
                                    {username}
                                    {isOwnMessage && (
                                      <span className="text-green-600 ml-1">
                                        (You)
                                      </span>
                                    )}
                                  </span>
                                </div>
                                <span className="text-xs text-gray-500">
                                  {formatTime(message.timestamp)}
                                </span>
                              </div>

                              {/* Message Content */}
                              <p className="text-gray-800 break-words">
                                {message.message || "Empty message"}
                              </p>
                            </>
                          )}
                        </div>

                        {/* Avatar for current user (right side) */}
                        {isOwnMessage && message.type !== "system" && (
                          <div
                            className={`w-8 h-8 ${getAvatarColor(
                              message
                            )} rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}
                          >
                            {getAvatarInitial(message)}
                          </div>
                        )}
                      </motion.div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>

            {/* Online Users Bar - Fixed */}
            <div className="px-3 sm:px-4 py-2 bg-amber-50 border-t border-amber-200 flex-shrink-0 shadow-sm">
              <p className="text-xs text-amber-700 font-semibold text-center sm:text-left">
                💬 Chat is live
              </p>
            </div>

            {/* Emoji Picker & Input Area - Fixed */}
            <div className="p-2 sm:p-3 bg-gradient-to-br from-gray-100 to-gray-200 border-t border-gray-300 flex-shrink-0 rounded-b-xl shadow-inner">
              <div className="flex space-x-1 sm:space-x-2 mb-2 overflow-x-auto pb-2 hide-scrollbar">
                <span className="text-xs text-gray-700 font-semibold self-center whitespace-nowrap hidden sm:inline">
                  Quick:
                </span>
                {emojis.map((emoji) => (
                  <motion.button
                    key={emoji}
                    whileHover={{ scale: 1.2 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => sendEmoji(emoji)}
                    className="text-base sm:text-xl p-1 sm:p-2 hover:bg-amber-100 rounded-lg transition-colors shadow-sm hover:shadow-md bg-white flex-shrink-0"
                    title={`Send ${emoji} reaction`}
                  >
                    {emoji}
                  </motion.button>
                ))}
              </div>

              {/* Message Input */}
              <form
                onSubmit={sendMessage}
                className="flex space-x-1 sm:space-x-2"
              >
                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder={
                      window.innerWidth < 640
                        ? "Message..."
                        : `Type as ${currentUsername || "Player"}...`
                    }
                    className="w-full px-2 sm:px-3 py-2 text-sm sm:text-base border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-gray-800 placeholder-gray-500 bg-white pr-12 sm:pr-16 shadow-sm"
                    maxLength={200}
                  />
                  <span className="absolute right-2 top-1/2 transform -translate-y-1/2 text-xs text-gray-500 bg-gray-100 px-1 rounded hidden sm:inline">
                    {newMessage.length}/200
                  </span>
                </div>
                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  disabled={!newMessage.trim()}
                  className="bg-gradient-to-r from-amber-500 to-amber-600 text-white px-3 sm:px-4 py-2 rounded-lg font-semibold text-sm sm:text-base hover:from-amber-600 hover:to-amber-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-1 shadow-md hover:shadow-lg"
                >
                  <span className="hidden sm:inline">Send</span>
                  <span>📤</span>
                </motion.button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Chat;
