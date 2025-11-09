import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { SocketProvider } from './contexts/SocketContext';
import Home from './pages/Home';
import Lobby from './pages/Lobby';
import Game from './pages/Game';
import GameAnimated from './pages/GameAnimated';
import AnimationShowcase from './pages/AnimationShowcase';
import './index.css';

function App() {
  return (
    <SocketProvider>
      <Router>
        <div className="min-h-screen bg-gradient-to-br from-amber-50 to-amber-100">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/lobby/:roomCode" element={<Lobby />} />
            <Route path="/game/:roomCode" element={<Game />} />
            <Route path="/game-animated/:roomCode" element={<GameAnimated />} />
            <Route path="/showcase" element={<AnimationShowcase />} />
          </Routes>
        </div>
      </Router>
    </SocketProvider>
  );
}

export default App;