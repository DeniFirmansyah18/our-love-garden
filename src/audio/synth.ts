import { clampVolume, type SoundSettings } from './settings';

export type SfxName =
  | 'ui'
  | 'pop'
  | 'ding'
  | 'plant'
  | 'water'
  | 'harvest'
  | 'bite'
  | 'catch'
  | 'chest'
  | 'sparkle'
  | 'step'
  | 'open'
  | 'close';

export type { SoundSettings } from './settings';

const SCALE = [0, 2, 4, 7, 9, 12, 14, 16, 19, 21];

/**
 * Everything audible is synthesised: no audio files, no licensing, no download.
 * The context is created lazily so mobile browsers allow it after a gesture.
 */
export class AudioEngine {
  private context: AudioContext | null = null;
  private master: GainNode | null = null;
  private musicBus: GainNode | null = null;
  private sfxBus: GainNode | null = null;
  private noise: AudioBuffer | null = null;
  private scheduler = 0;
  private nextNoteAt = 0;
  private step = 0;
  private settings: SoundSettings = { volume: 0.6, music: true, sfx: true };
  private unlocked = false;
  private playingMusic = false;

  constructor(settings: SoundSettings) {
    this.settings = { ...settings, volume: clampVolume(settings.volume) };
  }

  /** Call from a user gesture; safe to call repeatedly. */
  unlock(): void {
    if (!this.ensureContext()) return;
    if (this.context && this.context.state === 'suspended') {
      void this.context.resume();
    }
    this.unlocked = true;
    if (this.settings.music) this.startMusic();
  }

  private ensureContext(): boolean {
    if (this.context) return true;
    try {
      const Ctor =
        window.AudioContext ??
        (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!Ctor) return false;
      this.context = new Ctor();
      this.master = this.context.createGain();
      this.musicBus = this.context.createGain();
      this.sfxBus = this.context.createGain();
      this.master.gain.value = this.settings.volume;
      this.musicBus.gain.value = 0.32;
      this.sfxBus.gain.value = 0.8;
      this.musicBus.connect(this.master);
      this.sfxBus.connect(this.master);
      this.master.connect(this.context.destination);
      this.noise = this.buildNoise(this.context);
      return true;
    } catch {
      return false;
    }
  }

  private buildNoise(context: AudioContext): AudioBuffer {
    const length = Math.floor(context.sampleRate * 0.6);
    const buffer = context.createBuffer(1, length, context.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < length; i += 1) {
      data[i] = (Math.random() * 2 - 1) * (1 - i / length);
    }
    return buffer;
  }

  applySettings(settings: SoundSettings): void {
    this.settings = { ...settings, volume: clampVolume(settings.volume) };
    if (this.master && this.context) {
      this.master.gain.setTargetAtTime(this.settings.volume, this.context.currentTime, 0.08);
    }
    if (!this.settings.music) this.stopMusic();
    else if (this.unlocked && !this.playingMusic) this.startMusic();
  }

  getSettings(): SoundSettings {
    return { ...this.settings };
  }

  play(name: SfxName): void {
    if (!this.settings.sfx) return;
    if (!this.ensureContext() || !this.context || !this.sfxBus) return;
    if (this.context.state === 'suspended') return;

    const now = this.context.currentTime;
    const rand = (amount: number) => (Math.random() - 0.5) * amount;

    switch (name) {
      case 'ui':
        this.blip(now, 620, 0.055, 0.08, 'triangle');
        break;
      case 'pop':
        this.sweep(now, 520, 900, 0.09, 0.22, 'sine');
        this.blip(now, 1040, 0.04, 0.05, 'triangle');
        break;
      case 'ding':
        this.blip(now, 880, 0.22, 0.16, 'sine');
        this.blip(now + 0.09, 1320, 0.3, 0.1, 'sine');
        break;
      case 'plant':
        this.sweep(now, 220, 420, 0.16, 0.16, 'triangle');
        this.noiseBurst(now, 0.1, 0.12, 900);
        break;
      case 'water':
        this.noiseBurst(now, 0.34, 0.16, 1400);
        this.sweep(now, 900, 600, 0.18, 0.06, 'sine');
        break;
      case 'harvest':
        this.arpeggio(now, [0, 4, 7, 12], 660, 0.09, 0.14);
        break;
      case 'bite':
        this.sweep(now, 300, 720, 0.1, 0.2, 'square', 0.35);
        break;
      case 'catch':
        this.arpeggio(now, [0, 4, 7, 12, 16], 520, 0.1, 0.16);
        this.noiseBurst(now, 0.2, 0.1, 1200);
        break;
      case 'chest':
        this.arpeggio(now, [0, 7, 12, 19], 392, 0.16, 0.15);
        this.blip(now + 0.3, 1568, 0.5, 0.06, 'sine');
        break;
      case 'sparkle':
        this.arpeggio(now, [12, 16, 19, 24], 784, 0.07, 0.08);
        break;
      case 'step':
        this.blip(now, 150 + rand(40), 0.05, 0.05, 'sine');
        break;
      case 'open':
        this.sweep(now, 380, 620, 0.12, 0.08, 'sine');
        break;
      case 'close':
        this.sweep(now, 520, 300, 0.12, 0.07, 'sine');
        break;
    }
  }

  private blip(
    at: number,
    frequency: number,
    duration: number,
    gain: number,
    type: OscillatorType
  ): void {
    if (!this.context || !this.sfxBus) return;
    const osc = this.context.createOscillator();
    const amp = this.context.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(frequency, at);
    amp.gain.setValueAtTime(0.0001, at);
    amp.gain.exponentialRampToValueAtTime(gain, at + 0.012);
    amp.gain.exponentialRampToValueAtTime(0.0001, at + duration);
    osc.connect(amp).connect(this.sfxBus);
    osc.start(at);
    osc.stop(at + duration + 0.02);
  }

  private sweep(
    at: number,
    from: number,
    to: number,
    duration: number,
    gain: number,
    type: OscillatorType,
    detune = 0
  ): void {
    if (!this.context || !this.sfxBus) return;
    const osc = this.context.createOscillator();
    const amp = this.context.createGain();
    osc.type = type;
    osc.detune.setValueAtTime(detune * 100, at);
    osc.frequency.setValueAtTime(from, at);
    osc.frequency.exponentialRampToValueAtTime(Math.max(60, to), at + duration);
    amp.gain.setValueAtTime(0.0001, at);
    amp.gain.exponentialRampToValueAtTime(gain, at + 0.014);
    amp.gain.exponentialRampToValueAtTime(0.0001, at + duration);
    osc.connect(amp).connect(this.sfxBus);
    osc.start(at);
    osc.stop(at + duration + 0.02);
  }

  private noiseBurst(at: number, duration: number, gain: number, cutoff: number): void {
    if (!this.context || !this.sfxBus || !this.noise) return;
    const source = this.context.createBufferSource();
    source.buffer = this.noise;
    const filter = this.context.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = cutoff;
    filter.Q.value = 0.9;
    const amp = this.context.createGain();
    amp.gain.setValueAtTime(gain, at);
    amp.gain.exponentialRampToValueAtTime(0.0001, at + duration);
    source.connect(filter).connect(amp).connect(this.sfxBus);
    source.start(at);
    source.stop(at + duration + 0.02);
  }

  private arpeggio(at: number, steps: number[], base: number, spacing: number, gain: number): void {
    steps.forEach((semi, index) => {
      const frequency = base * Math.pow(2, semi / 12);
      this.blip(at + index * spacing, frequency, 0.26, gain, 'sine');
    });
  }

  startMusic(): void {
    if (!this.settings.music) return;
    if (!this.ensureContext() || !this.context) return;
    if (this.playingMusic) return;
    this.playingMusic = true;
    this.nextNoteAt = this.context.currentTime + 0.4;
    this.step = 0;
    this.scheduler = window.setInterval(() => this.scheduleMusic(), 420);
    this.scheduleMusic();
  }

  stopMusic(): void {
    this.playingMusic = false;
    window.clearInterval(this.scheduler);
    this.scheduler = 0;
  }

  private scheduleMusic(): void {
    if (!this.context || !this.musicBus || !this.playingMusic) return;
    const context = this.context;
    const horizon = context.currentTime + 1.2;

    while (this.nextNoteAt < horizon) {
      const beat = this.step % 16;
      const chordRoot = beat < 8 ? 0 : 5;
      const note = SCALE[(beat * 2 + this.step * 3) % SCALE.length] + chordRoot;
      const frequency = 261.63 * Math.pow(2, note / 12);
      this.musicNote(this.nextNoteAt, frequency, 1.5, 0.07, 'sine');

      if (beat % 4 === 0) {
        const pad = 261.63 * Math.pow(2, chordRoot / 12);
        this.musicPad(this.nextNoteAt, pad, 2.6, 0.045);
        this.musicPad(this.nextNoteAt, pad * 1.5, 2.6, 0.03);
        this.musicPad(this.nextNoteAt, pad * 2, 2.6, 0.022);
      }

      this.step += 1;
      this.nextNoteAt += 0.46;
    }
  }

  private musicNote(
    at: number,
    frequency: number,
    duration: number,
    gain: number,
    type: OscillatorType
  ): void {
    if (!this.context || !this.musicBus) return;
    const osc = this.context.createOscillator();
    const amp = this.context.createGain();
    osc.type = type;
    osc.frequency.value = frequency;
    amp.gain.setValueAtTime(0.0001, at);
    amp.gain.exponentialRampToValueAtTime(gain, at + 0.08);
    amp.gain.exponentialRampToValueAtTime(0.0001, at + duration);
    osc.connect(amp).connect(this.musicBus);
    osc.start(at);
    osc.stop(at + duration + 0.05);
  }

  private musicPad(at: number, frequency: number, duration: number, gain: number): void {
    this.musicNote(at, frequency, duration, gain, 'triangle');
  }

  dispose(): void {
    this.stopMusic();
    void this.context?.close();
    this.context = null;
    this.unlocked = false;
  }
}