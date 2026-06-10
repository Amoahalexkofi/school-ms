import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const db = await getDb();
  const card = await (db as any).staffIdCard.findUnique({ where: { id } });
  if (!card) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(card);
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const {
      title, schoolName, schoolAddress, background, logo, signImage, headerColor,
      enableVerticalCard, enableStaffRole, enableStaffId, enableStaffDepartment,
      enableDesignation, enableName, enableFathersName, enableMothersName,
      enableDateOfJoining, enablePermanentAddress, enableStaffDob, enableStaffPhone,
    } = await req.json();
    const data: any = {};
    if (title                  !== undefined) data.title                  = title.trim();
    if (schoolName             !== undefined) data.schoolName             = schoolName.trim();
    if (schoolAddress          !== undefined) data.schoolAddress          = schoolAddress?.trim() || "";
    if (background             !== undefined) data.background             = background             || null;
    if (logo                   !== undefined) data.logo                   = logo                   || null;
    if (signImage              !== undefined) data.signImage              = signImage              || null;
    if (headerColor            !== undefined) data.headerColor            = headerColor            || null;
    if (enableVerticalCard     !== undefined) data.enableVerticalCard     = Boolean(enableVerticalCard);
    if (enableStaffRole        !== undefined) data.enableStaffRole        = Boolean(enableStaffRole);
    if (enableStaffId          !== undefined) data.enableStaffId          = Boolean(enableStaffId);
    if (enableStaffDepartment  !== undefined) data.enableStaffDepartment  = Boolean(enableStaffDepartment);
    if (enableDesignation      !== undefined) data.enableDesignation      = Boolean(enableDesignation);
    if (enableName             !== undefined) data.enableName             = Boolean(enableName);
    if (enableFathersName      !== undefined) data.enableFathersName      = Boolean(enableFathersName);
    if (enableMothersName      !== undefined) data.enableMothersName      = Boolean(enableMothersName);
    if (enableDateOfJoining    !== undefined) data.enableDateOfJoining    = Boolean(enableDateOfJoining);
    if (enablePermanentAddress !== undefined) data.enablePermanentAddress = Boolean(enablePermanentAddress);
    if (enableStaffDob         !== undefined) data.enableStaffDob         = Boolean(enableStaffDob);
    if (enableStaffPhone       !== undefined) data.enableStaffPhone       = Boolean(enableStaffPhone);
    const db = await getDb();
    const card = await (db as any).staffIdCard.update({ where: { id }, data });
    return NextResponse.json(card);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const db = await getDb();
  await (db as any).staffIdCard.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
