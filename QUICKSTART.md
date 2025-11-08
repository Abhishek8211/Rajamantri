# 🚀 Quick Start Guide - Animated Rajamantri Game

## ⚡ Getting Started in 3 Steps

### 1️⃣ Install Dependencies
```bash
cd client
npm install
```

### 2️⃣ Start the Development Server
```bash
npm start
```

### 3️⃣ View the Animations
Open your browser and navigate to:
- **Demo Page**: `http://localhost:3000/showcase`
- **Test Game**: Create a room and use `/game-animated/:roomCode`

---

## 🎮 Testing the Animations

### Quick Demo (No Server Needed)
1. Navigate to `/showcase` in your browser
2. Click through the 4 demo tabs:
   - 🎴 Animated Cards - Click cards to see flip animations
   - ✨ Role Reveal - Click buttons to trigger full-screen reveals
   - 📊 Score Popup - See score change animations
   - 🃏 Card Deck - Watch card distribution

### Full Game Testing (Requires Server)
1. Start your backend server (if you have one)
2. Create a game room
3. Use the animated game route: `/game-animated/:roomCode`
4. Invite 3 other players (or add bots)
5. Click "Start Game"
6. Experience:
   - Card distribution animation
   - Tap your card to reveal with animation
   - Mantri selection with timer
   - Score popup after round

---

## 📝 Integration Checklist

### ✅ To Use Animated Version in Your Game:

**Option 1: Replace Current Game** (Recommended for new projects)
```javascript
// In Lobby.js or wherever you navigate to game
navigate(`/game-animated/${roomCode}`)
```

**Option 2: Add as Alternative Mode**
```javascript
// Add a toggle in your lobby
const [useAnimations, setUseAnimations] = useState(true);

const startGame = () => {
  const route = useAnimations ? 'game-animated' : 'game';
  navigate(`/${route}/${roomCode}`);
};
```

**Option 3: Make it Default**
```javascript
// In App.js - swap the routes
<Route path="/game/:roomCode" element={<GameAnimated />} />
<Route path="/game-classic/:roomCode" element={<Game />} />
```

---

## 🎨 Customization Quick Reference

### Change Card Colors
**File**: `client/src/components/AnimatedCard.js`
```javascript
// Line ~30
const roleData = {
  raja: {
    gradient: 'from-yellow-400 via-yellow-500 to-yellow-600', // ← Change this
  }
}
```

### Adjust Animation Speed
**Any component with motion**
```javascript
<motion.div
  transition={{ 
    duration: 0.6  // ← Lower = faster, Higher = slower
  }}
>
```

### Change Timer Duration
**File**: `client/src/pages/GameAnimated.js`
```javascript
// Line ~100
setTimer(10)  // ← Change to desired seconds
```

### Reduce Particles (for performance)
**Any component with particles**
```javascript
{[...Array(20)].map((_, i) => (  // ← Change 20 to lower number
  <Particle />
))}
```

---

## 🐛 Troubleshooting

### Animations Not Working?
1. ✅ Check browser console for errors
2. ✅ Ensure `framer-motion` is installed: `npm list framer-motion`
3. ✅ Clear browser cache and reload
4. ✅ Try a different browser (Chrome recommended)

### Cards Not Flipping?
1. ✅ Check CSS is loaded: Look for `.preserve-3d` class
2. ✅ Verify browser supports 3D transforms
3. ✅ Check console for CSS errors

### Performance Issues?
1. ✅ Reduce particle counts in components
2. ✅ Disable background animations in `GameAnimated.js` (lines 350-365)
3. ✅ Use smaller card size: `size="small"` in AnimatedCard
4. ✅ Close other browser tabs

### Route Not Found?
1. ✅ Verify `App.js` includes the route
2. ✅ Check exact path spelling
3. ✅ Restart development server

---

## 📦 Component Import Reference

```javascript
// Import animated components
import AnimatedCard from '../components/AnimatedCard';
import CardDeck from '../components/CardDeck';
import GameBoard from '../components/GameBoard';
import ScorePopup from '../components/ScorePopup';
import RoleRevealAnimation from '../components/RoleRevealAnimation';
```

### Usage Examples

**AnimatedCard**
```javascript
<AnimatedCard
  role="raja"           // 'raja' | 'mantri' | 'sipahi' | 'chor'
  isRevealed={false}    // boolean
  onReveal={handleReveal}
  isCurrentPlayer={true}
  size="normal"         // 'small' | 'normal' | 'large'
/>
```

**ScorePopup**
```javascript
<ScorePopup
  changes={[
    { playerId: '1', playerName: 'John', role: 'raja', icon: '👑', points: 1000 }
  ]}
  visible={true}
  onComplete={() => console.log('Done!')}
/>
```

**RoleRevealAnimation**
```javascript
<RoleRevealAnimation
  show={true}
  role="mantri"
  onComplete={() => setShow(false)}
/>
```

---

## 🎯 Key Files to Know

| File | Purpose | Edit for |
|------|---------|----------|
| `AnimatedCard.js` | Card flip animation | Colors, sizes |
| `GameBoard.js` | Game arena layout | Player positions |
| `GameAnimated.js` | Main game page | Game logic, timing |
| `ScorePopup.js` | Score changes | Particle count |
| `RoleRevealAnimation.js` | Full reveal | Stage timing |
| `index.css` | Global styles | Animation keyframes |

---

## 🎨 Asset Replacement Guide

### Replace Card Back Design
**File**: `AnimatedCard.js` - Line ~180
```javascript
// Replace this section
<div className="text-6xl">🎴</div>
// With
<img src="/assets/card-back.png" alt="Card Back" />
```

### Replace Role Icons
**File**: `AnimatedCard.js` - Line ~25
```javascript
const roleData = {
  raja: {
    icon: '👑',  // ← Replace with <img> or custom SVG
  }
}
```

### Add Background Music
**File**: `GameAnimated.js` - Add to component
```javascript
useEffect(() => {
  const audio = new Audio('/sounds/background.mp3');
  audio.loop = true;
  audio.play();
  return () => audio.pause();
}, []);
```

---

## 📱 Mobile Testing Tips

1. Open Chrome DevTools (F12)
2. Click "Toggle Device Toolbar" (Ctrl+Shift+M)
3. Select device: iPhone 12 Pro, Pixel 5, etc.
4. Test touch interactions
5. Check animations run smoothly

---

## 🎉 What You Get

- ✨ **6 animated components** ready to use
- 🎮 **Complete game page** with all animations
- 🎨 **Interactive demo page** at `/showcase`
- 📱 **Mobile responsive** design
- ⚡ **60fps performance** optimized
- 🎯 **Easy customization** with clear comments
- 📚 **Full documentation** included

---

## 🆘 Need Help?

1. **Check the docs**: See `ANIMATION_GUIDE.md` for detailed info
2. **View examples**: Visit `/showcase` route
3. **Read component code**: All components have JSDoc comments
4. **Test incrementally**: Start with `/showcase`, then integrate

---

## 🚀 Next Steps

1. ✅ Run `/showcase` to see all animations
2. ✅ Test in your game with `/game-animated/:roomCode`
3. ✅ Customize colors and timing to your preference
4. ✅ Add your own assets (card images, sounds)
5. ✅ Deploy and enjoy! 🎉

---

**Happy Gaming! 🎴🎮✨**

---

### Quick Command Reference

```bash
# Install
cd client && npm install

# Start development
npm start

# Build for production
npm run build

# Test
npm test
```

### Quick Routes Reference

- `/` - Home page
- `/lobby/:roomCode` - Game lobby
- `/game/:roomCode` - Original game
- `/game-animated/:roomCode` - 🌟 Animated game
- `/showcase` - 🎨 Animation demos

---

Made with ❤️ - Now go create something amazing! 🚀
