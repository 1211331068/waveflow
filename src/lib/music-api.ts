// ========== 类型定义 ==========
export interface SongInfo {
  id: number;
  name: string;
  artists: string[];
  album: string;
  albumPic: string;
  duration: number;
  url?: string;
}

export interface CategoryInfo {
  id: string;
  name: string;
  icon: string;
  color: string;
  search: string;
  playlistId?: number;
  desc: string;
}

export type QualityPreset = "lofi" | "standard" | "high" | "lossless";

export const qualityLabels: Record<QualityPreset, string> = {
  lofi: "Lo-Fi 怀旧",
  standard: "标准品质",
  high: "高品质",
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

// ========== 歌单分类（正确分类 + 真实歌单ID）==========
export const categories: CategoryInfo[] = [
  {
    id: "hot",
    name: "热歌榜",
    icon: "🔥",
    color: "from-orange-500 via-red-500 to-pink-600",
    search: "热歌",
    playlistId: 3778678,
    desc: "云音乐官方热歌榜 · 实时更新",
  },
  {
    id: "rap",
    name: "说唱榜",
    icon: "🎤",
    color: "from-yellow-500 via-amber-500 to-orange-700",
    search: "中文说唱",
    playlistId: 9917082,
    desc: "中文嘻哈 · Rap · Trap",
  },
  {
    id: "english",
    name: "欧美热歌",
    icon: "🌍",
    color: "from-blue-500 via-indigo-500 to-purple-700",
    search: "Billboard Hot 100",
    playlistId: 2809513713,
    desc: "Billboard · 欧美精选",
  },
  {
    id: "instrumental",
    name: "纯音乐",
    icon: "🎹",
    color: "from-teal-500 via-cyan-500 to-blue-700",
    search: "纯音乐 钢琴",
    playlistId: 71309482,
    desc: "治愈 · 钢琴 · 轻音乐",
  },
  {
    id: "phonk",
    name: "Phonk",
    icon: "💜",
    color: "from-purple-500 via-violet-500 to-fuchsia-700",
    search: "phonk drift",
    playlistId: 8824402154,
    desc: "Drift Phonk · Night Drive",
  },
  {
    id: "electronic",
    name: "电子音乐",
    icon: "⚡",
    color: "from-cyan-400 via-blue-500 to-indigo-700",
    search: "电子音乐",
    playlistId: 6683129,
    desc: "EDM · House · Future Bass",
  },
  {
    id: "kpop",
    name: "K-Pop",
    icon: "⭐",
    color: "from-fuchsia-500 via-pink-500 to-rose-700",
    search: "K-POP 热门",
    playlistId: 8191906184,
    desc: "韩国流行 · 最新热单",
  },
  {
    id: "jpop",
    name: "日系精选",
    icon: "🌸",
    color: "from-pink-400 via-rose-400 to-red-500",
    search: "J-POP 热门",
    playlistId: 2829883282,
    desc: "日本流行 · 动漫原声",
  },
  {
    id: "rock",
    name: "摇滚经典",
    icon: "🎸",
    color: "from-red-600 via-rose-600 to-orange-700",
    search: "摇滚经典",
    playlistId: 751052058,
    desc: "经典摇滚 · Alternative",
  },
  {
    id: "rbsoul",
    name: "R&B / Soul",
    icon: "🎷",
    color: "from-amber-600 via-orange-500 to-yellow-600",
    search: "R&B Soul",
    playlistId: 2887819734,
    desc: "节奏蓝调 · 灵魂乐",
  },
  {
    id: "lofi",
    name: "Lo-Fi 自习室",
    icon: "📚",
    color: "from-green-500 via-emerald-500 to-teal-700",
    search: "lofi study",
    playlistId: 2829816518,
    desc: "学习 · 放松 · 专注",
  },
  {
    id: "chinese",
    name: "华语精选",
    icon: "🎵",
    color: "from-rose-500 via-pink-500 to-purple-700",
    search: "华语流行",
    playlistId: 745956260,
    desc: "华语流行精选",
  },
];

// ========== 热门搜索关键词 ==========
export const hotKeywords = [
  "周杰伦", "林俊杰", "邓紫棋", "陈奕迅", "薛之谦",
  "Taylor Swift", "The Weeknd", "Drake", "Ed Sheeran", "Billie Eilish",
  "phonk", "lofi", "chill", "BTS", "NewJeans",
];

// ========== 推荐艺人 ==========
export const discoverArtists = [
  { keyword: "周杰伦", label: "🎤 周杰伦", color: "from-amber-500 to-orange-600" },
  { keyword: "Taylor Swift", label: "🌟 Taylor Swift", color: "from-blue-500 to-indigo-600" },
  { keyword: "林俊杰", label: "🎹 林俊杰", color: "from-cyan-500 to-teal-600" },
  { keyword: "The Weeknd", label: "🌙 The Weeknd", color: "from-red-600 to-rose-700" },
  { keyword: "邓紫棋", label: "💎 邓紫棋", color: "from-purple-500 to-pink-600" },
  { keyword: "BTS", label: "💜 BTS", color: "from-violet-500 to-purple-700" },
  { keyword: "陈奕迅", label: "🎭 陈奕迅", color: "from-emerald-500 to-teal-600" },
  { keyword: "Ed Sheeran", label: "🎸 Ed Sheeran", color: "from-orange-500 to-red-600" },
  { keyword: "薛之谦", label: "🎵 薛之谦", color: "from-teal-500 to-green-600" },
  { keyword: "Billie Eilish", label: "👁 Billie Eilish", color: "from-green-500 to-emerald-700" },
  { keyword: "五月天", label: "🎸 五月天", color: "from-indigo-500 to-blue-600" },
  { keyword: "NewJeans", label: "🐰 NewJeans", color: "from-pink-400 to-rose-500" },
];
