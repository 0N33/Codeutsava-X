// =========================================================================
// PROCEDURAL CYBER SOUNDTRACK SYNTHESIZER ENGINE
// Inspired by "Neo Nomen - RE:RUN OST" by Dani / Karlson
// 100% Offline Web Audio API | Zero Audio File Overhead | 136 BPM
// =========================================================================

class CyberSoundtrackEngine {
  private ctx: AudioContext | null = null;
  private isPlaying: boolean = false;
  private isMuted: boolean = true;
  private currentStep: number = 0;
  private timerId: number | null = null;
  private nextStepTime: number = 0;
  private tempo: number = 136; // BPM matching high-speed parkour / cyberpunk electro
  private masterGain: GainNode | null = null;
  private compressor: DynamicsCompressorNode | null = null;
  private delayNode: DelayNode | null = null;
  private delayFeedback: GainNode | null = null;
  private listeners: Set<(playing: boolean) => void> = new Set();

  private getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
        this.setupAudioGraph();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  private setupAudioGraph() {
    if (!this.ctx) return;

    // Master Dynamics Compressor (Gives that punchy, compressed electronic studio master sound)
    this.compressor = this.ctx.createDynamicsCompressor();
    this.compressor.threshold.setValueAtTime(-18, this.ctx.currentTime);
    this.compressor.knee.setValueAtTime(12, this.ctx.currentTime);
    this.compressor.ratio.setValueAtTime(6, this.ctx.currentTime);
    this.compressor.attack.setValueAtTime(0.003, this.ctx.currentTime);
    this.compressor.release.setValueAtTime(0.15, this.ctx.currentTime);

    // Master Volume Gain
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.setValueAtTime(0.18, this.ctx.currentTime);

    // Stereo Ping-Pong Style Delay Line for Leads & Arps
    this.delayNode = this.ctx.createDelay();
    // 3/16 dotted 8th delay at 136 BPM = ~0.33s
    this.delayNode.delayTime.setValueAtTime((60 / this.tempo) * 0.75, this.ctx.currentTime);

    this.delayFeedback = this.ctx.createGain();
    this.delayFeedback.gain.setValueAtTime(0.35, this.ctx.currentTime);

    const delayFilter = this.ctx.createBiquadFilter();
    delayFilter.type = 'bandpass';
    delayFilter.frequency.setValueAtTime(1600, this.ctx.currentTime);
    delayFilter.Q.setValueAtTime(1.2, this.ctx.currentTime);

    this.delayNode.connect(delayFilter);
    delayFilter.connect(this.delayFeedback);
    this.delayFeedback.connect(this.delayNode);
    this.delayFeedback.connect(this.compressor);

    this.compressor.connect(this.masterGain);
    this.masterGain.connect(this.ctx.destination);
  }

  public subscribe(cb: (playing: boolean) => void) {
    this.listeners.add(cb);
    return () => this.listeners.delete(cb);
  }

  private notify() {
    this.listeners.forEach((cb) => cb(this.isPlaying && !this.isMuted));
  }

  public getIsPlaying(): boolean {
    return this.isPlaying && !this.isMuted;
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    if (!this.isMuted) {
      this.start();
    } else {
      this.pause();
    }
    this.notify();
    return this.isMuted;
  }

  public start() {
    const ctx = this.getContext();
    if (!ctx) return;

    this.isMuted = false;
    if (this.isPlaying) return;

    this.isPlaying = true;
    this.currentStep = 0;
    this.nextStepTime = ctx.currentTime + 0.05;

    // Smooth ease-in
    if (this.masterGain) {
      this.masterGain.gain.setValueAtTime(0.0001, ctx.currentTime);
      this.masterGain.gain.linearRampToValueAtTime(0.22, ctx.currentTime + 0.4);
    }

    this.scheduleLoop();
    this.notify();
  }

  public pause() {
    if (!this.isPlaying) return;
    const ctx = this.getContext();
    if (ctx && this.masterGain) {
      this.masterGain.gain.linearRampToValueAtTime(0.0001, ctx.currentTime + 0.2);
    }
    setTimeout(() => {
      this.isPlaying = false;
      if (this.timerId !== null) {
        window.clearTimeout(this.timerId);
        this.timerId = null;
      }
      this.notify();
    }, 200);
  }

  private scheduleLoop = () => {
    if (!this.isPlaying || !this.ctx) return;

    const secondsPer16th = 60 / this.tempo / 4;
    const lookAhead = 0.12;

    while (this.nextStepTime < this.ctx.currentTime + lookAhead) {
      this.playStep(this.currentStep % 64, this.nextStepTime);
      this.nextStepTime += secondsPer16th;
      this.currentStep = (this.currentStep + 1) % 64;
    }

    this.timerId = window.setTimeout(this.scheduleLoop, 25);
  };

  // =========================================================================
  // STEP SEQUENCER: 64 STEPS (4 BARS OF 16TH NOTES AT 136 BPM)
  // High-Energy D-Minor Cyber Parkour Theme (Inspired by RE:RUN OST)
  // =========================================================================
  private playStep(step: number, time: number) {
    if (!this.ctx || !this.compressor) return;

    const bar = Math.floor(step / 16);
    const barStep = step % 16;

    // 1. FOUR-ON-THE-FLOOR PUNCHY ELECTRO KICK
    if (barStep === 0 || barStep === 4 || barStep === 8 || barStep === 12) {
      this.triggerKick(time);
    }

    // 2. CRISP CYBER SNARE & CLAP ON 2 & 4
    if (barStep === 4 || barStep === 12) {
      this.triggerSnare(time);
    }

    // 3. 16TH-NOTE DRIVING HI-HATS WITH OFFBEAT OPEN ACCENTS
    const isOpenHat = barStep === 2 || barStep === 6 || barStep === 10 || barStep === 14;
    this.triggerHiHat(time, isOpenHat);

    // 4. ROLLING 16TH-NOTE RUNNING BASSLINE (Signature RE:RUN Saw Bass)
    const bassNote = this.getBassNote(bar, barStep);
    if (bassNote > 0) {
      this.triggerBass(time, bassNote, 60 / this.tempo / 4 * 0.85);
    }

    // 5. ENERGETIC ARPEGGIATED CHORDS
    const arpNote = this.getArpNote(bar, barStep);
    if (arpNote > 0) {
      this.triggerArp(time, arpNote, 60 / this.tempo / 4 * 0.7);
    }

    // 6. CATCHY NEO NOMEN CHIPTUNE HOOK LEAD
    const leadNote = this.getLeadNote(bar, barStep);
    if (leadNote > 0) {
      this.triggerLead(time, leadNote, 60 / this.tempo / 4 * 1.6);
    }
  }

  // --- FREQUENCY NOTE HELPERS (MIDI to Hz) ---
  private midiToHz(note: number): number {
    return 440 * Math.pow(2, (note - 69) / 12);
  }

  // --- BASSLINE PATTERN (D minor -> Bb -> C -> Am) ---
  private getBassNote(bar: number, step: number): number {
    // D2 = 38, F2 = 41, G2 = 43, A2 = 45, C3 = 48, Bb1 = 34, C2 = 36, E2 = 40
    if (bar === 0 || bar === 2) {
      // D Minor running groove
      const pattern = [38, 38, 41, 38, 43, 38, 41, 38, 38, 38, 41, 38, 48, 45, 43, 41];
      return pattern[step] || 38;
    } else if (bar === 1) {
      // Bb Major -> C Major
      if (step < 8) {
        const patternBb = [34, 34, 38, 34, 41, 34, 38, 34];
        return patternBb[step] || 34;
      } else {
        const patternC = [36, 36, 40, 36, 43, 36, 45, 40];
        return patternC[step - 8] || 36;
      }
    } else {
      // Bar 3: Turnaround (Bb -> C -> A7)
      if (step < 8) {
        const patternBb = [34, 34, 38, 34, 41, 34, 38, 34];
        return patternBb[step] || 34;
      } else {
        const patternA = [33, 33, 37, 33, 40, 45, 43, 40]; // A1 -> C#2 -> E2
        return patternA[step - 8] || 33;
      }
    }
  }

  // --- ARPEGGIO CHORD PATTERN ---
  private getArpNote(bar: number, step: number): number {
    // Dm: D4(62), F4(65), A4(69), D5(74)
    // Bb: Bb3(58), D4(62), F4(65), Bb4(70)
    // C:  C4(60), E4(64), G4(67), C5(72)
    // Am: A3(57), C4(60), E4(64), A4(69)
    if (bar === 0 || bar === 2) {
      const dmArp = [62, 65, 69, 74, 69, 65, 69, 74, 62, 65, 69, 74, 69, 65, 62, 65];
      return dmArp[step] || 0;
    } else if (bar === 1) {
      if (step < 8) {
        const bbArp = [58, 62, 65, 70, 65, 62, 65, 70];
        return bbArp[step] || 0;
      } else {
        const cArp = [60, 64, 67, 72, 67, 64, 67, 72];
        return cArp[step - 8] || 0;
      }
    } else {
      if (step < 8) {
        const bbArp = [58, 62, 65, 70, 65, 62, 65, 70];
        return bbArp[step] || 0;
      } else {
        const amArp = [57, 61, 64, 69, 64, 61, 64, 69]; // A major / A7
        return amArp[step - 8] || 0;
      }
    }
  }

  // --- CATCHY NEO NOMEN LEAD HOOK MELODY ---
  private getLeadNote(bar: number, step: number): number {
    // D5=74, E5=76, F5=77, G5=79, A5=81, Bb5=82, C6=84, D6=86
    if (bar === 0) {
      const bar0 = [74, 0, 77, 0, 74, 0, 81, 0, 79, 0, 77, 76, 77, 0, 74, 0];
      return bar0[step] || 0;
    } else if (bar === 1) {
      const bar1 = [77, 0, 79, 0, 81, 0, 84, 0, 81, 0, 79, 77, 76, 0, 74, 72];
      return bar1[step] || 0;
    } else if (bar === 2) {
      const bar2 = [74, 0, 77, 0, 74, 0, 81, 0, 86, 0, 84, 81, 84, 0, 81, 0];
      return bar2[step] || 0;
    } else {
      const bar3 = [82, 0, 81, 0, 79, 0, 77, 0, 76, 0, 77, 0, 76, 74, 73, 74];
      return bar3[step] || 0;
    }
  }

  // =========================================================================
  // INSTRUMENT SYNTHESIS VOICES
  // =========================================================================

  // 1. Kick Voice
  private triggerKick(time: number) {
    if (!this.ctx || !this.compressor) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(155, time);
    osc.frequency.exponentialRampToValueAtTime(38, time + 0.09);

    gain.gain.setValueAtTime(0.75, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.18);

    // Initial punch click
    const clickOsc = this.ctx.createOscillator();
    const clickGain = this.ctx.createGain();
    clickOsc.type = 'triangle';
    clickOsc.frequency.setValueAtTime(320, time);
    clickOsc.frequency.exponentialRampToValueAtTime(60, time + 0.02);
    clickGain.gain.setValueAtTime(0.4, time);
    clickGain.gain.exponentialRampToValueAtTime(0.001, time + 0.025);

    clickOsc.connect(clickGain);
    clickGain.connect(this.compressor);

    osc.connect(gain);
    gain.connect(this.compressor);

    osc.start(time);
    clickOsc.start(time);
    osc.stop(time + 0.2);
    clickOsc.stop(time + 0.03);
  }

  // 2. Snare Voice
  private triggerSnare(time: number) {
    if (!this.ctx || !this.compressor) return;

    // Noise component
    const bufferSize = this.ctx.sampleRate * 0.12;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const noiseFilter = this.ctx.createBiquadFilter();
    noiseFilter.type = 'bandpass';
    noiseFilter.frequency.setValueAtTime(1900, time);
    noiseFilter.Q.setValueAtTime(1.4, time);

    const noiseGain = this.ctx.createGain();
    noiseGain.gain.setValueAtTime(0.5, time);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, time + 0.14);

    noise.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(this.compressor);

    // Tonal body component
    const osc = this.ctx.createOscillator();
    const oscGain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(240, time);
    osc.frequency.exponentialRampToValueAtTime(110, time + 0.08);
    oscGain.gain.setValueAtTime(0.35, time);
    oscGain.gain.exponentialRampToValueAtTime(0.001, time + 0.09);

    osc.connect(oscGain);
    oscGain.connect(this.compressor);

    noise.start(time);
    osc.start(time);
    noise.stop(time + 0.15);
    osc.stop(time + 0.1);
  }

  // 3. Hi-Hat Voice
  private triggerHiHat(time: number, isOpen: boolean) {
    if (!this.ctx || !this.compressor) return;

    const duration = isOpen ? 0.11 : 0.035;
    const bufferSize = Math.floor(this.ctx.sampleRate * duration);
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.setValueAtTime(7800, time);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(isOpen ? 0.22 : 0.12, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + duration);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.compressor);

    noise.start(time);
    noise.stop(time + duration + 0.01);
  }

  // 4. Rolling Cyber Bass Voice
  private triggerBass(time: number, midiNote: number, dur: number) {
    if (!this.ctx || !this.compressor) return;

    const freq = this.midiToHz(midiNote);
    const osc = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const filter = this.ctx.createBiquadFilter();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(freq, time);

    // Subtle detuned square sub-layer for aggressive bite
    osc2.type = 'square';
    osc2.frequency.setValueAtTime(freq * 1.004, time);

    // Dynamic Filter Envelope (Filter sweeps open on note attack)
    filter.type = 'lowpass';
    filter.Q.setValueAtTime(4.2, time);
    filter.frequency.setValueAtTime(1950, time);
    filter.frequency.exponentialRampToValueAtTime(320, time + dur);

    gain.gain.setValueAtTime(0.38, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + dur);

    osc.connect(filter);
    osc2.connect(filter);
    filter.connect(gain);
    gain.connect(this.compressor);

    osc.start(time);
    osc2.start(time);
    osc.stop(time + dur + 0.02);
    osc2.stop(time + dur + 0.02);
  }

  // 5. Arpeggio Chords Voice
  private triggerArp(time: number, midiNote: number, dur: number) {
    if (!this.ctx || !this.compressor) return;

    const freq = this.midiToHz(midiNote);
    const osc = this.ctx.createOscillator();
    const filter = this.ctx.createBiquadFilter();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(freq, time);

    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(2200, time);
    filter.Q.setValueAtTime(1.8, time);

    gain.gain.setValueAtTime(0.13, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + dur);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.compressor);
    if (this.delayNode) gain.connect(this.delayNode);

    osc.start(time);
    osc.stop(time + dur + 0.02);
  }

  // 6. Lead Hook Melody Voice
  private triggerLead(time: number, midiNote: number, dur: number) {
    if (!this.ctx || !this.compressor) return;

    const freq = this.midiToHz(midiNote);
    const osc = this.ctx.createOscillator();
    const subOsc = this.ctx.createOscillator();
    const filter = this.ctx.createBiquadFilter();
    const gain = this.ctx.createGain();

    osc.type = 'square';
    osc.frequency.setValueAtTime(freq, time);

    // Subtle lead portamento / vibrato
    subOsc.type = 'sawtooth';
    subOsc.frequency.setValueAtTime(freq * 0.998, time);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(3800, time);
    filter.Q.setValueAtTime(2.2, time);

    gain.gain.setValueAtTime(0.24, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + dur);

    osc.connect(filter);
    subOsc.connect(filter);
    filter.connect(gain);
    gain.connect(this.compressor);
    if (this.delayNode) gain.connect(this.delayNode);

    osc.start(time);
    subOsc.start(time);
    osc.stop(time + dur + 0.02);
    subOsc.stop(time + dur + 0.02);
  }
}

export const cyberSoundtrack = new CyberSoundtrackEngine();
