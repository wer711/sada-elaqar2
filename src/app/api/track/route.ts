import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// ─── Event Tracking Endpoint ────────────────────────────────
// Tracks all page views, clicks, and conversion events
// Stores in TitleGeneration table using propType/purpose as event markers

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      event,
      utm_source,
      utm_medium,
      utm_campaign,
      utm_content,
      timestamp,
      propType,
      city,
      platform,
      source,
    } = body;

    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
      || req.headers.get("x-real-ip")
      || "unknown";

    // Store tracking event in DB
    // We reuse TitleGeneration table with special markers
    try {
      await db.titleGeneration.create({
        data: {
          propType: propType || "track",
          purpose: event || "unknown",
          city: city || source || "unknown",
          area: utm_source || null,
          space: utm_medium || null,
          rooms: utm_campaign || null,
          feature: utm_content || platform || null,
          price: ip || null,
          results: JSON.stringify({ event, timestamp, ip: ip.slice(0, 20) }),
        },
      });
    } catch {
      // silently fail — tracking should never break the page
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: true }); // Always return OK
  }
}
