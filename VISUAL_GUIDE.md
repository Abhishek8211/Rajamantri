# 🎨 Visual Component Reference

## Quick Visual Guide to All Animated Components

---

## 1. 🎴 AnimatedCard

```
┌─────────────────────┐
│   CARD BACK (Tap)   │
│                     │
│       🎴            │
│   [Decorative       │
│    Pattern]         │
│                     │
│    "TAP ME!"        │
└─────────────────────┘
         ↓ (Flip Animation)
┌─────────────────────┐
│    REVEALED CARD    │
│                     │
│   [1000 pts] 👑     │
│                     │
│       👑            │
│      RAJA           │
│    "The King"       │
│                     │
└─────────────────────┘
```

**Animation Flow:**
1. Card lifts on hover (translateY: -10px)
2. Rotates 720° while tossing up
3. Flips 180° to reveal front
4. Glow effect pulses (2s loop)
5. Corner icons appear
6. Points badge animates in

**Colors:**
- Raja: Yellow/Gold gradient
- Mantri: Blue gradient
- Sipahi: Green gradient
- Chor: Red gradient

---

## 2. 🃏 CardDeck

```
Initial State:
    🎴  ← Top card
   🎴   ← Offset
  🎴    ← Offset
 🎴     ← Bottom
 
Shuffling:
  🎴🎴
   🔄  ← Shake & rotate
  🎴🎴

Distribution:
🎴 ➜ ➜ ➜ 👤 Player 1
  🎴 ➜ ➜ ➜ 👤 Player 2
    🎴 ➜ ➜ ➜ 👤 Player 3
      🎴 ➜ ➜ ➜ 👤 Player 4
```

**Animation Sequence:**
1. Cards stacked (4 cards, offset by 2px)
2. Deck shakes and rotates (0.8s)
3. Top card flies to player position (0.8s)
4. Rotates 720° during flight
5. Repeat for each player (500ms delay)
6. "CARDS IN THE AIR!" text appears

---

## 3. 🎪 GameBoard

```
        ┌─────────────┐
        │   PLAYER 1  │
        │     👤      │
        └─────────────┘
              ↓
    ┌─────┐     ┌─────┐
    │ P4  │←    ⚪    →│ P2  │
    │ 👤  │   ∘   ∘   │ 👤  │
    └─────┘   Round 1  └─────┘
                  ↑
        ┌─────────────┐
        │   PLAYER 3  │
        │     👤      │
        └─────────────┘
```

**Layout:**
- Center: Rotating circles (20s & 15s loops)
- 4 Positions: Top, Right, Bottom, Left
- Current player: Amber border highlight
- Game state icon in center (🎴/🤔/🎉)

**Player Cards Show:**
- Avatar circle with initial
- Username and score
- Connection status (green/red dot)
- Role badge when revealed
- "Waiting..." indicator

---

## 4. 📊 ScorePopup

```
        💥 EXPLOSION 💥
   ┌──────────────────────┐
   │  🎉 SCORE UPDATE 🎉  │
   ├──────────────────────┤
   │ 👑 Player 1   +1000  │ ← Green
   │ 💼 Player 2    +800  │ ← Green
   │ ⚔️ Player 3    -500  │ ← Red
   │ 🕵️ Player 4    +500  │ ← Green
   ├──────────────────────┤
   │ [Progress Bar ▓▓▓░] │
   └──────────────────────┘
   ✨✨✨ Confetti ✨✨✨
```

**Animation Stages:**
1. Explosion scale effect (0.8s)
2. Popup appears with backdrop blur
3. Each player card slides in (staggered 0.15s)
4. Score numbers pop with scale [0, 1.5, 1]
5. Particles fly in random directions
6. Confetti falls from top (if positive scores)
7. Progress bar depletes (3s)
8. Auto-dismiss

**Visual Effects:**
- Background glow pulses per player
- Flying particles (✨) x5 per player
- Confetti (🎉⭐🌟💫) x20 for wins
- Role-colored borders

---

## 5. 🎬 RoleRevealAnimation

### Stage 1: Cards Flying (1.5s)
```
        🎴
    🎴      🎴
  🎴          🎴
    🎴      🎴
        🎴
   
   "Cards in the Air!"
```
8 cards orbit center, rotating

---

### Stage 2: Shuffle (2s)
```
      🎴
    /  |  \
   🎴  🎴  🎴
    \  |  /
      🎴
      
   "Shuffling..."
```
Rapid rotation with particle trails

---

### Stage 3: Reveal (1.5s)
```
  [Card flips 180°]
  
  ┌───────────┐
  │           │
  │    👑     │
  │   RAJA    │
  │  1000 pts │
  │           │
  └───────────┘
  
  💥 Explosion particles
```
3D flip with explosion

---

### Stage 4: Details (2s)
```
┌─────────────────────┐
│        👑           │
│       RAJA          │
│    "The King"       │
├─────────────────────┤
│ Points  │  Power    │
│  1000   │ Leadership│
├─────────────────────┤
│  Rule the kingdom   │
│  with wisdom...     │
├─────────────────────┤
│   GET READY! 🚀     │
└─────────────────────┘
  ✨ Floating particles ✨
```
Full role card with stats

---

## 6. 🎮 GameAnimated (Full Page)

```
┌────────────────────────────────────────┐
│ 👑 RAJAMANTRI 👑    Room: ABC123      │
│ Round 3 ⚔️                             │
│                           🏆 LEADERBOARD│
│                           Player 1: 3000│
│                           Player 2: 2400│
├────────────────────────────────────────┤
│                                        │
│         [GameBoard Component]          │
│                                        │
│     👤                      👤         │
│   Player 1              Player 2       │
│                                        │
│         Center: Round Info             │
│           🎴 or 🤔 or 🎉              │
│                                        │
│     👤                      👤         │
│   Player 3              Player 4       │
│                                        │
├────────────────────────────────────────┤
│  [Mantri Guessing Interface]           │
│  If you're Mantri:                     │
│  ┌────────────┐ ┌────────────┐        │
│  │ 🎯 Player 2│ │ 🎯 Player 4│        │
│  └────────────┘ └────────────┘        │
└────────────────────────────────────────┘
```

**Layout:**
- Header: Game info + Leaderboard
- Main: GameBoard with players
- Bottom: Mantri controls (if applicable)
- Right: Chat panel (collapsible on mobile)
- Overlays: Timer, ScorePopup, RoleReveal

---

## 🎨 Color System

### Primary Colors
```
Raja:    #FBBF24 → #F59E0B → #D97706 (Yellow/Gold)
Mantri:  #60A5FA → #3B82F6 → #2563EB (Blue)
Sipahi:  #34D399 → #10B981 → #059669 (Green)
Chor:    #F87171 → #EF4444 → #DC2626 (Red)
```

### Background
```
Main:    Purple 900 → Blue 900 → Indigo 900
Overlay: Black/80 with backdrop blur
Cards:   White/10 with backdrop blur
```

### Shadows & Glows
```
Card Shadow:  shadow-2xl + role color glow
Popup Shadow: shadow-2xl with blur
Button:       shadow-lg + gradient
Text:         drop-shadow-lg for headers
```

---

## 📐 Sizing Reference

### Cards
```
Small:  w-24 (96px)  × h-36 (144px)
Normal: w-32 (128px) × h-48 (192px)
Large:  w-40 (160px) × h-60 (240px)
```

### Spacing
```
xs:   0.5rem (8px)
sm:   0.75rem (12px)
base: 1rem (16px)
lg:   1.5rem (24px)
xl:   2rem (32px)
2xl:  3rem (48px)
```

### Border Radius
```
Small:  rounded-lg (8px)
Medium: rounded-xl (12px)
Large:  rounded-2xl (16px)
Full:   rounded-3xl (24px)
Circle: rounded-full
```

---

## ⚡ Animation Timings

### Quick (Interactions)
```
Hover:   0.2s - 0.3s
Click:   0.15s - 0.25s
Tooltip: 0.2s
```

### Medium (Transitions)
```
Card Flip:      0.6s
State Change:   0.4s - 0.8s
Popup Appear:   0.5s
```

### Slow (Dramatic)
```
Card Toss:      1.5s
Full Reveal:    7s total (4 stages)
Score Popup:    3s display
Deck Shuffle:   2s
```

### Loops
```
Glow Pulse:     2s
Circle Rotate:  20s (outer), 15s (inner)
Particle Float: 3s
Confetti Fall:  1.5s
```

---

## 🎭 Animation Types

### Transform
- `translateY()` - Vertical movement
- `translateX()` - Horizontal movement
- `rotate()` - 2D rotation
- `rotateY()` - 3D flip
- `scale()` - Size change

### Effects
- `opacity` - Fade in/out
- `blur()` - Background blur
- `box-shadow` - Glow effects
- Particle spawning
- Confetti systems

---

## 📱 Responsive Breakpoints

```
sm:  640px  - Small tablets
md:  768px  - Medium tablets
lg:  1024px - Laptops
xl:  1280px - Desktops
2xl: 1536px - Large screens
```

**Mobile Adjustments:**
- Smaller card sizes
- Stacked layouts
- Hidden elements
- Larger touch targets (44px min)
- Simplified animations

---

## 🎯 Z-Index Layers

```
z-0:  Background elements
z-10: Game board & cards
z-20: Player nameplates
z-30: Floating indicators
z-40: Chat toggle button
z-50: Modals & popups
z-60: Role reveal overlay
```

---

## 🔤 Typography

```
Headings:  font-black (900)
Titles:    font-bold (700)
Body:      font-medium (500)
Small:     font-normal (400)

Sizes:
xs:   0.75rem (12px)
sm:   0.875rem (14px)
base: 1rem (16px)
lg:   1.125rem (18px)
xl:   1.25rem (20px)
2xl:  1.5rem (24px)
3xl:  1.875rem (30px)
4xl:  2.25rem (36px)
5xl:  3rem (48px)
```

---

This visual guide should help you understand the layout and appearance of each component! 🎨✨

For code examples, see the component files directly or visit `/showcase` for live demos.
