export interface AudioSettings {
  master: boolean;
  clicks: boolean;
  notifications: boolean;
  ui: boolean;
}

class VintageAudio {
  private sounds: { [key: string]: HTMLAudioElement } = {};
  private urls: { [key: string]: string } = {
    ding: 'https://assets.mixkit.co/active_storage/sfx/2017/2017-preview.mp3',
    stamp: 'https://assets.mixkit.co/active_storage/sfx/2354/2354-preview.mp3',
    error: 'https://assets.mixkit.co/active_storage/sfx/2358/2358-preview.mp3',
    message: 'https://assets.mixkit.co/active_storage/sfx/1359/1359-preview.mp3',
    coins: 'https://assets.mixkit.co/active_storage/sfx/2019/2019-preview.mp3',
    burn: 'https://assets.mixkit.co/active_storage/sfx/2507/2507-preview.mp3',
  };

  private lastPlayTime: { [key: string]: number } = {};
  private settings: AudioSettings = {
    master: true,
    clicks: true,
    notifications: true,
    ui: true,
  };
  private audioContext: AudioContext | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      const savedSettings = localStorage.getItem('vintageAudio_settings');
      if (savedSettings) {
        try {
          this.settings = { ...this.settings, ...JSON.parse(savedSettings) };
        } catch (e) {
          console.error('Failed to parse audio settings', e);
        }
      }
      this.init();
      
      // Global unlock for mobile and restricted browsers
      const unlock = () => {
        this.resumeContext();
        window.removeEventListener('click', unlock);
        window.removeEventListener('touchstart', unlock);
      };
      window.addEventListener('click', unlock);
      window.addEventListener('touchstart', unlock);
    }
  }

  public async resumeContext() {
    this.initCtx();
    if (this.audioContext && this.audioContext.state === 'suspended') {
      try {
        await this.audioContext.resume();
      } catch (e) {
        console.warn('AudioContext resume failed', e);
      }
    }
  }

  public stopAll() {
    // Stop all HTML Audio elements
    Object.values(this.sounds).forEach(audio => {
      audio.pause();
      audio.currentTime = 0;
    });
  }

  public getSettings(): AudioSettings {
    return { ...this.settings };
  }

  public updateSetting(key: keyof AudioSettings, value: boolean) {
    this.settings[key] = value;
    if (typeof window !== 'undefined') {
      localStorage.setItem('vintageAudio_settings', JSON.stringify(this.settings));
    }
  }

  // Legacy support for App.tsx if needed
  public getIsMuted(): boolean {
    return !this.settings.master;
  }

  public toggleMute(): boolean {
    this.settings.master = !this.settings.master;
    if (typeof window !== 'undefined') {
      localStorage.setItem('vintageAudio_settings', JSON.stringify(this.settings));
    }
    return !this.settings.master;
  }

  private initCtx() {
    if (!this.audioContext && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.audioContext = new AudioCtx();
      }
    }
  }

  private init() {
    Object.entries(this.urls).forEach(([name, url]) => {
      try {
        const audio = new Audio(url);
        audio.preload = 'auto';
        audio.volume = 0.6;
        this.sounds[name] = audio;
      } catch (e) {
        console.error(`Failed to initialize audio for ${name}:`, e);
      }
    });
  }

  private async play(name: string, category: keyof AudioSettings = 'ui') {
    if (!this.settings.master || !this.settings[category]) return;

    try {
      this.stopAll();
      await this.resumeContext();
      
      const audio = this.sounds[name];
      if (audio) {
        audio.currentTime = 0;
        const playPromise = audio.play();
        if (playPromise !== undefined) {
          playPromise.catch((error) => {
            if (error.name !== 'NotAllowedError') {
              console.warn(`Failed to play sound ${name}:`, error);
            }
          });
        }
      }
    } catch (e) {
      console.error(`Error playing audio ${name}:`, e);
    }
  }

  playClick() {
    if (!this.settings.master || !this.settings.clicks) return;
    try {
      this.stopAll();
      this.resumeContext();
      if (!this.audioContext) return;
      
      const ctx = this.audioContext;
      const t = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      // premium soft click
      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, t);
      osc.frequency.exponentialRampToValueAtTime(300, t + 0.05);
      
      gain.gain.setValueAtTime(0.3, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.05);
      
      osc.start(t);
      osc.stop(t + 0.05);
    } catch (e) {}
  }

  playCoins() { 
    this.play('coins', 'ui'); 
  }

  playDing() { this.play('ding', 'notifications'); }
  playStamp() { this.play('stamp', 'ui'); }
  playError() { this.play('error', 'ui'); }
  playMessage() { this.play('message', 'notifications'); }
  playBurn() { this.play('burn', 'ui'); }
}


export const vintageAudio = new VintageAudio();
