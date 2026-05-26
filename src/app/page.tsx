"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useMusicPlayer } from "@/hooks/useMusicPlayer";
import type { QualityPreset, CategoryInfo } from "@/lib/music-api";
import { qualityLabels, categories, discoverArtists } from "@/lib/music-api";

// ═══ Icons ═══
const I = {
  play: <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>,
  playLg: <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>,
  pause: <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>,
  prev: <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M6 6h2v12H6zm3.5 6l8.5 6V6z"/></svg>,
  next: <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"/></svg>,
  search: <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>,
  home: <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3"/></svg>,
  explore: <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>,
  library: <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5"/></svg>,
  heart: <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/></svg>,
  heartFill: <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/></svg>,
  music: <svg className="w-16 h-16" fill="none" stroke="currentColor" strokeWidth={0.8} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"/></svg>,
  spinner: <div className="w-6 h-6 border-2 border-purple-400 border-t-transparent rounded-full animate-spin" />,
};

// ═══ Helpers ═══
const fmt = (s: number) => { const m = Math.floor(s / 60); return `${m}:${Math.floor(s % 60).toString().padStart(2, "0")}`; };
const greet = () => { const h = new Date().getHours(); if (h < 6) return "夜深了"; if (h < 12) return "早上好"; if (h < 18) return "下午好"; return "晚上好"; };

// ═══ Album Cover ═══
function Cover({ src, name, sz = "md", round }: { src: string; name: string; sz?: "xs"|"sm"|"md"|"lg"|"xl"; round?: boolean }) {
  const [err, setErr] = useState(false);
  const s = { xs:"w-8 h-8", sm:"w-12 h-12", md:"w-40 h-40", lg:"w-48 h-48", xl:"w-56 h-56" }[sz];
  const c = ["from-violet-600 to-purple-700","from-cyan-500 to-blue-700","from-pink-500 to-rose-700","from-amber-500 to-orange-700","from-emerald-500 to-teal-700"];
  if (!src || err) return <div className={`${s} ${round?"rounded-full":"rounded-xl"} bg-gradient-to-br ${c[name.charCodeAt(0)%c.length]} flex items-center justify-center shadow-lg flex-shrink-0`}><span className="text-white/30 font-bold">{name[0]?.toUpperCase()}</span></div>;
  return <img src={src} alt={name} className={`${s} ${round?"rounded-full":"rounded-xl"} object-cover flex-shrink-0 shadow-xl ring-1 ring-white/5`} onError={() => setErr(true)} />;
}

// ═══ Quality Select ═══
function Qual({ cur, set }: { cur: QualityPreset; set: (q: QualityPreset) => void }) {
  const [o, so] = useState(false); const r = useRef<HTMLDivElement>(null);
  useEffect(() => { const h = (e: MouseEvent) => { if (r.current && !r.current.contains(e.target as Node)) so(false); }; document.addEventListener("mousedown", h); return () => document.removeEventListener("mousedown", h); }, []);
  return <div ref={r} className="relative"><button onClick={() => so(!o)} className="flex items-center gap-1.5 px-2 py-1 rounded-md text-xs bg-white/5 hover:bg-white/10 border border-white/5 transition-all">{qualityLabels[cur]}</button>
    {o && <div className="absolute bottom-full right-0 mb-1 w-36 py-1 bg-zinc-900/95 backdrop-blur-xl border border-white/10 rounded-lg shadow-2xl z-50">{(["lofi","standard","high","lossless"] as QualityPreset[]).map(q => <button key={q} onClick={() => { set(q); so(false); }} className={`w-full text-left px-3 py-1 text-sm ${cur===q?"text-purple-400":"text-zinc-300 hover:bg-white/5"}`}>{qualityLabels[q]}</button>)}</div>}</div>;
}

// ═══ EQ ═══
function EQ() { const [h,s]=useState([3,3,3,4]); useEffect(() => { const i=setInterval(()=>s(Array.from({length:4},()=>Math.random()*10+2)),120); return ()=>clearInterval(i); },[]); return <div className="flex items-end gap-px h-3">{h.map((v,i)=><div key={i} className="w-[2px] bg-purple-400 rounded-full" style={{height:v}}/>)}</div>; }

// ═══ Song Row ═══
function SongRow({ song, idx, act, playing, onPlay, onLike, liked }: any) {
  return (
    <div onClick={onPlay} className={`group flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-all ${act?"bg-white/[0.06]":"hover:bg-white/[0.03]"}`}>
      <span className="w-7 text-center text-xs text-zinc-500 tabular-nums group-hover:hidden">{act&&playing?<EQ/>:idx+1}</span>
      <span className="w-7 hidden group-hover:flex justify-center"><svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg></span>
      <Cover src={song.albumPic} name={song.name} sz="xs" />
      <div className="flex-1 min-w-0"><p className={`text-sm font-medium truncate ${act?"text-purple-400":""}`}>{song.name}</p><p className="text-xs text-zinc-500 truncate">{song.artists?.join(" / ")}</p></div>
      <span className="hidden sm:block text-xs text-zinc-500 truncate w-24">{song.album}</span>
      <span className="text-xs text-zinc-500 tabular-nums w-10 text-right">{fmt(song.duration)}</span>
      <button onClick={e=>{e.stopPropagation();onLike();}} className={`p-1 ${liked?"text-pink-400":"text-zinc-700 hover:text-zinc-400"}`}>{liked?I.heartFill:I.heart}</button>
    </div>
  );
}

// ═══ Category Card (with cover attempt) ═══
function CategoryCard({ cat, onClick }: { cat: CategoryInfo; onClick: () => void }) {
  return (
    <button onClick={onClick}
      className={`group relative w-full aspect-[4/3] rounded-2xl bg-gradient-to-br ${cat.color} overflow-hidden shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-300`}>
      <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
      <span className="absolute top-4 left-4 text-3xl">{cat.icon}</span>
      <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/70 via-black/30 to-transparent">
        <h3 className="text-base font-bold text-white">{cat.name}</h3>
        <p className="text-xs text-white/70 mt-0.5">{cat.desc}</p>
      </div>
      <div className="absolute bottom-3 right-3 w-10 h-10 rounded-full bg-white/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0 backdrop-blur-sm">
        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
      </div>
    </button>
  );
}

// ═══ MAIN PAGE ═══
export default function Home() {
  const p = useMusicPlayer();
  const [liked, setLiked] = useState<number[]>([]);
  const [vol, setVol] = useState(0.7);
  const [muted, setMuted] = useState(false);
  const [view, setView] = useState<"home"|"search"|"library">("home");
  const [search, setSearch] = useState("");
  const [catName, setCatName] = useState("");
  const pr = useRef<HTMLDivElement>(null);
  const tm = useRef<NodeJS.Timeout | null>(null);

  const toggleLike = (id: number) => setLiked(prev => prev.includes(id) ? prev.filter(x=>x!==id) : [...prev, id]);
  const progress = p.duration > 0 ? (p.currentTime / p.duration) * 100 : 0;

  const doSearch = useCallback((v: string) => {
    setSearch(v);
    if (tm.current) clearTimeout(tm.current);
    tm.current = setTimeout(() => p.doSearch(v), 250);
  }, [p]);

  const openCategory = (cat: CategoryInfo) => {
    setCatName(cat.name);
    setView("library");
    if (cat.playlistId) p.loadPlaylist(cat.playlistId);
    else p.searchAndPlay(cat.search);
  };

  const progClick = (e: React.MouseEvent) => { const r = (e.currentTarget as HTMLElement).getBoundingClientRect(); p.seekTo(((e.clientX-r.left)/r.width)*p.duration); };
  const volClick = (e: React.MouseEvent) => { const r = (e.currentTarget as HTMLElement).getBoundingClientRect(); const v = Math.min(1,Math.max(0,(e.clientX-r.left)/r.width)); setVol(v); setMuted(false); p.setVolume(v); };

  return (
    <div className="flex h-screen text-white overflow-hidden">
      {/* ──── SIDEBAR ──── */}
      <aside className="hidden md:flex w-56 flex-shrink-0 flex-col bg-black/20 backdrop-blur-xl border-r border-white/[0.04]">
        <div className="px-5 pt-6 pb-5">
          <h1 className="text-xl font-bold tracking-tight bg-gradient-to-r from-violet-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">WaveFlow</h1>
        </div>
        <nav className="px-3 space-y-0.5">
          {[
            { i: I.home, l: "首页", k: "home" as const },
            { i: I.explore, l: "搜索", k: "search" as const },
            { i: I.library, l: "音乐库", k: "library" as const },
          ].map(item => (
            <button key={item.k} onClick={() => setView(item.k)} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${view===item.k?"bg-white/10 text-white":"text-zinc-400 hover:text-white hover:bg-white/[0.04]"}`}>{item.i}{item.l}</button>
          ))}
        </nav>
        <div className="mx-4 my-4 border-t border-white/[0.04]" />
        <div className="flex-1 overflow-y-auto px-3 space-y-0.5">
          <p className="px-3 py-1 text-[11px] font-semibold text-zinc-500 uppercase tracking-widest">分类</p>
          {categories.map(c => (
            <button key={c.id} onClick={() => openCategory(c)} className="w-full text-left px-3 py-2 rounded-lg text-sm text-zinc-400 hover:text-white hover:bg-white/[0.04] transition-all truncate flex items-center gap-2">
              <span>{c.icon}</span>{c.name}
            </button>
          ))}
        </div>
        <div className="p-4 border-t border-white/[0.04]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-xs font-bold">Y</div>
            <div className="text-sm"><p className="font-medium">Yh</p><p className="text-[11px] text-zinc-500">免费用户</p></div>
          </div>
        </div>
      </aside>

      {/* ──── MAIN ──── */}
      <main className="flex-1 flex flex-col min-w-0 bg-transparent">
        {/* Header */}
        <header className="flex items-center gap-3 px-4 sm:px-6 py-3 bg-black/10 backdrop-blur-md border-b border-white/[0.04]">
          <div className="relative flex-1 max-w-md">
            <input type="text" value={search} onChange={e=>doSearch(e.target.value)} onKeyDown={e=>{if(e.key==="Enter"&&search.trim()){setCatName(search);setView("library");p.searchAndPlay(search.trim());}}}
              placeholder="搜索歌曲、艺人、专辑..." className="w-full px-4 py-2 pl-10 bg-white/[0.03] border border-white/[0.05] rounded-full text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-purple-400/30 focus:bg-white/[0.05] transition-all" />
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500">{I.search}</span>
            {p.searching && <span className="absolute right-3 top-1/2 -translate-y-1/2">{I.spinner}</span>}
          </div>
          <Qual cur={p.quality} set={p.setQuality} />
        </header>

        <div className="flex-1 overflow-y-auto">
          <div className="px-4 sm:px-6 py-5 sm:py-6 space-y-10">

            {/* ═══ HOME ═══ */}
            {view === "home" && (
              <>
                {/* Hero - Now Playing */}
                {p.currentTrack && (
                  <section className="relative overflow-hidden rounded-3xl p-5 sm:p-8 bg-gradient-to-br from-purple-950/40 via-violet-950/30 to-fuchsia-950/40 border border-white/[0.04] backdrop-blur-sm animate-slide-up">
                    <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center gap-6">
                      <Cover src={p.currentTrack.albumPic} name={p.currentTrack.name} sz="xl" />
                      <div className="min-w-0 flex-1">
                        <p className="text-xs text-zinc-400 mb-1 tracking-wide">{greet()}，来听首歌吧</p>
                        <h2 className="text-2xl sm:text-3xl font-bold mb-2 truncate">{p.currentTrack.name}</h2>
                        <p className="text-sm text-zinc-400 mb-1">{p.currentTrack.artists?.join(" / ")}</p>
                        <p className="text-xs text-zinc-500 mb-5">{p.currentTrack.album} · {fmt(p.currentTrack.duration)}</p>
                        {p.error && <p className="text-amber-400/80 text-xs mb-3">{p.error}</p>}
                        <div className="flex gap-3">
                          <button onClick={p.togglePlay} className="flex items-center gap-2 px-6 py-3 bg-purple-500 hover:bg-purple-400 rounded-full text-sm font-semibold transition-all active:scale-95 shadow-xl shadow-purple-500/20">{p.isPlaying?I.pause:I.play}{p.isPlaying?"暂停":"播放"}</button>
                          <button onClick={p.playNext} className="px-5 py-3 bg-white/5 hover:bg-white/10 rounded-full text-sm transition-all">下一首</button>
                        </div>
                      </div>
                    </div>
                    <div className="absolute -top-32 -right-32 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl" />
                    <div className="absolute -bottom-32 -left-32 w-72 h-72 bg-pink-500/10 rounded-full blur-3xl" />
                  </section>
                )}

                {/* Categories Grid */}
                <section>
                  <div className="flex items-center justify-between mb-5">
                    <h3 className="text-lg font-bold">浏览分类</h3>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
                    {categories.map(cat => (
                      <CategoryCard key={cat.id} cat={cat} onClick={() => openCategory(cat)} />
                    ))}
                  </div>
                </section>

                {/* Discover Artists */}
                <section>
                  <h3 className="text-lg font-bold mb-4">发现艺人</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
                    {discoverArtists.map(a => (
                      <button key={a.keyword} onClick={() => { setCatName(a.label.slice(2)); setView("library"); p.searchAndPlay(a.keyword); }}
                        className={`p-4 rounded-xl bg-gradient-to-br ${a.color} hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 shadow-lg text-left h-20 flex items-end`}>
                        <p className="text-white font-semibold text-sm">{a.label}</p>
                      </button>
                    ))}
                  </div>
                </section>
              </>
            )}

            {/* ═══ SEARCH ═══ */}
            {view === "search" && (
              <section>
                <h3 className="text-lg font-bold mb-4">{search ? `"${search}" 的搜索结果` : "热门搜索"}</h3>
                {p.searching ? <div className="text-center py-20 text-zinc-500">{I.spinner}<p className="mt-3">搜索中...</p></div>
                : p.searchResults.length > 0 ? (
                  <div className="space-y-0.5">{p.searchResults.map((s,i)=> <SongRow key={s.id} song={s} idx={i} act={p.currentTrack?.id===s.id} playing={p.isPlaying} onPlay={()=>{p.searchAndPlay(search);setTimeout(()=>p.play(p.playlist.findIndex(x=>x.id===s.id)),500);}} onLike={()=>toggleLike(s.id)} liked={liked.includes(s.id)} />)}</div>
                ) : search ? (
                  <div className="text-center py-20 text-zinc-500"><p className="text-5xl mb-4">🔍</p><p>未找到</p><p className="text-xs mt-1">换个关键词试试</p></div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">{discoverArtists.map(a => (
                    <button key={a.keyword} onClick={() => { doSearch(a.keyword); setView("library"); p.searchAndPlay(a.keyword); }} className={`p-4 rounded-xl bg-gradient-to-br ${a.color} hover:scale-[1.02] active:scale-[0.98] transition-all text-left`}><p className="text-white font-semibold text-sm">{a.label}</p></button>
                  ))}</div>
                )}
              </section>
            )}

            {/* ═══ LIBRARY ═══ */}
            {view === "library" && (
              <section>
                {p.loading ? <div className="text-center py-20 text-zinc-500">{I.spinner}<p className="mt-3">加载中...</p></div>
                : p.playlist.length > 0 ? (
                  <>
                    <div className="flex items-center gap-5 mb-6">
                      <div className="w-36 h-36 sm:w-44 sm:h-44 rounded-2xl bg-gradient-to-br from-purple-600/30 via-violet-600/30 to-pink-600/30 flex items-center justify-center shadow-xl border border-white/[0.04]">{I.music}</div>
                      <div>
                        <p className="text-xs text-zinc-500 uppercase tracking-wider mb-1">{catName || "歌单"}</p>
                        <h2 className="text-xl sm:text-2xl font-bold mb-1">当前歌单</h2>
                        <p className="text-sm text-zinc-400">{p.playlist.length} 首歌曲</p>
                        <button onClick={() => p.play(0)} className="mt-3 flex items-center gap-2 px-5 py-2.5 bg-purple-500 hover:bg-purple-400 rounded-full text-sm font-semibold transition-all active:scale-95 shadow-lg shadow-purple-500/20">{I.play}播放全部</button>
                      </div>
                    </div>
                    <div className="space-y-0.5">{p.playlist.map((s,i)=> <SongRow key={s.id} song={s} idx={i} act={p.currentTrack?.id===s.id} playing={p.isPlaying} onPlay={()=>p.play(i)} onLike={()=>toggleLike(s.id)} liked={liked.includes(s.id)} />)}</div>
                  </>
                ) : (
                  <div className="text-center py-20 text-zinc-500"><p className="text-5xl mb-4">🎵</p><p>暂无歌曲</p><p className="text-xs mt-1">点击分类开始聆听</p></div>
                )}
              </section>
            )}

            <div className="h-24" />
          </div>
        </div>
      </main>

      {/* ──── BOTTOM PLAYER ──── */}
      <div className="fixed bottom-0 left-0 right-0 h-[68px] bg-black/30 backdrop-blur-xl border-t border-white/[0.04] z-50">
        <div className="h-full px-3 sm:px-4 flex items-center gap-3">
          <div className="flex items-center gap-3 min-w-[120px] sm:min-w-[180px] max-w-[240px]">
            {p.currentTrack ? <Cover src={p.currentTrack.albumPic} name={p.currentTrack.name} sz="sm" /> : <div className="w-12 h-12 rounded-xl bg-white/[0.02] flex items-center justify-center">{I.music}</div>}
            <div className="min-w-0 hidden sm:block"><p className="text-sm font-semibold truncate">{p.currentTrack?.name || "WaveFlow"}</p><p className="text-xs text-zinc-500 truncate">{p.currentTrack?.artists?.join(" / ") || "选择歌曲开始"}</p></div>
            {p.currentTrack && <button onClick={() => toggleLike(p.currentTrack!.id)} className={`p-1 ${liked.includes(p.currentTrack.id)?"text-pink-400":"text-zinc-600 hover:text-zinc-400"}`}>{liked.includes(p.currentTrack.id)?I.heartFill:I.heart}</button>}
          </div>
          <div className="flex-1 flex flex-col items-center gap-0.5 max-w-xl mx-auto">
            <div className="flex items-center gap-5">
              <button onClick={p.playPrev} className="text-zinc-400 hover:text-white">{I.prev}</button>
              <button onClick={p.togglePlay} className="w-9 h-9 rounded-full bg-white text-black flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-lg">{p.isPlaying?I.pause:I.play}</button>
              <button onClick={p.playNext} className="text-zinc-400 hover:text-white">{I.next}</button>
            </div>
            <div className="hidden sm:flex items-center gap-2 w-full">
              <span className="text-[10px] text-zinc-500 w-8 text-right tabular-nums">{fmt(p.currentTime)}</span>
              <div ref={pr} onClick={progClick} className="flex-1 h-1 bg-white/[0.05] rounded-full group cursor-pointer hover:h-1.5 transition-all"><div className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full relative" style={{width:`${progress}%`}}><div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full opacity-0 group-hover:opacity-100 shadow-lg" /></div></div>
              <span className="text-[10px] text-zinc-500 w-8 tabular-nums">{fmt(p.duration)}</span>
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-2 min-w-[130px] justify-end">
            <Qual cur={p.quality} set={p.setQuality} />
            <button onClick={() => { if(muted){ p.setVolume(vol||0.7); setMuted(false); } else { p.setVolume(0); setMuted(true); } }} className="text-zinc-400 hover:text-white">
              {muted||vol===0 ? <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"/><path strokeLinecap="round" strokeLinejoin="round" d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2"/></svg> : <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15.536 8.464a5 5 0 010 7.072M12 6.588L5.882 18H3a1 1 0 01-1-1V7a1 1 0 011-1h2.882L12 6.588zM17.657 6.343a9 9 0 010 11.314"/></svg>}
            </button>
            <div onClick={volClick} className="w-20 h-1 bg-white/[0.05] rounded-full group cursor-pointer hover:h-1.5 transition-all"><div className="h-full bg-white/30 rounded-full" style={{width:`${muted?0:vol*100}%`}} /></div>
          </div>
        </div>
      </div>
    </div>
  );
}
