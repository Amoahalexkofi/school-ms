import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

const ALLOWED = [
  "name","phone","email","classInterested","note",
  "source","assignedTo","noOfChild","date","reference","enquiryType","status",
  "nextFollowUp",
];

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  const data: any = {};
  for (const key of ALLOWED) {
    if (key in body) {
      if ((key === "date" || key === "nextFollowUp") && body[key]) data[key] = new Date(body[key]);
      else if (key === "noOfChild" && body[key] !== undefined) data[key] = body[key] ? parseInt(body[key]) : null;
      else data[key] = body[key] ?? null;
    }
  }
  return NextResponse.json(await ((await getDb()) as any).enquiry.update({ where: { id }, data }));
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await ((await getDb()) as any).enquiry.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
