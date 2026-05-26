import { NextRequest, NextResponse } from "next/server";
import { getLyrics } from "@/lib/netease-api";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = parseInt(searchParams.get("id") || "");

  if (!id) {
    return NextResponse.json({ success: false, error: "Missing id" }, { status: 400 });
  }

  try {
    const result = await getLyrics(id);
    const lrc = result.body?.lrc?.lyric || "";
    const tlrc = result.body?.tlyric?.lyric || ""; // 翻译歌词
    return NextResponse.json({
      success: true,
      lyric: lrc,
      tlyric: tlrc,
    });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : String(e);
    console.error("Lyric error:", message);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
