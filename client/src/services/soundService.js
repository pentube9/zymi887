class SoundService {
  constructor() {
    this.messageSound = null;
    this.sentSound = null;
    this.receivedSound = null;
    this.callSound = null;
    this.settings = {
      notificationSound: true,
      callRingtone: true
    };
    this.initialized = false;
  }

  async init() {
    if (this.initialized) return;

    try {
      // Data URIs for basic fallback sounds
      const popSound = 'data:audio/wav;base64,UklGRl9vT19XQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YV92T19'; // Truncated but illustrates intent
      
      this.messageSound = new Audio('/assets/sounds/message.mp3');
      this.sentSound = new Audio('/assets/sounds/sent.mp3');
      this.receivedSound = new Audio('/assets/sounds/received.mp3');
      this.callSound = new Audio('/assets/sounds/call.mp3');

      // Add error handling for each sound
      this.messageSound.onerror = () => { this.messageSound = null; };
      this.sentSound.onerror = () => { this.sentSound = null; };
      this.receivedSound.onerror = () => { this.receivedSound = null; };
      this.callSound.onerror = () => { this.callSound = null; };

      this.initialized = true;
    } catch (err) {
      console.error('Sound service init failed:', err);
    }
  }

  async playMessageSound() {
    if (!this.settings.notificationSound) return;

    try {
      if (this.messageSound) {
        this.messageSound.currentTime = 0;
        await this.messageSound.play();
      }
    } catch (err) {
      console.error('Failed to play message sound:', err);
    }
  }

  async playSentSound() {
    try {
      if (this.sentSound) {
        this.sentSound.currentTime = 0;
        await this.sentSound.play();
      }
    } catch (err) {
      console.error('Failed to play sent sound:', err);
    }
  }

  async playReceivedSound() {
    if (!this.settings.notificationSound) return;

    try {
      if (this.receivedSound) {
        this.receivedSound.currentTime = 0;
        await this.receivedSound.play();
      }
    } catch (err) {
      console.error('Failed to play received sound:', err);
    }
  }

  async playCallRingtone() {
    if (!this.settings.callRingtone) return;

    try {
      if (this.callSound) {
        this.callSound.loop = true;
        this.callSound.currentTime = 0;
        await this.callSound.play();
      }
    } catch (err) {
      if (err.name !== 'NotAllowedError') {
        console.error('Failed to play call ringtone:', err);
      }
      // NotAllowedError is expected when no user interaction
    }
  }

  stopCallRingtone() {
    if (this.callSound) {
      this.callSound.pause();
      this.callSound.currentTime = 0;
    }
  }

  updateSettings(newSettings) {
    this.settings = { ...this.settings, ...newSettings };

    // Persist to localStorage
    try {
      const stored = JSON.parse(localStorage.getItem('zymi_settings') || '{}');
      localStorage.setItem('zymi_settings', JSON.stringify({
        ...stored,
        ...this.settings
      }));
    } catch (err) {
      console.error('Failed to save sound settings:', err);
    }
  }

  loadSettings() {
    try {
      const stored = localStorage.getItem('zymi_settings');
      if (stored) {
        const parsed = JSON.parse(stored);
        this.settings = { ...this.settings, ...parsed };
      }
    } catch (err) {
      console.error('Failed to load sound settings:', err);
    }
  }

  isEnabled() {
    return this.initialized && (this.settings.notificationSound || this.settings.callRingtone);
  }
}

// Singleton instance
export const soundService = new SoundService();
