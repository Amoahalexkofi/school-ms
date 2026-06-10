import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

// Mirrors Smart School's Marksheet_model — template_marksheets table

export async function GET() {
  const db = await getDb();
  const marksheets = await (db as any).templateMarksheet.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json(marksheets);
}

export async function POST(req: NextRequest) {
  try {
    const {
      headerImage, template, heading, title,
      leftLogo, rightLogo, examName, schoolName, examCenter,
      leftSign, middleSign, rightSign, examSession,
      isName, isFatherName, isMotherName, isDob, isAdmissionNo, isRollNo,
    } = await req.json();
    const db = await getDb();
    const ms = await (db as any).templateMarksheet.create({
      data: {
        headerImage:   headerImage  || null,
        template:      template     || null,
        heading:       heading      || null,
        title:         title        || null,
        leftLogo:      leftLogo     || null,
        rightLogo:     rightLogo    || null,
        examName:      examName     || null,
        schoolName:    schoolName   || null,
        examCenter:    examCenter   || null,
        leftSign:      leftSign     || null,
        middleSign:    middleSign   || null,
        rightSign:     rightSign    || null,
        examSession:   examSession  ?? 1,
        isName:        isName       ?? true,
        isFatherName:  isFatherName ?? true,
        isMotherName:  isMotherName ?? true,
        isDob:         isDob        ?? true,
        isAdmissionNo: isAdmissionNo ?? true,
        isRollNo:      isRollNo     ?? true,
      },
    });
    return NextResponse.json(ms, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
