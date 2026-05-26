// ========== 类型定义 ==========
export interface SongInfo {
  id: number;
  name: string;
  artists: string[];
  album: string;
  albumPic: string;
  duration: number; // seconds
  url?: string;      // 播放地址（获取后填充）
}

export type QualityPreset = "lofi" | "standard" | "high" | "lossless";

export const qualityLabels: Record<QualityPreset, string> = {
  lofi: "Lo-Fi 怀旧",
  standard: "标准 128kbps",
  high: "高品质 320kbps",
  lossless: "无损 FLAC",
};

// ========== API 客户端 ==========
const BASE = "/api/music";

export async function searchSongs(keywords: string, limit = 30): Promise<SongInfo[]> {
  const res = await fetch(`${BASE}/search?keywords=${encodeURIComponent(keywords)}&limit=${limit}`);
  const data = await res.json();
  return data.songs || [];
}

export async function getSongUrl(id: number): Promise<string | null> {
  const res = await fetch(`${BASE}/url?id=${id}`);
  const data = await res.json();
  return data.url || null;
}

export async function getHotPlaylist(id?: number): Promise<SongInfo[]> {
  const url = id ? `${BASE}/playlist?id=${id}` : `${BASE}/playlist`;
  const res = await fetch(url);
  const data = await res.json();
  return data.songs || [];
}

// ========== 热门搜索关键词 ==========
export const hotKeywords = [
  "周杰伦", "林俊杰", "邓紫棋", "陈奕迅", "薛之谦",
  "Taylor Swift", "周深", "五月天", "告五人", "李荣浩",
];

// ========== 内置后备歌曲（合成音乐） ==========
export interface FallbackTrack {
  id: number;
  name: string;
  artists: string[];
  album: string;
  duration: number;
}

export function getFallbackTracks(): FallbackTrack[] {
  return [
    { id: -1, name: "星空下的约定", artists: ["林夜"], album: "星河万里", duration: 225 },
    { id: -2, name: "Electric Dreams", artists: ["Synth Collective"], album: "Neon Nights", duration: 252 },
    { id: -3, name: "城市孤岛", artists: ["陈默"], album: "无声告白", duration: 245 },
    { id: -4, name: "Whispers in the Wind", artists: ["Luna Wave"], album: "Midnight Echoes", duration: 208 },
    { id: -5, name: "极光之下", artists: ["北极星乐队"], album: "追光者", duration: 270 },
    { id: -6, name: "Golden Hour", artists: ["Aria Chen"], album: "Desert Bloom", duration: 235 },
    { id: -7, name: "雨后初晴", artists: ["小野丽莎"], album: "温柔时光", duration: 258 },
    { id: -8, name: "Dark Matter", artists: ["Echo Lab"], album: "Quantum Drift", duration: 302 },
  ];
}
