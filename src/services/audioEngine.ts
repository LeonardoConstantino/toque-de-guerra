import { NoteItem, SoundfontType } from '../types/game';
import { calculateNoteDurationMs, getNoteFrequency } from './musicGrammar';

class RetroAudioEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private batteryFilter: BiquadFilterNode | null = null;
  private isMuted: boolean = false;
  private currentVolume: number = 0.8;
  private activeOscillators: { osc: OscillatorNode; gain: GainNode; stopTime: number }[] = [];
  private playbackAbortController: AbortController | null = null;

  // Initialize the Web Audio Context (resumed on first user gesture)
  public initContext(): AudioContext {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();

      // Master Gain
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.currentVolume, this.ctx.currentTime);

      // Battery low-pass / tone degradation filter
      this.batteryFilter = this.ctx.createBiquadFilter();
      this.batteryFilter.type = 'lowpass';
      this.batteryFilter.frequency.setValueAtTime(16000, this.ctx.currentTime);

      this.batteryFilter.connect(this.masterGain);
      this.masterGain.connect(this.ctx.destination);
    }

    if (this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }

    return this.ctx;
  }

  // Adjust output according to battery percentage (24% and lower degrades audio spectrum subtly)
  public setBatteryDegradation(batteryPercent: number) {
    if (!this.ctx || !this.batteryFilter) return;
    const now = this.ctx.currentTime;
    if (batteryPercent <= 0) {
      this.batteryFilter.frequency.setValueAtTime(200, now);
    } else if (batteryPercent <= 15) {
      this.batteryFilter.frequency.setValueAtTime(2200, now);
    } else if (batteryPercent <= 30) {
      this.batteryFilter.frequency.setValueAtTime(4500, now);
    } else {
      this.batteryFilter.frequency.setValueAtTime(18000, now);
    }
  }

  public setVolume(volume: number) {
    this.currentVolume = Math.max(0, Math.min(1, volume));
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : this.currentVolume, this.ctx.currentTime);
    }
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : this.currentVolume, this.ctx.currentTime);
    }
  }

  // Play a single note immediately (e.g. when typing in Composer or auditioning)
  public playNote(note: NoteItem, soundfont: SoundfontType = 'original', durationOverrideMs?: number) {
    const ctx = this.initContext();
    const freq = getNoteFrequency(note.pitch, note.sharp, note.octave);
    
    if (freq <= 0) {
      // Rest / Pause: trigger slight tactile silence
      return;
    }

    const durationMs = durationOverrideMs || calculateNoteDurationMs(note, 120);
    const durationSec = durationMs / 1000;
    const now = ctx.currentTime;

    this.synthesizeNote(freq, now, durationSec, soundfont);
  }

  // Synthesize note according to selected retro Soundfont
  private synthesizeNote(freq: number, startTime: number, durationSec: number, soundfont: SoundfontType) {
    if (!this.ctx || !this.batteryFilter) return;

    // Gate time: 92% sounding, 8% micro-gap for crisp monofonic separation
    const gateDuration = durationSec * 0.90;
    const stopTime = startTime + durationSec;

    const osc = this.ctx.createOscillator();
    const noteGain = this.ctx.createGain();

    switch (soundfont) {
      case 'original': {
        // Classic Nokia Monophonic 3310 Square Wave
        osc.type = 'square';
        osc.frequency.setValueAtTime(freq, startTime);

        // Crisp envelope: sharp attack, flat sustain, quick micro-decay
        noteGain.gain.setValueAtTime(0.001, startTime);
        noteGain.gain.linearRampToValueAtTime(0.22, startTime + 0.005);
        noteGain.gain.setValueAtTime(0.22, startTime + gateDuration - 0.005);
        noteGain.gain.exponentialRampToValueAtTime(0.0001, startTime + gateDuration);
        break;
      }
      case 'grave': {
        // Bassier square + sub harmonic
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(freq * 0.5, startTime);

        noteGain.gain.setValueAtTime(0.001, startTime);
        noteGain.gain.linearRampToValueAtTime(0.28, startTime + 0.008);
        noteGain.gain.setValueAtTime(0.28, startTime + gateDuration - 0.01);
        noteGain.gain.exponentialRampToValueAtTime(0.0001, startTime + gateDuration);
        break;
      }
      case 'agudo': {
        // High bright pulse
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq * 2, startTime);

        noteGain.gain.setValueAtTime(0.001, startTime);
        noteGain.gain.linearRampToValueAtTime(0.30, startTime + 0.004);
        noteGain.gain.setValueAtTime(0.30, startTime + gateDuration - 0.005);
        noteGain.gain.exponentialRampToValueAtTime(0.0001, startTime + gateDuration);
        break;
      }
      case 'radio': {
        // Lo-fi bandpassed with mild distortion
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(freq, startTime);

        noteGain.gain.setValueAtTime(0.001, startTime);
        noteGain.gain.linearRampToValueAtTime(0.18, startTime + 0.01);
        noteGain.gain.setValueAtTime(0.18, startTime + gateDuration - 0.01);
        noteGain.gain.exponentialRampToValueAtTime(0.0001, startTime + gateDuration);
        break;
      }
      case 'arcade': {
        // 8-Bit chiptune wave with micro pitch slide
        osc.type = 'square';
        osc.frequency.setValueAtTime(freq * 1.05, startTime);
        osc.frequency.exponentialRampToValueAtTime(freq, startTime + 0.02);

        noteGain.gain.setValueAtTime(0.001, startTime);
        noteGain.gain.linearRampToValueAtTime(0.25, startTime + 0.003);
        noteGain.gain.setValueAtTime(0.25, startTime + gateDuration - 0.005);
        noteGain.gain.exponentialRampToValueAtTime(0.0001, startTime + gateDuration);
        break;
      }
      case 'polyphonic': {
        // Dual oscillator harmony (Root + 5th)
        osc.type = 'square';
        osc.frequency.setValueAtTime(freq, startTime);

        const osc2 = this.ctx.createOscillator();
        osc2.type = 'triangle';
        osc2.frequency.setValueAtTime(freq * 1.5, startTime); // Perfect 5th

        const noteGain2 = this.ctx.createGain();
        noteGain2.gain.setValueAtTime(0.001, startTime);
        noteGain2.gain.linearRampToValueAtTime(0.15, startTime + 0.005);
        noteGain2.gain.exponentialRampToValueAtTime(0.0001, startTime + gateDuration);

        osc2.connect(noteGain2);
        noteGain2.connect(this.batteryFilter);
        osc2.start(startTime);
        osc2.stop(stopTime);

        noteGain.gain.setValueAtTime(0.001, startTime);
        noteGain.gain.linearRampToValueAtTime(0.18, startTime + 0.005);
        noteGain.gain.exponentialRampToValueAtTime(0.0001, startTime + gateDuration);
        break;
      }
    }

    osc.connect(noteGain);
    noteGain.connect(this.batteryFilter);

    osc.start(startTime);
    osc.stop(stopTime);

    this.activeOscillators.push({ osc, gain: noteGain, stopTime });
  }

  // Play an entire sequence of notes with progress callbacks
  public async playSequence(
    notes: NoteItem[],
    bpm: number,
    soundfont: SoundfontType = 'original',
    onNoteStart?: (index: number, note: NoteItem) => void,
    onFinish?: () => void
  ): Promise<void> {
    this.stopAllPlayback();

    this.playbackAbortController = new AbortController();
    const signal = this.playbackAbortController.signal;

    for (let i = 0; i < notes.length; i++) {
      if (signal.aborted) break;
      const note = notes[i];
      const durationMs = calculateNoteDurationMs(note, bpm);

      if (onNoteStart) {
        onNoteStart(i, note);
      }

      this.playNote(note, soundfont, durationMs);

      // Await note duration before stepping to next note
      await new Promise<void>((resolve) => {
        const timer = setTimeout(resolve, durationMs);
        signal.addEventListener('abort', () => {
          clearTimeout(timer);
          resolve();
        });
      });
    }

    if (!signal.aborted && onFinish) {
      onFinish();
    }
  }

  // Stop any active melody playback immediately
  public stopAllPlayback() {
    if (this.playbackAbortController) {
      this.playbackAbortController.abort();
      this.playbackAbortController = null;
    }
  }

  // Tactile phone button click sound
  public playKeyClick() {
    const ctx = this.initContext();
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(1200, now);
    osc.frequency.exponentialRampToValueAtTime(300, now + 0.02);

    gain.gain.setValueAtTime(0.05, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.02);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.02);
  }

  // Critical hit sound effect: deep bass boom + rapid arpeggiated chiptune flare
  public playCriticalHitSound() {
    const ctx = this.initContext();
    const now = ctx.currentTime;

    // Bass impact
    const bassOsc = ctx.createOscillator();
    const bassGain = ctx.createGain();
    bassOsc.type = 'sawtooth';
    bassOsc.frequency.setValueAtTime(160, now);
    bassOsc.frequency.exponentialRampToValueAtTime(40, now + 0.35);

    bassGain.gain.setValueAtTime(0.35, now);
    bassGain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

    bassOsc.connect(bassGain);
    bassGain.connect(ctx.destination);
    bassOsc.start(now);
    bassOsc.stop(now + 0.35);

    // Chiptune rapid fan-fare
    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
    notes.forEach((freq, idx) => {
      const chimeOsc = ctx.createOscillator();
      const chimeGain = ctx.createGain();
      chimeOsc.type = 'square';
      chimeOsc.frequency.setValueAtTime(freq, now + idx * 0.05);

      chimeGain.gain.setValueAtTime(0.001, now + idx * 0.05);
      chimeGain.gain.linearRampToValueAtTime(0.20, now + idx * 0.05 + 0.01);
      chimeGain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.05 + 0.12);

      chimeOsc.connect(chimeGain);
      chimeGain.connect(ctx.destination);
      chimeOsc.start(now + idx * 0.05);
      chimeOsc.stop(now + idx * 0.05 + 0.12);
    });
  }

  // Victory Fanfare
  public playVictoryJingle() {
    const ctx = this.initContext();
    const now = ctx.currentTime;
    const melody = [
      { f: 523.25, d: 0.1 },
      { f: 659.25, d: 0.1 },
      { f: 783.99, d: 0.1 },
      { f: 1046.50, d: 0.25 },
      { f: 880.00, d: 0.15 },
      { f: 1046.50, d: 0.4 },
    ];

    let t = now;
    melody.forEach(({ f, d }) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(f, t);

      gain.gain.setValueAtTime(0.2, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + d * 0.95);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(t);
      osc.stop(t + d);
      t += d;
    });
  }

  // Defeat / Decompression sound (gentle descending sigh)
  public playDefeatSound() {
    const ctx = this.initContext();
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(320, now);
    osc.frequency.exponentialRampToValueAtTime(90, now + 0.6);

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.6);
  }

  // School bell ring (for day start / transition)
  public playSchoolBell() {
    const ctx = this.initContext();
    const now = ctx.currentTime;

    const fundamental = 820;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(fundamental, now);

    // Rapid bell tremolo
    gain.gain.setValueAtTime(0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 1.2);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 1.2);
  }

  // Power off sound (subtle click & power drain down)
  public playPowerOffSound() {
    const ctx = this.initContext();
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(440, now);
    osc.frequency.exponentialRampToValueAtTime(40, now + 0.4);

    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.4);
  }
}

export const audioEngine = new RetroAudioEngine();

// Safe browser haptic feedback wrapper
export function triggerHaptic(pattern: 'note' | 'error' | 'confirm' | 'critical' | 'victory') {
  if (typeof window !== 'undefined' && 'navigator' in window && 'vibrate' in navigator) {
    try {
      switch (pattern) {
        case 'note':
          navigator.vibrate(10);
          break;
        case 'error':
          navigator.vibrate([25, 40, 25]);
          break;
        case 'confirm':
          navigator.vibrate(30);
          break;
        case 'critical':
          navigator.vibrate([40, 30, 60, 30, 80]);
          break;
        case 'victory':
          navigator.vibrate([30, 30, 40, 40, 100]);
          break;
      }
    } catch {
      // Ignore vibration errors if disabled by browser policies
    }
  }
}
