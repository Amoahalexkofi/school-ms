import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

// Mirrors Smart School's Admitcard_model — template_admitcards table

export async function GET() {
  const db = await getDb();
  const templates = await (db as any).admitCardTemplate.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json(templates);
}

export async function POST(req: NextRequest) {
  try {
    const {
      template, heading, title, leftLogo, rightLogo,
      examName, schoolName, examCenter, sign, backgroundImg,
      isName, isFatherName, isMotherName, isDob, isAdmissionNo, isRollNo,
    } = await req.json();
    const db = await getDb();
    const tpl = await (db as any).admitCardTemplate.create({
      data: {
        template:      template      || null,
        heading:       heading       || null,
        title:         title         || null,
        leftLogo:      leftLogo      || null,
        rightLogo:     rightLogo     || null,
        examName:      examName      || null,
        schoolName:    schoolName    || null,
        examCenter:    examCenter    || null,
        sign:          sign          || null,
        backgroundImg: backgroundImg || null,
        isName:        isName        ?? true,
        isFatherName:  isFatherName  ?? true,
        isMotherName:  isMotherName  ?? true,
        isDob:         isDob         ?? true,
        isAdmissionNo: isAdmissionNo ?? true,
        isRollNo:      isRollNo      ?? true,
      },
    });
    return NextResponse.json(tpl, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
