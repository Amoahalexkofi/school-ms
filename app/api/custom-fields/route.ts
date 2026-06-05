import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const tableName = searchParams.get("tableName");
  const where: any = { isActive: true };
  if (tableName) where.tableName = tableName;

  const fields = await (prisma as any).customField.findMany({
    where,
    orderBy: [{ tableName: "asc" }, { order: "asc" }],
  });
  return NextResponse.json(fields);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body.fieldLabel?.trim()) {
      return NextResponse.json({ error: "Field label required" }, { status: 422 });
    }

    // Set order to last position for that table
    const last = await (prisma as any).customField.findFirst({
      where: { tableName: body.tableName, isActive: true },
      orderBy: { order: "desc" },
    });
    const order = last ? last.order + 1 : 0;

    const field = await (prisma as any).customField.create({
      data: { ...body, order },
    });
    return NextResponse.json(field, { status: 201 });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: "Failed to create field" }, { status: 500 });
  }
}
