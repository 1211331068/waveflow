import type { QualityPreset } from "./music-api";

export class AudioPlayer {
  private audio: HTMLAudioElement | null = null;
  private ctx: AudioContext | null = null;
  private sourceNode: MediaElementAudioSourceNode | null = null;
  private masterGain: GainNode | null = null;
  private lofiFilter: BiquadFilterNode | null = null;
  private exciter: WaveShaperNode | null = null;
  private qualityGain: GainNode | null = null;

  private _isPlaying = false;
  private _currentQuality: QualityPreset = "standard";
  private _duration = 0;
  private _onTimeUpdate: ((t: number) => void) | null = null;
  private _onEnded: (() => void) | null = null;
  private _onError: ((msg: string) => void) | null = null;
  private _rafId: number | null = null;
  private _playLock = false; // 防止并发 play 调用

  get isPlaying() { return this._isPlaying; }
  get currentQuality() { return this._currentQuality; }
  get duration() { return this._duration; }

  async init(): Promise<void> {
    if (this.ctx) return;
    try {
      this.ctx = new AudioContext();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = 0.85;

      this.lofiFilter = this.ctx.createBiquadFilter();
      this.lofiFilter.type = "lowpass";
      this.lofiFilter.frequency.value = 20000;

      this.exciter = this.ctx.createWaveShaper();
      this.exciter.curve = this.makeLinearCurve();

      this.qualityGain = this.ctx.createGain();
      this.qualityGain.gain.value = 1;

      this.masterGain.connect(this.lofiFilter);
      this.lofiFilter.connect(this.exciter);
      this.exciter.connect(this.qualityGain);
      this.qualityGain.connect(this.ctx.destination);

      this.applyQuality(this._currentQuality);
    } catch (e) {
      console.warn("AudioContext init failed:", e);
    }
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

  async play(url: string, _trackId: number, duration: number): Promise<void> {
    // 防止并发 play
    if (this._playLock) return;
    this._playLock = true;

    try {
      if (!this.ctx) await this.init();
      if (!this.ctx) { this._playLock = false; return; }

      if (this.ctx.state === "suspended") {
        await this.ctx.resume();
      }

      // 先完全停止当前播放
      this.stopInternal();

      this._duration = duration;

      this.audio = new Audio();
      this.audio.crossOrigin = "anonymous";
      this.audio.preload = "auto";

      this.sourceNode = this.ctx.createMediaElementSource(this.audio);
      this.sourceNode.connect(this.masterGain!);

      this.audio.addEventListener("ended", () => {
        this._isPlaying = false;
        this.stopTimeUpdates();
        this._onEnded?.();
      }, { once: true });

      this.audio.addEventListener("error", () => {
        if (!this._isPlaying) return; // 已经停止的忽略
        this._isPlaying = false;
        this.stopTimeUpdates();
        this._onError?.("音频加载失败");
      }, { once: true });

      this.audio.addEventListener("loadedmetadata", () => {
        if (this.audio && isFinite(this.audio.duration) && this.audio.duration > 0) {
          this._duration = this.audio.duration;
        }
      }, { once: true });

      this.audio.src = url;

      await this.audio.play();
      this._isPlaying = true;
      this.startTimeUpdates();
    } catch (e) {
      this._isPlaying = false;
      this._onError?.("播放失败");
    } finally {
      this._playLock = false;
    }
  }

  private stopInternal(): void {
    this._isPlaying = false;
    this.stopTimeUpdates();

    if (this.sourceNode) {
      try { this.sourceNode.disconnect(); } catch {}
      this.sourceNode = null;
    }
    if (this.audio) {
      try {
        this.audio.pause();
        this.audio.src = "";
        this.audio.load();
      } catch {}
      this.audio = null;
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
      try { this.audio.currentTime = Math.min(time, this._duration); } catch {}
    }
  }

  setVolume(v: number): void {
    if (this.masterGain && this.ctx) {
      try { this.masterGain.gain.setTargetAtTime(v, this.ctx.currentTime, 0.05); } catch {}
    }
  }

  stop(): void {
    this._playLock = false;
    this.stopInternal();
  }

  onTimeUpdate(cb: (t: number) => void): void { this._onTimeUpdate = cb; }
  onEnded(cb: () => void): void { this._onEnded = cb; }
  onError(cb: (msg: string) => void): void { this._onError = cb; }

  destroy(): void {
    this.stop();
    if (this.ctx && this.ctx.state !== "closed") {
      try { this.ctx.close(); } catch {}
    }
    this.ctx = null;
  }
}

let instance: AudioPlayer | null = null;
export function getAudioPlayer(): AudioPlayer {
  if (!instance) instance = new AudioPlayer();
  return instance;
}
