import { NextRequest, NextResponse } from "next/server";

// ─── Multi-Provider AI System (Vercel-Compatible) ───────────

const AI_PROMPT_SYSTEM = `أنت خبير تسويق عقاري عالمي المستوى بخبرة 20 سنة في الأسواق العربية والخليجية. تتميز بقدرتك على صياغة عناوين تسويقية مذهلة توقف المتصفح فوراً وتجعله يضغط بدون تردد. أجب فقط بصيغة JSON كما هو مطلوب بدون أي نص إضافي أو markdown.`;

async function generateWithGroq(prompt: string): Promise<string> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) throw new Error("NO_KEY");
  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", "Authorization": `Bearer ${apiKey}` },
    body: JSON.stringify({
      messages: [{ role: "system", content: AI_PROMPT_SYSTEM }, { role: "user", content: prompt }],
      model: "llama-3.3-70b-versatile",
      temperature: 0.92,
      max_tokens: 3000,
    }),
  });
  if (!response.ok) { const e = await response.text().catch(() => ""); throw new Error(`Groq ${response.status}: ${e.slice(0, 200)}`); }
  const data = await response.json();
  const c = data.choices?.[0]?.message?.content;
  if (!c) throw new Error("Empty Groq response");
  return c;
}

async function generateWithOpenRouter(prompt: string): Promise<string> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) throw new Error("NO_KEY");
  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", "Authorization": `Bearer ${apiKey}`, "HTTP-Referer": "https://sada-elaqar.vercel.app", "X-Title": "صدى العقار" },
    body: JSON.stringify({
      model: "deepseek/deepseek-chat-v3-0324:free",
      messages: [{ role: "system", content: AI_PROMPT_SYSTEM }, { role: "user", content: prompt }],
      temperature: 0.92,
      max_tokens: 3000,
    }),
  });
  if (!response.ok) { const e = await response.text().catch(() => ""); throw new Error(`OpenRouter ${response.status}: ${e.slice(0, 200)}`); }
  const data = await response.json();
  const c = data.choices?.[0]?.message?.content;
  if (!c) throw new Error("Empty OpenRouter response");
  return c;
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
      generationConfig: { temperature: 0.92, maxOutputTokens: 3000 },
    }),
  });
  if (!response.ok) { const e = await response.text().catch(() => ""); throw new Error(`Gemini ${response.status}: ${e.slice(0, 200)}`); }
  const data = await response.json();
  const t = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!t) throw new Error("Empty Gemini response");
  return t;
}

async function generateWithZai(prompt: string): Promise<string> {
  try {
    const ZAI = (await import("z-ai-web-dev-sdk")).default;
    const zai = await ZAI.create();
    const completion = await zai.chat.completions.create({
      messages: [{ role: "assistant", content: AI_PROMPT_SYSTEM }, { role: "user", content: prompt }],
      thinking: { type: "disabled" },
    });
    const c = completion.choices[0]?.message?.content;
    if (!c) throw new Error("Empty z-ai response");
    return c;
  } catch { throw new Error("z-ai unavailable"); }
}

type ProviderFn = (prompt: string) => Promise<string>;
interface Provider { name: string; fn: ProviderFn; }

function getProviders(): Provider[] {
  const p: Provider[] = [];
  if (process.env.GROQ_API_KEY) p.push({ name: "Groq", fn: generateWithGroq });
  if (process.env.OPENROUTER_API_KEY) p.push({ name: "OpenRouter", fn: generateWithOpenRouter });
  if (process.env.GEMINI_API_KEY) p.push({ name: "Gemini", fn: generateWithGemini });
  p.push({ name: "z-ai", fn: generateWithZai });
  return p;
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

// ─── Invisible Smart Rate Limiting ─────────────
// Adapts dynamically based on server load (concurrent requests)
// User NEVER sees "limit" or "remaining" — only natural delays

const PER_IP_SOFT = 3;        // Progressive delay starts here
const PER_IP_HARD = 8;        // Friendly busy message
const GLOBAL_SOFT = 60;       // Global progressive delay
const GLOBAL_HARD = 180;      // Global busy message

// Dynamic: track concurrent requests for adaptive throttling
let activeRequests = 0;
const MAX_CONCURRENT = 5;     // If more than 5 concurrent, start throttling

let dailyCount = 0;
let dailyCountDate = new Date().toISOString().slice(0, 10);
const ipCounts = new Map<string, { count: number; date: string }>();
const recentRequests = new Map<string, number>();

function getToday(): string { return new Date().toISOString().slice(0, 10); }

function checkDailyReset() {
  const today = getToday();
  if (today !== dailyCountDate) { dailyCount = 0; dailyCountDate = today; }
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
  if (!entry || entry.date !== today) { ipCounts.set(ip, { count: 1, date: today }); }
  else { entry.count++; }
}

// ─── Region-specific dialect mapping ─────────────
const REGION_DIALECT: Record<string, string> = {
  // السعودية
  "الرياض": "لهجة نجدية فصيحة", "جدة": "لهجة حجازية ودودة", "مكة المكرمة": "لهجة حجازية روحانية",
  "المدينة المنورة": "لهجة حجازية هادئة", "الدمام": "لهجة خليجية شرقية", "الخبر": "لهجة خليجية",
  // الإمارات
  "دبي": "لهجة إماراتية فخمة وعصرية", "أبوظبي": "لهجة إماراتية رسمية", "الشارقة": "لهجة إماراتية ثقافية",
  // قطر
  "الدوحة": "لهجة قطرية راقية",
  // الكويت
  "الكويت العاصمة": "لهجة كويتية تجارية حيوية",
  // البحرين
  "المنامة": "لهجة بحرينية عريقة",
  // عُمان
  "مسقط": "لهجة عُمانية هادئة ورسمية",
  // مصر
  "القاهرة": "لهجة مصرية حيوية وجذابة", "الإسكندرية": "لهجة إسكندرانية بحرية",
  // الأردن
  "عمّان": "لهجة أردنية فصيحة وراقية",
  // العراق
  "بغداد": "لهجة عراقية دافئة وقوية",
  // لبنان
  "بيروت": "لهجة لبنانية أنيقة ومرحة",
  // المغرب
  "الدار البيضاء": "لهجة مغربية عملية وجذابة", "الرباط": "لهجة مغربية رسمية",
  // تونس
  "تونس العاصمة": "لهجة تونسية عصرية",
  // الجزائر
  "الجزائر العاصمة": "لهجة جزائرية دافئة", "وهران": "لهجة وهرانية مرحة",
  // تركيا
  "إسطنبول": "لهجة عربية فصيحة مناسبة للمستثمرين الأتراك والعرب",
};

function getDialect(city: string): string {
  return REGION_DIALECT[city] || "لهجة عربية فصيحة مناسبة للسوق المحلي";
}

// ─── Unique seed to prevent repetition ─────────────
function generateUniqueSeed(): string {
  const ts = Date.now().toString(36);
  const rand = Math.random().toString(36).substring(2, 8);
  return `${ts}-${rand}`;
}

export async function POST(req: NextRequest) {
  try {
    checkDailyReset();

    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
      || req.headers.get("x-real-ip")
      || "unknown";

    const ipUsage = getIpCount(ip);

    // ── Adaptive concurrent throttling ──
    if (activeRequests >= MAX_CONCURRENT) {
      // Server is under load — add delay proportional to queue
      const overloadDelay = Math.min(activeRequests * 1500, 12000);
      await new Promise((resolve) => setTimeout(resolve, overloadDelay));
    }

    // ── Per-IP progressive delay ──
    if (ipUsage >= PER_IP_SOFT && ipUsage < PER_IP_HARD) {
      const delayMs = Math.min((ipUsage - PER_IP_SOFT + 1) * 2500, 15000);
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }

    // ── Per-IP hard: friendly busy message ──
    if (ipUsage >= PER_IP_HARD) {
      const lastReq = recentRequests.get(ip) || 0;
      const hoursSince = (Date.now() - lastReq) / (1000 * 60 * 60);
      if (hoursSince < 1.5) {
        return NextResponse.json({
          titles: [],
          generalTips: [],
          message: "الخادم مشغول حالياً بكثير من الطلبات 🔄 جرب بعد دقيقتين وستحصل على نتيجة رائعة! أو جرّب النسخة برو للحصول على أولوية وأداء أسرع ✨",
        }, { status: 200 });
      }
      await new Promise((resolve) => setTimeout(resolve, 10000));
    }

    // ── Global soft: progressive delay ──
    if (dailyCount >= GLOBAL_SOFT && dailyCount < GLOBAL_HARD) {
      const overSoft = dailyCount - GLOBAL_SOFT;
      const delayMs = Math.min(overSoft * 600, 10000);
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }

    // ── Global hard ──
    if (dailyCount >= GLOBAL_HARD) {
      return NextResponse.json({
        titles: [],
        generalTips: [],
        message: "الخادم يتعامل مع طلبات كثيرة جداً حالياً 🔄 جرب بعد قليل! أو جرّب النسخة برو لأولوية في الاستخدام ونتائج أسرع ✨",
      }, { status: 200 });
    }

    // Track
    recentRequests.set(ip, Date.now());
    activeRequests++;
    const threeHoursAgo = Date.now() - 3 * 60 * 60 * 1000;
    for (const [key, val] of recentRequests.entries()) {
      if (val < threeHoursAgo) recentRequests.delete(key);
    }

    const body = await req.json();
    const { propType, purpose, city, area, space, rooms, feature, price, previousTitles, requestCount } = body;

    if (!propType || !purpose || !city) {
      activeRequests--;
      return NextResponse.json({ error: "نوع العقار والغرض والمدينة مطلوبون" }, { status: 400 });
    }

    const dialect = getDialect(city);
    const uniqueSeed = generateUniqueSeed();
    const reqNum = typeof requestCount === "number" ? requestCount : 1;

    const extras = [
      space ? `المساحة: ${space} م²` : "",
      rooms ? `عدد الغرف: ${rooms}` : "",
      feature ? `ميزة بارزة: ${feature}` : "",
      price ? `السعر: ${price}` : "",
      area ? `الحي/المنطقة: ${area}` : "",
    ].filter(Boolean).join("، ");

    // Build anti-repetition context
    let antiRepeat = "";
    if (previousTitles && Array.isArray(previousTitles) && previousTitles.length > 0) {
      const prevTitlesText = previousTitles.slice(-12).map((t: string) => `"${t}"`).join("، ");
      antiRepeat = `\n\n⚠️ تحذير مهم — هذه العناوين تم توليدها مسبقاً لنفس العقار، لا تكرر أي منها أو تقترب منها:\n${prevTitlesText}\n\nيجب أن تكون العناوين الجديدة مختلفة تماماً في الكلمات والأسلوب والتراكيب.`;
    }

    if (reqNum > 1) {
      antiRepeat += `\n\nهذه هي المرة رقم ${reqNum} التي يطلب فيها المستخدم عناوين لنفس العقار. قدّم له زاوية تسويقية جديدة كلياً — ركز على جانب مختلف من العقار (مثلاً: المرة الأولى ركزت على الموقع، الآن ركز على الاستثمار أو نمط الحياة أو المقارنة بالسوق).`;
    }

    // ─── SUPER PROMPT: Professional, region-specific, non-repetitive, personalized ───
    const prompt = `أنت أستاذ التسويق العقاري الأول في العالم العربي. تكتب عناوين توقف المتصفح عن التمرير وتجعله يضغط فوراً. أسلوبك فريد — لا أحد يكتب مثلك.

📌 معرف فريد لهذا الطلب: ${uniqueSeed} (استخدمه لضمان عدم التكرار)

🏢 بيانات العقار:
- النوع: ${propType}
- الغرض: ${purpose}
- المدينة: ${city}
- اللهجة المحلية: ${dialect}
${extras ? `- تفاصيل إضافية: ${extras}` : ""}

👤 الملف الشخصي للمستخدم:
- هو وكيل عقاري أو مستثمر في ${city}
- يحتاج عناوين تجذب المشترين الجادين تحديداً
- يريد التفرد على منافسيه في السوق
- يستهدف جمهور ${city} المحلي

المطلوب:
1. اكتب 6 عناوين تسويقية مذهلة — كل واحد لمنصة مختلفة — مختلفة تماماً عن بعضها في الأسلوب والكلمات والزاوية التسويقية.
2. كل عنوان يجب أن يبدو كأنه كتبه خبير يعرف سوق ${city} شخصياً.
3. أضف نصيحة نشر شخصية ومحددة لكل منصة — كأنك تنصح صديقك المقرب.
4. أضف هاشتاقات ذكية تجذب الجمهور المستهدف في ${city} (3-5 هاشتاقات).
5. أضف 3 نصائح تسويقية شخصية ومحددة لهذا العقار تحديداً في ${city} — ليست نصائح عامة بل موجهة له كشخص.
${antiRepeat}

قواعد صارمة:
- 🚫 ممنوع التكرار — لا تستخدم نفس الكلمات أو التراكيب بين العناوين الستة أبداً
- 🎯 كل عنوان يستهدف مشتري جاد وليس متصفح عابر
- 🏙️ استخدم لهجة ${dialect} بشكل طبيعي وغير متكلّف
- 💡 استخدم تقنيات نفسية مختلفة لكل عنوان: الندرة، السلطة، الاجتماعي، الفضول، الإلحاح، المقارنة
- 🔄 غيّر أسلوب الكتابة: سؤال، تعجبي، سردي، أرقام، عاطفي، مباشر، قصصي، تحدي
- 🚫 لا تستخدم كلمات إنجليزية أبداً
- ✍ية العناوين بأسلوب لا يشبه أي أداة أخرى — اجعلها تبدو كأنها كتبت يدوياً بخبرة سنوات

أجب فقط بهذا JSON بدون أي كلام إضافي:
{
  "titles": [
    {"platform": "واتساب", "title": "...", "tip": "...", "hashtags": ["...", "...", "..."]},
    {"platform": "إنستغرام", "title": "...", "tip": "...", "hashtags": ["...", "...", "...", "..."]},
    {"platform": "تويتر / X", "title": "...", "tip": "...", "hashtags": ["...", "..."]},
    {"platform": "فيسبوك", "title": "...", "tip": "...", "hashtags": ["...", "...", "..."]},
    {"platform": "سناب شات", "title": "...", "tip": "...", "hashtags": ["...", "..."]},
    {"platform": "لينكدإن", "title": "...", "tip": "...", "hashtags": ["...", "...", "..."]}
  ],
  "personalTips": [
    "نصيحة شخصية محددة لهذا المستخدم وعقاره في هذه المدينة",
    "نصيحة شخصية أخرى محددة",
    "نصيحة شخصية ثالثة محددة"
  ]
}

تفاصيل كل منصة:
- واتساب: رسالة ودية كأنك ترسلها لصديق مقرب، تذكر أهم 3 مميزات، تنتهي بدعوة للتواصل (3 أسطر максимум)
- إنستغرام: عنوان مشاعري يبيع الحلم وليس العقار، إيموجي مناسبة (2-3)، قصير وقوي جداً
- تويتر/X: عنوان صادم يثير الفضول فوراً، أقل من 180 حرف، مباشر وصادم
- فيسبوك: قصة قصيرة تعرض المميزات بأسلوب عائلي، تذكر السعر إن كان مميزاً
- سناب شات: عنوان شبابي سريع جداً، إيموجي كثيرة، تشويقي ويخلق إحساس بالتفويت
- لينكدإن: عنوان استثماري يركز على العائد والفرصة، لغة أعمال احترافية`;

    const text = await generateContent(prompt);

    let parsed;
    try {
      let clean = text.replace(/```json|```/g, "").trim();
      const jsonStart = clean.indexOf('{');
      const jsonEnd = clean.lastIndexOf('}');
      if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
        clean = clean.substring(jsonStart, jsonEnd + 1);
      }
      clean = clean.replace(/,\s*([}\]])/g, '$1');
      clean = clean.replace(/'/g, '"');
      parsed = JSON.parse(clean);
    } catch {
      const jsonMatch = text.match(/\{[\s\S]*"titles"[\s\S]*\}/);
      if (jsonMatch) {
        try {
          let extracted = jsonMatch[0];
          extracted = extracted.replace(/,\s*([}\]])/g, '$1');
          parsed = JSON.parse(extracted);
        } catch {
          try {
            const titleMatches = [...text.matchAll(/"platform"\s*:\s*"([^"]+)"\s*,\s*"title"\s*:\s*"([^"]+)"/g)];
            if (titleMatches.length > 0) {
              parsed = { titles: titleMatches.map(m => ({ platform: m[1], title: m[2], tip: "", hashtags: [] })), personalTips: [] };
            } else {
              activeRequests--;
              return NextResponse.json({ error: "تعذّر تحليل الاستجابة، حاول مرة أخرى" }, { status: 500 });
            }
          } catch {
            activeRequests--;
            return NextResponse.json({ error: "تعذّر تحليل الاستجابة، حاول مرة أخرى" }, { status: 500 });
          }
        }
      } else {
        activeRequests--;
        return NextResponse.json({ error: "تعذّر تحليل الاستجابة، حاول مرة أخرى" }, { status: 500 });
      }
    }

    dailyCount++;
    incrementIpCount(ip);
    activeRequests--;

    // Save to DB (non-critical)
    try {
      const { db } = await import("@/lib/db");
      if (db) {
        await db.titleGeneration.create({
          data: {
            propType, purpose, city,
            area: area || null, space: space || null,
            rooms: rooms || null, feature: feature || null,
            price: price || null,
            results: JSON.stringify(parsed.titles),
          },
        });
      }
    } catch (dbError) {
      console.error("DB save error (non-critical):", dbError);
    }

    // Map personalTips to generalTips for backward compatibility
    return NextResponse.json({
      titles: parsed.titles,
      generalTips: parsed.personalTips || parsed.generalTips || [],
    });
  } catch (error) {
    activeRequests--;
    console.error("Generation error:", error);
    return NextResponse.json({ error: "حدث خطأ أثناء التوليد — تحقق من اتصالك وحاول مجدداً" }, { status: 500 });
  }
}
