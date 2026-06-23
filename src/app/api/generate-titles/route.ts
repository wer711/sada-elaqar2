import { NextRequest, NextResponse } from "next/server";

// ─── Multi-Provider AI System (Vercel-Compatible) ───────────
// Tries providers in order until one works
// Groq → OpenRouter → Gemini
// No SQLite dependency - works on serverless

const AI_PROMPT_SYSTEM = "أنت مساعد تسويق عقاري محترف. أجب فقط بصيغة JSON كما هو مطلوب بدون أي نص إضافي.";

async function generateWithGroq(prompt: string): Promise<string> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) throw new Error("NO_KEY");

  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      messages: [
        { role: "system", content: AI_PROMPT_SYSTEM },
        { role: "user", content: prompt },
      ],
      model: "llama-3.3-70b-versatile",
      temperature: 0.7,
      max_tokens: 2000,
    }),
  });

  if (!response.ok) {
    const errText = await response.text().catch(() => "");
    throw new Error(`Groq API error ${response.status}: ${errText.slice(0, 200)}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;
  if (!content) throw new Error("Empty response from Groq");
  return content;
}

async function generateWithOpenRouter(prompt: string): Promise<string> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) throw new Error("NO_KEY");

  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`,
      "HTTP-Referer": "https://sada-elaqar.vercel.app",
      "X-Title": "صدى العقار",
    },
    body: JSON.stringify({
      model: "deepseek/deepseek-chat-v3-0324:free",
      messages: [
        { role: "system", content: AI_PROMPT_SYSTEM },
        { role: "user", content: prompt },
      ],
      temperature: 0.7,
      max_tokens: 2000,
    }),
  });

  if (!response.ok) {
    const errText = await response.text().catch(() => "");
    throw new Error(`OpenRouter API error ${response.status}: ${errText.slice(0, 200)}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;
  if (!content) throw new Error("Empty response from OpenRouter");
  return content;
}

async function generateWithGemini(prompt: string): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("NO_KEY");

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: `${AI_PROMPT_SYSTEM}\n\n${prompt}` }] }],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 2000,
      },
    }),
  });

  if (!response.ok) {
    const errText = await response.text().catch(() => "");
    throw new Error(`Gemini API error ${response.status}: ${errText.slice(0, 200)}`);
  }

  const data = await response.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error("Empty response from Gemini");
  return text;
}

async function generateWithZai(prompt: string): Promise<string> {
  try {
    const ZAI = (await import("z-ai-web-dev-sdk")).default;
    const zai = await ZAI.create();
    const completion = await zai.chat.completions.create({
      messages: [
        { role: "assistant", content: AI_PROMPT_SYSTEM },
        { role: "user", content: prompt },
      ],
      thinking: { type: "disabled" },
    });
    const content = completion.choices[0]?.message?.content;
    if (!content) throw new Error("Empty response");
    return content;
  } catch {
    throw new Error("z-ai unavailable");
  }
}

type ProviderFn = (prompt: string) => Promise<string>;

interface Provider {
  name: string;
  fn: ProviderFn;
}

function getProviders(): Provider[] {
  const providers: Provider[] = [];

  if (process.env.GROQ_API_KEY) {
    providers.push({ name: "Groq", fn: generateWithGroq });
  }
  if (process.env.OPENROUTER_API_KEY) {
    providers.push({ name: "OpenRouter", fn: generateWithOpenRouter });
  }
  if (process.env.GEMINI_API_KEY) {
    providers.push({ name: "Gemini", fn: generateWithGemini });
  }
  // z-ai as last resort (may not work on all platforms)
  providers.push({ name: "z-ai", fn: generateWithZai });

  return providers;
}

async function generateContent(prompt: string): Promise<string> {
  const providers = getProviders();
  const errors: string[] = [];

  for (const provider of providers) {
    try {
      const result = await provider.fn(prompt);
      console.log(`✅ ${provider.name} succeeded`);
      return result;
    } catch (e) {
      const msg = e instanceof Error ? e.message : "unknown";
      errors.push(`${provider.name}: ${msg}`);
      console.log(`❌ ${provider.name} failed (${msg})`);
    }
  }

  throw new Error(`All AI providers failed: ${errors.join(" | ")}`);
}

// ─── Invisible Smart Rate Limiting (In-Memory) ─────────────
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

    // Try to save to DB (non-critical, works locally)
    try {
      const { db } = await import("@/lib/db");
      if (db) {
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
      }
    } catch (dbError) {
      console.error("DB save error (non-critical):", dbError);
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
