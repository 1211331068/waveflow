import { NextRequest, NextResponse } from "next/server";

let _songUrl: ((params: any) => Promise<any>) | null = null;

async function getApi() {
  if (!_songUrl) {
    const mod = await import("NeteaseCloudMusicApi");
    _songUrl = (mod as any).song_url_v1 || (mod as any).default?.song_url_v1;
  }
  return _songUrl;
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = parseInt(searchParams.get("id") || "");
  const level = searchParams.get("level") || "exhigh";

  if (!id) {
    return NextResponse.json(
      { success: false, error: "Missing id" },
      { status: 400 }
    );
  }

  try {
    const song_url_v1 = await getApi();
    if (!song_url_v1) {
      return NextResponse.json(
        { success: false, error: "API module not loaded" },
        { status: 500 }
      );
    }

    let result = await song_url_v1({ id, level });
    let urlData = result.body?.data?.[0];

    if (!urlData?.url) {
      result = await song_url_v1({ id, level: "standard" });
      urlData = result.body?.data?.[0];
    }

    return NextResponse.json({
      success: !!urlData?.url,
      url: urlData?.url || null,
      id: urlData?.id || id,
      level: urlData?.level || "standard",
      type: urlData?.type || "",
    });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : String(e);
    console.error("URL error:", message);
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
