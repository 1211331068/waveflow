import type { QualityPreset } from "./music-api";

export class AudioPlayer {
  private audio: HTMLAudioElement | null = null;
  private ctx: AudioContext | null = null;
  private sourceNode: MediaElementAudioSourceNode | null = null;
  private masterGain: GainNode | null = null;
  private analyser: AnalyserNode | null = null;

  // Quality chain
  private lofiFilter: BiquadFilterNode | null = null;
  private exciter: WaveShaperNode | null = null;
  private qualityGain: GainNode | null = null;

  private _isPlaying = false;
  private _currentQuality: QualityPreset = "standard";
  private _currentUrl = "";
  private _duration = 0;
  private _onTimeUpdate: ((t: number) => void) | null = null;
  private _onEnded: (() => void) | null = null;
  private _onError: ((msg: string) => void) | null = null;
  private _rafId: number | null = null;

  get isPlaying() { return this._isPlaying; }
  get currentQuality() { return this._currentQuality; }
  get duration() { return this._duration; }

  async init(): Promise<void> {
    if (this.ctx) return;

    this.ctx = new AudioContext();

    // Master gain
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.value = 0.85;

    // Analyser
    this.analyser = this.ctx.createAnalyser();
    this.analyser.fftSize = 256;

    // Quality nodes
    this.lofiFilter = this.ctx.createBiquadFilter();
    this.lofiFilter.type = "lowpass";
    this.lofiFilter.frequency.value = 20000;

    this.exciter = this.ctx.createWaveShaper();
    this.exciter.curve = this.makeLinearCurve();

    this.qualityGain = this.ctx.createGain();
    this.qualityGain.gain.value = 1;

    // Chain: masterGain → analyser → lofiFilter → exciter → qualityGain → destination
    this.masterGain.connect(this.analyser);
    this.analyser.connect(this.lofiFilter);
    this.lofiFilter.connect(this.exciter);
    this.exciter.connect(this.qualityGain);
    this.qualityGain.connect(this.ctx.destination);

    this.applyQuality(this._currentQuality);
  }

  private makeLinearCurve(): Float32Array<ArrayBuffer> {
    const c = new Float32Array(256) as Float32Array<ArrayBuffer>;
    for (let i = 0; i < 256; i++) c[i] = (i - 128) / 128;
    return c;
  }

  private makeExciterCurve(drive: number): Float32Array<ArrayBuffer> {
    const c = new Float32Array(256) as Float32Array<ArrayBuffer>;
    for (let i = 0; i < 256; i++) {
      const x = (i - 128) / 128;
      c[i] = Math.tanh(x * drive) / Math.tanh(drive);
    }
    return c;
  }

  setQuality(preset: QualityPreset): void {
    this._currentQuality = preset;
    this.applyQuality(preset);
  }

  private applyQuality(preset: QualityPreset): void {
    if (!this.ctx || !this.lofiFilter || !this.exciter || !this.masterGain) return;
    const t = this.ctx.currentTime;

    switch (preset) {
      case "lofi":
        this.lofiFilter.frequency.setTargetAtTime(1800, t, 0.05);
        this.exciter.curve = this.makeExciterCurve(3);
        this.masterGain.gain.setTargetAtTime(0.55, t, 0.05);
        break;
      case "standard":
        this.lofiFilter.frequency.setTargetAtTime(20000, t, 0.05);
        this.exciter.curve = this.makeLinearCurve();
        this.masterGain.gain.setTargetAtTime(0.85, t, 0.05);
        break;
      case "high":
        this.lofiFilter.frequency.setTargetAtTime(20000, t, 0.05);
        this.exciter.curve = this.makeExciterCurve(1.8);
        this.masterGain.gain.setTargetAtTime(0.9, t, 0.05);
        break;
      case "lossless":
        this.lofiFilter.frequency.setTargetAtTime(20000, t, 0.05);
        this.exciter.curve = this.makeExciterCurve(1.3);
        this.masterGain.gain.setTargetAtTime(0.95, t, 0.05);
        break;
    }
  }

  async play(url: string, trackId: number, duration: number): Promise<void> {
    if (!this.ctx) await this.init();

    // Resume context if needed
    if (this.ctx!.state === "suspended") {
      await this.ctx!.resume();
    }

    this.stop();

    this._duration = duration;
    this._currentUrl = url;

    this.audio = new Audio();
    this.audio.crossOrigin = "anonymous";
    this.audio.preload = "auto";

    // Create media element source and connect to gain
    this.sourceNode = this.ctx!.createMediaElementSource(this.audio!);
    this.sourceNode.connect(this.masterGain!);

    // Events
    this.audio.addEventListener("ended", () => {
      this._isPlaying = false;
      this.stopTimeUpdates();
      this._onEnded?.();
    });

    this.audio.addEventListener("error", () => {
      this._isPlaying = false;
      this.stopTimeUpdates();
      this._onError?.("播放失败，请尝试其他歌曲");
    });

    this.audio.addEventListener("loadedmetadata", () => {
      // Use actual duration if available
      if (this.audio && isFinite(this.audio.duration) && this.audio.duration > 0) {
        this._duration = this.audio.duration;
      }
    });

    this.audio.src = url;
    this.audio.volume = 1;

    try {
      await this.audio.play();
      this._isPlaying = true;
      this.startTimeUpdates();
    } catch (e) {
      console.error("Play error:", e);
      this._onError?.("播放失败，请重试");
    }
  }

  private startTimeUpdates(): void {
    this.stopTimeUpdates();
    const update = () => {
      if (!this._isPlaying || !this.audio) return;
      this._onTimeUpdate?.(this.audio.currentTime);
      this._rafId = requestAnimationFrame(update);
    };
    update();
  }

  private stopTimeUpdates(): void {
    if (this._rafId !== null) {
      cancelAnimationFrame(this._rafId);
      this._rafId = null;
    }
  }

  pause(): void {
    if (this.audio) {
      this.audio.pause();
      this._isPlaying = false;
      this.stopTimeUpdates();
    }
  }

  resume(): void {
    if (this.audio) {
      this.audio.play().then(() => {
        this._isPlaying = true;
        this.startTimeUpdates();
      }).catch(() => {});
    }
  }

  seekTo(time: number): void {
    if (this.audio) {
      this.audio.currentTime = Math.min(time, this._duration);
    }
  }

  setVolume(v: number): void {
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(v, this.ctx.currentTime, 0.05);
    }
  }

  stop(): void {
    this._isPlaying = false;
    this.stopTimeUpdates();
    if (this.sourceNode) {
      try { this.sourceNode.disconnect(); } catch {}
      this.sourceNode = null;
    }
    if (this.audio) {
      this.audio.pause();
      this.audio.src = "";
      this.audio.load();
      this.audio = null;
    }
  }

  onTimeUpdate(cb: (t: number) => void): void { this._onTimeUpdate = cb; }
  onEnded(cb: () => void): void { this._onEnded = cb; }
  onError(cb: (msg: string) => void): void { this._onError = cb; }

  destroy(): void {
    this.stop();
    if (this.ctx && this.ctx.state !== "closed") {
      this.ctx.close();
    }
    this.ctx = null;
  }
}

let instance: AudioPlayer | null = null;
export function getAudioPlayer(): AudioPlayer {
  if (!instance) instance = new AudioPlayer();
  return instance;
}
