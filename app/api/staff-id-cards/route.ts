import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

// Mirrors Smart School's Staffidcard_model — staff_id_card table

export async function GET() {
  const db = await getDb();
  const cards = await (db as any).staffIdCard.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json(cards);
}

export async function POST(req: NextRequest) {
  try {
    const {
      title, schoolName, schoolAddress, background, logo, signImage, headerColor,
      enableVerticalCard, enableStaffRole, enableStaffId, enableStaffDepartment,
      enableDesignation, enableName, enableFathersName, enableMothersName,
      enableDateOfJoining, enablePermanentAddress, enableStaffDob, enableStaffPhone,
    } = await req.json();
    if (!title?.trim())       return NextResponse.json({ error: "title is required" }, { status: 422 });
    if (!schoolName?.trim())  return NextResponse.json({ error: "schoolName is required" }, { status: 422 });
    const db = await getDb();
    const card = await (db as any).staffIdCard.create({
      data: {
        title:                 title.trim(),
        schoolName:            schoolName.trim(),
        schoolAddress:         schoolAddress?.trim() || "",
        background:            background  || null,
        logo:                  logo        || null,
        signImage:             signImage   || null,
        headerColor:           headerColor || null,
        enableVerticalCard:    enableVerticalCard    ?? false,
        enableStaffRole:       enableStaffRole       ?? true,
        enableStaffId:         enableStaffId         ?? true,
        enableStaffDepartment: enableStaffDepartment ?? true,
        enableDesignation:     enableDesignation     ?? true,
        enableName:            enableName            ?? true,
        enableFathersName:     enableFathersName     ?? false,
        enableMothersName:     enableMothersName     ?? false,
        enableDateOfJoining:   enableDateOfJoining   ?? true,
        enablePermanentAddress:enablePermanentAddress ?? false,
        enableStaffDob:        enableStaffDob        ?? false,
        enableStaffPhone:      enableStaffPhone      ?? true,
      },
    });
    return NextResponse.json(card, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
