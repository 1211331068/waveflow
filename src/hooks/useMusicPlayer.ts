"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { getAudioPlayer } from "@/lib/audio-player";
import {
  getPlaylistSongs,
  getSongUrl,
  searchSongs,
  hotKeywords,
  getLyrics,
  categories,
  type SongInfo,
  type QualityPreset,
  type LyricData,
} from "@/lib/music-api";

interface PlayerState {
  isPlaying: boolean;
  currentTrack: SongInfo | null;
  currentTrackIndex: number;
  currentTime: number;
  duration: number;
  quality: QualityPreset;
  isReady: boolean;
  playlist: SongInfo[];
  loading: boolean;
  error: string | null;
  searchResults: SongInfo[];
  searching: boolean;
  lyrics: LyricData | null;
  lyricsLoading: boolean;
}

const MAX_SKIP = 10;

export function useMusicPlayer() {
  const playerRef = useRef(getAudioPlayer());
  const player = playerRef.current;

  // ⚡ 关键：用 ref 保存 playlist，避免 useCallback 闭包过期
  const playlistRef = useRef<SongInfo[]>([]);
  const currentIndexRef = useRef(0);
  const mountedRef = useRef(true);
  const skippingRef = useRef(false); // 防双重跳过
  const skipCountRef = useRef(0);
  const errorHandledRef = useRef(false); // 防 error 事件重复处理
  const pendingPlayRef = useRef(false); // 防并发 play 调用

  const [state, setState] = useState<PlayerState>({
    isPlaying: false,
    currentTrack: null,
    currentTrackIndex: 0,
    currentTime: 0,
    duration: 0,
    quality: "standard",
    isReady: false,
    playlist: [],
    loading: true,
    error: null,
    searchResults: [],
    searching: false,
    lyrics: null,
    lyricsLoading: false,
  });

  // ─── 核心：安全播放一首歌 ───
  const playOneTrack = useCallback(async (index: number) => {
    const playlist = playlistRef.current;
    if (index < 0 || index >= playlist.length) return;
    if (pendingPlayRef.current) return; // 防止并发

    const track = playlist[index];
    currentIndexRef.current = index;
    pendingPlayRef.current = true;

    setState((s) => ({
      ...s,
      currentTrack: track,
      currentTrackIndex: index,
      duration: track.duration,
      currentTime: 0,
      error: null,
      lyrics: null,
    }));

    try {
      const url = await getSongUrl(track.id);
      if (!mountedRef.current) { pendingPlayRef.current = false; return; }

      if (url) {
        skipCountRef.current = 0;
        await player.play(url, track.id, track.duration);
        if (mountedRef.current) {
          setState((s) => ({ ...s, isPlaying: true }));
        }
      } else {
        // 无播放源 → 自动跳过（唯一跳过入口）
        skipCountRef.current++;
        pendingPlayRef.current = false;
        if (mountedRef.current) {
          setState((s) => ({ ...s, error: `${track.name} 暂无播放源` }));
        }
        if (skipCountRef.current < MAX_SKIP) {
          setTimeout(() => {
            if (mountedRef.current) {
              const next = (index + 1) % playlistRef.current.length;
              playOneTrack(next);
            }
          }, 600);
        } else {
          skipCountRef.current = 0;
          if (mountedRef.current) {
            setState((s) => ({ ...s, error: "当前歌单大部分歌曲无法播放，请尝试其他歌单" }));
          }
        }
      }
    } catch (e: unknown) {
      pendingPlayRef.current = false;
      if (mountedRef.current) {
        const msg = e instanceof Error ? e.message : "播放出错";
        setState((s) => ({ ...s, error: msg }));
      }
    }
  }, [player]);

  // ─── 播放下一首（由 onEnded 触发，不自动跳过）───
  const playNextSafe = useCallback(() => {
    if (skippingRef.current) return;
    const next = (currentIndexRef.current + 1) % playlistRef.current.length;
    pendingPlayRef.current = false; // 重置
    playOneTrack(next);
  }, [playOneTrack]);

  // ─── 初始化 ───
  useEffect(() => {
    let cancelled = false;
    mountedRef.current = true;

    const initAndLoad = async () => {
      await player.init();
      if (cancelled || !mountedRef.current) return;

      setState((s) => ({ ...s, loading: true }));
      try {
        const songs = await getPlaylistSongs();
        if (!cancelled && songs.length > 0) {
          playlistRef.current = songs;
          setState((s) => ({
            ...s, playlist: songs, loading: false, isReady: true,
            currentTrack: songs[0], duration: songs[0].duration,
          }));
          return;
        }
      } catch {}

      if (!cancelled) {
        try {
          const kw = hotKeywords[Math.floor(Math.random() * hotKeywords.length)];
          const songs = await searchSongs(kw, 20);
          if (songs.length > 0) {
            playlistRef.current = songs;
            setState((s) => ({
              ...s, playlist: songs, loading: false, isReady: true,
              currentTrack: songs[0], duration: songs[0].duration,
            }));
            return;
          }
        } catch {}
      }

      if (!cancelled) {
        setState((s) => ({ ...s, loading: false, error: "暂无可用歌曲" }));
      }
    };

    initAndLoad();

    // 时间更新
    player.onTimeUpdate((t) => {
      if (mountedRef.current) setState((s) => ({ ...s, currentTime: t }));
    });

    // 播放结束 → 下一首（不自动跳过无源的）
    player.onEnded(() => {
      if (mountedRef.current) playNextSafe();
    });

    // 音频错误 → 下一首
    player.onError((msg) => {
      if (!mountedRef.current) return;
      if (errorHandledRef.current) return;
      errorHandledRef.current = true;
      setState((s) => ({ ...s, error: msg }));
      setTimeout(() => {
        errorHandledRef.current = false;
        if (mountedRef.current) playNextSafe();
      }, 300);
    });

    return () => {
      mountedRef.current = false;
      cancelled = true;
      try { player.stop(); } catch {}
    };
  }, [player, playNextSafe]);

  // ─── 公开 API ───
  const play = useCallback((index?: number) => {
    const idx = index ?? currentIndexRef.current;
    if (idx >= 0 && idx < playlistRef.current.length) {
      pendingPlayRef.current = false;
      skipCountRef.current = 0;
      playOneTrack(idx);
    }
  }, [playOneTrack]);

  const pause = useCallback(() => {
    try { player.pause(); } catch {}
    setState((s) => ({ ...s, isPlaying: false }));
  }, [player]);

  const resume = useCallback(() => {
    try { player.resume(); } catch {}
    setState((s) => ({ ...s, isPlaying: true }));
  }, [player]);

  const togglePlay = useCallback(() => {
    if (state.isPlaying) pause();
    else if (state.currentTime > 0) resume();
    else play();
  }, [state.isPlaying, state.currentTime, play, pause, resume]);

  const playNext = useCallback(() => {
    pendingPlayRef.current = false;
    skipCountRef.current = 0;
    playNextSafe();
  }, [playNextSafe]);

  const playPrev = useCallback(() => {
    pendingPlayRef.current = false;
    skipCountRef.current = 0;
    const prev = (currentIndexRef.current - 1 + playlistRef.current.length) % playlistRef.current.length;
    playOneTrack(prev);
  }, [playOneTrack]);

  const setQuality = useCallback((q: QualityPreset) => {
    try { player.setQuality(q); } catch {}
    setState((s) => ({ ...s, quality: q }));
  }, [player]);

  const seekTo = useCallback((time: number) => {
    try { player.seekTo(time); } catch {}
    setState((s) => ({ ...s, currentTime: time }));
  }, [player]);

  const setVolume = useCallback((v: number) => {
    try { player.setVolume(Math.min(1, Math.max(0, v))); } catch {}
  }, [player]);

  // 🔍 搜索
  const doSearch = useCallback(async (keyword: string) => {
    if (!keyword.trim()) {
      setState((s) => ({ ...s, searchResults: [], searching: false }));
      return;
    }
    setState((s) => ({ ...s, searching: true }));
    try {
      const songs = await searchSongs(keyword, 30);
      if (mountedRef.current) setState((s) => ({ ...s, searchResults: songs, searching: false }));
    } catch {
      if (mountedRef.current) setState((s) => ({ ...s, searching: false }));
    }
  }, []);

  const searchAndPlay = useCallback(async (keyword: string) => {
    setState((s) => ({ ...s, loading: true, error: null }));
    try {
      const songs = await searchSongs(keyword, 30);
      if (mountedRef.current && songs.length > 0) {
        playlistRef.current = songs;
        currentIndexRef.current = 0;
        skipCountRef.current = 0;
        pendingPlayRef.current = false;
        setState((s) => ({
          ...s, playlist: songs, currentTrack: songs[0], currentTrackIndex: 0,
          duration: songs[0].duration, loading: false, isReady: true, error: null,
        }));
        return;
      }
      // 无结果 → 清空歌单
      if (mountedRef.current) {
        playlistRef.current = [];
        setState((s) => ({ ...s, playlist: [], loading: false, error: "搜索无结果，换个关键词试试" }));
      }
    } catch {
      if (mountedRef.current) {
        playlistRef.current = [];
        setState((s) => ({ ...s, playlist: [], loading: false, error: "搜索失败" }));
      }
    }
  }, []);

  const loadPlaylist = useCallback(async (playlistId: number) => {
    setState((s) => ({ ...s, loading: true, error: null }));
    try {
      const songs = await getPlaylistSongs(playlistId);
      if (mountedRef.current && songs.length > 0) {
        playlistRef.current = songs;
        currentIndexRef.current = 0;
        skipCountRef.current = 0;
        pendingPlayRef.current = false;
        setState((s) => ({
          ...s, playlist: songs, currentTrack: songs[0], currentTrackIndex: 0,
          duration: songs[0].duration, loading: false, isReady: true, error: null,
        }));
        return;
      }
      // 歌单无结果 → 清空旧歌单，回退到搜索
      if (mountedRef.current) {
        const cat = categories.find(c => c.playlistId === playlistId);
        if (cat) {
          // 用搜索关键词回退
          try {
            const fallback = await searchSongs(cat.search, 30);
            if (fallback.length > 0) {
              playlistRef.current = fallback;
              setState((s) => ({
                ...s, playlist: fallback, currentTrack: fallback[0], currentTrackIndex: 0,
                duration: fallback[0].duration, loading: false, isReady: true, error: null,
              }));
              return;
            }
          } catch {}
        }
        // 完全失败 → 清空歌单
        playlistRef.current = [];
        setState((s) => ({ ...s, playlist: [], loading: false, error: "该歌单暂无可用歌曲" }));
      }
    } catch {
      if (mountedRef.current) {
        playlistRef.current = [];
        setState((s) => ({ ...s, playlist: [], loading: false, error: "加载歌单失败，请检查网络" }));
      }
    }
  }, []);

  // 🎤 获取当前歌曲歌词
  const fetchLyrics = useCallback(async () => {
    const track = playlistRef.current[currentIndexRef.current];
    if (!track) return;
    setState((s) => ({ ...s, lyricsLoading: true }));
    try {
      const data = await getLyrics(track.id);
      if (mountedRef.current) {
        setState((s) => ({ ...s, lyrics: data, lyricsLoading: false }));
      }
    } catch {
      if (mountedRef.current) {
        setState((s) => ({ ...s, lyrics: null, lyricsLoading: false }));
      }
    }
  }, []);

  return {
    ...state,
    togglePlay, play, pause, playNext, playPrev,
    setQuality, seekTo, setVolume,
    doSearch, searchAndPlay, loadPlaylist,
    fetchLyrics,
  };
}
