"use client";

import { useState, useRef, useEffect } from "react";
import { useMusicPlayer } from "@/hooks/useMusicPlayer";
import type { QualityPreset, SongInfo } from "@/lib/music-api";
import { qualityLabels } from "@/lib/music-api";

// ---------- icons ----------
const icons = {
  home: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0a1 1 0 01-1-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 01-1 1" />
    </svg>
  ),
  search: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  ),
  library: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
    </svg>
  ),
  heart: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
    </svg>
  ),
  heartFilled: (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
      <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
    </svg>
  ),
  playlist: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
    </svg>
  ),
  play: (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
      <path d="M8 5v14l11-7z" />
    </svg>
  ),
  pause: (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
      <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
    </svg>
  ),
  prev: (
    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
      <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z" />
    </svg>
  ),
  next: (
    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
      <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" />
    </svg>
  ),
  shuffle: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
    </svg>
  ),
  repeat: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
    </svg>
  ),
  volume: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.536 8.464a5 5 0 010 7.072M12 6.588L5.882 18H3a1 1 0 01-1-1V7a1 1 0 011-1h2.882L12 6.588zM17.657 6.343a9 9 0 010 11.314" />
    </svg>
  ),
  volumeMute: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
    </svg>
  ),
  add: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
    </svg>
  ),
  more: (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
    </svg>
  ),
  clock: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  quality: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
    </svg>
  ),
  eq: (
    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
      <rect x="2" y="14" width="4" height="8" rx="1" />
      <rect x="10" y="8" width="4" height="14" rx="1" />
      <rect x="18" y="2" width="4" height="20" rx="1" />
    </svg>
  ),
};

// ---------- data ----------
const playlists = [
  { id: 1, name: "今日推荐", desc: "根据你的口味每日更新", color: "from-indigo-600 to-purple-600" },
  { id: 2, name: "深夜电子", desc: "迷幻电子，沉浸律动", color: "from-emerald-600 to-teal-600" },
  { id: 3, name: "华语流行", desc: "最热门的中文金曲", color: "from-rose-600 to-pink-600" },
  { id: 4, name: "爵士咖啡馆", desc: "慵懒午后，一杯咖啡", color: "from-amber-600 to-orange-600" },
  { id: 5, name: "Lo-Fi 学习", desc: "专注学习的完美伴侣", color: "from-cyan-600 to-blue-600" },
  { id: 6, name: "摇滚经典", desc: "永不过时的摇滚力量", color: "from-red-600 to-rose-600" },
  { id: 7, name: "K-Pop 热单", desc: "最燃的韩流热门曲", color: "from-fuchsia-600 to-purple-600" },
  { id: 8, name: "古典时光", desc: "穿越百年的优雅旋律", color: "from-stone-600 to-neutral-600" },
];

const hotAlbums = [
  { title: "Midnight Echoes", artist: "Luna Wave", year: "2026", cover: "bg-gradient-to-br from-indigo-500 to-purple-700" },
  { title: "Neon Nights", artist: "Synth Collective", year: "2026", cover: "bg-gradient-to-br from-pink-500 to-rose-700" },
  { title: "Desert Bloom", artist: "Aria Chen", year: "2025", cover: "bg-gradient-to-br from-amber-500 to-orange-700" },
  { title: "Quantum Drift", artist: "Echo Lab", year: "2026", cover: "bg-gradient-to-br from-cyan-500 to-blue-700" },
  { title: "Velvet Soul", artist: "Marcus J", year: "2025", cover: "bg-gradient-to-br from-emerald-500 to-teal-700" },
];



// ---------- helpers ----------
const formatTime = (s: number) => {
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, "0")}`;
};

// ---------- Quality Selector ----------
function QualitySelector({
  current,
  onChange,
}: {
  current: QualityPreset;
  onChange: (q: QualityPreset) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const qualities: QualityPreset[] = ["lofi", "standard", "high", "lossless"];

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-white/5 hover:bg-white/10 border border-white/10 transition-colors"
        title="切换音质"
      >
        <span className="text-purple-400">{icons.eq}</span>
        <span>{qualityLabels[current]}</span>
        <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && (
        <div className="absolute bottom-full right-0 mb-2 w-40 py-1 bg-gray-900/95 backdrop-blur-xl border border-white/10 rounded-lg shadow-xl z-50">
          {qualities.map((q) => (
            <button
              key={q}
              onClick={() => {
                onChange(q);
                setOpen(false);
              }}
              className={`w-full flex items-center gap-2 px-3 py-1.5 text-sm transition-colors ${
                current === q
                  ? "text-purple-400 bg-purple-400/10"
                  : "text-gray-300 hover:bg-white/5 hover:text-white"
              }`}
            >
              {current === q && (
                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                </svg>
              )}
              <span className={current !== q ? "ml-5" : ""}>{qualityLabels[q]}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ---------- Visualizer Bars ----------
function Visualizer({ isPlaying }: { isPlaying: boolean }) {
  const [heights, setHeights] = useState([3, 3, 3, 3, 3]);

  useEffect(() => {
    if (!isPlaying) {
      setHeights([2, 2, 2, 2, 2]);
      return;
    }
    const interval = setInterval(() => {
      setHeights(
        Array.from({ length: 5 }, () => Math.floor(Math.random() * 14) + 2)
      );
    }, 150);
    return () => clearInterval(interval);
  }, [isPlaying]);

  return (
    <div className="flex items-end gap-[2px] h-4">
      {heights.map((h, i) => (
        <div
          key={i}
          className="w-[3px] bg-purple-400 rounded-full transition-all duration-150"
          style={{ height: `${h}px` }}
        />
      ))}
    </div>
  );
}

// ========== MAIN PAGE ==========
export default function Home() {
  const player = useMusicPlayer();
  const [liked, setLiked] = useState<number[]>([]);
  const [volume, setVolumeState] = useState(0.7);
  const [muted, setMuted] = useState(false);
  const progressRef = useRef<HTMLDivElement>(null);

  const toggleLike = (id: number) => {
    setLiked((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const handleVolumeChange = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const v = Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width));
    setVolumeState(v);
    setMuted(false);
    player.setVolume(v);
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width));
    const time = ratio * player.duration;
    player.seekTo(time);
  };

  const progressPercent =
    player.duration > 0 ? (player.currentTime / player.duration) * 100 : 0;

  const toggleMute = () => {
    if (muted) {
      player.setVolume(volume || 0.7);
      setMuted(false);
    } else {
      player.setVolume(0);
      setMuted(true);
    }
  };

  return (
    <div className="flex h-screen text-white overflow-hidden">
      {/* =============== SIDEBAR =============== */}
      <aside className="w-64 flex-shrink-0 flex flex-col bg-black/30 backdrop-blur-xl border-r border-white/5">
        <div className="px-6 pt-6 pb-4">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            WaveFlow
          </h1>
        </div>
        <nav className="px-3 space-y-0.5">
          {[
            { icon: icons.home, label: "首页", active: true },
            { icon: icons.search, label: "探索", active: false },
            { icon: icons.library, label: "音乐库", active: false },
          ].map((item) => (
            <button
              key={item.label}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                item.active ? "bg-white/10 text-white" : "text-gray-300 hover:bg-white/5 hover:text-white"
              }`}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </nav>
        <div className="px-6 mt-6">
          <button className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-gray-300 hover:bg-white/5 hover:text-white transition-colors">
            {icons.heart} 我喜欢
          </button>
        </div>
        <div className="mx-6 my-4 border-t border-white/5" />
        <div className="flex-1 overflow-y-auto px-3 space-y-0.5">
          <p className="px-4 py-1 text-xs font-semibold text-gray-400 uppercase tracking-wider">
            我的歌单
          </p>
          {["深夜电台", "运动能量", "通勤路上", "放松午后", "游戏BGM", "读书时光"].map(
            (name) => (
              <button
                key={name}
                className="w-full flex items-center gap-3 px-4 py-2 rounded-lg text-sm text-gray-300 hover:bg-white/5 hover:text-white transition-colors"
              >
                {icons.playlist} {name}
              </button>
            )
          )}
        </div>
        <div className="p-3 border-t border-white/5">
          <button className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm text-gray-300 hover:bg-white/5 hover:text-white transition-colors">
            {icons.add} 新建歌单
          </button>
        </div>
      </aside>

      {/* =============== MAIN =============== */}
      <main className="flex-1 flex flex-col min-w-0">
        <header className="flex items-center justify-between px-8 py-4 bg-black/20 backdrop-blur-md border-b border-white/5">
          <div className="relative">
            <input
              type="text"
              placeholder="搜索歌曲、专辑、艺人..."
              className="w-80 px-4 py-2 pl-10 bg-white/5 border border-white/10 rounded-full text-sm text-white placeholder-gray-400 focus:outline-none focus:border-purple-400/50 focus:bg-white/10 transition-all"
            />
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">{icons.search}</span>
          </div>
          <div className="flex items-center gap-4">
            <QualitySelector current={player.quality} onChange={player.setQuality} />
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-sm font-bold ring-2 ring-white/20">
              U
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto">
          <div className="px-8 pt-6 pb-8 space-y-10">
            {/* Hero */}
            <section className="relative overflow-hidden rounded-2xl p-8 bg-gradient-to-r from-purple-600/30 via-indigo-600/30 to-pink-600/30 border border-white/5 backdrop-blur-sm">
              <div className="relative z-10">
                {player.loading ? (
                  <div className="space-y-3">
                    <div className="h-5 w-24 bg-white/10 rounded-full animate-pulse" />
                    <div className="h-7 w-64 bg-white/10 rounded animate-pulse" />
                    <div className="h-4 w-40 bg-white/10 rounded animate-pulse" />
                  </div>
                ) : player.currentTrack ? (
                  <>
                    <span className="inline-block px-3 py-1 text-xs font-medium bg-purple-400/20 text-purple-200 rounded-full mb-4">
                      {player.usingFallback ? "🎹 合成音乐" : "🎵 正在播放"}
                    </span>
                    <h2 className="text-2xl font-bold mb-1 truncate">{player.currentTrack.name}</h2>
                    <p className="text-gray-300 mb-2">{player.currentTrack.artists?.join(" / ")} · {player.currentTrack.album}</p>
                    {player.error && (
                      <p className="text-amber-400 text-xs mb-3">⚠ {player.error}</p>
                    )}
                    <div className="flex flex-wrap gap-3">
                      <button
                        onClick={player.togglePlay}
                        disabled={!player.isReady}
                        className="flex items-center gap-2 px-6 py-2.5 bg-purple-500 hover:bg-purple-400 disabled:opacity-50 rounded-full text-sm font-semibold transition-colors shadow-lg shadow-purple-500/25"
                      >
                        {player.isPlaying ? icons.pause : icons.play}
                        {player.isPlaying ? "暂停" : "播放"}
                      </button>
                      <button
                        onClick={player.playNext}
                        className="px-4 py-2.5 bg-white/10 hover:bg-white/20 rounded-full text-sm font-medium transition-colors"
                      >
                        下一首
                      </button>
                    </div>
                  </>
                ) : null}
              </div>
              <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl" />
              <div className="absolute bottom-0 right-32 w-40 h-40 bg-pink-500/20 rounded-full blur-3xl" />
              {/* Now playing EQ indicator */}
              <div className="absolute top-6 right-6">
                <Visualizer isPlaying={player.isPlaying} />
              </div>
            </section>

            {/* Featured Playlists */}
            <section>
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-xl font-bold">精选歌单</h3>
                <button className="text-sm text-gray-400 hover:text-white transition-colors">查看全部 →</button>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {playlists.map((pl) => (
                  <div
                    key={pl.id}
                    className="group cursor-pointer p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/10 transition-all"
                  >
                    <div className={`w-full aspect-square rounded-lg bg-gradient-to-br ${pl.color} mb-3 flex items-center justify-center shadow-lg relative overflow-hidden`}>
                      <span className="text-4xl font-bold text-white/60 select-none">{pl.name[0]}</span>
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20">
                        <div
                          className="w-12 h-12 rounded-full bg-purple-500 shadow-lg flex items-center justify-center transform translate-y-2 group-hover:translate-y-0 transition-transform"
                          onClick={(e) => {
                            e.stopPropagation();
                            player.play(0);
                          }}
                        >
                          {icons.play}
                        </div>
                      </div>
                    </div>
                    <h4 className="font-semibold text-sm mb-1 truncate">{pl.name}</h4>
                    <p className="text-xs text-gray-400 truncate">{pl.desc}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* Hot Albums */}
            <section>
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-xl font-bold">热门专辑</h3>
                <button className="text-sm text-gray-400 hover:text-white transition-colors">查看全部 →</button>
              </div>
              <div className="flex gap-4 overflow-x-auto pb-2 -mx-2 px-2">
                {hotAlbums.map((album, i) => (
                  <div key={i} className="flex-shrink-0 w-44 group cursor-pointer p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/10 transition-all">
                    <div className={`w-full aspect-square rounded-lg ${album.cover} mb-3 shadow-lg flex items-end p-3 relative overflow-hidden`}>
                      <span className="text-white/40 text-xs font-mono">{album.year}</span>
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20">
                        <div
                          className="w-10 h-10 rounded-full bg-purple-500 shadow-lg flex items-center justify-center"
                          onClick={(e) => {
                            e.stopPropagation();
                            player.play(i);
                          }}
                        >
                          {icons.play}
                        </div>
                      </div>
                    </div>
                    <h4 className="font-semibold text-sm truncate">{album.title}</h4>
                    <p className="text-xs text-gray-400 truncate">{album.artist}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* Top Songs */}
            <section>
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-xl font-bold">{player.usingFallback ? "合成曲目" : "热门歌曲"}</h3>
                <span className="text-xs text-gray-400">{player.playlist.length} 首</span>
              </div>
              {player.loading ? (
                <div className="bg-white/5 rounded-xl border border-white/5 p-6 text-center text-gray-400">
                  <div className="animate-spin w-6 h-6 border-2 border-purple-400 border-t-transparent rounded-full mx-auto mb-2" />
                  <p className="text-sm">正在加载歌曲列表...</p>
                </div>
              ) : (
                <div className="bg-white/5 rounded-xl border border-white/5 overflow-hidden">
                  <div className="grid grid-cols-[40px_1fr_1fr_80px_40px] gap-4 px-5 py-3 text-xs font-semibold text-gray-400 border-b border-white/5 uppercase tracking-wider">
                    <span>#</span>
                    <span>歌曲</span>
                    <span>专辑</span>
                    <span className="flex items-center gap-1">{icons.clock}</span>
                    <span />
                  </div>
                  {player.playlist.map((song, i) => (
                    <div
                      key={song.id}
                      onClick={() => player.play(i)}
                      className={`grid grid-cols-[40px_1fr_1fr_80px_40px] gap-4 px-5 py-3 text-sm items-center hover:bg-white/5 cursor-pointer transition-colors group ${
                        i !== player.playlist.length - 1 ? "border-b border-white/[0.03]" : ""
                      } ${player.currentTrackIndex === i ? "bg-white/5" : ""}`}
                    >
                      <span className="text-gray-400 text-center group-hover:hidden">
                        {player.currentTrackIndex === i && player.isPlaying ? (
                          <Visualizer isPlaying={true} />
                        ) : (
                          i + 1
                        )}
                      </span>
                      <span className="hidden group-hover:flex text-center justify-center">
                        {icons.play}
                      </span>
                      <div className="min-w-0">
                        <p className={`font-medium truncate ${player.currentTrackIndex === i ? "text-purple-400" : "text-white"}`}>
                          {song.name}
                        </p>
                        <p className="text-xs text-gray-400 truncate">{song.artists?.join(" / ")}</p>
                      </div>
                      <p className="text-gray-400 truncate">{song.album}</p>
                      <span className="text-gray-400 tabular-nums">{formatTime(song.duration)}</span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleLike(song.id);
                        }}
                        className={`transition-colors ${liked.includes(song.id) ? "text-pink-400" : "text-gray-500 hover:text-gray-300"}`}
                      >
                        {liked.includes(song.id) ? icons.heartFilled : icons.heart}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </section>

            <div className="h-24" />
          </div>
        </div>
      </main>

      {/* =============== BOTTOM PLAYER =============== */}
      <div className="fixed bottom-0 left-0 right-0 h-20 bg-black/40 backdrop-blur-xl border-t border-white/5 z-50">
        <div className="h-full max-w-full px-4 flex items-center gap-4">
          {/* Track info */}
          <div className="flex items-center gap-3 min-w-[240px] max-w-[280px]">
            {player.currentTrack?.albumPic ? (
              <img
                src={player.currentTrack.albumPic}
                alt=""
                className="w-12 h-12 rounded-lg object-cover flex-shrink-0 shadow-lg"
              />
            ) : (
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center flex-shrink-0 shadow-lg">
                <span className="text-white/60 text-lg">♪</span>
              </div>
            )}
            <div className="min-w-0">
              <p className="text-sm font-semibold text-white truncate">
                {player.currentTrack?.name || "未选择歌曲"}
              </p>
              <p className="text-xs text-gray-400 truncate">
                {player.currentTrack?.artists?.join(" / ") || ""}
              </p>
            </div>
            {player.currentTrack && (
              <button
                onClick={() => toggleLike(player.currentTrack!.id)}
                className={`flex-shrink-0 transition-colors ${liked.includes(player.currentTrack.id) ? "text-pink-400" : "text-gray-400 hover:text-white"}`}
              >
                {liked.includes(player.currentTrack.id) ? icons.heartFilled : icons.heart}
              </button>
            )}
          </div>

          {/* Player controls + progress */}
          <div className="flex-1 flex flex-col items-center justify-center gap-1 max-w-2xl mx-auto">
            <div className="flex items-center gap-4">
              <button className="text-gray-400 hover:text-white transition-colors">{icons.shuffle}</button>
              <button onClick={player.playPrev} className="text-gray-300 hover:text-white transition-colors">
                {icons.prev}
              </button>
              <button
                onClick={player.togglePlay}
                disabled={!player.isReady}
                className="w-9 h-9 rounded-full bg-white text-black flex items-center justify-center hover:scale-105 disabled:opacity-50 transition-transform"
              >
                {player.isPlaying ? icons.pause : icons.play}
              </button>
              <button onClick={player.playNext} className="text-gray-300 hover:text-white transition-colors">
                {icons.next}
              </button>
              <button className="text-gray-400 hover:text-white transition-colors">{icons.repeat}</button>
            </div>
            {/* Progress bar */}
            <div className="flex items-center gap-3 w-full">
              <span className="text-xs text-gray-400 w-10 text-right tabular-nums">
                {formatTime(player.currentTime)}
              </span>
              <div
                ref={progressRef}
                onClick={handleProgressClick}
                className="flex-1 h-1 bg-white/10 rounded-full group cursor-pointer relative"
              >
                <div
                  className="h-full bg-purple-400 rounded-full relative transition-all duration-100"
                  style={{ width: `${progressPercent}%` }}
                >
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow" />
                </div>
              </div>
              <span className="text-xs text-gray-400 w-10 tabular-nums">
                {formatTime(player.duration)}
              </span>
            </div>
          </div>

          {/* Volume + Quality */}
          <div className="flex items-center gap-3 min-w-[240px] justify-end">
            <QualitySelector current={player.quality} onChange={player.setQuality} />
            <button onClick={toggleMute} className="text-gray-400 hover:text-white transition-colors">
              {muted || volume === 0 ? icons.volumeMute : icons.volume}
            </button>
            <div
              onClick={handleVolumeChange}
              className="w-24 h-1 bg-white/10 rounded-full group cursor-pointer relative"
            >
              <div
                className="h-full bg-white/60 rounded-full"
                style={{ width: `${muted ? 0 : volume * 100}%` }}
              >
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
