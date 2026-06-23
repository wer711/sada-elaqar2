import { NextRequest, NextResponse } from "next/server";

// ─── Multi-Provider AI System (Vercel-Compatible) ───────────
// Tries providers in order until one works
// Groq → OpenRouter → Gemini → z-ai
// No SQLite dependency - works on serverless

const AI_PROMPT_SYSTEM = `أنت خبير تسويق عقاري محترف ومستشار رقمي. أجب فقط بصيغة JSON كما هو مطلوب بدون أي نص إضافي أو markdown.`;

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
      temperature: 0.85,
      max_tokens: 3000,
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
      temperature: 0.85,
      max_tokens: 3000,
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

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-lite:generateContent?key=${apiKey}`;
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: `${AI_PROMPT_SYSTEM}\n\n${prompt}` }] }],
      generationConfig: {
        temperature: 0.85,
        maxOutputTokens: 3000,
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
// The user NEVER sees "limit" or "remaining" — only natural delays
// and friendly messages when the server is "busy"

const PER_IP_DAILY_SOFT = 3;   // After this: add progressive delay
const PER_IP_DAILY_HARD = 6;   // After this: soft busy message (no "limit" word)
const GLOBAL_DAILY_SOFT = 80;  // Progressive delay after this
const GLOBAL_DAILY_HARD = 200; // Hard busy message after this

let dailyCount = 0;
let dailyCountDate = new Date().toISOString().slice(0, 10);
const ipCounts = new Map<string, { count: number; date: string }>();
const recentRequests = new Map<string, number>(); // IP -> last request timestamp

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

    // ── Invisible progressive delay (soft limit) ──
    if (ipUsage >= PER_IP_DAILY_SOFT && ipUsage < PER_IP_DAILY_HARD) {
      // Add natural-feeling delay that increases with each request
      const delayMs = Math.min((ipUsage - PER_IP_DAILY_SOFT + 1) * 2000, 10000);
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }

    // ── Hard limit: friendly "busy" message (no mention of limits) ──
    if (ipUsage >= PER_IP_DAILY_HARD) {
      // Check if enough time has passed since last request (2 hour cooldown)
      const lastReq = recentRequests.get(ip) || 0;
      const hoursSinceLastReq = (Date.now() - lastReq) / (1000 * 60 * 60);
      
      if (hoursSinceLastReq < 2) {
        return NextResponse.json(
          {
            titles: [],
            marketingTips: [],
            message: "الخادم مشغول الآن بطلبات كثيرة 🔄 جرب بعد قليل وستحصل على نتيجة ممتازة!",
          },
          { status: 200 } // Return 200 so frontend treats it as success with a message
        );
      }
      // After 2 hours, allow one more try with heavy delay
      await new Promise((resolve) => setTimeout(resolve, 8000));
    }

    // ── Global soft limit: progressive delay ──
    if (dailyCount >= GLOBAL_DAILY_SOFT && dailyCount < GLOBAL_DAILY_HARD) {
      const overSoft = dailyCount - GLOBAL_DAILY_SOFT;
      const delayMs = Math.min(overSoft * 500, 8000);
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }

    // ── Global hard limit ──
    if (dailyCount >= GLOBAL_DAILY_HARD) {
      return NextResponse.json(
        {
          titles: [],
          marketingTips: [],
          message: "الخادم يتعامل مع طلبات كثيرة حالياً 🔄 جرب بعد قليل!",
        },
        { status: 200 }
      );
    }

    // Track last request time for this IP
    recentRequests.set(ip, Date.now());

    // Clean up old entries from recentRequests (older than 3 hours)
    const threeHoursAgo = Date.now() - 3 * 60 * 60 * 1000;
    for (const [key, val] of recentRequests.entries()) {
      if (val < threeHoursAgo) recentRequests.delete(key);
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

    // ─── IMPROVED PROMPT: Professional, diverse, with marketing tips ───
    const prompt = `أنت أستاذ في التسويق العقاري العربي بخبرة 15 سنة. أنت تكتب عناوين تسويقية توقف المتصفح وتجعله يضغط فوراً.

بيانات العقار:
- النوع: ${propType}
- الغرض: ${purpose}
- المدينة: ${city}
${extras ? `- تفاصيل: ${extras}` : ""}

المطلوب بالضبط:
1. اكتب 6 عناوين تسويقية مذهلة ومختلفة كلياً عن بعضها، كل واحد مخصص لمنصة مختلفة.
2. كل عنوان يجب أن يكون فريداً في أسلوبه وطريقته — لا تكرر نفس الكلمات أو التراكيب بين العناوين.
3. أضف نصيحة تسويقية قصيرة ومحددة لكل منصة (كيف تنشر بطريقة تحقق أقصى تفاعل).
4. أضف هاشتاجات مناسبة لكل منصة (3-5 هاشتاجات).

قواعد الذهب:
- كل عنوان يجب أن يثير فضول أو رغبة أو إحساس بالفرصة — لا عناوين عامة أو مملة.
- استخدم تقنيات نفسية: الندرة ("فرصة أخيرة")، السلطة ("الأكثر طلباً")، الاجتماعي ("الجميع يبحث عن")، الفضول ("لن تصدق").
- غيّر أسلوب الكتابة بين العناوين: واحد سؤال، واحد تعجبي، واحد سردي، واحد مع أرقام، واحد عاطفي، واحد مباشر.
- لا تستخدم كلمات إنجليزية أبداً.
- راعِ لهجة المدينة المناسبة.

أجب فقط بهذا الـ JSON بدون أي كلام إضافي أو backticks:
{
  "titles": [
    {
      "platform": "واتساب",
      "title": "...",
      "tip": "نصيحة نشر قصيرة ومحددة",
      "hashtags": ["هاشتاق1", "هاشتاق2", "هاشتاق3"]
    },
    {
      "platform": "إنستغرام",
      "title": "...",
      "tip": "نصيحة نشر قصيرة ومحددة",
      "hashtags": ["هاشتاق1", "هاشتاق2", "هاشتاق3", "هاشتاق4"]
    },
    {
      "platform": "تويتر / X",
      "title": "...",
      "tip": "نصيحة نشر قصيرة ومحددة",
      "hashtags": ["هاشتاق1", "هاشتاق2"]
    },
    {
      "platform": "فيسبوك",
      "title": "...",
      "tip": "نصيحة نشر قصيرة ومحددة",
      "hashtags": ["هاشتاق1", "هاشتاق2", "هاشتاق3"]
    },
    {
      "platform": "سناب شات",
      "title": "...",
      "tip": "نصيحة نشر قصيرة ومحددة",
      "hashtags": ["هاشتاق1", "هاشتاق2"]
    },
    {
      "platform": "لينكدإن",
      "title": "...",
      "tip": "نصيحة نشر قصيرة ومحددة",
      "hashtags": ["هاشتاق1", "هاشتاق2", "هاشتاق3"]
    }
  ],
  "generalTips": [
    "نصيحة عامة 1 للتسويق العقاري",
    "نصيحة عامة 2",
    "نصيحة عامة 3"
  ]
}

تفاصيل كل منصة:
- واتساب: عنوان تفصيلي وودود كأنك ترسله لصديق، يذكر أفضل 3 مميزات، ينتهي بدعوة للتواصل مع رقم (لا يتجاوز 3 أسطر)
- إنستغرام: عنوان مشاعري جذاب يستخدم إيموجي مناسبة (2-3 فقط)، قصير وقوي، يركز على الحلم والمشاعر
- تويتر/X: عنوان صادم يثير الفضول فوراً، لا يتجاوز 180 حرف، مباشر وواضح
- فيسبوك: عنوان قصصي يعرض المميزات بأسلوب عائلي ودود، يذكر السعر إذا كان مميزاً
- سناب شات: عنوان شبابي سريع جداً، إيموجي كثيرة، مثير للفضول بأسلوب تشويقي
- لينكدإن: عنوان احترافي استثماري، يركز على العائد والفرصة والقيمة، لغة أعمال رسمية`;

    const text = await generateContent(prompt);

    let parsed;
    try {
      // Step 1: Remove markdown code blocks
      let clean = text.replace(/```json|```/g, "").trim();
      
      // Step 2: Remove any leading/trailing non-JSON text
      const jsonStart = clean.indexOf('{');
      const jsonEnd = clean.lastIndexOf('}');
      if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
        clean = clean.substring(jsonStart, jsonEnd + 1);
      }
      
      // Step 3: Fix common AI JSON issues
      // Remove trailing commas before } or ]
      clean = clean.replace(/,\s*([}\]])/g, '$1');
      // Fix unescaped quotes in strings (basic)
      // Fix single quotes to double quotes
      clean = clean.replace(/'/g, '"');
      
      parsed = JSON.parse(clean);
    } catch {
      // Step 4: Try regex extraction as fallback
      const jsonMatch = text.match(/\{[\s\S]*"titles"[\s\S]*\}/);
      if (jsonMatch) {
        try {
          let extracted = jsonMatch[0];
          // Fix trailing commas
          extracted = extracted.replace(/,\s*([}\]])/g, '$1');
          parsed = JSON.parse(extracted);
        } catch {
          // Step 5: Last resort - try to extract titles manually
          try {
            const titleMatches = [...text.matchAll(/"platform"\s*:\s*"([^"]+)"\s*,\s*"title"\s*:\s*"([^"]+)"/g)];
            if (titleMatches.length > 0) {
              parsed = {
                titles: titleMatches.map(m => ({
                  platform: m[1],
                  title: m[2],
                  tip: "",
                  hashtags: [],
                })),
                generalTips: [],
              };
            } else {
              return NextResponse.json(
                { error: "تعذّر تحليل الاستجابة، حاول مرة أخرى" },
                { status: 500 }
              );
            }
          } catch {
            return NextResponse.json(
              { error: "تعذّر تحليل الاستجابة، حاول مرة أخرى" },
              { status: 500 }
            );
          }
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

    // NEVER expose remaining count to the client
    return NextResponse.json({
      titles: parsed.titles,
      generalTips: parsed.generalTips || [],
    });
  } catch (error) {
    console.error("Generation error:", error);
    return NextResponse.json(
      { error: "حدث خطأ أثناء التوليد — تحقق من اتصالك وحاول مجدداً" },
      { status: 500 }
    );
  }
}
