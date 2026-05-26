import { NextRequest, NextResponse } from "next/server";
import { getSongUrl } from "@/lib/netease-api";

// 音质降级顺序：从高到低尝试
const LEVELS = ["hires", "lossless", "exhigh", "higher", "standard"];

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = parseInt(searchParams.get("id") || "");

  if (!id) {
    return NextResponse.json({ success: false, error: "Missing id" }, { status: 400 });
  }

  try {
    // 按优先级依次尝试各音质级别
    for (const level of LEVELS) {
      const result = await getSongUrl(id, level);
      const urlData = result.body?.data?.[0];
      if (urlData?.url) {
        return NextResponse.json({
          success: true,
          url: urlData.url,
          id: urlData.id || id,
          level: urlData.level || level,
          type: urlData.type || "",
        });
      }
    }

    return NextResponse.json({
      success: false,
      url: null,
      id,
      level: "none",
      type: "",
    });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : String(e);
    console.error("URL error:", message);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
