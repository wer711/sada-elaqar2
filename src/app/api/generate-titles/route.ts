import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// ─── Triple Provider: Groq → Gemini → z-ai ─────────────────
// Groq: Free, fast, global (no geo-restrictions) — PRIMARY
// Gemini: Free but geo-restricted — SECONDARY
// z-ai: Works locally only — FALLBACK

async function generateWithGroq(prompt: string): Promise<string> {
  const Groq = (await import("groq-sdk")).default;
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) throw new Error("NO_GROQ_KEY");

  const groq = new Groq({ apiKey });
  const chatCompletion = await groq.chat.completions.create({
    messages: [
      {
        role: "system",
        content: "أنت مساعد تسويق عقاري محترف. أجب فقط بصيغة JSON كما هو مطلوب بدون أي نص إضافي.",
      },
      { role: "user", content: prompt },
    ],
    model: "llama-3.3-70b-versatile",
    temperature: 0.7,
    max_tokens: 2000,
  });

  return chatCompletion.choices[0]?.message?.content || "";
}

async function generateWithGemini(prompt: string): Promise<string> {
  const { GoogleGenerativeAI } = await import("@google/generative-ai");
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("NO_GEMINI_KEY");

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
  const result = await model.generateContent(prompt);
  return result.response.text();
}

async function generateWithZai(prompt: string): Promise<string> {
  const ZAI = (await import("z-ai-web-dev-sdk")).default;
  const zai = await ZAI.create();
  const completion = await zai.chat.completions.create({
    messages: [
      {
        role: "assistant",
        content: "أنت مساعد تسويق عقاري محترف. أجب فقط بصيغة JSON كما هو مطلوب بدون أي نص إضافي.",
      },
      { role: "user", content: prompt },
    ],
    thinking: { type: "disabled" },
  });
  return completion.choices[0]?.message?.content || "";
}

async function generateContent(prompt: string): Promise<string> {
  const errors: string[] = [];

  // 1. Try Groq (best for production — free, fast, global)
  try {
    return await generateWithGroq(prompt);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "unknown";
    errors.push(`Groq: ${msg}`);
    console.log(`Groq failed (${msg})`);
  }

  // 2. Try Gemini (free but geo-restricted)
  try {
    return await generateWithGemini(prompt);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "unknown";
    errors.push(`Gemini: ${msg}`);
    console.log(`Gemini failed (${msg})`);
  }

  // 3. Try z-ai (local dev fallback)
  try {
    return await generateWithZai(prompt);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "unknown";
    errors.push(`z-ai: ${msg}`);
    console.log(`z-ai failed (${msg})`);
  }

  throw new Error(`All AI providers failed: ${errors.join(" | ")}`);
}

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

    const body = await req.json();
    const { propType, purpose, city, area, space, rooms, feature, price } = body;

    if (!propType || !purpose || !city) {
      return NextResponse.json(
        { error: "نوع العقار والغرض والمدينة مطلوبون" },
        { status: 400 }
      );
    }

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

    // ── Generate with triple provider ──
    const text = await generateContent(prompt);

    let parsed;
    try {
      const clean = text.replace(/```json|```/g, "").trim();
      parsed = JSON.parse(clean);
    } catch {
      const jsonMatch = text.match(/\{[\s\S]*"titles"[\s\S]*\}/);
      if (jsonMatch) {
        try {
          parsed = JSON.parse(jsonMatch[0]);
        } catch {
          return NextResponse.json(
            { error: "تعذّر تحليل الاستجابة، حاول مرة أخرى" },
            { status: 500 }
          );
        }
      } else {
        return NextResponse.json(
          { error: "تعذّر تحليل الاستجابة، حاول مرة أخرى" },
          { status: 500 }
        );
      }
    }

    dailyCount++;
    incrementIpCount(ip);

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
