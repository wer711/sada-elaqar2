import { NextRequest, NextResponse } from "next/server";

// ─── Event Tracking Endpoint (Vercel-Compatible) ──────────────
// Tracks all page views, clicks, and conversion events
// Falls back to console logging if DB is unavailable (serverless)

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

    // Log the event (always works)
    console.log(`📊 Track: ${event} | ${city || source || "unknown"} | ${ip.slice(0, 20)}`);

    // Try to save to DB (non-critical, works locally only)
    try {
      const { db } = await import("@/lib/db");
      if (db) {
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
      }
    } catch {
      // silently fail — tracking should never break the page
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: true }); // Always return OK
  }
}
