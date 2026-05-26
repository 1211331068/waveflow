import { NextRequest, NextResponse } from "next/server";
import { getSongUrl } from "@/lib/netease-api";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = parseInt(searchParams.get("id") || "");
  const level = searchParams.get("level") || "exhigh";

  if (!id) {
    return NextResponse.json({ success: false, error: "Missing id" }, { status: 400 });
  }

  try {
    let result = await getSongUrl(id, level);
    let urlData = result.body?.data?.[0];

    if (!urlData?.url) {
      result = await getSongUrl(id, "standard");
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
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
