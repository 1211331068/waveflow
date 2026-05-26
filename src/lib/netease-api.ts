// 绕过 NeteaseCloudMusicApi 的 main.js（它加载全部 377 个模块，在 Vercel 上会失败）
// 这里只加载我们需要的 4 个模块 + 共享依赖

import { createRequire } from "node:module";
import { existsSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { resolve } from "node:path";

// 确保 /tmp/anonymous_token 存在 (util/request.js 需要它)
const tokenPath = resolve(tmpdir(), "anonymous_token");
if (!existsSync(tokenPath)) {
  writeFileSync(tokenPath, "", "utf-8");
}

const req = createRequire(import.meta.url);

// 只加载需要的具体模块（不会触发 main.js 的全局加载）
const requestFn = req("NeteaseCloudMusicApi/util/request.js");
const searchModule = req("NeteaseCloudMusicApi/module/search.js");
const songUrlModule = req("NeteaseCloudMusicApi/module/song_url_v1.js");
const playlistModule = req("NeteaseCloudMusicApi/module/playlist_track_all.js");
const lyricModule = req("NeteaseCloudMusicApi/module/lyric.js");

// 🇨🇳 中国 IP 池 - 伪装请求来源，解决海外服务器播放限制
const CN_IPS = [
  "116.25.146.101", "58.60.1.24", "113.68.153.86",
  "120.229.45.42", "183.6.100.88", "223.104.1.25",
  "112.96.109.102", "117.136.79.10", "36.110.147.28",
  "111.206.94.146", "221.219.99.186", "123.120.193.98",
];

function randomCNIP(): string {
  return CN_IPS[Math.floor(Math.random() * CN_IPS.length)];
}

// 🍪 VIP Cookie 支持（通过环境变量 NETEASE_COOKIE 传入）
function getCookie(): string | undefined {
  return process.env.NETEASE_COOKIE || undefined;
}

function invoke(
  mod: (query: any, request: any) => Promise<any>,
  data: Record<string, any> = {}
) {
  const cookie = getCookie();
  const params: Record<string, any> = { ...data, realIP: randomCNIP() };
  if (cookie) {
    params.cookie = cookie;
  }
  return mod(params, requestFn);
}

export async function searchSongs(keywords: string, limit = 30) {
  return invoke(searchModule, { keywords, limit, type: 1 });
}

// 尝试多个音质级别获取播放 URL（VIP 可用更高音质）
export async function getSongUrl(id: number, level = "exhigh") {
  return invoke(songUrlModule, { id, level });
}

// 获取歌词
export async function getLyrics(id: number) {
  return invoke(lyricModule, { id });
}

export async function getPlaylistTracks(playlistId = 3778678) {
  return invoke(playlistModule, { id: playlistId, limit: 50, offset: 0 });
}
