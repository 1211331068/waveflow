import { NextRequest, NextResponse } from "next/server";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { song_url_v1 } = require("NeteaseCloudMusicApi");

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
    let result = await song_url_v1({ id, level });
    let urlData = result.body?.data?.[0];

    // fallback to standard quality
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
    return NextResponse.json({
      success: false,
      error: "Music server unavailable",
    });
  }
}
