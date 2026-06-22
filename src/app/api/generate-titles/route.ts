import { NextRequest, NextResponse } from "next/server";
import ZAI from "z-ai-web-dev-sdk";
import { db } from "@/lib/db";

// ─── Invisible Smart Rate Limiting ──────────────────────────
const GLOBAL_DAILY_SOFT_LIMIT = 80;
const GLOBAL_DAILY_HARD_LIMIT = 150;
const PER_IP_DAILY_LIMIT = 3;

let dailyCount = 0;
let dailyCountDate = new Date().toISOString().slice(0, 10);
const ipCounts = new Map<string, { count: number; date: string }>();

function getToday(): string {
  return new Date().toISOString().slice(0, 10);
}

function checkDailyReset() {
  const today = getToday();
  if (today !== dailyCountDate) {
    dailyCount = 0;
    dailyCountDate = today;
  }
}

function getIpCount(ip: string): number {
  const entry = ipCounts.get(ip);
  const today = getToday();
  if (!entry || entry.date !== today) return 0;
  return entry.count;
}

function incrementIpCount(ip: string) {
  const today = getToday();
  const entry = ipCounts.get(ip);
  if (!entry || entry.date !== today) {
    ipCounts.set(ip, { count: 1, date: today });
  } else {
    entry.count++;
  }
}

// ─── Tracking Helper ────────────────────────────────────────
async function trackEvent(event: string, data: Record<string, string>) {
  // Store tracking events in DB for later analysis
  try {
    await db.titleGeneration.create({
      data: {
        propType: data.propType || "track",
        purpose: data.purpose || event,
        city: data.city || data.source || "unknown",
        area: data.utm_source || null,
        space: data.utm_medium || null,
        rooms: data.utm_campaign || null,
        feature: data.utm_content || null,
        price: data.ip || null,
        results: JSON.stringify(data),
      },
    });
  } catch {
    // silently fail
  }
}

export async function POST(req: NextRequest) {
  try {
    checkDailyReset();

    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
      || req.headers.get("x-real-ip")
      || "unknown";

    const ipUsage = getIpCount(ip);
    if (ipUsage >= PER_IP_DAILY_LIMIT) {
      return NextResponse.json(
        {
          error: "limit_reached",
          message: "لقد استخدمت حدودك اليومية من الأداة المجانية. جرّب النسخة الكاملة بدون حدود!",
          redirect: "https://sada-elaqar.vercel.app",
        },
        { status: 429 }
      );
    }

    if (dailyCount >= GLOBAL_DAILY_HARD_LIMIT) {
      return NextResponse.json(
        {
          error: "daily_limit",
          message: "تم الوصول للحد اليومي للأداة المجانية. النسخة الكاملة متاحة دائماً!",
          redirect: "https://sada-elaqar.vercel.app",
        },
        { status: 429 }
      );
    }

    if (dailyCount >= GLOBAL_DAILY_SOFT_LIMIT) {
      const overSoft = dailyCount - GLOBAL_DAILY_SOFT_LIMIT;
      const delayMs = Math.min(overSoft * 500, 5000);
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }

    // ── Parse & Validate ──
    const body = await req.json();
    const { propType, purpose, city, area, space, rooms, feature, price, utm_source, utm_medium, utm_campaign, utm_content } = body;

    if (!propType || !purpose || !city) {
      return NextResponse.json(
        { error: "نوع العقار والغرض والمدينة مطلوبون" },
        { status: 400 }
      );
    }

    // Build extras
    const extras = [
      space ? `المساحة: ${space} م²` : "",
      rooms ? `عدد الغرف: ${rooms}` : "",
      feature ? `ميزة بارزة: ${feature}` : "",
      price ? `السعر: ${price}` : "",
      area ? `الحي/المنطقة: ${area}` : "",
    ]
      .filter(Boolean)
      .join("، ");

    const prompt = `أنت خبير في التسويق العقاري للسوق العربي والخليجي.

بيانات العقار:
- النوع: ${propType}
- الغرض: ${purpose}
- المدينة: ${city}
${extras ? `- تفاصيل إضافية: ${extras}` : ""}

المطلوب: اكتب بالضبط 6 عناوين تسويقية جذابة وقوية لهذا العقار، كل عنوان مخصص لمنصة مختلفة.

أجب فقط بهذا الـ JSON بدون أي كلام إضافي أو backticks:
{
  "titles": [
    {"platform": "واتساب", "title": "..."},
    {"platform": "إنستغرام", "title": "..."},
    {"platform": "تويتر / X", "title": "..."},
    {"platform": "فيسبوك", "title": "..."},
    {"platform": "سناب شات", "title": "..."},
    {"platform": "لينكدإن", "title": "..."}
  ]
}

قواعد كل عنوان:
- واتساب: تفصيلي وودود، يذكر المميزات والموقع، ينتهي بدعوة للتواصل (لا يتجاوز 3 أسطر)
- إنستغرام: جذاب ومشاعري، يستخدم نقاط وإيموجي مناسبة، قصير وقوي
- تويتر/X: مباشر وصادم، لا يتجاوز 200 حرف، يثير الفضول
- فيسبوك: تفصيلي وموثوق، يعرض المميزات والسعر بوضوح، لغة ودية وعائلية
- سناب شات: شبابي وسريع، يستخدم إيموجي كثيرة، قصير جداً ومثير للفضول
- لينكدإن: احترافي واستثماري، يركز على العائد والقيمة، لغة أعمال

اكتب بلهجة عربية فصيحة مناسبة لمدينة ${city}. لا تستخدم كلمات إنجليزية.`;

    // ── AI Generation ──
    const zai = await ZAI.create();

    const completion = await zai.chat.completions.create({
      messages: [
        {
          role: "assistant",
          content:
            "أنت مساعد تسويق عقاري محترف. أجب فقط بصيغة JSON كما هو مطلوب بدون أي نص إضافي.",
        },
        { role: "user", content: prompt },
      ],
      thinking: { type: "disabled" },
    });

    const text = completion.choices[0]?.message?.content || "";

    let parsed;
    try {
      const clean = text.replace(/```json|```/g, "").trim();
      parsed = JSON.parse(clean);
    } catch {
      return NextResponse.json(
        { error: "تعذّر تحليل الاستجابة، حاول مرة أخرى" },
        { status: 500 }
      );
    }

    // ── Track usage ──
    dailyCount++;
    incrementIpCount(ip);

    // Save to database with tracking data
    try {
      await db.titleGeneration.create({
        data: {
          propType,
          purpose,
          city,
          area: area || null,
          space: space || null,
          rooms: rooms || null,
          feature: feature || null,
          price: price || null,
          results: JSON.stringify(parsed.titles),
        },
      });
    } catch (dbError) {
      console.error("DB save error:", dbError);
    }

    // Track UTM/source data
    if (utm_source || utm_medium || utm_campaign) {
      trackEvent("generation", {
        propType,
        purpose,
        city,
        utm_source: utm_source || "",
        utm_medium: utm_medium || "",
        utm_campaign: utm_campaign || "",
        utm_content: utm_content || "",
        ip,
        source: "title-tool",
      }).catch(() => {});
    }

    const remaining = Math.max(0, PER_IP_DAILY_LIMIT - getIpCount(ip));

    return NextResponse.json({
      titles: parsed.titles,
      _meta: { remaining },
    });
  } catch (error) {
    console.error("Generation error:", error);
    return NextResponse.json(
      { error: "حدث خطأ أثناء التوليد — تحقق من اتصالك وحاول مجدداً" },
      { status: 500 }
    );
  }
}
