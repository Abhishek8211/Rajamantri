# 🔊 Sound Effects Guide

This game includes comprehensive sound effects to enhance the gaming experience!

## 📂 Sound Files Location

All sound files should be placed in: `/client/public/sfx/`

## 🎵 Required Sound Files

| File Name | Description | When It Plays | Status |
|-----------|-------------|---------------|--------|
| `backgroundTheme.mp3` | Background music (loops) | Game starts, plays throughout | ✅ Provided |
| `cardShuffle.mp3` | Card shuffling sound | Card distribution animation | ✅ Provided |
| `cardFlip.mp3` | Card flip sound | Player reveals their role | ⚠️ Placeholder |
| `countdown.mp3` | Countdown sound | 3-2-1-GO! animation | ⚠️ Placeholder |
| `correctGuess.mp3` | Success sound | Sipahi catches the Chor | ⚠️ Placeholder |
| `wrongGuess.mp3` | Failure sound | Sipahi chooses wrong player | ⚠️ Placeholder |
| `victory.mp3` | Victory fanfare | Game ends, winner announced | ⚠️ Placeholder |
| `chatNotification.mp3` | Notification sound | New chat message received | ⚠️ Placeholder |
| `buttonClick.mp3` | Click sound | Button interactions | ⚠️ Placeholder |

## 🎮 Sound Features

### Background Music
- **Loops continuously** throughout the game
- **Volume: 30%** (lower so it doesn't overpower other sounds)
- Starts automatically when game begins
- Stops when you leave the game

### Sound Effects
- **Card Flip**: Plays when you reveal your role card
- **Card Shuffle**: Plays during card distribution animation
- **Countdown**: Plays during 3-2-1-GO! countdown
- **Correct/Wrong Guess**: Plays after Sipahi makes their choice
- **Victory**: Plays when game ends and winner is announced
- **Chat Notification**: Plays when other players send messages
- **Button Click**: Plays for button interactions (Mantri call, Sipahi guess)

### Mute Control
- **Mute Button** located in top-right corner of game screen
- Icon: 🔊 (unmuted) / 🔇 (muted)
- Your preference is **saved** in browser (persists across sessions)
- Muting stops all sounds including background music

## 📥 Where to Get Sound Files

### Free Sound Resources:
1. **Freesound.org** - https://freesound.org
   - Card sounds: Search "card flip", "card shuffle"
   - UI sounds: Search "button click", "notification"
   - Game sounds: Search "countdown", "victory", "success", "fail"

2. **Mixkit** - https://mixkit.co/free-sound-effects/
   - Game sounds category
   - UI sounds category

3. **Zapsplat** - https://www.zapsplat.com
   - Free for personal use
   - Good variety of game sounds

4. **BBC Sound Effects** - https://sound-effects.bbcrewind.co.uk
   - Professional quality sounds
   - Free for personal use

### Recommended Sound Types:
- **cardFlip.mp3**: Short, crisp paper/card flip sound (0.2-0.5s)
- **cardShuffle.mp3**: Multiple cards shuffling (1-2s)
- **countdown.mp3**: Ticking clock or beep sound (3-4s)
- **correctGuess.mp3**: Success chime, ding, or fanfare (1-2s)
- **wrongGuess.mp3**: Buzzer, wrong answer sound (0.5-1s)
- **victory.mp3**: Triumphant fanfare, celebration music (3-5s)
- **chatNotification.mp3**: Subtle notification beep (0.2-0.5s)
- **buttonClick.mp3**: Short click or pop sound (0.1-0.2s)

## 🛠️ Adding Your Own Sounds

1. **Find or create** your sound files
2. **Convert to MP3** format (if needed)
3. **Name them exactly** as listed above
4. **Place in** `/client/public/sfx/` folder
5. **Restart** the React app to load new sounds

### Optimal Sound Settings:
- **Format**: MP3 (best browser compatibility)
- **Sample Rate**: 44.1kHz
- **Bit Rate**: 128-192kbps (good quality, small size)
- **Mono/Stereo**: Stereo for music, mono for effects (smaller files)
- **Volume Normalization**: Keep sounds at consistent volume levels

## 🎚️ Volume Levels (in code)

```javascript
backgroundTheme: 0.3   // 30% (background)
cardFlip: 0.5          // 50%
cardShuffle: 0.6       // 60%
countdown: 0.7         // 70%
correctGuess: 0.8      // 80%
wrongGuess: 0.8        // 80%
victory: 0.9           // 90%
chatNotification: 0.4  // 40% (subtle)
buttonClick: 0.3       // 30% (subtle)
```

You can adjust these in `/client/src/hooks/useSoundEffects.js`

## 🐛 Troubleshooting

### Sounds not playing?
1. **Check browser console** for errors
2. **Verify file names** match exactly (case-sensitive)
3. **Check file format** (must be MP3)
4. **Test file playback** directly in browser
5. **Clear browser cache** and reload
6. **Check mute button** isn't enabled

### Background music not starting?
- Modern browsers require **user interaction** before playing audio
- Music will start when game begins (after you've clicked buttons)
- If it doesn't start, click the mute button twice (off/on)

### Volume too loud/quiet?
- Edit volume levels in `/client/src/hooks/useSoundEffects.js`
- Values range from 0.0 (silent) to 1.0 (full volume)

## 📝 Implementation Details

Sound effects are managed by the **useSoundEffects** custom hook:
- **File**: `/client/src/hooks/useSoundEffects.js`
- **Used in**: `/client/src/pages/Game.js`
- **Features**:
  - Automatic audio element creation
  - Mute state persistence (localStorage)
  - Individual play functions for each sound
  - Background music loop control
  - Memory cleanup on unmount

## 🎨 UI Integration

The mute button appears in the game's top navigation bar:
- **Position**: Top-right corner, next to Scores and Chat buttons
- **Style**: Purple/pink gradient when unmuted, gray when muted
- **Icon**: 🔊 (sound on) / 🔇 (sound off)
- **Tooltip**: "Mute Sound" / "Unmute Sound"

## 📊 Feature Status

✅ **Implemented**:
- Background music looping
- All sound effect triggers
- Mute/unmute toggle with persistence
- Volume level controls
- Chat notification for other players' messages
- Button click feedback

🚀 **Future Enhancements**:
- Volume slider (individual control)
- Sound effect preview in settings
- Custom sound upload
- Different music tracks
- Spatial audio effects

---

**Enjoy the enhanced gaming experience! 🎮🔊**
