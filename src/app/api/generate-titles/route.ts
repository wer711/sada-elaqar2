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
      antiRepeat = `\n\n⚠️ تحذير مهم — هذه العناوين كُتبت مسبقاً لنفس العقار، لا تكرر أي منها أو تقترب منها:\n${prevTitlesText}\n\nيجب أن تكون العناوين الجديدة مختلفة تماماً في الكلمات والأسلوب والتراكيب.`;
    }

    if (reqNum > 1) {
      antiRepeat += `\n\nهذه هي المرة رقم ${reqNum} التي يطلب فيها المستخدم عناوين لنفس العقار. قدّم له زاوية تسويقية جديدة كلياً — ركز على جانب مختلف من العقار (مثلاً: المرة الأولى ركزت على الموقع، الآن ركز على الاستثمار أو نمط الحياة أو المقارنة بالسوق).`;
    }

    // ─── BUYER-PERSUASION PROMPT: Focus on convincing the BUYER, not impressing the seller ───
    const prompt = `أنت خبير في سيكولوجية الإقناع العقاري. تفهم كيف يفكر المشتري، ماذا يخاف، ماذا يطمح، وما الذي يجعله يتخذ قرار الشراء أو الإيجار. تكتب عناوين تخاطب عقل ومشاعر المشتري مباشرة — وليس البائع.

📌 معرف فريد: ${uniqueSeed}

🏢 بيانات العقار:
- النوع: ${propType}
- الغرض: ${purpose}
- المدينة: ${city}
- اللهجة المحلية: ${dialect}
${extras ? `- تفاصيل: ${extras}` : ""}

🧠 سيكولوجية المشتري في سوق ${city}:
- المشتري يخاف: الغش، المبالغة، العقار فيه عيوب مخفية، أن يدفع أكثر من القيمة
- المشتري يطمح: صفقة حقيقية، موقع مميز، راحة البال، استثمار آمن، بيت أحلامه
- المشتري يثق في: التفاصيل المحددة، الأرقام الحقيقية، التجارب المشابهة، الإحساس بالصدق
- المشتري ينفر من: العناوين العامة، المبالغات، الكلمات الفارغة، "فرصة العمر" بدون دليل

المطلوب بالضبط:
اكتب 6 عناوين — كل واحد لمنصة مختلفة — لكن بشرط واحد أساسي:
🎯 كل عنوان يجب أن يجعل المشتري يشعر بأن هذا العقار هو الحل لمشكلته أو تحقيق حلمه — وليس مجرد إعلان بيع.

لكل عنوان:
1. ابدأ من نقطة ألم أو رغبة ي شعور المشتري (ليس من مواصفات العقار)
2. اربط العقار بهذه الرغبة أو الألم بشكل مباشر وصادق
3. قدم دليلاً أو تفصيلاً محدداً يُصدّق كلامك (مساحة، سعر، ميزة حقيقية)
4. اختم بإجراء واضح (اتصل، زر، احجز) مع إحساس بالحاجة للسرعة لكن بدون مبالغة
5. أضف نصيحة نشر محددة لكل منصة — كيف يجعل هذا العنوان يصل لأكبر عدد من المشترين الجادين
6. أضف هاشتاقات يبحث عنها المشتري فعلاً في ${city} (3-5 هاشتاقات)
7. أضف 3 نصائح شخصية للبائع: كيف يتعامل مع المشتري في ${city} وكيف يزيد قيمة عقاره في المفاوضات

${antiRepeat}

قواعد صارمة لا تنتهك:
- 🚫 ممنوع التكرار — لا تكرر نفس الكلمات أو التراكيب بين العناوين
- 🧠 كل عنوان يخاطب المشتري مباشرة بلغة يفهمها ويثق بها
- 🏙️ استخدم ${dialect} بشكل طبيعي — كأنك تسوق لصديقك في ${city}
- 🚫 ممنوع العناوين العامة: "شقة رائعة"، "فرصة لا تعوض"، "لن تجد مثيل" — هذه لا تقنع أحداً
- ✅ استخدم تفاصيل محددة: "شقة 150م في حي النرجس — أقرب للمترو من جارك"، "فيلا بتشطيب فاخر في أحياء الورود — مدرسة أبناءك على بعد 3 دقائق"
- 💡 كل عنوان يلمس عصباً مختلفاً: أمن العائلة، استثمار المستقبل، راحة الحياة، فخر الملكية، توفير الوقت، قيمة المال
- 🔄 غيّر أسلوب الكتابة بين العناوين: سؤال يوقظ الفكر، قصة قصيرة تلمس القلب، مقارنة تفتح العقل، تحدي يثير الحماسة، حقيقة تفرض الاحترام، نداء عاطفي يصل الروح
- 🚫 لا تستخدم كلمات إنجليزية
- ✍️ اكتب بأسلوب بشري طبيعي — كأن صاحب العقار يكتب لجاره أو قريبه

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
    "نصيحة محددة لكيفية إقناع المشتري في هذه المدينة بهذا العقار",
    "نصيحة عن كيفية زيادة القيمة المتصورة للعقار في المفاوضات",
    "نصيحة عن أفضل وقت وطريقة لنشر هذا الإعلان في هذه المدينة"
  ]
}

كيف يفكر المشتري على كل منصة:
- واتساب: يقرأ الرسائل من أشخاص يثق بهم — اكتب كأنك تشاركه صفقة حقيقية بصدق، ذكر تفاصيل محددة تعكس واقع العقار، اختم ب"راسلني قبل ما أحد يسبقك" (3 أسطر)
- إنستغرام: يتصفح بحثاً عن الحلم — بِعْ الأسلوب والحياة وليس المساحة، صور له كيف سيعيش هناك، إيموجي مناسبة (2-3)
- تويتر/X: يبحث عن آراء وتحليلات سريعة — اعطه حقيقة صادمة أو مقارنة ذكية تفتح عينه (أقل من 180 حرف)
- فيسبوك: يبحث عن عروض موثوقة من أناس حقيقيين — اكتب بأسلوب جار ينصح جاره، اذكر السعر إن كان مميزاً
- سناب شات: يتفاعل مع المحتوى السريع والمثير — اخلق إحساس بالتفويت والإلحاح لكن بدون مبالغة، إيموجي كثيرة
- لينكدإن: يبحث عن فرص استثمارية بعوائد حقيقية — قدم أرقام ومقارنات وإشارات للسوق، لغة أعمال محترفة`;

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
    return NextResponse.json({ error: "حدث خطأ أثناء الكتابة — تحقق من اتصالك وحاول مجدداً" }, { status: 500 });
  }
}
