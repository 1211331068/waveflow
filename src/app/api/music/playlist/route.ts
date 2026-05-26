import { NextRequest, NextResponse } from "next/server";

let _playlistTrackAll: ((params: any) => Promise<any>) | null = null;

async function getApi() {
  if (!_playlistTrackAll) {
    const mod = await import("NeteaseCloudMusicApi");
    _playlistTrackAll = (mod as any).playlist_track_all || (mod as any).default?.playlist_track_all;
  }
  return _playlistTrackAll;
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = parseInt(searchParams.get("id") || "3778678");

  try {
    const playlist_track_all = await getApi();
    if (!playlist_track_all) {
      return NextResponse.json(
        { success: false, error: "API module not loaded" },
        { status: 500 }
      );
    }

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
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
