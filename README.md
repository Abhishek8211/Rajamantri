# 👑 Raja Mantri Chor Sipahi 🎮

**An immersive online multiplayer card game based on the classic Indian game!**  
Play with friends in real-time, reveal your secret roles, and use strategy to win the kingdom! 👑⚔️🕵️

---

## 📖 Table of Contents

- [Game Overview](#-game-overview)
- [Quick Start](#-quick-start)
- [Key Features](#-key-features)
- [Technology Stack](#-technology-stack)
- [Project Structure](#-project-structure)
- [Game Flow & Rules](#-game-flow--rules)
- [Architecture](#-architecture)
- [Use Cases](#-use-cases)
- [API Documentation](#-api-documentation)
- [Troubleshooting](#-troubleshooting)
- [Deployment](#-deployment)
- [Contributing](#-contributing)
- [License & Credits](#-license--credits)

---

## 🎯 Game Overview

**Raja Mantri Chor Sipahi** is a 4-player social deduction card game where players are secretly assigned roles and must use strategy, deception, and deduction to score points. This modern web implementation brings the classic Indian game online with real-time multiplayer, stunning animations, and AI opponents.

### 🃏 The Four Roles

| Role                  | Icon | Description                                   | Strategy                                         |
| --------------------- | ---- | --------------------------------------------- | ------------------------------------------------ |
| **Raja** (King)       | 👑   | The ruler who trusts the Mantri               | Stay calm, trust your Mantri's judgment          |
| **Mantri** (Minister) | 💼   | Advisor who calls the Sipahi to find the Chor | Call the Sipahi quickly, observe player behavior |
| **Sipahi** (Soldier)  | ⚔️   | Enforcer who must identify the Chor           | Analyze carefully, you have 2 minutes to decide  |
| **Chor** (Thief)      | 🕵️   | The criminal trying to avoid capture          | Act innocent, blend in with other players        |

### 🏆 Scoring System

**Fixed Points (Every Round):**

- **👑 Raja**: Always **1000 points** (guaranteed income)
- **💼 Mantri**: Always **800 points** (trusted advisor)

**Variable Points (Based on Sipahi's Choice):**

| Scenario           | Sipahi | Chor | Outcome         |
| ------------------ | ------ | ---- | --------------- |
| **Sipahi Correct** | +500   | 0    | ✅ Chor caught  |
| **Sipahi Wrong**   | 0      | +500 | ❌ Chor escapes |

**Example Game (3 Rounds):**

| Round     | Player A      | Player B      | Player C        | Player D        |
| --------- | ------------- | ------------- | --------------- | --------------- |
| **1**     | Raja → 1000   | Mantri → 800  | Sipahi → 500 ✅ | Chor → 0        |
| **2**     | Chor → 500 ✅ | Sipahi → 0 ❌ | Mantri → 800    | Raja → 1000     |
| **3**     | Mantri → 800  | Chor → 0      | Raja → 1000     | Sipahi → 500 ✅ |
| **Total** | **2300** 🥈   | **1600**      | **2300** 🥈     | **2500** 🏆     |

---

## ⚡ Quick Start

### Prerequisites

- **Node.js** v14 or higher
- **npm** or **yarn**
- Modern web browser (Chrome, Firefox, Safari, Edge)

### 🚀 Installation

**1. Clone the Repository**

```bash
git clone https://github.com/Abhishek8211/Rajamantri.git
cd Rajamantri
```

**2. Start the Server**

```bash
cd server
npm install
npm start
```

✅ Server running on `http://localhost:5001`

**3. Start the Client** _(in a new terminal)_

```bash
cd client
npm install
npm start
```

✅ Client running on `http://localhost:3000` (or 3002 if 3000 is busy)

**Note:** If port 3000 is already in use, React will prompt you to use an alternate port. Type `Y` to accept port 3002 or any available port.

### 🎮 First Game

1. Open browser to `http://localhost:3000`
2. Enter your username
3. Click **"Create Room"**
4. Choose number of rounds (1-10)
5. **Add AI bots from lobby if needed** (NEW! ⭐)
6. Share room code with friends OR start game with bots
7. Reveal your role and play!

---

## 🆕 Recent Updates (Latest Features)

### 🐛 Critical Bug Fixes (November 2025)

**10 Production Bugs Fixed** - Game is now stable and production-ready!

**Server-Side Fixes:**

- ✅ **Timer Race Condition** - Mantri/Sipahi timers now properly cleaned up on disconnect
- ✅ **Bot Memory Leaks** - Bot timers cleared when removed from lobby
- ✅ **Duplicate Room Codes** - Unique code generation with collision detection
- ✅ **Case-Sensitive Rooms** - Room codes now case-insensitive (ABC123 = abc123)

**Client-Side Fixes:**

- ✅ **Toast Memory Leak** - Limited to 5 toasts max, useCallback optimization
- ✅ **Chat Auto-Scroll** - Smart scrolling (only when user is near bottom)
- ✅ **Empty Room Codes** - Validation prevents joining with empty/invalid codes
- ✅ **Browser Back Button** - Warning dialog protects against accidental navigation
- ✅ **Score Accuracy** - Server-side score calculation prevents drift
- ✅ **Sipahi Timer Visibility** - All players now see countdown

**What This Means:**

- No more crashes from timer conflicts
- Memory usage optimized
- Better user experience with validation
- Production-ready stability

### 🤖 Smart Bot Management

**In-Lobby Bot Controls** - No more pre-game configuration! Host can now:

- Add 1-3 AI players directly from the lobby
- See planned bot count in real-time
- Modify bot settings before game starts
- Remove bots if too many players join
- Beautiful centered UI with square bot selection buttons

**How it works:**

1. Host clicks "Add AI Players" button
2. Select number of bots (1, 2, or 3)
3. See total player count (humans + bots)
4. Confirm → Bots join when game starts
5. Remove button available if needed

### 👋 Player Removal System

**Host Controls** - Complete lobby management:

- **Remove any player** (humans or bots) with × button
- Only host sees remove buttons (on other players)
- **Beautiful confirmation modal** - Animated dialog replaces browser alerts
- Removed players get notified and redirected
- Chat announces all removals
- Real-time lobby updates for everyone

**Confirmation Modal Features:**

- Gradient design with animated warning icon
- Shake animation on icon appearance
- Player card showing who will be removed
- "Cannot be undone" warning message
- Cancel/Remove buttons with hover effects
- Backdrop blur with click-outside-to-close
- Spring physics animations (scale + fade)

**Safety Features:**

- Host cannot remove themselves
- Non-host players cannot remove anyone
- Game requires minimum 4 players to start
- Validation prevents starting with insufficient players

### 🔔 Toast Notification System

**Beautiful Alerts** - No more browser alerts!

- **Top-center positioning** - Never overlaps game UI
- **4 color-coded types** - Error (red), Warning (amber), Success (green), Info (blue)
- **Smooth animations** - Slide down with spring physics
- **Auto-dismiss timer** - Progress bar shows countdown (5s default)
- **Fixed auto-dismiss bug** - useCallback ensures proper timer execution
- **Manual close** - Rotating × button
- **Icon animations** - Shake effect on appear
- **Multiple toasts** - Stack properly without overlap
- **Memory optimized** - Stable function references prevent re-renders

### 🎨 UI/UX Improvements

**Lobby Interface:**

- Centered bot controls with max-width design
- Square 64×64px bot selection buttons with icons
- Gradient backgrounds and shadows throughout
- Remove buttons on player cards (host only)
- Responsive design for all screen sizes

**Animation Polish:**

- Toast slides from -100px with spring effect
- Bot buttons scale on hover (1.08x)
- Selected bot shows amber gradient + ring glow
- Smooth transitions on all interactions

---

## ✨ Key Features

### 🎮 Core Gameplay

- ✅ **Multiplayer Rooms** - Create/join with unique codes
- ✅ **4-Player Support** - Exactly 4 players per game
- ✅ **Real-time Sync** - Powered by Socket.io
- ✅ **AI Opponents** - 3 difficulty levels (Smart, Random, Novice)
- ✅ **Customizable Rounds** - Choose 1-10 rounds
- ✅ **Role Assignment** - Random, fair distribution
- ✅ **Strategic Gameplay** - Mantri → Sipahi workflow
- ✅ **Timer System** - 10s for Mantri, 2min for Sipahi

### 🎨 Visual Experience

- ✅ **Animation Showcase** - Dedicated page to view all animations
- ✅ **4-Stage Role Reveal** - Cards flying → Shuffle → Flip → Details (7s sequence)
- ✅ **3D Card Animations** - Smooth flip with CSS transforms
- ✅ **Card Flying Effect** - Cards toss in air
- ✅ **Shuffle Animation** - Dramatic 360° rotation
- ✅ **Countdown Timer** - 3-2-1-GO! before rounds
- ✅ **Score Popups** - Animated reveals with spring physics
- ✅ **Winner Celebration** - Confetti and trophy
- ✅ **Custom Scrollbar** - Amber-colored smooth scrolling
- ✅ **Mobile Responsive** - Optimized for all screens
- ✅ **Dark Theme** - Beautiful gradients

### 💬 Social Features

- ✅ **Live Chat** - Real-time messaging with scrollable layout
- ✅ **Auto-expand Chat** - Opens automatically when message icon clicked
- ✅ **Mobile Chat Overlay** - Full-screen chat on mobile devices
- ✅ **Backdrop Dismiss** - Click outside to close mobile chat
- ✅ **Dynamic Layout** - Chat minimizes to header-only on collapse
- ✅ **Emoji Reactions** - Quick emotional responses
- ✅ **System Messages** - Game events announced

### 🎯 Lobby Management (New!)

- ✅ **Smart Bot Controls** - Add 1-3 AI players directly from lobby
- ✅ **Real-time Bot Counter** - See planned bot count before game starts
- ✅ **Player Removal** - Host can remove any player (humans or bots)
- ✅ **Centered UI** - Beautiful, centered bot selection interface
- ✅ **Visual Confirmations** - Animated toasts for all actions
- ✅ **Minimum Validation** - Game requires exactly 4 players (humans + bots)
- ✅ **Kick Notifications** - Removed players get notified and redirected

### 🔔 Notification System (New!)

- ✅ **Toast Notifications** - Beautiful animated popups at top-center
- ✅ **4 Notification Types** - Error (red), Warning (amber), Success (green), Info (blue)
- ✅ **Smart Positioning** - Top-center placement to avoid UI overlap
- ✅ **Auto-dismiss** - Closes automatically with progress bar
- ✅ **Manual Close** - Rotating × button for instant dismissal
- ✅ **Icon Animations** - Shake effect on appearance
- ✅ **Multiple Toasts** - Stacks notifications properly
- ✅ **Player Status** - See who's online/revealed

### 📊 Scoring & Analytics

- ✅ **Dynamic Scoreboard** - Round-by-round tracking
- ✅ **Score History** - View all rounds in modal
- ✅ **Leaderboard** - Real-time rankings
- ✅ **Score Animations** - Watch points accumulate
- ✅ **Winner Announcement** - Beautiful end-game ceremony

### 🤖 AI System

- ✅ **SMART** (70% accuracy) - Challenges experienced players
- ✅ **RANDOM** (25% accuracy) - Unpredictable behavior
- ✅ **NOVICE** (10% accuracy) - Great for beginners
- ✅ **Personality Traits** - Unique play styles
- ✅ **Realistic Delays** - Human-like thinking times
- ✅ **Chat Integration** - Bots send messages

---

## 🛠️ Technology Stack

### Frontend

| Technology           | Version  | Purpose                 |
| -------------------- | -------- | ----------------------- |
| **React.js**         | 19.2.0   | UI framework with hooks |
| **Framer Motion**    | 12.23.24 | Animation library       |
| **Tailwind CSS**     | 3.x      | Utility-first styling   |
| **Socket.io-client** | 4.8.1    | Real-time connection    |
| **React Router**     | 7.1.1    | Client-side routing     |

### Backend

| Technology     | Version | Purpose              |
| -------------- | ------- | -------------------- |
| **Node.js**    | 18+     | JavaScript runtime   |
| **Express.js** | 4.21.2  | Web server framework |
| **Socket.io**  | 4.8.1   | WebSocket server     |
| **CORS**       | 2.8.5   | Cross-origin sharing |

### Key Libraries

- **CSS Transforms** - 3D card flips (rotateY, perspective)
- **AnimatePresence** - Enter/exit animations
- **Motion Variants** - Reusable animation patterns

---

## 📁 Project Structure

```
Rajamantri/
├── client/                          # React frontend
│   ├── public/
│   │   ├── card-back.png           # Card back design
│   │   ├── card-raja.png           # Raja (King) card
│   │   ├── card-mantri.png         # Mantri (Minister) card
│   │   ├── card-sipahi.png         # Sipahi (Soldier) card
│   │   ├── card-chor.png           # Chor (Thief) card
│   │   ├── logo.png                # App logo
│   │   ├── index.html              # HTML template
│   │   └── manifest.json           # PWA manifest
│   ├── src/
│   │   ├── components/
│   │   │   ├── Chat.js             # Real-time chat with scrollable layout
│   │   │   ├── Toast.js            # Notification system (NEW) ⭐
│   │   │   ├── ConfirmModal.js     # Beautiful confirmation dialogs (NEW) ⭐
│   │   │   ├── RoleRevealAnimation.js  # 4-stage cinematic reveal
│   │   │   ├── AnimatedCard.js     # 3D flipping role cards
│   │   │   ├── CardDeck.js         # Card distribution animation
│   │   │   └── ScorePopup.js       # Animated score announcements
│   │   ├── pages/
│   │   │   ├── Home.js             # Landing page (create/join)
│   │   │   ├── Lobby.js            # Pre-game waiting room
│   │   │   ├── Game.js             # Original game interface
│   │   │   ├── GameAnimated.js     # Enhanced game with animations ⭐
│   │   │   └── AnimationShowcase.js # Animation testing page
│   │   ├── contexts/
│   │   │   └── SocketContext.js    # Socket.io React context
│   │   ├── App.js                  # Main app router
│   │   ├── index.js                # React entry point
│   │   └── index.css               # Global styles + Tailwind
│   └── package.json                # Frontend dependencies
│
├── server/                          # Node.js + Express backend
│   ├── index.js                    # Main server (828 lines)
│   │                                 ├─ Express routes
│   │                                 ├─ Socket.io handlers
│   │                                 ├─ Game logic
│   │                                 ├─ Bot AI system
│   │                                 └─ Room management
│   └── package.json                # Backend dependencies
│
└── README.md                        # This documentation
```

### 🌐 Application Routes

| Route              | Page              | Description                     | Access  |
| ------------------ | ----------------- | ------------------------------- | ------- |
| `/`                | Home              | Create/join room                | Public  |
| `/lobby/:roomCode` | Lobby             | Wait for players                | Members |
| `/game/:roomCode`  | GameAnimated      | Active gameplay with animations | Members |
| `/showcase`        | AnimationShowcase | Test all animations             | Public  |

---

## 🎯 Game Flow & Rules

### Complete Game Flow

**Phase 1: Room Setup**

1. Player creates room → Gets 6-char code (e.g., "ABC123")
2. Share code with friends OR enable bots
3. Host configures rounds (1-10) and bot difficulty
4. Host starts game

**Phase 2: Round Start** 5. Countdown: **3... 2... 1... GO!** with animation 6. Cards fly from deck with shuffle effect 7. Roles assigned randomly to all 4 players

**Phase 3: Role Reveal** 8. Players click to flip their cards (3D animation) 9. Game waits until all players reveal

**Phase 4: Mantri's Decision** ⏱️ 10 seconds 10. Mantri clicks "Call Sipahi Sipahi Chor Ko Pakdo" 11. Auto-calls if timer expires 12. System announces: "Mantri called Sipahi!"

**Phase 5: Sipahi's Choice** ⏱️ 2 minutes 13. Sipahi chooses to point at Raja or Chor 14. Random choice if timer expires 15. System announces the guess

**Phase 6: Score Calculation** ⏱️ 5 seconds 16. Loading animation shows 17. Scores calculated based on rules

**Phase 7: Round Results** 18. **Animated score popup** shows: - Each player's role badge - Points earned (color-coded: green/red/gray) - Sorted by performance

**Phase 8: Next Round or End** 19. If more rounds: Repeat from Phase 2 20. If final round: **Winner celebration** with confetti!

### Timer System

| Phase               | Duration    | Auto-Action       | Visual               |
| ------------------- | ----------- | ----------------- | -------------------- |
| **Mantri Decision** | 10s         | Auto-calls Sipahi | Red-orange gradient  |
| **Sipahi Decision** | 2min (120s) | Random guess      | Purple-blue gradient |
| **Score Display**   | 5s          | Next round/finish | Loading spinner      |

### Strategy Tips

**For Raja** 👑

- You have no control but guaranteed 1000 points
- Trust your Mantri's judgment
- Stay calm and enjoy the ride

**For Mantri** 💼

- You have 10 seconds to call Sipahi
- Observe player reactions quickly
- Call early to give Sipahi more time

**For Sipahi** ⚔️

- You have 2 minutes to analyze
- Watch for nervous behavior from Chor
- Consider player chat messages
- Raja always gets 1000, so catching Chor matters most

**For Chor** 🕵️

- Act innocent and blend in
- Participate in chat normally
- Don't reveal too early
- Hope Sipahi makes wrong choice for +500 points

---

## 🏗️ Architecture & Implementation

### Socket.io Event System

**Client → Server Events:**

```javascript
// Room Management
socket.emit("create-room", {
  username: "Player1",
  rounds: 5,
  addBots: true,
  botCount: 2,
  botDifficulty: "smart",
});

socket.emit("join-room", {
  roomCode: "ABC123",
  username: "Player2",
});

socket.emit("start-game", roomCode);

// Gameplay Actions
socket.emit("reveal-role", roomCode);
socket.emit("mantri-call-sipahi", roomCode);
socket.emit("sipahi-guess", roomCode, guessedPlayerId);

// Chat
socket.emit("send-chat-message", {
  roomCode,
  message,
  username,
});
socket.emit("send-emoji", {
  roomCode,
  emoji,
  username,
});
```

**Server → Client Events:**

```javascript
// Room Events
socket.on("room-created", (room) => {
  /* ... */
});
socket.on("room-joined", (room) => {
  /* ... */
});
socket.on("room-updated", (room) => {
  /* ... */
});
socket.on("player-left", ({ playerId, room }) => {
  /* ... */
});

// Game Flow Events
socket.on("game-started", (roomData) => {
  /* Countdown */
});
socket.on("player-revealed", ({ playerId, allRevealed }) => {
  /* ... */
});
socket.on("all-roles-revealed", (room) => {
  /* Mantri's turn */
});
socket.on("mantri-called-sipahi", ({ mantriId, sipahiId }) => {
  /* ... */
});
socket.on("sipahi-guessed", ({ sipahiId, guessedPlayerId }) => {
  /* ... */
});
socket.on("guess-processed", (roomData) => {
  /* Show results */
});
socket.on("next-round-started", (roomData) => {
  /* New round */
});
socket.on("game-finished", (roomData) => {
  /* Winner! */
});

// Chat Events
socket.on("new-chat-message", (message) => {
  /* Display */
});
```

### Game State Machine

```javascript
const GAME_STATES = {
  WAITING: "waiting", // In lobby
  STARTING: "starting", // Countdown
  ROLE_ASSIGNMENT: "role-assignment", // Cards dealt
  GUESSING: "guessing", // Mantri's turn (10s)
  SIPAHI_GUESSING: "sipahi-guessing", // Sipahi's turn (2min)
  CONCLUDING_SCORES: "concluding-scores", // 5s delay
  ROUND_RESULT: "round-result", // Score popup
  FINISHED: "finished", // Game over
};
```

**State Transitions:**

```
WAITING → STARTING (host starts)
  → ROLE_ASSIGNMENT (countdown ends)
  → GUESSING (all revealed)
  → SIPAHI_GUESSING (Mantri called)
  → CONCLUDING_SCORES (Sipahi guessed)
  → ROUND_RESULT (5s passed)
  → ROLE_ASSIGNMENT (next round) OR FINISHED (all rounds done)
```

### Bot AI System

**Personality Types:**

```javascript
const BOT_PERSONALITIES = {
  SMART: {
    accuracy: 0.7, // 70% correct
    thinkTime: [4, 7], // 4-7 seconds
    chatChance: 0.3, // 30% chat
  },
  RANDOM: {
    accuracy: 0.25, // 25% correct
    thinkTime: [2, 5], // 2-5 seconds
    chatChance: 0.15, // 15% chat
  },
  NOVICE: {
    accuracy: 0.1, // 10% correct
    thinkTime: [5, 9], // 5-9 seconds
    chatChance: 0.05, // 5% chat
  },
};
```

**Bot Behavior:**

```javascript
// 1. Role Reveal (1-4s delay)
setTimeout(() => {
  socket.emit("reveal-role", roomCode);
}, random(1000, 4000));

// 2. Mantri Calls (2-5s delay)
setTimeout(() => {
  socket.emit("mantri-call-sipahi", roomCode);
}, random(2000, 5000));

// 3. Sipahi Guesses (personality-based)
setTimeout(() => {
  const target = calculateGuess(personality, history);
  socket.emit("sipahi-guess", roomCode, target);
}, personality.thinkTime * 1000);

// 4. Chat (30% chance)
if (Math.random() < 0.3) {
  socket.emit("send-chat-message", {
    roomCode,
    message: "Good game! 🎮",
    username: botName,
  });
}
```

### Data Models

**Room Object:**

```javascript
{
  code: "ABC123",              // 6-char uppercase
  host: "socket-id",           // Host player ID
  players: [Player],           // 2-4 players
  gameState: "waiting",        // Current state
  maxPlayers: 4,               // Always 4
  rounds: 5,                   // 1-10 rounds
  currentRound: 1,             // Current round
  scores: {},                  // { playerId: score }
  roundHistory: [],            // Score changes per round
  chatMessages: [],            // Chat history
  addBots: true,               // AI enabled?
  botCount: 2,                 // Number of bots
  botDifficulty: "smart"       // Bot difficulty
}
```

**Player Object:**

```javascript
{
  id: "socket-id" | "bot-123",
  username: "PlayerName",
  isHost: false,
  connected: true,
  ready: false,
  score: 0,
  isBot: false,
  personality: "smart",        // For bots
  revealed: false,
  role: "raja"|"mantri"|"chor"|"sipahi"
}
```

**Chat Message:**

```javascript
{
  id: "timestamp-string",
  username: "PlayerName",
  message: "Hello!" | "🎉",
  type: "player"|"system"|"emoji"|"mantri-call",
  timestamp: "10:30:45 AM",
  playerId: "socket-id",
  highlighted: true            // Yellow background
}
```

---

## 🎨 Use Cases

### Use Case 1: Friends Playing Together

**Scenario**: 4 friends want to play online

**Steps:**

1. Host creates room, gets code "XYZ123"
2. Shares code via WhatsApp/Discord
3. All join using the code
4. Host selects 5 rounds, starts game
5. Everyone plays through 5 rounds
6. Winner announced with confetti

**Benefits**:

- No registration needed
- Quick setup (<30 seconds)
- Real-time sync
- Cross-platform (mobile + desktop)

### Use Case 2: Solo Practice with AI

**Scenario**: New player wants to learn

**Steps:**

1. Player creates room alone
2. Enables "Add Bots" option
3. Sets bot difficulty to "NOVICE"
4. Starts game with 3 AI opponents
5. Practices strategy without pressure

**Benefits**:

- Learn at own pace
- No waiting for players
- AI provides realistic gameplay
- Can experiment with strategies

### Use Case 3: Tournament Mode

**Scenario**: 10 rounds competition

**Steps:**

1. Host creates room with 10 rounds
2. All players join
3. Plays through long session
4. Detailed scoreboard tracks progress
5. Winner determined by cumulative score

**Benefits**:

- Extended gameplay (20-30 minutes)
- Strategic depth increases
- Score history preserved
- Comeback opportunities

### Use Case 4: Quick Match

**Scenario**: 5-minute break

**Steps:**

1. Create room with 2 rounds only
2. Add 3 SMART bots instantly
3. Play quick 2-round game
4. Results in ~5 minutes

**Benefits**:

- Ultra-fast setup
- No coordination needed
- Perfect for breaks
- Still competitive

### Use Case 5: Mobile Gaming

**Scenario**: Playing on phone while commuting

**Steps:**

1. Open on mobile browser
2. Responsive UI adapts
3. Touch-optimized controls
4. Chat accessible via toggle
5. Full feature parity

**Benefits**:

- Works on all devices
- No app download required
- Same experience as desktop
- Mobile-first design

---

## 📡 API Documentation

### REST Endpoints

#### `GET /`

**Description**: Server health check

**Response:**

```json
{
  "message": "Raja Mantri Chor Sipahi Server is running!",
  "activeRooms": 3,
  "activePlayers": 12
}
```

#### `GET /rooms`

**Description**: List all active rooms (debugging)

**Response:**

```json
{
  "rooms": [
    {
      "code": "ABC123",
      "players": 4,
      "gameState": "guessing",
      "currentRound": 2
    }
  ]
}
```

#### `GET /room/:roomCode`

**Description**: Get specific room info

**Parameters**: `roomCode` (string, 6 chars)

**Response:**

```json
{
  "code": "ABC123",
  "players": [
    /* ... */
  ],
  "gameState": "role-assignment",
  "currentRound": 2,
  "rounds": 5
}
```

### Socket.io Events Reference

**Connection:**

```javascript
socket.on("connect", () => {
  console.log("Connected to server");
});

socket.on("disconnect", () => {
  console.log("Disconnected from server");
});
```

**Room Management:**

```javascript
// Create Room
socket.emit("create-room", {
  username,
  rounds,
  addBots,
  botCount,
  botDifficulty,
});
socket.on("room-created", (room) => {
  /* Navigate to lobby */
});

// Join Room
socket.emit("join-room", { roomCode, username });
socket.on("room-joined", (room) => {
  /* Navigate to lobby */
});
socket.on("room-updated", (room) => {
  /* Update UI */
});

// Start Game
socket.emit("start-game", roomCode);
socket.on("game-started", (roomData) => {
  /* Navigate to game */
});
```

**Gameplay:**

```javascript
// Reveal Role
socket.emit("reveal-role", roomCode);
socket.on("player-revealed", ({ playerId, allRevealed }) => {
  /* ... */
});
socket.on("all-roles-revealed", (room) => {
  /* Start Mantri timer */
});

// Mantri Calls Sipahi
socket.emit("mantri-call-sipahi", roomCode);
socket.on("mantri-called-sipahi", ({ mantriId, sipahiId }) => {
  /* Start Sipahi timer */
});

// Sipahi Guesses
socket.emit("sipahi-guess", roomCode, guessedPlayerId);
socket.on("sipahi-guessed", ({ sipahiId, guessedPlayerId }) => {
  /* Calculating... */
});
socket.on("guess-processed", (roomData) => {
  /* Show scores */
});

// Next Round / End
socket.on("next-round-started", (roomData) => {
  /* New round */
});
socket.on("game-finished", (roomData) => {
  /* Winner celebration */
});
```

**Chat:**

```javascript
// Send Message
socket.emit("send-chat-message", { roomCode, message, username });
socket.emit("send-emoji", { roomCode, emoji, username });

// Receive Messages
socket.on("new-chat-message", (message) => {
  /* Display in chat */
});
```

**Lobby Management (NEW):**

```javascript
// Update Bot Settings
socket.emit("update-bot-settings", {
  roomCode,
  addBots: true,
  botCount: 2,
  botDifficulty: "smart",
});
socket.on("room-updated", (room) => {
  /* Lobby UI updates with bot info */
});

// Remove Player (Host Only)
socket.emit("remove-player", {
  roomCode,
  playerId: "player-socket-id",
});
socket.on("room-updated", (room) => {
  /* Player removed from lobby */
});

// Kicked from Room
socket.on("kicked-from-room", ({ message }) => {
  /* Show notification and redirect to home */
});
```

---

## 🐛 Troubleshooting

### ✅ Recently Fixed Issues (No Action Needed)

**These bugs have been fixed in the latest version:**

1. ✅ **Timer doesn't stop when Mantri disconnects** → Fixed with cleanup handlers
2. ✅ **Toasts don't auto-dismiss** → Fixed with useCallback optimization
3. ✅ **Removed bots still in memory** → Fixed with proper cleanup
4. ✅ **Chat doesn't scroll to new messages** → Fixed with smart auto-scroll
5. ✅ **Room codes case-sensitive** → Fixed with normalization
6. ✅ **Can join with empty room code** → Fixed with validation
7. ✅ **Browser back breaks game** → Fixed with beforeunload warning
8. ✅ **Duplicate room codes possible** → Fixed with collision detection
9. ✅ **Scores show wrong totals** → Fixed with server-side calculation
10. ✅ **Sipahi timer hidden from others** → Fixed, now visible to all

**If you're experiencing any of these, pull the latest code from GitHub!**

### Common Issues

#### ❌ "Room not found" error

**Problem**: Can't join room with code

**Solutions**:

1. Check room code (now case-insensitive: ABC123 = abc123)
2. Make sure code is exactly 6 characters
3. Ensure room hasn't closed
4. Ask host to create new room
5. Verify server is running

#### ❌ Cards not flipping

**Problem**: Click "Reveal Card" but nothing happens

**Solutions**:

1. Enable hardware acceleration in browser
2. Update to latest Chrome/Firefox
3. Clear cache: `Ctrl+Shift+Delete`
4. Check console (`F12`) for errors

#### ❌ Chat messages delayed

**Problem**: Messages don't show up or arrive late

**Solutions**:

1. Check network connection
2. Open DevTools (`F12`) → Network → WS tab
3. Verify websocket connection
4. Restart server
5. Refresh page (`F5`)

**Note**: Chat now has smart auto-scroll! If you're scrolling up to read old messages, new messages won't interrupt you. Scroll near bottom to re-enable auto-scroll.

#### ❌ Chat not expanding when clicked

**Problem**: Click message icon but chat stays minimized

**Solutions**:

1. Refresh page (`F5`)
2. Check browser console (`F12`) for errors
3. Clear localStorage: `localStorage.clear()` in console
4. Ensure you're using latest version
5. Try clicking the chat header directly

#### ❌ Game content hidden on mobile

**Problem**: Game area disappears when chat opens on small screens

**Solutions**:

1. Update to latest version (chat now overlays game)
2. Minimize chat by clicking header
3. Use backdrop click (click outside chat) to close
4. Rotate device to landscape mode
5. Report bug if issue persists

#### ❌ Chat overlay blocking interactions

**Problem**: Can't click game elements when chat is minimized

**Solutions**:

1. Ensure chat is fully minimized (header only visible)
2. Click outside chat area to dismiss overlay
3. Refresh page if overlay still blocking
4. Check `z-index` conflicts in browser DevTools
5. Verify parent state sync in console

#### ❌ Port 3000 already in use

**Problem**: React app won't start on default port

**Solutions**:

1. Accept alternate port when prompted (usually 3002)
2. Kill process using port: `netstat -ano | findstr :3000`
3. Manually specify port: `set PORT=3001 && npm start`
4. Close other React apps
5. Restart terminal/computer if needed

#### ❌ Cannot start game (insufficient players)

**Problem**: Error: "At least 4 players (including bots) are required to start the game. Currently: X/4"

**Solutions**:

1. **Add more bots** - Click "Add AI Players" in lobby
2. **Wait for players** - Share room code with friends
3. **Check bot settings** - Ensure bots are configured correctly
4. **Total must be 4** - Humans + Bots = 4 players exactly
5. **Remove and re-add** - If bots show but game won't start, remove and add fresh bots

#### ❌ Player removal not working

**Problem**: × button not appearing or removal fails

**Solutions**:

1. **Check if you're host** - Only host can remove players
2. **Can't remove yourself** - Host cannot remove their own card
3. **Confirm the dialog** - Click OK in the confirmation popup
4. **Check connection** - Ensure stable internet connection
5. **Refresh lobby** - F5 to reload if buttons don't appear

#### ❌ Kicked from lobby unexpectedly

**Problem**: "You have been removed from the lobby by the host"

**Explanation**: The host removed you from the lobby

**What to do**:

1. Contact the host to ask why
2. Wait 2 seconds for automatic redirect to home
3. Join a different room or create your own
4. Cannot rejoin same room immediately

#### ❌ Toast notifications not appearing or not auto-dismissing

**Problem**: No notification popups showing or they don't disappear automatically

**Solutions**:

1. **Auto-dismiss fix**: Updated to useCallback for stable timer execution
2. Check browser console for JavaScript errors
3. Clear browser cache and reload (Ctrl+Shift+Delete)
4. Disable browser extensions that might block popups
5. Try different browser (Chrome, Firefox, Edge)
6. Check if z-index is being overridden by custom CSS
7. Ensure React hooks (useCallback) are properly imported

#### ❌ Confirmation modal not appearing when removing player

**Problem**: Browser alert shows instead of beautiful modal, or nothing happens

**Solutions**:

1. Ensure ConfirmModal component is imported in Lobby.js
2. Check confirmModal state is properly initialized
3. Verify AnimatePresence is wrapping modal content
4. Clear browser cache and hard reload (Ctrl+Shift+F5)
5. Check browser console for React errors
6. Ensure Framer Motion is installed (`npm install framer-motion`)

#### ❌ Bots not playing

**Problem**: Bots added but don't reveal/guess

**Solutions**:

1. Ensure "Add Bots" was checked
2. Wait for role reveal phase
3. Check server console for errors
4. Restart with fresh room

#### ❌ Scores not updating

**Problem**: Scores stuck at 0

**Solutions**:

1. Wait 5 seconds after Sipahi's guess
2. Check if score popup appeared
3. Verify `guess-processed` event in DevTools
4. Refresh page if stuck

### Debug Mode

**Client (`src/contexts/SocketContext.js`):**

```javascript
const socket = io("http://localhost:5001", {
  transports: ["websocket"],
  debug: true, // Add this
});

socket.onAny((eventName, ...args) => {
  console.log(`[Socket Event] ${eventName}:`, args);
});
```

**Server (`server/index.js`):**

```javascript
io.on("connection", (socket) => {
  console.log(`[Server] New connection: ${socket.id}`);

  socket.onAny((eventName, ...args) => {
    console.log(`[Server] ${eventName}:`, args);
  });
});
```

---

## 🚀 Deployment

### Production Checklist

- [ ] Update CORS origins in `server/index.js`
- [ ] Set environment variables (PORT, NODE_ENV)
- [ ] Build React app: `npm run build`
- [ ] Use process manager (PM2, Forever)
- [ ] Configure reverse proxy (Nginx)
- [ ] Enable HTTPS/SSL
- [ ] Set up monitoring (Sentry)
- [ ] Configure CDN for static assets

### Environment Variables

**Server (`.env`):**

```bash
PORT=5001
NODE_ENV=production
CORS_ORIGIN=https://yourdomain.com
SOCKET_PING_INTERVAL=25000
SOCKET_PING_TIMEOUT=60000
```

**Client (`.env`):**

```bash
REACT_APP_API_URL=https://api.yourdomain.com
REACT_APP_SOCKET_URL=https://socket.yourdomain.com
```

### Deployment Platforms

**Heroku (Easy):**

```bash
heroku create rajamantri-game
heroku config:set NODE_ENV=production
git push heroku main
heroku open
```

**Docker (Containerized):**

```dockerfile
FROM node:18-alpine
WORKDIR /usr/src/app
COPY package*.json ./
COPY client/package*.json ./client/
COPY server/package*.json ./server/
RUN cd client && npm install
RUN cd server && npm install
COPY . .
RUN cd client && npm run build
EXPOSE 5001
CMD ["node", "server/index.js"]
```

---

## 💡 Feature Status

### ✅ Fully Implemented

- [x] Real-time multiplayer (Socket.io)
- [x] Room creation with codes
- [x] AI opponents (3 difficulties)
- [x] 3D card flip animations
- [x] Card flying & shuffle effects
- [x] Countdown timers
- [x] Round-by-round scoreboard
- [x] Score popup animations
- [x] Winner celebration with confetti
- [x] Live chat with emojis
- [x] Mobile responsive design
- [x] Bot personality system
- [x] Game state machine
- [x] Mantri → Sipahi flow
- [x] 2-minute Sipahi timer
- [x] Score calculation delay
- [x] Chat message highlighting

### 🚀 Upcoming Features

- [ ] Sound effects & music
- [ ] Player avatars upload
- [ ] Room passwords
- [ ] Spectator mode
- [ ] Replay system
- [ ] Statistics dashboard
- [ ] Achievement system
- [ ] Tournament brackets
- [ ] Custom card themes
- [ ] Voice chat integration
- [ ] Mobile app (React Native)
- [ ] Database persistence
- [ ] User accounts
- [ ] Friend system
- [ ] Global leaderboards

---

## 🤝 Contributing

We welcome contributions! Here's how:

1. **Fork** the repository
2. **Create** a feature branch: `git checkout -b feature/amazing-feature`
3. **Commit** changes: `git commit -m 'feat: Add amazing feature'`
4. **Push** to branch: `git push origin feature/amazing-feature`
5. **Open** a Pull Request

### Development Guidelines

- Follow existing code style
- Write meaningful commit messages
- Test on multiple devices
- Update documentation
- Add comments for complex logic

### Commit Message Convention

- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation changes
- `style:` Code formatting
- `refactor:` Code restructuring
- `test:` Adding tests
- `chore:` Build/config changes

---

## 📄 License & Credits

**License**: MIT License

**Developed by**: [Abhishek8211](https://github.com/Abhishek8211) && [netxspider](https://github.com/netxspider)

**Game Design**: Traditional Indian game adaptation

**Technology**: React, Socket.io, Framer Motion, Tailwind CSS

---

## 📞 Support

- **GitHub Issues**: [Report bugs](https://github.com/Abhishek8211/Rajamantri/issues)
- **Discussions**: [Ask questions](https://github.com/Abhishek8211/Rajamantri/discussions)
- **Email**: abhishekkr7133@gmail.com || netxspider@gmail.com

---

## 🎮 Play Now!

Ready to play? Start your own game:

```bash
git clone https://github.com/Abhishek8211/Rajamantri.git
cd Rajamantri
# Follow Quick Start guide above
```

**Enjoy the game! May the best strategist win! 👑🎮⚔️**

---

<div align="center">

Made with ❤️ by netxspider & Abhishek8211

⭐ **Star this repo if you enjoyed it!** ⭐

[⬆ Back to Top](#-raja-mantri-chor-sipahi-)

</div>
