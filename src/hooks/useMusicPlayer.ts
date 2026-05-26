"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { getAudioPlayer } from "@/lib/audio-player";
import {
  getPlaylistSongs,
  getSongUrl,
  searchSongs,
  hotKeywords,
  type SongInfo,
  type QualityPreset,
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
  searchError: string | null;
}

export function useMusicPlayer() {
  const player = useRef(getAudioPlayer()).current;
  const playIndexRef = useRef(0);
  const mountedRef = useRef(true);
  const skipCountRef = useRef(0);
  const MAX_SKIP = 10; // 最多连续跳过 10 首

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
    searchError: null,
  });

  // 加载歌单
  useEffect(() => {
    let cancelled = false;
    mountedRef.current = true;

    async function loadSongs() {
      setState((s) => ({ ...s, loading: true }));
      try {
        const songs = await getPlaylistSongs();
        if (!cancelled && songs.length > 0) {
          setState((s) => ({
            ...s,
            playlist: songs,
            loading: false,
            isReady: true,
            currentTrack: songs[0],
            duration: songs[0].duration,
          }));
          return;
        }
      } catch {}

      // 备用：随机搜索热门关键词
      if (!cancelled) {
        try {
          const keyword = hotKeywords[Math.floor(Math.random() * hotKeywords.length)];
          const songs = await searchSongs(keyword, 20);
          if (songs.length > 0) {
            setState((s) => ({
              ...s,
              playlist: songs,
              loading: false,
              isReady: true,
              currentTrack: songs[0],
              duration: songs[0].duration,
            }));
            return;
          }
        } catch {}
      }

      if (!cancelled) {
        setState((s) => ({ ...s, loading: false, error: "暂无可用歌曲，请稍后重试" }));
      }
    }

    player.init().then(() => {
      if (mountedRef.current) loadSongs();
    });

    player.onTimeUpdate((t) => {
      if (mountedRef.current) setState((s) => ({ ...s, currentTime: t }));
    });

    player.onEnded(() => {
      if (mountedRef.current) playNextInternal();
    });

    player.onError(() => {
      if (mountedRef.current) {
        skipCountRef.current++;
        if (skipCountRef.current < MAX_SKIP) {
          playNextInternal();
        } else {
          setState((s) => ({ ...s, error: "连续多首歌曲无法播放，请尝试搜索其他歌曲" }));
          skipCountRef.current = 0;
        }
      }
    });

    return () => {
      mountedRef.current = false;
      cancelled = true;
      player.stop();
    };
  }, []);

  // 🔍 搜索功能
  const doSearch = useCallback(async (keyword: string) => {
    if (!keyword.trim()) {
      setState((s) => ({ ...s, searchResults: [], searching: false }));
      return;
    }
    setState((s) => ({ ...s, searching: true, searchError: null }));
    try {
      const songs = await searchSongs(keyword, 30);
      if (mountedRef.current) {
        setState((s) => ({ ...s, searchResults: songs, searching: false }));
      }
    } catch {
      if (mountedRef.current) {
        setState((s) => ({ ...s, searching: false, searchError: "搜索失败，请重试" }));
      }
    }
  }, []);

  // 🎵 搜索并替换播放列表
  const searchAndPlay = useCallback(async (keyword: string) => {
    setState((s) => ({ ...s, loading: true }));
    try {
      const songs = await searchSongs(keyword, 30);
      if (mountedRef.current && songs.length > 0) {
        skipCountRef.current = 0;
        setState((s) => ({
          ...s,
          playlist: songs,
          currentTrack: songs[0],
          currentTrackIndex: 0,
          duration: songs[0].duration,
          loading: false,
          isReady: true,
          error: null,
        }));
        return;
      }
    } catch {}
    if (mountedRef.current) {
      setState((s) => ({ ...s, loading: false, error: "搜索无结果" }));
    }
  }, []);

  // 加载歌单并替换
  const loadPlaylist = useCallback(async (playlistId: number) => {
    setState((s) => ({ ...s, loading: true }));
    try {
      const songs = await getPlaylistSongs(playlistId);
      if (mountedRef.current && songs.length > 0) {
        skipCountRef.current = 0;
        setState((s) => ({
          ...s,
          playlist: songs,
          currentTrack: songs[0],
          currentTrackIndex: 0,
          duration: songs[0].duration,
          loading: false,
          isReady: true,
          error: null,
        }));
        return;
      }
    } catch {}
    if (mountedRef.current) {
      setState((s) => ({ ...s, loading: false, error: "加载歌单失败" }));
    }
  }, []);

  // 播放指定曲目
  const playTrack = useCallback(
    async (index: number) => {
      if (index < 0 || index >= state.playlist.length) return;

      const track = state.playlist[index];
      playIndexRef.current = index;
      setState((s) => ({
        ...s,
        currentTrack: track,
        currentTrackIndex: index,
        duration: track.duration,
        currentTime: 0,
        error: null,
      }));

      try {
        const url = await getSongUrl(track.id);
        if (url) {
          skipCountRef.current = 0;
          await player.play(url, track.id, track.duration);
          setState((s) => ({ ...s, isPlaying: true }));
        } else {
          // 自动跳过不可播歌曲
          skipCountRef.current++;
          setState((s) => ({
            ...s,
            error: `${track.name} 暂无播放源，自动跳过`,
          }));
          if (skipCountRef.current < MAX_SKIP) {
            setTimeout(() => playNextInternal(), 500);
          } else {
            setState((s) => ({
              ...s,
              error: "连续多首歌曲无法播放，请尝试其他歌单",
            }));
          }
        }
      } catch {
        setState((s) => ({ ...s, error: "获取播放地址失败" }));
      }
    },
    [state.playlist]
  );

  const playNextInternal = useCallback(() => {
    const nextIdx = (playIndexRef.current + 1) % state.playlist.length;
    playTrack(nextIdx);
  }, [state.playlist.length, playTrack]);

  const play = useCallback(
    (index?: number) => {
      const idx = index ?? state.currentTrackIndex;
      playTrack(idx);
    },
    [state.currentTrackIndex, playTrack]
  );

  const pause = useCallback(() => {
    player.pause();
    setState((s) => ({ ...s, isPlaying: false }));
  }, []);

  const resume = useCallback(() => {
    player.resume();
    setState((s) => ({ ...s, isPlaying: true }));
  }, []);

  const togglePlay = useCallback(() => {
    if (state.isPlaying) pause();
    else if (state.currentTime > 0) resume();
    else play();
  }, [state.isPlaying, state.currentTime, play, pause, resume]);

  const playNext = useCallback(() => {
    playNextInternal();
  }, [playNextInternal]);

  const playPrev = useCallback(() => {
    const prevIdx = (state.currentTrackIndex - 1 + state.playlist.length) % state.playlist.length;
    playTrack(prevIdx);
  }, [state.currentTrackIndex, state.playlist.length, playTrack]);

  const setQuality = useCallback((quality: QualityPreset) => {
    player.setQuality(quality);
    setState((s) => ({ ...s, quality }));
  }, []);

  const seekTo = useCallback((time: number) => {
    player.seekTo(time);
    setState((s) => ({ ...s, currentTime: time }));
  }, []);

  const setVolume = useCallback((v: number) => {
    player.setVolume(Math.min(1, Math.max(0, v)));
  }, []);

  return {
    ...state,
    togglePlay,
    play,
    pause,
    playNext,
    playPrev,
    setQuality,
    seekTo,
    setVolume,
    doSearch,
    searchAndPlay,
    loadPlaylist,
  };
}
