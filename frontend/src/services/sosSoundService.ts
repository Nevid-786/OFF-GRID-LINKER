/**
 * Web Audio API SOS Sound Synthesizer Service
 * Produces real-time multi-frequency emergency siren sweeps and audio alerts.
 * Inspired by NaariShakti emergency dispatch sound feedback.
 */

class SOSSoundService {
  private audioCtx: AudioContext | null = null;
  private isMuted: boolean = false;
  private isPlaying: boolean = false;
  private sirenIntervalId: number | null = null;

  constructor() {
    // AudioContext will be initialized on first user gesture or sound play
  }

  private initContext() {
    if (!this.audioCtx) {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.audioCtx = new AudioContextClass();
    }
    if (this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (muted) {
      this.stopSiren();
    }
  }

  public getIsMuted(): boolean {
    return this.isMuted;
  }

  public getIsPlaying(): boolean {
    return this.isPlaying;
  }

  /**
   * Plays a single short alert beep (e.g. on new telemetry arrival)
   */
  public playBeep(freq: number = 880, durationMs: number = 200) {
    if (this.isMuted) return;
    try {
      this.initContext();
      if (!this.audioCtx) return;

      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      osc.type = 'sine';
      osc.frequency.value = freq;

      gain.gain.setValueAtTime(0.15, this.audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + durationMs / 1000);

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      osc.start();
      osc.stop(this.audioCtx.currentTime + durationMs / 1000);
    } catch (e) {
      console.warn('Audio play error:', e);
    }
  }

  /**
   * Starts a dual-frequency continuous emergency siren sweep (SOS alarm)
   */
  public startSiren() {
    if (this.isMuted || this.isPlaying) return;
    try {
      this.initContext();
      if (!this.audioCtx) return;

      this.isPlaying = true;
      let high = false;

      const playSirenPulse = () => {
        if (!this.isPlaying || !this.audioCtx) return;

        const osc = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();

        osc.type = 'sawtooth';
        // Oscillate between 650Hz and 950Hz
        const startFreq = high ? 650 : 950;
        const endFreq = high ? 950 : 650;
        high = !high;

        osc.frequency.setValueAtTime(startFreq, this.audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(endFreq, this.audioCtx.currentTime + 0.45);

        gain.gain.setValueAtTime(0.1, this.audioCtx.currentTime);
        gain.gain.linearRampToValueAtTime(0.001, this.audioCtx.currentTime + 0.45);

        osc.connect(gain);
        gain.connect(this.audioCtx.destination);

        osc.start();
        osc.stop(this.audioCtx.currentTime + 0.45);
      };

      playSirenPulse();
      this.sirenIntervalId = window.setInterval(playSirenPulse, 500);
    } catch (e) {
      console.warn('Siren start error:', e);
    }
  }

  /**
   * Stops the active siren loop
   */
  public stopSiren() {
    this.isPlaying = false;
    if (this.sirenIntervalId !== null) {
      clearInterval(this.sirenIntervalId);
      this.sirenIntervalId = null;
    }
  }
}

export const sosSoundService = new SOSSoundService();
