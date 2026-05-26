// ========== 音频质量预设 ==========
export type QualityPreset = "lofi" | "standard" | "high" | "lossless";

export const qualityLabels: Record<QualityPreset, string> = {
  lofi: "Lo-Fi 怀旧",
  standard: "标准 128kbps",
  high: "高品质 320kbps",
  lossless: "无损 FLAC",
};

export interface TrackDef {
  id: number;
  title: string;
  artist: string;
  album: string;
  duration: number;
  bpm: number;
  // synthesis params
  baseFreq: number;       // root note frequency
  scale: number[];         // intervals (semitones from root)
  pattern: number[];       // note sequence indices into scale
  noteLength: number;      // seconds per note
  waveType: OscillatorType;
  filterFreq: number;
  filterQ: number;
  reverbMix: number;
  delayTime: number;
  delayFeedback: number;
  subOctave: boolean;
  arpPattern: number[];    // arpeggiation offsets
}

// ========== 歌曲定义 ==========
export const tracks: TrackDef[] = [
  {
    id: 1,
    title: "星空下的约定",
    artist: "林夜",
    album: "星河万里",
    duration: 225,
    bpm: 75,
    baseFreq: 220,
    scale: [0, 2, 4, 7, 9, 11, 12],
    pattern: [0, 2, 4, 5, 4, 2, 0, 2, 4, 7, 5, 4, 2, 0],
    noteLength: 0.8,
    waveType: "sine",
    filterFreq: 1200,
    filterQ: 2,
    reverbMix: 0.4,
    delayTime: 0.3,
    delayFeedback: 0.3,
    subOctave: true,
    arpPattern: [0, 4, 7, 12],
  },
  {
    id: 2,
    title: "Electric Dreams",
    artist: "Synth Collective",
    album: "Neon Nights",
    duration: 252,
    bpm: 128,
    baseFreq: 130.81,
    scale: [0, 3, 5, 7, 10, 12],
    pattern: [0, 2, 1, 3, 4, 3, 1, 0, 5, 3, 2, 0],
    noteLength: 0.25,
    waveType: "sawtooth",
    filterFreq: 2500,
    filterQ: 6,
    reverbMix: 0.2,
    delayTime: 0.15,
    delayFeedback: 0.4,
    subOctave: false,
    arpPattern: [0, 3, 7, 10],
  },
  {
    id: 3,
    title: "城市孤岛",
    artist: "陈默",
    album: "无声告白",
    duration: 245,
    bpm: 65,
    baseFreq: 196,
    scale: [0, 2, 3, 7, 8, 11, 12],
    pattern: [0, 5, 3, 2, 0, 3, 5, 6, 5, 3, 1, 0],
    noteLength: 1.2,
    waveType: "triangle",
    filterFreq: 800,
    filterQ: 1,
    reverbMix: 0.6,
    delayTime: 0.5,
    delayFeedback: 0.5,
    subOctave: true,
    arpPattern: [0, 7, 12, 19],
  },
  {
    id: 4,
    title: "Whispers in the Wind",
    artist: "Luna Wave",
    album: "Midnight Echoes",
    duration: 208,
    bpm: 60,
    baseFreq: 329.63,
    scale: [0, 2, 4, 5, 7, 9, 11, 12],
    pattern: [0, 4, 7, 5, 3, 1, 0, 4, 6, 7, 5, 3, 2, 0],
    noteLength: 2.0,
    waveType: "sine",
    filterFreq: 3000,
    filterQ: 3,
    reverbMix: 0.7,
    delayTime: 0.6,
    delayFeedback: 0.25,
    subOctave: false,
    arpPattern: [0, 4, 7],
  },
  {
    id: 5,
    title: "极光之下",
    artist: "北极星乐队",
    album: "追光者",
    duration: 270,
    bpm: 140,
    baseFreq: 164.81,
    scale: [0, 2, 4, 7, 9, 12],
    pattern: [0, 1, 2, 3, 4, 3, 2, 1, 4, 5, 3, 0],
    noteLength: 0.15,
    waveType: "square",
    filterFreq: 4000,
    filterQ: 8,
    reverbMix: 0.15,
    delayTime: 0.1,
    delayFeedback: 0.2,
    subOctave: true,
    arpPattern: [0, 4, 7, 12, 7, 4],
  },
  {
    id: 6,
    title: "Golden Hour",
    artist: "Aria Chen",
    album: "Desert Bloom",
    duration: 235,
    bpm: 90,
    baseFreq: 261.63,
    scale: [0, 4, 5, 7, 11, 12],
    pattern: [0, 3, 1, 4, 2, 5, 3, 1, 0],
    noteLength: 0.5,
    waveType: "triangle",
    filterFreq: 1500,
    filterQ: 4,
    reverbMix: 0.35,
    delayTime: 0.25,
    delayFeedback: 0.35,
    subOctave: false,
    arpPattern: [0, 5, 7, 12],
  },
  {
    id: 7,
    title: "雨后初晴",
    artist: "小野丽莎",
    album: "温柔时光",
    duration: 258,
    bpm: 85,
    baseFreq: 146.83,
    scale: [0, 2, 3, 5, 7, 10, 12],
    pattern: [0, 2, 4, 2, 0, 4, 5, 3, 1, 0, 2, 4, 3],
    noteLength: 0.6,
    waveType: "sine",
    filterFreq: 2000,
    filterQ: 2.5,
    reverbMix: 0.5,
    delayTime: 0.4,
    delayFeedback: 0.4,
    subOctave: true,
    arpPattern: [0, 3, 7, 10],
  },
  {
    id: 8,
    title: "Dark Matter",
    artist: "Echo Lab",
    album: "Quantum Drift",
    duration: 302,
    bpm: 110,
    baseFreq: 98,
    scale: [0, 1, 4, 5, 7, 8, 11, 12],
    pattern: [0, 3, 1, 5, 2, 6, 4, 0, 7, 3, 1],
    noteLength: 0.35,
    waveType: "sawtooth",
    filterFreq: 3500,
    filterQ: 10,
    reverbMix: 0.25,
    delayTime: 0.2,
    delayFeedback: 0.45,
    subOctave: true,
    arpPattern: [0, 3, 7, 10, 15, 10, 7, 3],
  },
];

// ========== Audio Engine ==========
export class AudioEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private analyser: AnalyserNode | null = null;

  // quality chain
  private qualityGain: GainNode | null = null;
  private bitCrusher: ScriptProcessorNode | null = null;
  private lofiFilter: BiquadFilterNode | null = null;
  private exciter: WaveShaperNode | null = null;
  private stereoWidener: StereoPannerNode | null = null;

  // synth nodes per track
  private activeOscillators: OscillatorNode[] = [];
  private activeGains: GainNode[] = [];
  private activeFilters: BiquadFilterNode[] = [];
  private activeLFOs: OscillatorNode[] = [];
  private activeNoiseSources: AudioBufferSourceNode[] = [];

  // state
  private _isPlaying = false;
  private _currentQuality: QualityPreset = "standard";
  private _currentTrackIndex = 0;
  private _startTime = 0;
  private _pauseOffset = 0;
  private _playbackTimer: number | null = null;
  private _onTimeUpdate: ((t: number) => void) | null = null;
  private _onTrackEnd: (() => void) | null = null;

  get isPlaying() {
    return this._isPlaying;
  }
  get currentQuality() {
    return this._currentQuality;
  }
  get currentTrackIndex() {
    return this._currentTrackIndex;
  }

  async init(): Promise<void> {
    if (this.ctx) return;
    this.ctx = new AudioContext();

    // Master chain
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.value = 0.85;

    this.analyser = this.ctx.createAnalyser();
    this.analyser.fftSize = 256;

    // Quality processing nodes (insert between analyser and destination)
    this.qualityGain = this.ctx.createGain();
    this.qualityGain.gain.value = 1;

    // LoFi nodes (disabled by default)
    this.lofiFilter = this.ctx.createBiquadFilter();
    this.lofiFilter.type = "lowpass";
    this.lofiFilter.frequency.value = 20000;

    // Exciter curve for Hi-Fi / Lossless
    this.exciter = this.ctx.createWaveShaper();
    this.exciter.curve = this.makeLinearCurve(); // neutral by default

    // Stereo widener
    this.stereoWidener = this.ctx.createStereoPanner();
    this.stereoWidener.pan.value = 0;

    // Connect: masterGain → analyser → lofiFilter → exciter → stereoWidener → qualityGain → destination
    this.masterGain.connect(this.analyser);
    this.analyser.connect(this.lofiFilter);
    this.lofiFilter.connect(this.exciter);
    this.exciter.connect(this.stereoWidener);
    this.stereoWidener.connect(this.qualityGain);
    this.qualityGain.connect(this.ctx.destination);

    this.applyQualityPreset(this._currentQuality);
  }

  private makeLinearCurve(): Float32Array<ArrayBuffer> {
    const curve = new Float32Array(256) as Float32Array<ArrayBuffer>;
    for (let i = 0; i < 256; i++) {
      curve[i] = (i - 128) / 128;
    }
    return curve;
  }

  private makeExciterCurve(drive: number): Float32Array<ArrayBuffer> {
    const curve = new Float32Array(256) as Float32Array<ArrayBuffer>;
    const k = drive;
    for (let i = 0; i < 256; i++) {
      const x = (i - 128) / 128;
      curve[i] = Math.tanh(x * k) / Math.tanh(k);
    }
    return curve;
  }

  setQuality(preset: QualityPreset): void {
    this._currentQuality = preset;
    this.applyQualityPreset(preset);
  }

  private applyQualityPreset(preset: QualityPreset): void {
    if (!this.ctx || !this.lofiFilter || !this.exciter || !this.stereoWidener || !this.masterGain) return;

    switch (preset) {
      case "lofi":
        // 模拟低保真：低通滤波 + 降低音量模拟压缩
        this.lofiFilter.frequency.setTargetAtTime(1800, this.ctx.currentTime, 0.05);
        this.exciter.curve = this.makeExciterCurve(3); // warm saturation
        this.stereoWidener.pan.setTargetAtTime(0, this.ctx.currentTime, 0.05);
        this.masterGain.gain.setTargetAtTime(0.55, this.ctx.currentTime, 0.05);
        break;

      case "standard":
        this.lofiFilter.frequency.setTargetAtTime(20000, this.ctx.currentTime, 0.05);
        this.exciter.curve = this.makeLinearCurve();
        this.stereoWidener.pan.setTargetAtTime(0, this.ctx.currentTime, 0.05);
        this.masterGain.gain.setTargetAtTime(0.7, this.ctx.currentTime, 0.05);
        break;

      case "high":
        this.lofiFilter.frequency.setTargetAtTime(20000, this.ctx.currentTime, 0.05);
        this.exciter.curve = this.makeExciterCurve(1.8);
        this.stereoWidener.pan.setTargetAtTime(0, this.ctx.currentTime, 0.05);
        this.masterGain.gain.setTargetAtTime(0.75, this.ctx.currentTime, 0.05);
        break;

      case "lossless":
        this.lofiFilter.frequency.setTargetAtTime(20000, this.ctx.currentTime, 0.05);
        this.exciter.curve = this.makeExciterCurve(1.3);
        // subtle stereo widening
        this.stereoWidener.pan.setTargetAtTime(0, this.ctx.currentTime, 0.05);
        this.masterGain.gain.setTargetAtTime(0.78, this.ctx.currentTime, 0.05);
        break;
    }
  }

  setVolume(v: number): void {
    if (this.masterGain) {
      this.masterGain.gain.setTargetAtTime(v, this.ctx!.currentTime, 0.05);
    }
  }

  onTimeUpdate(cb: (t: number) => void): void {
    this._onTimeUpdate = cb;
  }

  onTrackEnd(cb: () => void): void {
    this._onTrackEnd = cb;
  }

  // ---------- Synth helpers ----------
  private freqFromScale(baseFreq: number, scale: number[], index: number, octave: number): number {
    const semitones = scale[index % scale.length] + octave * 12;
    return baseFreq * Math.pow(2, semitones / 12);
  }

  playTrack(trackIndex: number): void {
    this.stopAllSound();
    if (!this.ctx || !this.masterGain || !this.analyser) return;

    // Resume AudioContext if suspended (browser policy requires user gesture)
    if (this.ctx.state === "suspended") {
      this.ctx.resume();
    }

    const track = tracks[trackIndex % tracks.length];
    if (!track) return;
    this._currentTrackIndex = trackIndex;

    const now = this.ctx.currentTime;
    const totalNotes = Math.floor(track.duration / track.noteLength);

    // --- Melody oscillator ---
    const melodyOsc = this.ctx.createOscillator();
    const melodyGain = this.ctx.createGain();
    const melodyFilter = this.ctx.createBiquadFilter();

    melodyOsc.type = track.waveType;
    melodyFilter.type = "lowpass";
    melodyFilter.frequency.value = track.filterFreq;
    melodyFilter.Q.value = track.filterQ;
    melodyGain.gain.value = 0;

    melodyOsc.connect(melodyFilter);
    melodyFilter.connect(melodyGain);
    melodyGain.connect(this.masterGain);

    this.activeOscillators.push(melodyOsc);
    this.activeGains.push(melodyGain);
    this.activeFilters.push(melodyFilter);

    // Schedule notes
    for (let i = 0; i < totalNotes; i++) {
      const t = now + i * track.noteLength;
      const scaleIdx = track.pattern[i % track.pattern.length];
      const oct = Math.floor(i / track.pattern.length / 2);
      const freq = this.freqFromScale(track.baseFreq, track.scale, scaleIdx, oct);

      melodyOsc.frequency.setValueAtTime(freq, t);
      // ADSR-like envelope: quick attack, sustain, smooth release
      const attackTime = track.noteLength * 0.08;
      const releaseStart = track.noteLength * 0.8;
      melodyGain.gain.setValueAtTime(0, t);
      melodyGain.gain.linearRampToValueAtTime(0.35, t + attackTime);
      melodyGain.gain.setValueAtTime(0.35, t + releaseStart);
      melodyGain.gain.linearRampToValueAtTime(0.001, t + track.noteLength);
    }

    melodyOsc.start(now);
    melodyOsc.stop(now + track.duration + 2);

    // --- Sub oscillator ---
    if (track.subOctave) {
      const subOsc = this.ctx.createOscillator();
      const subGain = this.ctx.createGain();
      const subFilter = this.ctx.createBiquadFilter();

      subOsc.type = "sine";
      subFilter.type = "lowpass";
      subFilter.frequency.value = 300;
      subGain.gain.value = 0.15;

      subOsc.connect(subFilter);
      subFilter.connect(subGain);
      subGain.connect(this.masterGain);

      this.activeOscillators.push(subOsc);
      this.activeGains.push(subGain);
      this.activeFilters.push(subFilter);

      for (let i = 0; i < totalNotes; i++) {
        const t = now + i * track.noteLength;
        const scaleIdx = track.pattern[i % track.pattern.length];
        const freq = this.freqFromScale(track.baseFreq, track.scale, scaleIdx, -1);
        subOsc.frequency.setValueAtTime(freq, t);
      }

      subOsc.start(now);
      subOsc.stop(now + track.duration + 2);
    }

    // --- Arpeggiator ---
    if (track.arpPattern.length > 0) {
      const arpOsc = this.ctx.createOscillator();
      const arpGain = this.ctx.createGain();
      const arpFilter = this.ctx.createBiquadFilter();

      arpOsc.type = track.waveType === "sine" ? "triangle" : "sine";
      arpFilter.type = "highpass";
      arpFilter.frequency.value = 600;
      arpGain.gain.value = 0.12;

      arpOsc.connect(arpFilter);
      arpFilter.connect(arpGain);
      arpGain.connect(this.masterGain);

      this.activeOscillators.push(arpOsc);
      this.activeGains.push(arpGain);
      this.activeFilters.push(arpFilter);

      const arpStep = track.noteLength / track.arpPattern.length;
      for (let i = 0; i < totalNotes * track.arpPattern.length; i++) {
        const t = now + i * arpStep;
        const arpIdx = track.arpPattern[i % track.arpPattern.length];
        const baseScaleIdx = track.pattern[Math.floor(i / track.arpPattern.length) % track.pattern.length];
        const freq = this.freqFromScale(track.baseFreq, track.scale, baseScaleIdx, 1) * Math.pow(2, (arpIdx % 12) / 12);
        arpOsc.frequency.setValueAtTime(freq, t);
        arpGain.gain.setValueAtTime(0.06, t);
        arpGain.gain.setTargetAtTime(0.001, t + arpStep * 0.8, arpStep * 0.1);
      }

      arpOsc.start(now);
      arpOsc.stop(now + track.duration + 2);
    }

    // --- LFO modulation on filter ---
    const lfo = this.ctx.createOscillator();
    const lfoGain = this.ctx.createGain();
    lfo.type = "sine";
    lfo.frequency.value = 0.2 + Math.random() * 0.5;
    lfoGain.gain.value = track.filterFreq * 0.3;
    lfo.connect(lfoGain);
    lfoGain.connect(melodyFilter.frequency);
    lfo.start(now);
    lfo.stop(now + track.duration + 2);
    this.activeLFOs.push(lfo);

    // --- Noise layer (rhythm texture) ---
    const bufferSize = this.ctx.sampleRate * 2;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    const noiseSource = this.ctx.createBufferSource();
    noiseSource.buffer = noiseBuffer;
    noiseSource.loop = true;

    const noiseFilter = this.ctx.createBiquadFilter();
    noiseFilter.type = "bandpass";
    noiseFilter.frequency.value = 2000;
    noiseFilter.Q.value = 0.5;

    const noiseGain = this.ctx.createGain();
    noiseGain.gain.value = 0.02;

    // LFO on noise gain for rhythmic feel
    const noiseLFO = this.ctx.createOscillator();
    const noiseLFOGain = this.ctx.createGain();
    noiseLFO.type = "sine";
    noiseLFO.frequency.value = track.bpm / 60;
    noiseLFOGain.gain.value = 0.03;
    noiseLFO.connect(noiseLFOGain);
    noiseLFOGain.connect(noiseGain.gain);
    noiseLFO.start(now);
    noiseLFO.stop(now + track.duration + 2);
    this.activeLFOs.push(noiseLFO);

    noiseSource.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(this.masterGain);

    noiseSource.start(now);
    noiseSource.stop(now + track.duration + 2);
    this.activeNoiseSources.push(noiseSource);

    // --- Delay / Reverb simulation via feedback delay ---
    if (track.delayTime > 0) {
      const delay = this.ctx.createDelay(1);
      const delayFeedback = this.ctx.createGain();
      delay.delayTime.value = track.delayTime;
      delayFeedback.gain.value = track.delayFeedback;

      const delayMix = this.ctx.createGain();
      delayMix.gain.value = track.reverbMix * 0.3;

      melodyGain.connect(delay);
      delay.connect(delayFeedback);
      delayFeedback.connect(delay);
      delay.connect(delayMix);
      delayMix.connect(this.masterGain);
    }

    // --- State & timer ---
    this._isPlaying = true;
    this._startTime = this.ctx.currentTime - this._pauseOffset;
    this._pauseOffset = 0;
    this.startTimeUpdates(track.duration);

    // Auto-advance on end
    const endTime = now + track.duration;
    const checkEnd = () => {
      if (this.ctx && this.ctx.currentTime >= endTime && this._isPlaying) {
        this._onTrackEnd?.();
      } else if (this._isPlaying) {
        requestAnimationFrame(checkEnd);
      }
    };
    requestAnimationFrame(checkEnd);
  }

  private startTimeUpdates(duration: number): void {
    this.stopTimeUpdates();
    const update = () => {
      if (!this._isPlaying || !this.ctx) return;
      const elapsed = this.ctx.currentTime - this._startTime;
      const clamped = Math.max(0, Math.min(elapsed, duration));
      this._onTimeUpdate?.(clamped);
      if (clamped < duration) {
        this._playbackTimer = window.setTimeout(update, 100);
      }
    };
    update();
  }

  private stopTimeUpdates(): void {
    if (this._playbackTimer !== null) {
      clearTimeout(this._playbackTimer);
      this._playbackTimer = null;
    }
  }

  pause(): void {
    if (!this.ctx || !this._isPlaying) return;
    this._pauseOffset = this.ctx.currentTime - this._startTime;
    this._isPlaying = false;
    this.stopTimeUpdates();
    this.ctx.suspend();
  }

  resume(): void {
    if (!this.ctx || this._isPlaying) return;
    this.ctx.resume();
    this._isPlaying = true;
    this._startTime = this.ctx.currentTime - this._pauseOffset;
    this.startTimeUpdates(999);
  }

  seekTo(time: number): void {
    // Since we're synthesizing, seeking is complex.
    // For simplicity: restart track at approximate position?
    // Instead, we restart the track and offset the start time.
    this._pauseOffset = time;
    if (this._isPlaying) {
      this.stopAllSound();
      this.playTrack(this._currentTrackIndex);
    }
  }

  stopAllSound(): void {
    this._isPlaying = false;
    this.stopTimeUpdates();
    this._pauseOffset = 0;

    [...this.activeOscillators, ...this.activeLFOs].forEach((o) => {
      try { o.stop(); } catch {}
    });
    this.activeNoiseSources.forEach((s) => {
      try { s.stop(); } catch {}
    });

    this.activeOscillators = [];
    this.activeGains = [];
    this.activeFilters = [];
    this.activeLFOs = [];
    this.activeNoiseSources = [];
  }

  destroy(): void {
    this.stopAllSound();
    if (this.ctx && this.ctx.state !== "closed") {
      this.ctx.close();
    }
    this.ctx = null;
  }
}

// Singleton
let engineInstance: AudioEngine | null = null;
export function getAudioEngine(): AudioEngine {
  if (!engineInstance) {
    engineInstance = new AudioEngine();
  }
  return engineInstance;
}
