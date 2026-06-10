import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

// Mirrors Smart School's Student_id_card_model: idcardlist() + addidcard()

const CARD_FIELDS = [
  "title","schoolName","schoolAddress","background","logo","signImage",
  "enableVerticalCard","headerColor",
  "enableAdmissionNo","enableStudentName","enableClass",
  "enableFathersName","enableMothersName","enableAddress",
  "enablePhone","enableDob","enableBloodGroup",
  "enableStudentBarcode","enableStudentRollno","enableStudentHouseName",
  "status",
] as const;

export async function GET() {
  const db = await getDb();
  const cards = await (db as any).idCard.findMany({ orderBy: { createdAt: "asc" } });
  return NextResponse.json(cards);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body.title?.trim() || !body.schoolName?.trim())
      return NextResponse.json({ error: "title and schoolName are required" }, { status: 422 });
    const db = await getDb();
    const data: any = {};
    for (const f of CARD_FIELDS) {
      if (f in body) data[f] = body[f];
    }
    data.title = data.title?.trim();
    data.schoolName = data.schoolName?.trim();
    const card = await (db as any).idCard.create({ data });
    return NextResponse.json(card, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
