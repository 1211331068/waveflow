"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useMusicPlayer } from "@/hooks/useMusicPlayer";
import type { QualityPreset } from "@/lib/music-api";
import { qualityLabels, hotPlaylists, discoverSearches } from "@/lib/music-api";

// ─────── icons (kept as inline SVGs) ───────
const I = {
  search: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>,
  home: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0a1 1 0 01-1-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 01-1 1" /></svg>,
  searchTab: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>,
  library: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>,
  heart: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>,
  heartFilled: <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>,
  play: <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>,
  playSm: <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>,
  pause: <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" /></svg>,
  prev: <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M6 6h2v12H6zm3.5 6l8.5 6V6z" /></svg>,
  next: <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" /></svg>,
  clock: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
  volume: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.536 8.464a5 5 0 010 7.072M12 6.588L5.882 18H3a1 1 0 01-1-1V7a1 1 0 011-1h2.882L12 6.588zM17.657 6.343a9 9 0 010 11.314" /></svg>,
  volumeMute: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15zM17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" /></svg>,
  eq: <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><rect x="2" y="14" width="4" height="8" rx="1" /><rect x="10" y="8" width="4" height="14" rx="1" /><rect x="18" y="2" width="4" height="20" rx="1" /></svg>,
  spinner: <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>,
};

// ─────── helpers ───────
const fmt = (s: number) => {
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, "0")}`;
};

// ─────── Quality Selector ───────
function QualitySelector({ current, onChange }: { current: QualityPreset; onChange: (q: QualityPreset) => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);
  const qs: QualityPreset[] = ["lofi", "standard", "high", "lossless"];
  return (
    <div ref={ref} className="relative">
      <button onClick={() => setOpen(!open)} className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-white/5 hover:bg-white/10 border border-white/10 transition-colors">
        <span className="text-purple-400">{I.eq}</span><span>{qualityLabels[current]}</span>
      </button>
      {open && (
        <div className="absolute bottom-full right-0 mb-2 w-40 py-1 bg-gray-900/95 backdrop-blur-xl border border-white/10 rounded-lg shadow-xl z-50">
          {qs.map((q) => (
            <button key={q} onClick={() => { onChange(q); setOpen(false); }} className={`w-full flex items-center gap-2 px-3 py-1.5 text-sm ${current === q ? "text-purple-400 bg-purple-400/10" : "text-gray-300 hover:bg-white/5"}`}>
              {current === q && <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" /></svg>}
              <span className={current !== q ? "ml-5" : ""}>{qualityLabels[q]}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─────── Album Art (with fallback) ───────
function AlbumArt({ src, name, size = "md" }: { src: string; name: string; size?: "sm" | "md" | "lg" }) {
  const sizes = { sm: "w-10 h-10", md: "w-12 h-12", lg: "w-48 h-48" };
  const [err, setErr] = useState(false);
  if (!src || err) {
    const colors = ["from-purple-500 to-pink-600", "from-indigo-500 to-purple-600", "from-cyan-500 to-blue-600", "from-emerald-500 to-teal-600", "from-amber-500 to-orange-600", "from-rose-500 to-red-600"];
    const c = colors[name.charCodeAt(0) % colors.length];
    return <div className={`${sizes[size]} rounded-lg bg-gradient-to-br ${c} flex items-center justify-center flex-shrink-0`}><span className="text-white/50 font-bold text-lg">{name[0]}</span></div>;
  }
  return <img src={src} alt={name} className={`${sizes[size]} rounded-lg object-cover flex-shrink-0 shadow-lg`} onError={() => setErr(true)} />;
}

// ─────── Song Row ───────
function SongRow({ song, index, isActive, isPlaying, onPlay, onLike, liked }: {
  song: any; index: number; isActive: boolean; isPlaying: boolean; onPlay: () => void; onLike: () => void; liked: boolean;
}) {
  return (
    <div onClick={onPlay} className={`grid grid-cols-[36px_44px_1fr_1fr_60px_36px] gap-3 px-4 py-2.5 text-sm items-center hover:bg-white/5 cursor-pointer transition-colors group rounded-lg ${isActive ? "bg-white/5" : ""} `}>
      <span className="text-gray-500 text-center text-xs tabular-nums group-hover:hidden">{isActive && isPlaying ? <EQBars /> : index + 1}</span>
      <span className="hidden group-hover:flex justify-center">{I.playSm}</span>
      <AlbumArt src={song.albumPic} name={song.name} size="sm" />
      <div className="min-w-0">
        <p className={`font-medium truncate text-sm ${isActive ? "text-purple-400" : "text-white"}`}>{song.name}</p>
        <p className="text-xs text-gray-500 truncate">{song.artists?.join(" / ")}</p>
      </div>
      <p className="text-gray-500 truncate text-xs">{song.album}</p>
      <span className="text-gray-500 text-xs tabular-nums">{fmt(song.duration)}</span>
      <button onClick={(e) => { e.stopPropagation(); onLike(); }} className={`${liked ? "text-pink-400" : "text-gray-600 hover:text-gray-300"}`}>{liked ? I.heartFilled : I.heart}</button>
    </div>
  );
}

// ─────── EQ Bars ───────
function EQBars() {
  const [h, setH] = useState([3, 3, 3, 3]);
  useEffect(() => {
    const i = setInterval(() => setH(Array.from({ length: 4 }, () => Math.floor(Math.random() * 10) + 2)), 120);
    return () => clearInterval(i);
  }, []);
  return <div className="flex items-end gap-[2px] h-3">{h.map((v, i) => <div key={i} className="w-[2px] bg-purple-400 rounded-full" style={{ height: v }} />)}</div>;
}

// ══════════════════════════════════════
// MAIN APP
// ══════════════════════════════════════
export default function Home() {
  const player = useMusicPlayer();
  const [liked, setLiked] = useState<number[]>([]);
  const [volume, setVolumeState] = useState(0.7);
  const [muted, setMuted] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [view, setView] = useState<"home" | "search" | "library">("home");
  const progressRef = useRef<HTMLDivElement>(null);
  const searchTimer = useRef<NodeJS.Timeout | null>(null);

  const toggleLike = (id: number) => setLiked((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]));

  // 搜索防抖
  const handleSearchInput = useCallback((val: string) => {
    setSearchText(val);
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => player.doSearch(val), 300);
  }, [player]);

  const handleSearchKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && searchText.trim()) {
      setView("search");
      player.searchAndPlay(searchText.trim());
    }
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    player.seekTo(((e.clientX - rect.left) / rect.width) * player.duration);
  };

  const handleVolumeClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const v = Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width));
    setVolumeState(v); setMuted(false); player.setVolume(v);
  };

  const toggleMute = () => {
    if (muted) { player.setVolume(volume || 0.7); setMuted(false); }
    else { player.setVolume(0); setMuted(true); }
  };

  const progress = player.duration > 0 ? (player.currentTime / player.duration) * 100 : 0;

  return (
    <div className="flex h-screen text-white overflow-hidden bg-[#0a0a0f]">
      {/* ─── SIDEBAR ─── */}
      <aside className="w-60 flex-shrink-0 flex flex-col bg-black/40 backdrop-blur-xl border-r border-white/5">
        <div className="px-5 pt-5 pb-4">
          <h1 className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">🎵 WaveFlow</h1>
        </div>
        <nav className="px-2 space-y-0.5">
          {[
            { icon: I.home, label: "发现", key: "home" as const },
            { icon: I.searchTab, label: "搜索", key: "search" as const },
            { icon: I.library, label: "音乐库", key: "library" as const },
          ].map((item) => (
            <button key={item.key} onClick={() => setView(item.key)}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${view === item.key ? "bg-white/10 text-white" : "text-gray-400 hover:bg-white/5 hover:text-white"}`}>
              {item.icon}{item.label}
            </button>
          ))}
        </nav>
        <div className="mx-4 my-3 border-t border-white/5" />
        <div className="flex-1 overflow-y-auto px-2 space-y-0.5">
          <p className="px-4 py-1 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">推荐歌单</p>
          {hotPlaylists.slice(0, 6).map((pl) => (
            <button key={pl.id} onClick={() => { setView("library"); player.loadPlaylist(pl.id); }}
              className="w-full flex items-center gap-3 px-4 py-2 rounded-lg text-sm text-gray-400 hover:bg-white/5 hover:text-white transition-colors truncate">
              <span className="text-xs">🎵</span> {pl.name}
            </button>
          ))}
        </div>
      </aside>

      {/* ─── MAIN ─── */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Header + Search */}
        <header className="flex items-center gap-4 px-6 py-3 bg-black/20 backdrop-blur-md border-b border-white/5">
          <div className="relative flex-1 max-w-md">
            <input type="text" value={searchText} onChange={(e) => handleSearchInput(e.target.value)} onKeyDown={handleSearchKeyDown}
              placeholder="搜索歌曲、艺人、专辑..." className="w-full px-4 py-2 pl-10 bg-white/5 border border-white/10 rounded-full text-sm text-white placeholder-gray-500 focus:outline-none focus:border-purple-400/50 transition-all" />
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">{I.search}</span>
            {player.searching && <span className="absolute right-3 top-1/2 -translate-y-1/2 text-purple-400">{I.spinner}</span>}
          </div>
          <QualitySelector current={player.quality} onChange={player.setQuality} />
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-xs font-bold">U</div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto">
          <div className="px-6 py-5 space-y-8">

            {/* ─── HOME VIEW ─── */}
            {view === "home" && (
              <>
                {/* Now Playing Banner */}
                {player.currentTrack && (
                  <section className="relative overflow-hidden rounded-2xl p-6 bg-gradient-to-r from-purple-600/20 via-indigo-600/20 to-pink-600/20 border border-white/5 backdrop-blur-sm">
                    <div className="flex items-center gap-5 relative z-10">
                      <AlbumArt src={player.currentTrack.albumPic} name={player.currentTrack.name} size="lg" />
                      <div className="min-w-0">
                        <span className="inline-block px-2.5 py-0.5 text-xs font-medium bg-purple-400/20 text-purple-200 rounded-full mb-2">🎵 正在播放</span>
                        <h2 className="text-xl font-bold mb-1 truncate">{player.currentTrack.name}</h2>
                        <p className="text-gray-400 text-sm mb-3">{player.currentTrack.artists?.join(" / ")} · {player.currentTrack.album}</p>
                        {player.error && <p className="text-amber-400 text-xs mb-3">{player.error}</p>}
                        <div className="flex gap-2">
                          <button onClick={player.togglePlay} className="flex items-center gap-2 px-5 py-2 bg-purple-500 hover:bg-purple-400 rounded-full text-sm font-semibold transition-colors">
                            {player.isPlaying ? I.pause : I.play} {player.isPlaying ? "暂停" : "播放"}
                          </button>
                          <button onClick={player.playNext} className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-full text-sm transition-colors">下一首</button>
                        </div>
                      </div>
                    </div>
                  </section>
                )}

                {/* Discover Artists */}
                <section>
                  <h3 className="text-lg font-bold mb-4">热门艺人</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {discoverSearches.map((item) => (
                      <button key={item.keyword} onClick={() => { setView("library"); player.searchAndPlay(item.keyword); }}
                        className={`p-4 rounded-xl bg-gradient-to-br ${item.color} hover:scale-[1.02] transition-transform shadow-lg text-left`}>
                        <p className="text-white font-semibold text-sm">{item.label}</p>
                      </button>
                    ))}
                  </div>
                </section>

                {/* Playlist Grid */}
                <section>
                  <h3 className="text-lg font-bold mb-4">推荐歌单</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {hotPlaylists.map((pl) => (
                      <button key={pl.id} onClick={() => { setView("library"); player.loadPlaylist(pl.id); }}
                        className="group p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/10 transition-all text-left">
                        <div className="w-full aspect-square rounded-lg bg-gradient-to-br from-indigo-500 to-purple-700 mb-3 flex items-center justify-center relative overflow-hidden">
                          <span className="text-5xl font-bold text-white/20">♫</span>
                          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/30">
                            <div className="w-10 h-10 rounded-full bg-purple-500 flex items-center justify-center">{I.play}</div>
                          </div>
                        </div>
                        <h4 className="font-semibold text-sm truncate">{pl.name}</h4>
                        <p className="text-xs text-gray-500 truncate">{pl.description} · {pl.trackCount}首</p>
                      </button>
                    ))}
                  </div>
                </section>
              </>
            )}

            {/* ─── SEARCH VIEW ─── */}
            {view === "search" && (
              <section>
                <h3 className="text-lg font-bold mb-4">
                  {searchText ? `搜索: "${searchText}"` : "请输入关键词搜索"}
                </h3>
                {player.searching ? (
                  <div className="text-center py-12 text-gray-500"><div className="mx-auto mb-3">{I.spinner}</div><p>搜索中...</p></div>
                ) : player.searchResults.length > 0 ? (
                  <div className="space-y-1">
                    {player.searchResults.map((song, i) => (
                      <SongRow key={song.id} song={song} index={i}
                        isActive={player.currentTrack?.id === song.id}
                        isPlaying={player.isPlaying}
                        onPlay={() => { const idx = player.playlist.findIndex(s => s.id === song.id);
                          if (idx >= 0) player.play(idx);
                          else { player.searchAndPlay(searchText); setTimeout(() => { const ni = player.playlist.findIndex(s => s.id === song.id); if (ni >= 0) player.play(ni); }, 500); }
                        }}
                        onLike={() => toggleLike(song.id)}
                        liked={liked.includes(song.id)}
                      />
                    ))}
                  </div>
                ) : searchText ? (
                  <div className="text-center py-12 text-gray-500"><p>未找到相关结果</p></div>
                ) : (
                  <div className="grid grid-cols-2 gap-3">
                    {discoverSearches.map((item) => (
                      <button key={item.keyword} onClick={() => { handleSearchInput(item.keyword); setView("library"); player.searchAndPlay(item.keyword); }}
                        className={`p-4 rounded-xl bg-gradient-to-br ${item.color} text-left hover:scale-[1.02] transition-transform`}>
                        <p className="text-white font-semibold">{item.label}</p>
                      </button>
                    ))}
                  </div>
                )}
              </section>
            )}

            {/* ─── LIBRARY / PLAYLIST VIEW ─── */}
            {view === "library" && (
              <section>
                {player.loading ? (
                  <div className="text-center py-16 text-gray-500"><div className="mx-auto mb-3">{I.spinner}</div><p>加载歌单中...</p></div>
                ) : player.playlist.length > 0 ? (
                  <>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-bold">当前播放列表</h3>
                      <span className="text-xs text-gray-500">{player.playlist.length} 首歌曲</span>
                    </div>
                    <div className="space-y-1">
                      {player.playlist.map((song, i) => (
                        <SongRow key={song.id} song={song} index={i}
                          isActive={player.currentTrack?.id === song.id}
                          isPlaying={player.isPlaying}
                          onPlay={() => player.play(i)}
                          onLike={() => toggleLike(song.id)}
                          liked={liked.includes(song.id)}
                        />
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="text-center py-16 text-gray-500">
                    <p className="text-4xl mb-3">🎵</p>
                    <p>暂无歌曲，请搜索或选择歌单</p>
                  </div>
                )}
              </section>
            )}

            <div className="h-24" />
          </div>
        </div>
      </main>

      {/* ─── BOTTOM PLAYER BAR ─── */}
      <div className="fixed bottom-0 left-0 right-0 h-20 bg-black/50 backdrop-blur-xl border-t border-white/5 z-50">
        <div className="h-full px-4 flex items-center gap-4">
          {/* Track Info */}
          <div className="flex items-center gap-3 min-w-[220px] max-w-[280px]">
            {player.currentTrack ? (
              <AlbumArt src={player.currentTrack.albumPic} name={player.currentTrack.name} size="sm" />
            ) : (
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center flex-shrink-0"><span className="text-white/40">♪</span></div>
            )}
            <div className="min-w-0">
              <p className="text-sm font-semibold truncate">{player.currentTrack?.name || "未选择歌曲"}</p>
              <p className="text-xs text-gray-500 truncate">{player.currentTrack?.artists?.join(" / ") || ""}</p>
            </div>
            {player.currentTrack && (
              <button onClick={() => toggleLike(player.currentTrack!.id)} className={`flex-shrink-0 ${liked.includes(player.currentTrack.id) ? "text-pink-400" : "text-gray-500 hover:text-gray-300"}`}>{liked.includes(player.currentTrack.id) ? I.heartFilled : I.heart}</button>
            )}
          </div>

          {/* Controls + Progress */}
          <div className="flex-1 flex flex-col items-center gap-1 max-w-xl mx-auto">
            <div className="flex items-center gap-5">
              <button onClick={player.playPrev} className="text-gray-400 hover:text-white transition-colors">{I.prev}</button>
              <button onClick={player.togglePlay} className="w-9 h-9 rounded-full bg-white text-black flex items-center justify-center hover:scale-105 transition-transform">{player.isPlaying ? I.pause : I.play}</button>
              <button onClick={player.playNext} className="text-gray-400 hover:text-white transition-colors">{I.next}</button>
            </div>
            <div className="flex items-center gap-2 w-full">
              <span className="text-[10px] text-gray-500 w-9 text-right tabular-nums">{fmt(player.currentTime)}</span>
              <div ref={progressRef} onClick={handleProgressClick} className="flex-1 h-1 bg-white/10 rounded-full group cursor-pointer"><div className="h-full bg-purple-400 rounded-full relative" style={{ width: `${progress}%` }}><div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full opacity-0 group-hover:opacity-100 shadow" /></div></div>
              <span className="text-[10px] text-gray-500 w-9 tabular-nums">{fmt(player.duration)}</span>
            </div>
          </div>

          {/* Volume */}
          <div className="flex items-center gap-2 min-w-[180px] justify-end">
            <QualitySelector current={player.quality} onChange={player.setQuality} />
            <button onClick={toggleMute} className="text-gray-400 hover:text-white">{muted || volume === 0 ? I.volumeMute : I.volume}</button>
            <div onClick={handleVolumeClick} className="w-20 h-1 bg-white/10 rounded-full group cursor-pointer"><div className="h-full bg-white/50 rounded-full" style={{ width: `${muted ? 0 : volume * 100}%` }} /></div>
          </div>
        </div>
      </div>
    </div>
  );
}
