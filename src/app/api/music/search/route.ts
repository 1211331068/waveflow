import { NextRequest, NextResponse } from "next/server";
import { searchSongs } from "@/lib/netease-api";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const keywords = searchParams.get("keywords") || "热门";
  const limit = parseInt(searchParams.get("limit") || "30");

  try {
    const result = await searchSongs(keywords, limit);
    const songs = (result.body?.result?.songs || []).map((s: Record<string, any>) => ({
      id: s.id,
      name: s.name,
      artists: (s.ar || []).map((a: Record<string, any>) => a.name),
      album: s.al?.name || "",
      albumPic: s.al?.picUrl || "",
      duration: Math.floor((s.dt || 0) / 1000),
    }));
    return NextResponse.json({
      success: true,
      songs,
      total: result.body?.result?.songCount || 0,
    });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : String(e);
    console.error("Search error:", message);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
