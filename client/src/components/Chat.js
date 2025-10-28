import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSocket } from '../contexts/SocketContext';

const Chat = ({ roomCode, currentUsername }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isOpen, setIsOpen] = useState(true);
  const messagesEndRef = useRef(null);
  const { socket } = useSocket();

  const emojis = ['😂', '😎', '😜', '😮', '🎉', '👑', '🕵️', '⚔️', '👍', '👎', '🔥', '❤️'];

  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (message) => {
      console.log('📨 New message received:', message); // Debug log
      setMessages(prev => [...prev, message]);
    };

    socket.on('new-chat-message', handleNewMessage);

    return () => {
      socket.off('new-chat-message', handleNewMessage);
    };
  }, [socket]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const sendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !socket) return;

    console.log('📤 Sending message as:', currentUsername); // Debug log

    socket.emit('send-chat-message', {
      roomCode,
      message: newMessage,
      username: currentUsername
    });

    setNewMessage('');
  };

  const sendEmoji = (emoji) => {
    if (!socket) return;

    console.log('🎭 Sending emoji as:', currentUsername); // Debug log

    socket.emit('send-emoji', {
      roomCode,
      emoji,
      username: currentUsername
    });
  };

  // Safe username getter with better fallbacks
  const getSafeUsername = (message) => {
    if (!message) return 'System';
    
    // Check different possible username properties
    const username = message.username || message.sender || message.playerName;
    
    if (username && username !== 'undefined' && username !== 'null') {
      return username;
    }
    
    // If no username found, try to identify by type
    if (message.type === 'system') return 'System';
    if (message.type === 'emoji') return 'Player';
    
    return 'Player';
  };

  // Safe avatar initial
  const getAvatarInitial = (message) => {
    const username = getSafeUsername(message);
    return username[0]?.toUpperCase() || 'P';
  };

  const getMessageColor = (type, username) => {
    if (type === 'system') return 'bg-blue-100 border-blue-300 text-blue-800';
    if (type === 'emoji') return 'bg-purple-100 border-purple-300 text-purple-800';
    
    const safeUsername = getSafeUsername({ username, type });
    return safeUsername === currentUsername 
      ? 'bg-green-100 border-green-300 text-gray-800' 
      : 'bg-white border-gray-300 text-gray-800';
  };

  const getMessageAlignment = (message) => {
    const username = getSafeUsername(message);
    return username === currentUsername ? 'justify-end' : 'justify-start';
  };

  const getAvatarColor = (message) => {
    const username = getSafeUsername(message);
    const colors = [
      'bg-red-500', 'bg-blue-500', 'bg-green-500', 'bg-purple-500', 
      'bg-pink-500', 'bg-indigo-500', 'bg-teal-500', 'bg-orange-500'
    ];
    const index = username.charCodeAt(0) % colors.length;
    return colors[index];
  };

  const formatTime = (timestamp) => {
    return timestamp || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const isCurrentUser = (message) => {
    const username = getSafeUsername(message);
    return username === currentUsername;
  };

  return (
    <div className="bg-white rounded-lg shadow-lg h-[500px] flex flex-col">
      {/* Chat Header */}
      <div 
        className="bg-amber-500 text-white p-4 rounded-t-lg cursor-pointer flex justify-between items-center"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center space-x-2">
          <h3 className="font-bold text-lg">💬 Game Chat</h3>
          <span className="text-sm bg-amber-600 px-2 py-1 rounded-full">
            {messages.length} messages
          </span>
        </div>
        <motion.span
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="text-lg"
        >
          ▼
        </motion.span>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col flex-1"
          >
            {/* Messages Area */}
            <div className="flex-1 p-4 overflow-y-auto bg-gray-50">
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
                    
                    console.log(`📝 Rendering message ${index}:`, { // Debug log
                      username,
                      isOwnMessage,
                      currentUsername,
                      message
                    });

                    return (
                      <motion.div
                        key={message.id || `msg-${index}-${Date.now()}`}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`flex ${getMessageAlignment(message)} items-start space-x-2`}
                      >
                        {/* Avatar for other users (left side) */}
                        {!isOwnMessage && message.type !== 'system' && (
                          <div className={`w-8 h-8 ${getAvatarColor(message)} rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}>
                            {getAvatarInitial(message)}
                          </div>
                        )}

                        <div
                          className={`max-w-xs p-3 rounded-lg border-2 ${getMessageColor(message.type, message.username)}`}
                        >
                          {message.type === 'emoji' ? (
                            <div className="text-center">
                              <div className="text-2xl">{message.emoji || '❓'}</div>
                              <p className="text-xs text-gray-600 mt-1">
                                {username} reacted
                              </p>
                            </div>
                          ) : message.type === 'system' ? (
                            <>
                              <div className="flex items-center space-x-2 mb-1">
                                <span className="text-blue-600 text-sm">⚡</span>
                                <span className="font-semibold text-blue-700 text-sm">
                                  System
                                </span>
                              </div>
                              <p className="text-blue-800 text-sm">{message.message || 'System message'}</p>
                              <p className="text-xs text-blue-600 mt-1">{formatTime(message.timestamp)}</p>
                            </>
                          ) : (
                            <>
                              {/* Message Header */}
                              <div className="flex justify-between items-start mb-2">
                                <div className="flex items-center space-x-2">
                                  <span className={`font-bold text-sm ${
                                    isOwnMessage ? 'text-green-700' : 'text-amber-700'
                                  }`}>
                                    {username}
                                    {isOwnMessage && (
                                      <span className="text-green-600 ml-1">(You)</span>
                                    )}
                                  </span>
                                </div>
                                <span className="text-xs text-gray-500">
                                  {formatTime(message.timestamp)}
                                </span>
                              </div>
                              
                              {/* Message Content */}
                              <p className="text-gray-800 break-words">{message.message || 'Empty message'}</p>
                            </>
                          )}
                        </div>

                        {/* Avatar for current user (right side) */}
                        {isOwnMessage && message.type !== 'system' && (
                          <div className={`w-8 h-8 ${getAvatarColor(message)} rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}>
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

            {/* Debug Info */}
            <div className="px-4 py-2 bg-yellow-50 border-t border-yellow-200">
              <p className="text-xs text-yellow-700">
                <strong>Debug:</strong> Current user: <strong>{currentUsername || 'Not set'}</strong> | 
                Messages: {messages.length} | 
                Socket: {socket?.id ? 'Connected' : 'Disconnected'}
              </p>
            </div>

            {/* Emoji Picker & Input Area */}
            <div className="p-3 bg-gray-100 border-t">
              <div className="flex space-x-2 mb-2 overflow-x-auto pb-2">
                <span className="text-xs text-gray-600 font-semibold self-center">Quick reactions:</span>
                {emojis.map((emoji) => (
                  <motion.button
                    key={emoji}
                    whileHover={{ scale: 1.3 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => sendEmoji(emoji)}
                    className="text-xl p-2 hover:bg-gray-200 rounded-lg transition-colors"
                    title={`Send ${emoji} reaction`}
                  >
                    {emoji}
                  </motion.button>
                ))}
              </div>

              {/* Message Input */}
              <form onSubmit={sendMessage} className="flex space-x-2">
                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder={`Type a message as ${currentUsername || 'Player'}...`}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent text-gray-800 placeholder-gray-500 bg-white pr-20"
                    maxLength={200}
                  />
                  <span className="absolute right-2 top-1/2 transform -translate-y-1/2 text-xs text-gray-500">
                    {newMessage.length}/200
                  </span>
                </div>
                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  disabled={!newMessage.trim()}
                  className="bg-amber-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-amber-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-1"
                >
                  <span>Send</span>
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