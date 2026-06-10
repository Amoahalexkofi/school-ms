import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

// Mirrors Smart School's Student_id_card_model: idcardlist() + addidcard()
export async function GET() {
  const db = await getDb();
  const cards = await (db as any).idCard.findMany({ where: { isActive: true }, orderBy: { createdAt: "asc" } });
  return NextResponse.json(cards);
}

export async function POST(req: NextRequest) {
  try {
    const { heading, title, bgColor, fontColor, bodyColor, schoolName, leftLogo, rightLogo, fieldList, status } = await req.json();
    if (!heading?.trim()) return NextResponse.json({ error: "Heading is required" }, { status: 422 });
    const db = await getDb();
    const card = await (db as any).idCard.create({
      data: {
        heading:    heading.trim(),
        title:      title      || null,
        bgColor:    bgColor    || "#1a56db",
        fontColor:  fontColor  || "#ffffff",
        bodyColor:  bodyColor  || "#f9fafb",
        schoolName: schoolName || null,
        leftLogo:   leftLogo   || null,
        rightLogo:  rightLogo  || null,
        fieldList:  fieldList  ?? null,
        status:     status     ? parseInt(status) : 0,
      },
    });
    return NextResponse.json(card, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
