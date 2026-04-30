class SoundService {
  constructor() {
    this.messageSound = null;
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
      // Load sounds from assets
      this.messageSound = new Audio('/assets/sounds/message.mp3');
      this.callSound = new Audio('/assets/sounds/call.mp3');

      // Preload
      this.messageSound.load();
      this.callSound.load();

      // Handle autoplay restrictions - must be triggered by user interaction
      this.messageSound.play().then(() => {
        this.messageSound.pause();
        this.messageSound.currentTime = 0;
      }).catch(() => {
        console.log('Audio autoplay blocked - will play on user interaction');
      });

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

  async playCallRingtone() {
    if (!this.settings.callRingtone) return;

    try {
      if (this.callSound) {
        this.callSound.loop = true;
        this.callSound.currentTime = 0;
        await this.callSound.play();
      }
    } catch (err) {
      console.error('Failed to play call ringtone:', err);
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
