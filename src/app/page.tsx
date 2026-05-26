"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useMusicPlayer } from "@/hooks/useMusicPlayer";
import type { QualityPreset } from "@/lib/music-api";
import { qualityLabels, hotPlaylists, discoverSearches } from "@/lib/music-api";

// ═══ SVG Icons ═══
const Icon = {
  play: <path d="M8 5v14l11-7z" />,
  pause: <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />,
  prev: <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z" />,
  next: <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" />,
  search: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />,
  home: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0a1 1 0 01-1-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 01-1 1" />,
  explore: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />,
  library: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />,
  heart: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />,
  heartFill: <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />,
  clock: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />,
  music: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />,
};

function Svg({ d, className = "w-5 h-5", fill = "none", stroke = "currentColor" }: any) {
  return <svg className={className} fill={fill} stroke={stroke} viewBox="0 0 24 24">{d}</svg>;
}

// ═══ Helpers ═══
const fmt = (s: number) => { const m = Math.floor(s / 60); return `${m}:${Math.floor(s % 60).toString().padStart(2, "0")}`; };
const greet = () => { const h = new Date().getHours(); if (h < 6) return "夜深了"; if (h < 12) return "早上好"; if (h < 18) return "下午好"; return "晚上好"; };

// ═══ Album Cover Component ═══
function Cover({ src, name, size = "md", round = false }: { src: string; name: string; size?: "sm"|"md"|"lg"|"xl"; round?: boolean }) {
  const [err, setErr] = useState(false);
  const sz = { sm: "w-10 h-10", md: "w-12 h-12", lg: "w-40 h-40", xl: "w-56 h-56" }[size];
  const rd = round ? "rounded-full" : "rounded-xl";
  if (!src || err) {
    const c = ["from-violet-600 to-purple-700","from-cyan-600 to-blue-700","from-pink-600 to-rose-700","from-amber-600 to-orange-700","from-emerald-600 to-teal-700","from-indigo-600 to-blue-700"];
    return <div className={`${sz} ${rd} bg-gradient-to-br ${c[name.charCodeAt(0)%c.length]} flex items-center justify-center shadow-lg flex-shrink-0`}><span className="text-white/40 font-bold text-lg">{name[0]?.toUpperCase()}</span></div>;
  }
  return <img src={src} alt={name} className={`${sz} ${rd} object-cover flex-shrink-0 shadow-lg ring-1 ring-white/5`} onError={() => setErr(true)} />;
}

// ═══ Quality Selector ═══
function QualitySelect({ current, onChange }: { current: QualityPreset; onChange: (q: QualityPreset) => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => { const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); }; document.addEventListener("mousedown", h); return () => document.removeEventListener("mousedown", h); }, []);
  return (
    <div ref={ref} className="relative">
      <button onClick={() => setOpen(!open)} className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium glass glass-hover transition-all">
        <span className="w-2 h-2 rounded-full bg-purple-400" />{qualityLabels[current]}
      </button>
      {open && (
        <div className="absolute bottom-full right-0 mb-2 w-40 py-1 bg-zinc-900/95 backdrop-blur-xl border border-white/10 rounded-lg shadow-2xl z-50">
          {(["lofi","standard","high","lossless"] as QualityPreset[]).map(q => (
            <button key={q} onClick={() => { onChange(q); setOpen(false); }} className={`w-full text-left px-3 py-1.5 text-sm ${current===q?"text-purple-400 bg-purple-400/10":"text-zinc-300 hover:bg-white/5"}`}>{qualityLabels[q]}</button>
          ))}
        </div>
      )}
    </div>
  );
}

// ═══ EQ Animation ═══
function EQ() {
  const [h, setH] = useState([3,3,3,4]);
  useEffect(() => { const i = setInterval(() => setH(Array.from({length:4},()=>Math.random()*10+2)),120); return () => clearInterval(i); }, []);
  return <div className="flex items-end gap-px h-3">{h.map((v,i)=><div key={i} className="w-[2px] bg-purple-400 rounded-full transition-all duration-100" style={{height:v}}/>)}</div>;
}

// ═══ Song Row ═══
function SongRow({ song, index, isActive, isPlaying, onPlay, onLike, liked }: any) {
  return (
    <div onClick={onPlay} className={`group flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-all duration-200 ${isActive ? "glass bg-white/[0.06]" : "hover:bg-white/[0.03]"}`}>
      <span className="w-8 text-center text-xs text-zinc-500 tabular-nums group-hover:hidden">{isActive && isPlaying ? <EQ/> : index+1}</span>
      <span className="w-8 hidden group-hover:flex justify-center text-white"><Svg d={Icon.play} className="w-4 h-4" fill="currentColor" stroke="none"/></span>
      <Cover src={song.albumPic} name={song.name} size="sm" />
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium truncate ${isActive?"text-purple-400":""}`}>{song.name}</p>
        <p className="text-xs text-zinc-500 truncate">{song.artists?.join(" / ")}</p>
      </div>
      <span className="hidden sm:block text-xs text-zinc-500 truncate w-28">{song.album}</span>
      <span className="text-xs text-zinc-500 tabular-nums w-10 text-right">{fmt(song.duration)}</span>
      <button onClick={e=>{e.stopPropagation();onLike();}} className={`p-1 ${liked?"text-pink-400":"text-zinc-700 hover:text-zinc-400"} transition-colors`}><Svg d={liked?Icon.heartFill:Icon.heart} className="w-4 h-4" fill={liked?"currentColor":"none"} stroke="currentColor"/></button>
    </div>
  );
}

// ═══ MAIN PAGE ═══
export default function Home() {
  const p = useMusicPlayer();
  const [liked, setLiked] = useState<number[]>([]);
  const [volume, setVol] = useState(0.7);
  const [muted, setMuted] = useState(false);
  const [view, setView] = useState<"home"|"search"|"library">("home");
  const [searchText, setSearchText] = useState("");
  const progressRef = useRef<HTMLDivElement>(null);
  const timer = useRef<NodeJS.Timeout | null>(null);

  const toggleLike = (id: number) => setLiked(prev => prev.includes(id) ? prev.filter(x=>x!==id) : [...prev,id]);
  const progress = p.duration>0 ? (p.currentTime/p.duration)*100 : 0;

  const handleSearch = useCallback((val: string) => {
    setSearchText(val);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => p.doSearch(val), 250);
  }, [p]);

  const handleProgress = (e: React.MouseEvent) => { const r = e.currentTarget.getBoundingClientRect(); p.seekTo(((e.clientX-r.left)/r.width)*p.duration); };
  const handleVolume = (e: React.MouseEvent) => { const r = e.currentTarget.getBoundingClientRect(); const v = Math.min(1,Math.max(0,(e.clientX-r.left)/r.width)); setVol(v); setMuted(false); p.setVolume(v); };
  const toggleMute = () => { if(muted){p.setVolume(volume||0.7);setMuted(false);}else{p.setVolume(0);setMuted(true);} };

  // ═══ RENDER ═══
  return (
    <div className="flex h-screen text-white overflow-hidden bg-[#0a0a0f]">
      {/* ──── SIDEBAR ──── */}
      <aside className="hidden md:flex w-[240px] flex-shrink-0 flex-col bg-black/30 backdrop-blur-xl border-r border-white/[0.04]">
        <div className="px-5 pt-6 pb-5">
          <h1 className="text-xl font-bold tracking-tight">
            <span className="bg-gradient-to-r from-violet-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">WaveFlow</span>
          </h1>
        </div>
        <nav className="px-3 space-y-0.5">
          {[
            { icon: Icon.home, label: "首页", key: "home" as const },
            { icon: Icon.explore, label: "搜索", key: "search" as const },
            { icon: Icon.library, label: "音乐库", key: "library" as const },
          ].map(item => (
            <button key={item.key} onClick={() => setView(item.key)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${view===item.key?"bg-white/10 text-white":"text-zinc-400 hover:text-white hover:bg-white/[0.04]"}`}>
              <Svg d={item.icon} className="w-5 h-5" />{item.label}
            </button>
          ))}
        </nav>
        <div className="mx-4 my-4 border-t border-white/[0.04]" />
        <div className="flex-1 overflow-y-auto px-3 space-y-0.5">
          <p className="px-3 py-1 text-[11px] font-semibold text-zinc-500 uppercase tracking-widest">歌单</p>
          {hotPlaylists.slice(0,8).map(pl => (
            <button key={pl.id} onClick={() => { setView("library"); p.loadPlaylist(pl.id); }}
              className="w-full text-left px-3 py-2 rounded-lg text-sm text-zinc-400 hover:text-white hover:bg-white/[0.04] transition-all duration-200 truncate">
              {pl.name}
            </button>
          ))}
        </div>
        <div className="p-4 border-t border-white/[0.04]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-xs font-bold ring-2 ring-purple-500/20">Y</div>
            <div className="text-sm"><p className="font-medium -mb-0.5">Yh</p><p className="text-[11px] text-zinc-500">免费用户</p></div>
          </div>
        </div>
      </aside>

      {/* ──── MAIN ──── */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="flex items-center gap-4 px-6 py-3 bg-black/10 backdrop-blur-md border-b border-white/[0.04]">
          <div className="relative flex-1 max-w-md">
            <input type="text" value={searchText} onChange={e=>handleSearch(e.target.value)} onKeyDown={e=>{if(e.key==="Enter"&&searchText.trim()){setView("library");p.searchAndPlay(searchText.trim());}}}
              placeholder="搜索歌曲、艺人或专辑..." className="w-full px-4 py-2 pl-10 bg-white/[0.04] border border-white/[0.06] rounded-full text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-purple-400/30 focus:bg-white/[0.06] transition-all duration-200" />
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500"><Svg d={Icon.search} /></span>
            {p.searching && <span className="absolute right-3 top-1/2 -translate-y-1/2"><div className="w-4 h-4 border-2 border-purple-400 border-t-transparent rounded-full animate-spin" /></span>}
          </div>
          <QualitySelect current={p.quality} onChange={p.setQuality} />
          <div className="md:hidden w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-xs font-bold">Y</div>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="px-4 sm:px-6 py-5 sm:py-6 space-y-8 animate-fade-in">

            {/* ═══ HOME ═══ */}
            {view === "home" && (
              <>
                {/* Greeting + Now Playing */}
                {p.currentTrack && (
                  <section className="relative overflow-hidden rounded-2xl p-5 sm:p-6 bg-gradient-to-br from-violet-950/50 via-purple-950/30 to-pink-950/50 border border-white/[0.04]">
                    <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center gap-5">
                      <Cover src={p.currentTrack.albumPic} name={p.currentTrack.name} size="xl" />
                      <div className="min-w-0 flex-1">
                        <p className="text-xs text-zinc-500 mb-1">{greet()} · {p.loading ? "加载中..." : "来听首歌吧"}</p>
                        <h2 className="text-xl sm:text-2xl font-bold mb-1.5 truncate">{p.currentTrack.name}</h2>
                        <p className="text-sm text-zinc-400 mb-1">{p.currentTrack.artists?.join(" / ")}</p>
                        <p className="text-xs text-zinc-500 mb-4">{p.currentTrack.album}</p>
                        {p.error && <p className="text-amber-400/80 text-xs mb-3">{p.error}</p>}
                        <div className="flex gap-2.5">
                          <button onClick={p.togglePlay} className="flex items-center gap-2 px-5 py-2.5 bg-purple-500 hover:bg-purple-400 rounded-full text-sm font-semibold transition-all duration-200 shadow-lg shadow-purple-500/20 active:scale-95">
                            <Svg d={p.isPlaying?Icon.pause:Icon.play} className="w-4 h-4" fill="currentColor" stroke="none" />{p.isPlaying?"暂停":"播放"}
                          </button>
                          <button onClick={p.playNext} className="px-4 py-2.5 glass glass-hover rounded-full text-sm transition-all duration-200">下一首</button>
                        </div>
                      </div>
                    </div>
                    {/* Decorative blobs */}
                    <div className="absolute -top-20 -right-20 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl" />
                    <div className="absolute -bottom-20 -left-20 w-48 h-48 bg-pink-500/10 rounded-full blur-3xl" />
                  </section>
                )}

                {/* Quick Search Artists */}
                <section>
                  <h3 className="text-lg font-bold mb-4">发现艺人</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                    {discoverSearches.map(item => (
                      <button key={item.keyword} onClick={() => { setView("library"); p.searchAndPlay(item.keyword); }}
                        className={`group relative p-4 rounded-xl bg-gradient-to-br ${item.color} hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 shadow-lg text-left overflow-hidden`}>
                        <p className="text-white font-semibold text-sm relative z-10">{item.label}</p>
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                      </button>
                    ))}
                  </div>
                </section>

                {/* Playlist Grid */}
                <section>
                  <h3 className="text-lg font-bold mb-4">精选歌单</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                    {hotPlaylists.map(pl => (
                      <button key={pl.id} onClick={() => { setView("library"); p.loadPlaylist(pl.id); }}
                        className="group p-3 rounded-xl glass glass-hover transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] text-left">
                        <div className="w-full aspect-square rounded-lg bg-gradient-to-br from-indigo-500/30 to-purple-700/30 mb-3 flex items-center justify-center relative overflow-hidden">
                          <Svg d={Icon.music} className="w-12 h-12 text-white/20" />
                          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 bg-black/30 backdrop-blur-[2px]">
                            <div className="w-12 h-12 rounded-full bg-purple-500 shadow-lg flex items-center justify-center transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                              <Svg d={Icon.play} className="w-5 h-5" fill="white" stroke="none" />
                            </div>
                          </div>
                        </div>
                        <h4 className="font-semibold text-sm truncate">{pl.name}</h4>
                        <p className="text-xs text-zinc-500 mt-0.5">{pl.trackCount} 首歌曲</p>
                      </button>
                    ))}
                  </div>
                </section>
              </>
            )}

            {/* ═══ SEARCH ═══ */}
            {view === "search" && (
              <section>
                <h3 className="text-lg font-bold mb-4">{searchText ? `"${searchText}" 的搜索结果` : "热门搜索"}</h3>
                {p.searching ? (
                  <div className="text-center py-20 text-zinc-500"><div className="mx-auto mb-3 w-8 h-8 border-2 border-purple-400 border-t-transparent rounded-full animate-spin" /><p>搜索中...</p></div>
                ) : p.searchResults.length > 0 ? (
                  <div className="space-y-0.5">
                    {p.searchResults.map((s,i) => (
                      <SongRow key={s.id} song={s} index={i} isActive={p.currentTrack?.id===s.id} isPlaying={p.isPlaying}
                        onPlay={() => { p.searchAndPlay(searchText); setTimeout(() => p.play(p.playlist.findIndex(x=>x.id===s.id)), 500); }}
                        onLike={() => toggleLike(s.id)} liked={liked.includes(s.id)} />
                    ))}
                  </div>
                ) : searchText ? (
                  <div className="text-center py-20 text-zinc-500"><p className="text-4xl mb-4">🔍</p><p>未找到相关内容</p><p className="text-xs mt-1">试试其他关键词</p></div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {discoverSearches.map(item => (
                      <button key={item.keyword} onClick={() => { handleSearch(item.keyword); setView("library"); p.searchAndPlay(item.keyword); }}
                        className={`p-4 rounded-xl bg-gradient-to-br ${item.color} text-left hover:scale-[1.02] active:scale-[0.98] transition-all duration-200`}>
                        <p className="text-white font-semibold text-sm">{item.label}</p>
                      </button>
                    ))}
                  </div>
                )}
              </section>
            )}

            {/* ═══ LIBRARY ═══ */}
            {view === "library" && (
              <section>
                {p.loading ? (
                  <div className="text-center py-20 text-zinc-500"><div className="mx-auto mb-3 w-8 h-8 border-2 border-purple-400 border-t-transparent rounded-full animate-spin" /><p>加载歌单...</p></div>
                ) : p.playlist.length > 0 ? (
                  <>
                    <div className="flex items-center gap-4 mb-5">
                      <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-xl bg-gradient-to-br from-purple-600/30 to-pink-600/30 flex items-center justify-center shadow-xl"><Svg d={Icon.music} className="w-16 h-16 text-white/20" /></div>
                      <div>
                        <p className="text-xs text-zinc-500 uppercase tracking-wider mb-1">播放列表</p>
                        <h2 className="text-xl sm:text-2xl font-bold mb-1">当前歌单</h2>
                        <p className="text-sm text-zinc-400">{p.playlist.length} 首歌曲</p>
                        <button onClick={() => p.play(0)} className="mt-3 flex items-center gap-2 px-5 py-2.5 bg-purple-500 hover:bg-purple-400 rounded-full text-sm font-semibold transition-all duration-200 active:scale-95 shadow-lg shadow-purple-500/20">
                          <Svg d={Icon.play} className="w-4 h-4" fill="currentColor" stroke="none" />播放全部
                        </button>
                      </div>
                    </div>
                    <div className="space-y-0.5">
                      {p.playlist.map((s,i) => (
                        <SongRow key={s.id} song={s} index={i} isActive={p.currentTrack?.id===s.id} isPlaying={p.isPlaying}
                          onPlay={() => p.play(i)} onLike={() => toggleLike(s.id)} liked={liked.includes(s.id)} />
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="text-center py-20 text-zinc-500"><p className="text-5xl mb-4">🎵</p><p>暂无歌曲</p><p className="text-xs mt-1">搜索或点击歌单开始聆听</p></div>
                )}
              </section>
            )}

            <div className="h-24" />
          </div>
        </div>
      </main>

      {/* ──── BOTTOM PLAYER ──── */}
      <div className="fixed bottom-0 left-0 right-0 h-[72px] bg-black/40 backdrop-blur-xl border-t border-white/[0.04] z-50 animate-slide-up">
        <div className="h-full px-4 flex items-center gap-3 sm:gap-4">
          {/* Track Info */}
          <div className="flex items-center gap-3 min-w-[160px] sm:min-w-[200px] max-w-[280px]">
            {p.currentTrack ? (
              <Cover src={p.currentTrack.albumPic} name={p.currentTrack.name} size="sm" />
            ) : (
              <div className="w-12 h-12 rounded-xl bg-white/[0.03] flex items-center justify-center flex-shrink-0"><Svg d={Icon.music} className="w-5 h-5 text-zinc-700" /></div>
            )}
            <div className="min-w-0 hidden sm:block">
              <p className="text-sm font-semibold truncate">{p.currentTrack?.name || "未选择歌曲"}</p>
              <p className="text-xs text-zinc-500 truncate">{p.currentTrack?.artists?.join(" / ") || "WaveFlow"}</p>
            </div>
            {p.currentTrack && (
              <button onClick={() => toggleLike(p.currentTrack!.id)} className={`flex-shrink-0 p-1 ${liked.includes(p.currentTrack.id)?"text-pink-400":"text-zinc-600 hover:text-zinc-400"} transition-colors`}>
                <Svg d={liked.includes(p.currentTrack.id)?Icon.heartFill:Icon.heart} className="w-4 h-4" fill={liked.includes(p.currentTrack.id)?"currentColor":"none"} stroke="currentColor" />
              </button>
            )}
          </div>

          {/* Controls + Progress */}
          <div className="flex-1 flex flex-col items-center gap-0.5 max-w-xl mx-auto">
            <div className="flex items-center gap-4 sm:gap-6">
              <button onClick={p.playPrev} className="text-zinc-400 hover:text-white transition-colors"><Svg d={Icon.prev} className="w-4 h-4" fill="currentColor" stroke="none"/></button>
              <button onClick={p.togglePlay} className="w-9 h-9 rounded-full bg-white text-black flex items-center justify-center hover:scale-105 active:scale-95 transition-all duration-200 shadow-lg">
                <Svg d={p.isPlaying?Icon.pause:Icon.play} className="w-4 h-4" fill="currentColor" stroke="none" />
              </button>
              <button onClick={p.playNext} className="text-zinc-400 hover:text-white transition-colors"><Svg d={Icon.next} className="w-4 h-4" fill="currentColor" stroke="none"/></button>
            </div>
            <div className="hidden sm:flex items-center gap-2 w-full">
              <span className="text-[10px] text-zinc-500 w-8 text-right tabular-nums">{fmt(p.currentTime)}</span>
              <div ref={progressRef} onClick={handleProgress} className="flex-1 h-1 bg-white/[0.06] rounded-full group cursor-pointer hover:h-1.5 transition-all">
                <div className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full relative" style={{width:`${progress}%`}}>
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg" />
                </div>
              </div>
              <span className="text-[10px] text-zinc-500 w-8 tabular-nums">{fmt(p.duration)}</span>
            </div>
          </div>

          {/* Volume */}
          <div className="hidden sm:flex items-center gap-2 min-w-[150px] justify-end">
            <QualitySelect current={p.quality} onChange={p.setQuality} />
            <button onClick={toggleMute} className="text-zinc-400 hover:text-white p-1 transition-colors">
              <Svg d={muted||volume===0?<><path d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"/><path d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2"/></>:<path d="M15.536 8.464a5 5 0 010 7.072M12 6.588L5.882 18H3a1 1 0 01-1-1V7a1 1 0 011-1h2.882L12 6.588zM17.657 6.343a9 9 0 010 11.314"/>} className="w-4 h-4" />
            </button>
            <div onClick={handleVolume} className="w-20 h-1 bg-white/[0.06] rounded-full group cursor-pointer hover:h-1.5 transition-all">
              <div className="h-full bg-white/40 rounded-full" style={{width:`${muted?0:volume*100}%`}}>
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
