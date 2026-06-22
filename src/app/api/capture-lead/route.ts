import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, whatsapp, email, country, role, propType, purpose, city } = body;

    // At least whatsapp or email is required
    if (!whatsapp && !email) {
      return NextResponse.json(
        { error: "رقم الواتساب أو البريد الإلكتروني مطلوب" },
        { status: 400 }
      );
    }

    const lead = await db.lead.create({
      data: {
        name: name || null,
        whatsapp: whatsapp || null,
        email: email || null,
        country: country || null,
        role: role || null,
        propType: propType || null,
        purpose: purpose || null,
        city: city || null,
        source: "title-tool",
      },
    });

    return NextResponse.json({ success: true, leadId: lead.id });
  } catch (error) {
    console.error("Lead capture error:", error);
    return NextResponse.json(
      { error: "حدث خطأ في حفظ البيانات" },
      { status: 500 }
    );
  }
}
