"use client";

import { useEffect, useRef, useCallback, useMemo, useState } from "react";
import type { LyricData, LyricLine, QualityPreset } from "@/lib/music-api";
import { qualityLabels } from "@/lib/music-api";
import ShadeLineBackground from "@/components/shade-line-background";

interface LyricViewProps {
  lyrics: LyricData | null;
  loading: boolean;
  currentTime: number;
  duration: number;
  songName: string;
  artists: string[];
  albumPic: string;
  onClose: () => void;
  isPlaying: boolean;
  onTogglePlay: () => void;
  onPlayNext: () => void;
  onPlayPrev: () => void;
  quality: QualityPreset;
  onSetQuality: (q: QualityPreset) => void;
  onSeekTo: (t: number) => void;
  volume: number;
  onSetVolume: (v: number) => void;
}

// 返回当前高亮的歌词行索引
function findActiveLine(lines: LyricLine[], time: number): number {
  if (!lines.length) return -1;
  let active = -1;
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].time <= time + 0.3) {
      active = i;
    } else {
      break;
    }
  }
  return active;
}



export default function LyricView({
  lyrics, loading, currentTime, duration, songName, artists, albumPic, onClose,
  isPlaying, onTogglePlay, onPlayNext, onPlayPrev,
  quality, onSetQuality, onSeekTo, volume, onSetVolume,
}: LyricViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const lineRefs = useRef<(HTMLDivElement | null)[]>([]);
  const isUserScrolling = useRef(false);
  const scrollTimer = useRef<NodeJS.Timeout | null>(null);
  const [qualOpen, setQualOpen] = useState(false);
  const qualRef = useRef<HTMLDivElement>(null);

  // 关闭音质菜单
  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (qualRef.current && !qualRef.current.contains(e.target as Node)) setQualOpen(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const activeIndex = useMemo(
    () => (lyrics ? findActiveLine(lyrics.lines, currentTime) : -1),
    [lyrics, currentTime]
  );

  // 自动滚动 - 使用 scrollTop 直接控制，确保可靠
  useEffect(() => {
    if (activeIndex < 0) return;
    if (isUserScrolling.current) return;

    const el = lineRefs.current[activeIndex];
    const container = containerRef.current;
    if (!el || !container) return;

    const containerRect = container.getBoundingClientRect();
    const elRect = el.getBoundingClientRect();
    const targetScrollTop = container.scrollTop + elRect.top - containerRect.top - containerRect.height * 0.4;

    container.scrollTo({
      top: targetScrollTop,
      behavior: "smooth",
    });
  }, [activeIndex]);

  // 用户手动滚动时暂停自动滚动 2.5 秒
  const handleScroll = useCallback(() => {
    isUserScrolling.current = true;
    if (scrollTimer.current) clearTimeout(scrollTimer.current);
    scrollTimer.current = setTimeout(() => {
      isUserScrolling.current = false;
    }, 2500);
  }, []);

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;
  const muted = volume === 0;
  const progClick = (e: React.MouseEvent) => {
    const r = (e.currentTarget as HTMLElement).getBoundingClientRect();
    onSeekTo(((e.clientX - r.left) / r.width) * duration);
  };
  const volClick = (e: React.MouseEvent) => {
    const r = (e.currentTarget as HTMLElement).getBoundingClientRect();
    onSetVolume(Math.min(1, Math.max(0, (e.clientX - r.left) / r.width)));
  };

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <ShadeLineBackground />
        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
        <div className="relative z-10 text-center">
          <div className="w-10 h-10 border-2 border-purple-400 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-zinc-300 text-sm">加载歌词中...</p>
        </div>
        <button onClick={onClose} className="absolute top-6 right-6 text-zinc-400 hover:text-white transition-colors z-10">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col">
      {/* Shader 背景 */}
      <ShadeLineBackground />
      {/* 深色遮罩 */}
      <div className="absolute inset-0 bg-black/60" />

      {/* 顶部栏 */}
      <div className="relative z-10 flex items-center justify-between px-6 py-4 bg-gradient-to-b from-black/50 to-transparent">
        <button onClick={onClose} className="text-zinc-400 hover:text-white transition-colors p-2 -ml-2">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        <div className="text-center min-w-0 flex-1 px-4">
          <p className="text-white font-semibold text-sm truncate">{songName}</p>
          <p className="text-zinc-500 text-xs truncate">{artists.join(" / ")}</p>
        </div>
        <div className="w-10" />
      </div>

      {/* 唱片封面区域 */}
      <div className="relative z-10 flex-shrink-0 flex items-center justify-center py-4">
        <div className="relative">
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-purple-500/20 via-transparent to-pink-500/20 blur-2xl scale-150" />
          <div className={`relative w-40 h-40 rounded-full overflow-hidden shadow-2xl ring-1 ring-white/10 ${progress > 0 ? "animate-spin-slow" : ""}`}
            style={{ animationDuration: "20s" }}>
            {albumPic ? (
              <img src={albumPic} alt={songName} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center">
                <span className="text-3xl font-bold text-white/30">{songName[0]}</span>
              </div>
            )}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-10 h-10 rounded-full bg-black/80 border-2 border-zinc-800 flex items-center justify-center">
                <div className="w-2.5 h-2.5 rounded-full bg-zinc-600" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 歌词区域 */}
      {lyrics && lyrics.lines.length > 0 ? (
        <div
          ref={containerRef}
          onScroll={handleScroll}
          className="relative z-10 flex-1 overflow-y-auto px-4 py-2 scrollbar-hide"
          style={{
            WebkitMaskImage: "linear-gradient(to bottom, transparent 0%, black 12%, black 88%, transparent 100%)",
            maskImage: "linear-gradient(to bottom, transparent 0%, black 12%, black 88%, transparent 100%)",
          }}>
          {/* 顶部留白 */}
          <div className="h-[35vh]" />

          <div className="space-y-6">
            {lyrics.lines.map((line, idx) => {
              const isActive = idx === activeIndex;
              const isNear = Math.abs(idx - activeIndex) <= 1;

              return (
                <div
                  key={idx}
                  ref={el => { lineRefs.current[idx] = el; }}
                  className="transition-all duration-300 ease-out"
                  style={{ opacity: isActive ? 1 : isNear ? 0.6 : 0.35 }}>
                  <p className={`text-center leading-relaxed ${
                    isActive
                      ? "text-purple-300 text-2xl font-bold drop-shadow-[0_0_12px_rgba(168,85,247,0.5)]"
                      : isNear
                      ? "text-zinc-300 text-lg"
                      : "text-zinc-500 text-base"
                  }`}>
                    {line.text}
                  </p>
                  {line.ttext && (
                    <p className={`text-center mt-1 transition-all duration-300 ${
                      isActive
                        ? "text-purple-200/80 text-sm"
                        : isNear
                        ? "text-zinc-400 text-xs"
                        : "text-zinc-600 text-xs"
                    }`}>
                      {line.ttext}
                    </p>
                  )}
                </div>
              );
            })}
          </div>

          {/* 底部留白 */}
          <div className="h-[35vh]" />
        </div>
      ) : (
        <div className="relative z-10 flex-1 flex items-center justify-center text-zinc-500">
          <div className="text-center">
            <svg className="w-16 h-16 mx-auto mb-4 opacity-30" fill="none" stroke="currentColor" strokeWidth={0.8} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"/>
            </svg>
            <p className="text-sm">暂无歌词</p>
            <p className="text-xs mt-1 opacity-50">此歌曲为纯音乐或暂无歌词信息</p>
          </div>
        </div>
      )}

      {/* 底部控制栏 */}
      <div className="relative z-10 px-4 py-3 bg-black/30 backdrop-blur-md border-t border-white/[0.04]">
        {/* 进度条 */}
        <div className="flex items-center gap-2 mb-2">
          <span className="text-[10px] text-zinc-500 w-10 text-right tabular-nums">{fmt(currentTime)}</span>
          <div onClick={progClick} className="flex-1 h-1 bg-white/[0.06] rounded-full group cursor-pointer hover:h-1.5 transition-all">
            <div className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full relative" style={{ width: `${progress}%` }}>
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full opacity-0 group-hover:opacity-100 shadow-lg" />
            </div>
          </div>
          <span className="text-[10px] text-zinc-500 w-10 tabular-nums">{fmt(duration)}</span>
        </div>

        {/* 控制按钮行 */}
        <div className="flex items-center justify-between">
          {/* 音质选择 */}
          <div ref={qualRef} className="relative w-24">
            <button onClick={() => setQualOpen(!qualOpen)} className="w-full text-left px-2 py-1 rounded text-[10px] bg-white/[0.04] border border-white/[0.05] text-zinc-400 hover:text-white transition-colors truncate">
              {qualityLabels[quality]}
            </button>
            {qualOpen && (
              <div className="absolute bottom-full left-0 mb-1 w-32 py-1 bg-zinc-900/95 backdrop-blur-xl border border-white/10 rounded-lg shadow-2xl z-50">
                {(Object.keys(qualityLabels) as QualityPreset[]).map(q => (
                  <button key={q} onClick={() => { onSetQuality(q); setQualOpen(false); }}
                    className={`w-full text-left px-3 py-1 text-xs ${quality === q ? "text-purple-400" : "text-zinc-400 hover:text-white hover:bg-white/5"}`}>
                    {qualityLabels[q]}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* 播放控制 */}
          <div className="flex items-center gap-6">
            <button onClick={onPlayPrev} className="text-zinc-400 hover:text-white transition-colors">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M6 6h2v12H6zm3.5 6l8.5 6V6z"/></svg>
            </button>
            <button onClick={onTogglePlay} className="w-10 h-10 rounded-full bg-white flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-lg">
              {isPlaying ? (
                <svg className="w-5 h-5 text-black" fill="currentColor" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
              ) : (
                <svg className="w-5 h-5 text-black ml-0.5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
              )}
            </button>
            <button onClick={onPlayNext} className="text-zinc-400 hover:text-white transition-colors">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"/></svg>
            </button>
          </div>

          {/* 音量 */}
          <div className="flex items-center gap-1.5 w-24 justify-end">
            <button onClick={() => onSetVolume(muted ? 0.7 : 0)} className="text-zinc-400 hover:text-white">
              {muted ? (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"/><path strokeLinecap="round" strokeLinejoin="round" d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2"/>
                </svg>
              ) : volume < 0.5 ? (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.536 8.464a5 5 0 010 7.072M12 6.588L5.882 18H3a1 1 0 01-1-1V7a1 1 0 011-1h2.882L12 6.588z"/>
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.536 8.464a5 5 0 010 7.072M12 6.588L5.882 18H3a1 1 0 01-1-1V7a1 1 0 011-1h2.882L12 6.588zM17.657 6.343a9 9 0 010 11.314"/>
                </svg>
              )}
            </button>
            <div onClick={volClick} className="w-12 h-1 bg-white/[0.06] rounded-full group cursor-pointer hover:h-1.5 transition-all">
              <div className="h-full bg-white/30 rounded-full" style={{ width: `${muted ? 0 : volume * 100}%` }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const fmt = (s: number) => {
  const m = Math.floor(s / 60);
  return `${m}:${Math.floor(s % 60).toString().padStart(2, "0")}`;
};
