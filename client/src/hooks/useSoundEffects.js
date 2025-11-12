import { useEffect, useRef, useState } from 'react';

/**
 * Custom hook for managing sound effects in the game
 * Provides play functions for all game sounds and mute toggle
 */
const useSoundEffects = () => {
  const [isMuted, setIsMuted] = useState(() => {
    // Load mute preference from localStorage
    const saved = localStorage.getItem('soundMuted');
    return saved === 'true';
  });

  // Audio refs for all sound effects
  const audioRefs = useRef({
    backgroundTheme: null,
    cardFlip: null,
    cardShuffle: null,
    countdown: null,
    correctGuess: null,
    wrongGuess: null,
    victory: null,
    chatNotification: null,
    buttonClick: null,
  });

  // Initialize audio elements
  useEffect(() => {
    // Background theme (loops)
    audioRefs.current.backgroundTheme = new Audio('/sfx/backgroundTheme.mp3');
    audioRefs.current.backgroundTheme.loop = true;
    audioRefs.current.backgroundTheme.volume = 0.3; // Lower volume for background

    // Card flip sound
    audioRefs.current.cardFlip = new Audio('/sfx/cardFlip.mp3');
    audioRefs.current.cardFlip.volume = 0.5;

    // Card shuffle sound
    audioRefs.current.cardShuffle = new Audio('/sfx/cardShuffle.mp3');
    audioRefs.current.cardShuffle.volume = 0.6;

    // Countdown sound
    audioRefs.current.countdown = new Audio('/sfx/countdown.mp3');
    audioRefs.current.countdown.volume = 0.7;

    // Correct guess sound
    audioRefs.current.correctGuess = new Audio('/sfx/correctGuess.mp3');
    audioRefs.current.correctGuess.volume = 0.8;

    // Wrong guess sound
    audioRefs.current.wrongGuess = new Audio('/sfx/wrongGuess.mp3');
    audioRefs.current.wrongGuess.volume = 0.8;

    // Victory sound
    audioRefs.current.victory = new Audio('/sfx/victory.mp3');
    audioRefs.current.victory.volume = 0.9;

    // Chat notification sound
    audioRefs.current.chatNotification = new Audio('/sfx/chatNotification.mp3');
    audioRefs.current.chatNotification.volume = 0.4;

    // Button click sound
    audioRefs.current.buttonClick = new Audio('/sfx/buttonClick.mp3');
    audioRefs.current.buttonClick.volume = 0.3;

    // Cleanup on unmount
    // Keep references to handlers so we can remove them
    return () => {
      // pause and clear sources
      Object.values(audioRefs.current).forEach(audio => {
        if (audio) {
          try {
            audio.pause();
          } catch (e) {
            // ignore
          }
          try {
            audio.src = '';
          } catch (e) {
            // ignore
          }
        }
      });

      // remove any document-level listeners that might have been added
      try {
        document.removeEventListener('click', audioRefs.current.__userGestureHandler);
        document.removeEventListener('touchstart', audioRefs.current.__userGestureHandler);
        document.removeEventListener('visibilitychange', audioRefs.current.__visibilityHandler);
      } catch (e) {
        // ignore
      }
    };
  }, []);

  // Handle mute state changes
  useEffect(() => {
    // Save to localStorage
    localStorage.setItem('soundMuted', isMuted.toString());

    // Mute/unmute all audio
    Object.values(audioRefs.current).forEach(audio => {
      if (audio) {
        audio.muted = isMuted;
      }
    });

    // Stop background music if muted
    if (isMuted && audioRefs.current.backgroundTheme) {
      audioRefs.current.backgroundTheme.pause();
      // If we had a user-gesture handler attached, remove it since user opted to mute
      try {
        document.removeEventListener('click', audioRefs.current.__userGestureHandler);
        document.removeEventListener('touchstart', audioRefs.current.__userGestureHandler);
      } catch (e) {}
    }

    // If unmuted, try to play background music (handles visibility and autoplay restrictions)
    if (!isMuted && audioRefs.current.backgroundTheme) {
      // attempt play; if blocked, attach a one-time user interaction handler
      const tryPlay = () => {
        const bg = audioRefs.current.backgroundTheme;
        if (!bg) return;
        if (!bg.paused) return;
        bg.play().catch(err => {
          // If autoplay is blocked, wait for user interaction
          const userGestureHandler = () => {
            bg.play().catch(() => {});
            // remove handlers after first attempt
            document.removeEventListener('click', audioRefs.current.__userGestureHandler);
            document.removeEventListener('touchstart', audioRefs.current.__userGestureHandler);
            audioRefs.current.__userGestureHandler = null;
          };

          // store handler so we can remove it later
          audioRefs.current.__userGestureHandler = userGestureHandler;
          document.addEventListener('click', userGestureHandler, { once: true });
          document.addEventListener('touchstart', userGestureHandler, { once: true });
        });
      };

      tryPlay();
    }
  }, [isMuted]);

  // Try to resume background music when the tab becomes visible
  useEffect(() => {
    const visibilityHandler = () => {
      const bg = audioRefs.current.backgroundTheme;
      if (!bg) return;
      if (document.visibilityState === 'visible' && !isMuted && bg.paused) {
        bg.play().catch(() => {
          // if blocked, rely on user gesture handler added earlier in mute effect
        });
      }
    };

    audioRefs.current.__visibilityHandler = visibilityHandler;
    document.addEventListener('visibilitychange', visibilityHandler);

    return () => {
      document.removeEventListener('visibilitychange', visibilityHandler);
    };
  }, [isMuted]);

  /**
   * Play a sound effect
   * @param {string} soundName - Name of the sound to play
   */
  const playSound = (soundName) => {
    if (isMuted) return;

    const audio = audioRefs.current[soundName];
    if (audio) {
      // Reset to start and play
      audio.currentTime = 0;
      audio.play().catch(error => {
        console.warn(`Failed to play ${soundName}:`, error);
      });
    }
  };

  /**
   * Start background music (with user interaction requirement)
   */
  const startBackgroundMusic = () => {
    if (isMuted) return;
    
    const bgMusic = audioRefs.current.backgroundTheme;
    if (bgMusic && bgMusic.paused) {
      bgMusic.play().catch(error => {
        console.warn('Failed to play background music:', error);
      });
    }
  };

  /**
   * Stop background music
   */
  const stopBackgroundMusic = () => {
    const bgMusic = audioRefs.current.backgroundTheme;
    if (bgMusic && !bgMusic.paused) {
      bgMusic.pause();
      bgMusic.currentTime = 0;
    }
  };

  /**
   * Toggle mute state
   */
  const toggleMute = () => {
    setIsMuted(prev => !prev);
  };

  // Convenience methods for each sound
  const sounds = {
    playCardFlip: () => playSound('cardFlip'),
    playCardShuffle: () => playSound('cardShuffle'),
    playCountdown: () => playSound('countdown'),
    playCorrectGuess: () => playSound('correctGuess'),
    playWrongGuess: () => playSound('wrongGuess'),
    playVictory: () => playSound('victory'),
    playChatNotification: () => playSound('chatNotification'),
    playButtonClick: () => playSound('buttonClick'),
    startBackgroundMusic,
    stopBackgroundMusic,
    toggleMute,
    isMuted,
  };

  return sounds;
};

export default useSoundEffects;
