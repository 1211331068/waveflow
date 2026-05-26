const http = require("http");
const api = require("NeteaseCloudMusicApi");

const PORT = 3001;

function sendJSON(res, data, status = 200) {
  res.writeHead(status, {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
  });
  res.end(JSON.stringify(data));
}

function parseURL(url) {
  const parsed = new URL(url, "http://localhost");
  const path = parsed.pathname;
  const params = Object.fromEntries(parsed.searchParams.entries());
  return { path, params };
}

const server = http.createServer(async (req, res) => {
  if (req.method === "OPTIONS") {
    res.writeHead(204, {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
    });
    res.end();
    return;
  }

  const { path, params } = parseURL(req.url);

  try {
    if (path === "/search") {
      const result = await api.search({
        keywords: params.keywords || "热门",
        limit: parseInt(params.limit) || 30,
        type: 1,
      });
      const songs = (result.body?.result?.songs || []).map((s) => ({
        id: s.id,
        name: s.name,
        artists: (s.ar || []).map((a) => a.name),
        album: s.al?.name || "",
        albumPic: s.al?.picUrl || "",
        duration: Math.floor((s.dt || 0) / 1000),
      }));
      sendJSON(res, { success: true, songs, total: result.body?.result?.songCount || 0 });
      return;
    }

    if (path === "/url") {
      const id = parseInt(params.id);
      if (!id) {
        sendJSON(res, { success: false, error: "Missing id" }, 400);
        return;
      }

      let result = await api.song_url_v1({ id, level: params.level || "exhigh" });
      let urlData = result.body?.data?.[0];

      if (!urlData?.url) {
        result = await api.song_url_v1({ id, level: "standard" });
        urlData = result.body?.data?.[0];
      }

      sendJSON(res, {
        success: !!urlData?.url,
        url: urlData?.url || null,
        id: urlData?.id || id,
        level: urlData?.level || "standard",
        type: urlData?.type || "",
      });
      return;
    }

    if (path === "/playlist") {
      const playlistId = parseInt(params.id) || 3778678;
      const result = await api.playlist_track_all({
        id: playlistId,
        limit: 50,
        offset: 0,
      });
      const songs = (result.body?.songs || []).map((s) => ({
        id: s.id,
        name: s.name,
        artists: (s.ar || []).map((a) => a.name),
        album: s.al?.name || "",
        albumPic: s.al?.picUrl || "",
        duration: Math.floor((s.dt || 0) / 1000),
      }));
      sendJSON(res, { success: true, songs });
      return;
    }

    sendJSON(res, { success: false, error: "Unknown endpoint" }, 404);
  } catch (e) {
    console.error("Music server error:", e.message);
    sendJSON(res, { success: false, error: e.message }, 500);
  }
});

// 🔒 只监听 localhost，防止外部直接访问音乐API
server.listen(PORT, "127.0.0.1", () => {
  console.log("Music API server (internal) running on http://127.0.0.1:" + PORT);
});
