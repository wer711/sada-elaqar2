import { NextRequest, NextResponse } from "next/server";
import ZAI from "z-ai-web-dev-sdk";
import { db } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { propType, purpose, city, area, space, rooms, feature, price, leadId } = body;

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

المطلوب: اكتب بالضبط 4 عناوين تسويقية جذابة وقوية لهذا العقار، كل عنوان مخصص لمنصة مختلفة.

أجب فقط بهذا الـ JSON بدون أي كلام إضافي أو backticks:
{
  "titles": [
    {"platform": "واتساب", "title": "..."},
    {"platform": "إنستغرام", "title": "..."},
    {"platform": "تويتر / X", "title": "..."},
    {"platform": "لينكدإن", "title": "..."}
  ]
}

قواعد كل عنوان:
- واتساب: تفصيلي وودود، يذكر المميزات والموقع، ينتهي بدعوة للتواصل (لا يتجاوز 3 أسطر)
- إنستغرام: جذاب ومشاعري، يستخدم نقاط وإيموجي مناسبة، قصير وقوي
- تويتر/X: مباشر وصادم، لا يتجاوز 200 حرف، يثير الفضول
- لينكدإن: احترافي واستثماري، يركز على العائد والقيمة، لغة أعمال

اكتب بلهجة عربية فصيحة مناسبة لمدينة ${city}. لا تستخدم كلمات إنجليزية.`;

    // Use z-ai-web-dev-sdk for secure backend AI call
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

    // Save generation to database
    try {
      await db.titleGeneration.create({
        data: {
          leadId: leadId || null,
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
      // Don't fail the request if DB save fails
    }

    return NextResponse.json({ titles: parsed.titles });
  } catch (error) {
    console.error("Generation error:", error);
    return NextResponse.json(
      { error: "حدث خطأ أثناء التوليد — تحقق من اتصالك وحاول مجدداً" },
      { status: 500 }
    );
  }
}
