import { NextRequest, NextResponse } from "next/server";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { playlist_track_all } = require("NeteaseCloudMusicApi");

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = parseInt(searchParams.get("id") || "3778678");

  try {
    const result = await playlist_track_all({ id, limit: 50, offset: 0 });
    const songs = (result.body?.songs || []).map((s: Record<string, any>) => ({
      id: s.id,
      name: s.name,
      artists: (s.ar || []).map((a: Record<string, any>) => a.name),
      album: s.al?.name || "",
      albumPic: s.al?.picUrl || "",
      duration: Math.floor((s.dt || 0) / 1000),
    }));
    return NextResponse.json({ success: true, songs });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : String(e);
    console.error("Playlist error:", message);
    return NextResponse.json({ success: false, songs: [] });
  }
}
