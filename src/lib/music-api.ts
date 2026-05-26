// ========== 类型定义 ==========
export interface SongInfo {
  id: number;
  name: string;
  artists: string[];
  album: string;
  albumPic: string;
  duration: number; // seconds
  url?: string;
}

export interface PlaylistInfo {
  id: number;
  name: string;
  coverImgUrl: string;
  description: string;
  trackCount: number;
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

export async function getPlaylistSongs(id?: number): Promise<SongInfo[]> {
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

// ========== 热门歌单 ID（网易云真实歌单）==========
export const hotPlaylists: PlaylistInfo[] = [
  { id: 3778678, name: "热歌榜", coverImgUrl: "", description: "云音乐热歌榜", trackCount: 200 },
  { id: 2884035, name: "官方榜", coverImgUrl: "", description: "云音乐新歌榜", trackCount: 100 },
  { id: 19723756, name: "飙升榜", coverImgUrl: "", description: "云音乐飙升榜", trackCount: 100 },
  { id: 3779629, name: "新歌榜", coverImgUrl: "", description: "云音乐新歌榜", trackCount: 100 },
  { id: 4395559, name: "欧美热歌", coverImgUrl: "", description: "欧美最热单曲", trackCount: 200 },
  { id: 745956260, name: "华语精选", coverImgUrl: "", description: "华语精选歌单", trackCount: 160 },
  { id: 6683129, name: "电子精选", coverImgUrl: "", description: "电子音乐精选", trackCount: 120 },
  { id: 2645297116, name: "轻音乐", coverImgUrl: "", description: "治愈系轻音乐", trackCount: 80 },
];

// ========== 推荐搜索 ==========
export const discoverSearches = [
  { keyword: "周杰伦", label: "🎤 周杰伦", color: "from-amber-500 to-orange-600" },
  { keyword: "林俊杰", label: "🎹 林俊杰", color: "from-blue-500 to-cyan-600" },
  { keyword: "邓紫棋", label: "🌟 邓紫棋", color: "from-purple-500 to-pink-600" },
  { keyword: "陈奕迅", label: "🎭 陈奕迅", color: "from-emerald-500 to-teal-600" },
  { keyword: "Taylor Swift", label: "🎸 Taylor Swift", color: "from-rose-500 to-red-600" },
  { keyword: "五月天", label: "🎸 五月天", color: "from-indigo-500 to-violet-600" },
  { keyword: "薛之谦", label: "🎵 薛之谦", color: "from-teal-500 to-green-600" },
  { keyword: "周深", label: "🎶 周深", color: "from-pink-500 to-rose-600" },
];
