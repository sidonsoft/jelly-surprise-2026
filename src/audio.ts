class AudioManager {
  private audioContext: AudioContext | null = null;
  private bgmGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;
  private bgmOscillator: OscillatorNode | null = null;
  private isMuted: boolean = false;
  private isInitialized: boolean = false;

  async init() {
    if (this.isInitialized) return;
    try {
      this.audioContext = new AudioContext();
      this.bgmGain = this.audioContext.createGain();
      this.sfxGain = this.audioContext.createGain();
      this.bgmGain.connect(this.audioContext.destination);
      this.sfxGain.connect(this.audioContext.destination);
      this.bgmGain.gain.value = 0.15;
      this.sfxGain.gain.value = 0.3;
      this.isInitialized = true;
    } catch (e) {
      console.warn('Audio not available:', e);
    }
  }

  async resume() {
    if (this.audioContext?.state === 'suspended') {
      await this.audioContext.resume();
    }
  }

  toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    if (this.bgmGain) {
      this.bgmGain.gain.value = this.isMuted ? 0 : 0.15;
    }
    if (this.sfxGain) {
      this.sfxGain.gain.value = this.isMuted ? 0 : 0.3;
    }
    return this.isMuted;
  }

  isMutedState(): boolean {
    return this.isMuted;
  }

  playBGM() {
    if (!this.audioContext || !this.bgmGain || this.isMuted) return;
    this.stopBGM();
    
    const ctx = this.audioContext;
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const lfo = ctx.createOscillator();
    const lfoGain = ctx.createGain();
    
    osc1.type = 'sine';
    osc2.type = 'sine';
    lfo.type = 'sine';
    
    osc1.frequency.value = 220;
    osc2.frequency.value = 330;
    lfo.frequency.value = 0.5;
    lfoGain.gain.value = 5;
    
    lfo.connect(lfoGain);
    lfoGain.connect(osc1.frequency);
    osc1.connect(this.bgmGain);
    osc2.connect(this.bgmGain);
    
    osc1.start();
    osc2.start();
    lfo.start();
    
    this.bgmOscillator = osc1;
  }

  stopBGM() {
    if (this.bgmOscillator) {
      try {
        this.bgmOscillator.stop();
      } catch (e) {}
      this.bgmOscillator = null;
    }
  }

  playCollect() {
    if (!this.audioContext || !this.sfxGain || this.isMuted) return;
    const ctx = this.audioContext;
    const sfx = this.sfxGain;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(600, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.1);
    
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
    
    osc.connect(gain);
    gain.connect(sfx);
    
    osc.start();
    osc.stop(ctx.currentTime + 0.15);
  }

  playEvolve() {
    if (!this.audioContext || !this.sfxGain || this.isMuted) return;
    const ctx = this.audioContext;
    const sfx = this.sfxGain;
    
    [0, 0.1, 0.2].forEach((delay, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = 'sine';
      const freqs = [400, 500, 600];
      osc.frequency.setValueAtTime(freqs[i], ctx.currentTime + delay);
      osc.frequency.exponentialRampToValueAtTime(freqs[i] * 1.5, ctx.currentTime + delay + 0.2);
      
      gain.gain.setValueAtTime(0.2, ctx.currentTime + delay);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + delay + 0.3);
      
      osc.connect(gain);
      gain.connect(sfx);
      
      osc.start(ctx.currentTime + delay);
      osc.stop(ctx.currentTime + delay + 0.3);
    });
  }

  playClick() {
    if (!this.audioContext || !this.sfxGain || this.isMuted) return;
    const ctx = this.audioContext;
    const sfx = this.sfxGain;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(400, ctx.currentTime + 0.05);
    
    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.05);
    
    osc.connect(gain);
    gain.connect(sfx);
    
    osc.start();
    osc.stop(ctx.currentTime + 0.05);
  }

  playMenuOpen() {
    if (!this.audioContext || !this.sfxGain || this.isMuted) return;
    const ctx = this.audioContext;
    const sfx = this.sfxGain;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(300, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(500, ctx.currentTime + 0.1);
    
    gain.gain.setValueAtTime(0.1, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
    
    osc.connect(gain);
    gain.connect(sfx);
    
    osc.start();
    osc.stop(ctx.currentTime + 0.15);
  }
}

export const audioManager = new AudioManager();