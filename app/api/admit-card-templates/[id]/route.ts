import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const db = await getDb();
  const tpl = await (db as any).admitCardTemplate.findUnique({ where: { id } });
  if (!tpl) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(tpl);
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const {
      template, heading, title, leftLogo, rightLogo,
      examName, schoolName, examCenter, sign, backgroundImg,
      isName, isFatherName, isMotherName, isDob, isAdmissionNo, isRollNo,
    } = await req.json();
    const data: any = {};
    if (template      !== undefined) data.template      = template      || null;
    if (heading       !== undefined) data.heading       = heading       || null;
    if (title         !== undefined) data.title         = title         || null;
    if (leftLogo      !== undefined) data.leftLogo      = leftLogo      || null;
    if (rightLogo     !== undefined) data.rightLogo     = rightLogo     || null;
    if (examName      !== undefined) data.examName      = examName      || null;
    if (schoolName    !== undefined) data.schoolName    = schoolName    || null;
    if (examCenter    !== undefined) data.examCenter    = examCenter    || null;
    if (sign          !== undefined) data.sign          = sign          || null;
    if (backgroundImg !== undefined) data.backgroundImg = backgroundImg || null;
    if (isName        !== undefined) data.isName        = Boolean(isName);
    if (isFatherName  !== undefined) data.isFatherName  = Boolean(isFatherName);
    if (isMotherName  !== undefined) data.isMotherName  = Boolean(isMotherName);
    if (isDob         !== undefined) data.isDob         = Boolean(isDob);
    if (isAdmissionNo !== undefined) data.isAdmissionNo = Boolean(isAdmissionNo);
    if (isRollNo      !== undefined) data.isRollNo      = Boolean(isRollNo);
    const db = await getDb();
    const tpl = await (db as any).admitCardTemplate.update({ where: { id }, data });
    return NextResponse.json(tpl);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const db = await getDb();
  await (db as any).admitCardTemplate.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
