import { NextRequest, NextResponse } from "next/server";

let _search: ((params: any) => Promise<any>) | null = null;

async function getApi() {
  if (!_search) {
    const mod = await import("NeteaseCloudMusicApi");
    _search = (mod as any).search || (mod as any).default?.search;
  }
  return _search;
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const keywords = searchParams.get("keywords") || "热门";
  const limit = parseInt(searchParams.get("limit") || "30");

  try {
    const search = await getApi();
    if (!search) {
      return NextResponse.json(
        { success: false, error: "API module not loaded" },
        { status: 500 }
      );
    }
    const result = await search({ keywords, limit, type: 1 });
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
    const stack = e instanceof Error ? e.stack : "";
    console.error("Search error:", message, stack);
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
