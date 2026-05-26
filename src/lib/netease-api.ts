// 绕过 NeteaseCloudMusicApi 的 main.js（它加载全部 377 个模块，在 Vercel 上会失败）
// 这里只加载我们需要的 3 个模块 + 共享依赖

import { createRequire } from "node:module";
const req = createRequire(import.meta.url);

// 只加载需要的具体模块（不会触发 main.js 的全局加载）
const requestFn = req("NeteaseCloudMusicApi/util/request.js");
const searchModule = req("NeteaseCloudMusicApi/module/search.js");
const songUrlModule = req("NeteaseCloudMusicApi/module/song_url_v1.js");
const playlistModule = req("NeteaseCloudMusicApi/module/playlist_track_all.js");

const { cookieToJson } = req("NeteaseCloudMusicApi/util/index.js");

function invoke(mod: (query: any, request: any) => Promise<any>, data: Record<string, any> = {}) {
  const cookie = typeof data.cookie === "string" ? cookieToJson(data.cookie) : data.cookie || {};
  return mod({ ...data, cookie }, requestFn);
}

export async function searchSongs(keywords: string, limit = 30) {
  return invoke(searchModule, { keywords, limit, type: 1 });
}

export async function getSongUrl(id: number, level = "exhigh") {
  return invoke(songUrlModule, { id, level });
}

export async function getPlaylistTracks(playlistId = 3778678) {
  return invoke(playlistModule, { id: playlistId, limit: 50, offset: 0 });
}
