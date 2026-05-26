"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { getAudioPlayer } from "@/lib/audio-player";
import {
  getHotPlaylist,
  getSongUrl,
  getFallbackTracks,
  hotKeywords,
  qualityLabels,
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
  usingFallback: boolean;
}

const FALLBACK_TRACKS: SongInfo[] = getFallbackTracks().map((t) => ({
  id: t.id,
  name: t.name,
  artists: t.artists,
  album: t.album,
  albumPic: "",
  duration: t.duration,
}));

export function useMusicPlayer() {
  const player = useRef(getAudioPlayer()).current;
  const playIndexRef = useRef(0);
  const mountedRef = useRef(true);

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
    usingFallback: false,
  });

  // Load playlist on mount
  useEffect(() => {
    let cancelled = false;
    mountedRef.current = true;

    async function loadSongs() {
      setState((s) => ({ ...s, loading: true }));
      try {
        // Try loading real songs from Netease
        const songs = await getHotPlaylist();
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
      } catch {
        // API error, fall through to random search
      }

      // Try searching for popular songs
      if (!cancelled) {
        try {
          const keyword = hotKeywords[Math.floor(Math.random() * hotKeywords.length)];
          const songs = await import("@/lib/music-api").then((m) => m.searchSongs(keyword, 20));
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

      // Ultimate fallback: synthesized tracks
      if (!cancelled) {
        setState((s) => ({
          ...s,
          playlist: FALLBACK_TRACKS,
          loading: false,
          isReady: true,
          currentTrack: FALLBACK_TRACKS[0],
          duration: FALLBACK_TRACKS[0].duration,
          usingFallback: true,
        }));
      }
    }

    player.init().then(() => {
      loadSongs();
    });

    player.onTimeUpdate((t) => {
      if (mountedRef.current) {
        setState((s) => ({ ...s, currentTime: t }));
      }
    });

    player.onEnded(() => {
      if (mountedRef.current) {
        playNextInternal();
      }
    });

    player.onError((msg) => {
      if (mountedRef.current) {
        setState((s) => ({ ...s, error: msg }));
      }
    });

    return () => {
      mountedRef.current = false;
      cancelled = true;
      player.stop();
    };
  }, []);

  // Play a specific track
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

      if (state.usingFallback) {
        // Use synth engine for fallback
        const { getAudioEngine } = await import("@/lib/audio-engine");
        const engine = getAudioEngine();
        await engine.init();
        engine.playTrack(index);
        setState((s) => ({ ...s, isPlaying: true }));
        return;
      }

      // Get real URL and play
      try {
        const url = await getSongUrl(track.id);
        if (url) {
          await player.play(url, track.id, track.duration);
          setState((s) => ({ ...s, isPlaying: true }));
        } else {
          setState((s) => ({
            ...s,
            error: "该歌曲暂无播放源（可能需要 VIP 或已下架）",
          }));
        }
      } catch {
        setState((s) => ({ ...s, error: "获取播放地址失败" }));
      }
    },
    [state.playlist, state.usingFallback]
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
    if (state.isPlaying) {
      pause();
    } else {
      if (state.currentTime > 0) {
        resume();
      } else {
        play();
      }
    }
  }, [state.isPlaying, state.currentTime, play, pause, resume]);

  const playNext = useCallback(() => {
    const nextIdx = (state.currentTrackIndex + 1) % state.playlist.length;
    playTrack(nextIdx);
  }, [state.currentTrackIndex, state.playlist.length, playTrack]);

  const playPrev = useCallback(() => {
    const prevIdx =
      (state.currentTrackIndex - 1 + state.playlist.length) % state.playlist.length;
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
    trackCount: state.playlist.length,
    qualityLabels,
    togglePlay,
    play,
    pause,
    playNext,
    playPrev,
    setQuality,
    seekTo,
    setVolume,
  };
}
