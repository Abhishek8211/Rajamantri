# Rajamantri - Animated Card Game Components

## 🎴 Overview

This project features a **fully animated UNO-style card game** UI with smooth transitions, 3D card flips, particle effects, and engaging visual feedback. The game implements the traditional Indian card game "Rajamantri" with modern web animations.

## 🎮 Game Rules

### Cards & Roles
- **Raja (King)** 👑 - 1000 points
- **Mantri (Minister)** 💼 - 800 points  
- **Sipahi (Soldier)** ⚔️ - 500 points
- **Chor (Thief)** 🕵️ - 0 points

### Gameplay Flow
1. **Card Distribution**: Cards are shuffled and tossed in the air, each player picks one
2. **Role Reveal**: Players tap their cards to reveal their roles
3. **Mantri's Turn**: The Mantri gets 10 seconds to identify the Chor
4. **Scoring**:
   - If Mantri is **correct**: Everyone gets points according to their card
   - If Mantri is **wrong**: Chor and Sipahi points are swapped
5. Multiple rounds continue until a winner emerges

## 🎨 Animated Components

### 1. **AnimatedCard**
**Location**: `client/src/components/AnimatedCard.js`

Features:
- ✨ 3D flip animation with backface visibility
- 🎴 UNO-style card back design with rotating pattern
- 💫 Glow effects based on role color
- 🌟 Particle effects on reveal
- 📱 Responsive sizing (small, normal, large)
- ⚡ Spring physics for smooth interactions

```jsx
<AnimatedCard
  role="raja"
  isRevealed={true}
  onReveal={handleReveal}
  isCurrentPlayer={true}
  size="normal"
/>
```

### 2. **CardDeck**
**Location**: `client/src/components/CardDeck.js`

Features:
- 🃏 Stacked deck with offset cards
- 🌪️ Shuffle animation with rotation
- ✈️ Card distribution with flying animation
- 🎯 Target position tracking for each player
- ⏱️ Sequential card dealing with timing

```jsx
<CardDeck
  cards={players}
  isDistributing={true}
  playerPositions={getPlayerPositions()}
  onDistribute={() => setIsDistributingCards(false)}
/>
```

### 3. **GameBoard**
**Location**: `client/src/components/GameBoard.js`

Features:
- 🎪 Circular game board with positioned players
- 🔄 Rotating decorative circles
- 🎭 Player avatars positioned around board
- 📊 Real-time game state indicators
- 🌈 Gradient backgrounds with patterns
- 🎆 Particle effects for celebrations

```jsx
<GameBoard
  players={players}
  currentPlayer={getCurrentPlayer()}
  onRevealRole={handleRevealRole}
  roundNumber={currentRound}
  gameState="role-assignment"
/>
```

### 4. **ScorePopup**
**Location**: `client/src/components/ScorePopup.js`

Features:
- 💥 Explosion effect on appearance
- 📈 Animated score changes with +/- indicators
- ✨ Flying particles and confetti
- 🎊 Role-based color coding
- ⏱️ Auto-dismiss timer bar
- 🎨 Glassmorphism design

```jsx
<ScorePopup
  changes={scoreChanges}
  visible={showScorePopup}
  onComplete={() => setShowScorePopup(false)}
/>
```

### 5. **RoleRevealAnimation**
**Location**: `client/src/components/RoleRevealAnimation.js`

Features:
- 🎬 Multi-stage reveal sequence:
  1. **Cards Flying** - Cards toss in the air
  2. **Shuffle** - Dramatic shuffling effect
  3. **Reveal** - 3D card flip reveal
  4. **Details** - Full role information display
- 🌟 Role-specific colors and gradients
- ⚡ Power descriptions and point values
- 🎆 Floating particles and shine effects

```jsx
<RoleRevealAnimation
  show={showRoleReveal}
  role="mantri"
  onComplete={() => setShowRoleReveal(false)}
/>
```

### 6. **GameAnimated**
**Location**: `client/src/pages/GameAnimated.js`

The main game page that orchestrates all components:
- 🎮 Complete game flow management
- 🔄 Socket.io integration for multiplayer
- ⏱️ 10-second Mantri timer with visual feedback
- 📊 Live scoreboard with animations
- 💬 Integrated chat system
- 📱 Fully responsive mobile/desktop layout
- 🎨 Dynamic background animations

## 🎯 Key Features

### Visual Effects
- **3D Card Flips**: Smooth perspective transforms
- **Particle Systems**: Confetti, sparkles, and explosions
- **Gradient Animations**: Flowing color transitions
- **Pulse Effects**: Breathing glow animations
- **Spring Physics**: Natural movement with Framer Motion
- **Glassmorphism**: Modern frosted glass effects

### UX Enhancements
- **Haptic Feedback**: Scale and rotation on interactions
- **Sound Design Ready**: Animation complete callbacks for sound triggers
- **Loading States**: Smooth transitions between game phases
- **Error Prevention**: Timer auto-select, connection indicators
- **Accessibility**: Clear visual feedback, readable fonts

### Mobile Optimization
- Responsive layouts for all screen sizes
- Touch-optimized tap targets
- Collapsible chat panel
- Simplified mobile header
- Optimized animation performance

## 🚀 Getting Started

### Installation
```bash
cd client
npm install
npm start
```

### Usage

#### Standard Game (Original)
Navigate to: `/game/:roomCode`

#### Animated Game (New)
Navigate to: `/game-animated/:roomCode`

### Switching to Animated Version

Update your Lobby component to redirect to `/game-animated/:roomCode` instead of `/game/:roomCode`:

```jsx
// In Lobby.js
<button onClick={() => navigate(`/game-animated/${roomCode}`)}>
  Start Animated Game
</button>
```

## 🎨 Customization

### Changing Card Colors
Edit `AnimatedCard.js` - `getRoleData()` function:
```javascript
const roleData = {
  raja: {
    gradient: 'from-yellow-400 via-yellow-500 to-yellow-600',
    shadow: 'shadow-yellow-500/50',
    glow: 'rgba(250, 204, 21, 0.5)',
  }
  // ... modify colors here
}
```

### Animation Timing
Adjust durations in component props:
```javascript
transition={{ 
  duration: 0.6,  // Change this
  ease: 'easeInOut' 
}}
```

### Particle Count
Modify particle arrays:
```javascript
{[...Array(20)].map((_, i) => (  // Change 20 to desired count
  <ParticleComponent key={i} />
))}
```

## 🎭 Animation Sequences

### Card Reveal Sequence
1. User clicks card
2. Card lifts with hover effect
3. Card tosses in air (1.5s)
4. Card flips while falling (0.6s)
5. Glow effect activates (2s loop)
6. Particles explode outward

### Round Complete Sequence
1. Mantri makes guess
2. Screen fades to result popup
3. Score changes animate in
4. Confetti particles spawn
5. Auto-dismiss timer runs (3s)
6. Smooth transition to next round

## 📦 Dependencies

- **react** ^19.2.0
- **framer-motion** ^12.23.24 - Animation library
- **react-router-dom** ^7.9.4 - Routing
- **socket.io-client** ^4.8.1 - Multiplayer
- **tailwindcss** - Styling

## 🎨 Asset Placeholders

The components are designed to work with placeholder emojis. For production, replace with custom assets:

### Card Back Design
- Location: `AnimatedCard.js` - Card back section
- Replace: 🎴 emoji with custom SVG/PNG
- Dimensions: 256x384px recommended

### Role Icons
- Location: `getRoleData()` in each component
- Current: 👑 💼 ⚔️ 🕵️
- Replace with custom icons/illustrations

### Background Particles
- Location: Background elements in `GameAnimated.js`
- Add custom particle sprites for more visual flair

## 🐛 Troubleshooting

### Cards not flipping
- Check CSS: Ensure `.preserve-3d` and `.backface-hidden` are loaded
- Verify browser supports 3D transforms

### Animations choppy
- Reduce particle count
- Use `will-change: transform` CSS property
- Check device performance

### Z-index issues
- Review component hierarchy
- Ensure modals have `z-50` or higher

## 📄 License

MIT License - Feel free to use in your projects!

## 🙏 Credits

- Animation system: Framer Motion
- Design inspiration: UNO card game
- Game concept: Traditional Rajamantri card game

---

**Ready to play?** Start the server and navigate to `/game-animated/:roomCode` for the full animated experience! 🎉
