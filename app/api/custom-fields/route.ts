import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const tableName = searchParams.get("tableName");
  const where: any = { isActive: true };
  if (tableName) where.tableName = tableName;

  const fields = await ((await getDb()) as any).customField.findMany({
    where,
    orderBy: [{ tableName: "asc" }, { order: "asc" }],
  });
  return NextResponse.json(fields);
}

export async function POST(req: NextRequest) {
  try {
    const { tableName, fieldLabel, fieldType, options, isRequired } = await req.json();
    if (!fieldLabel?.trim()) {
      return NextResponse.json({ error: "Field label required" }, { status: 422 });
    }

    const last = await ((await getDb()) as any).customField.findFirst({
      where: { tableName, isActive: true },
      orderBy: { order: "desc" },
    });
    const order = last ? last.order + 1 : 0;

    const field = await ((await getDb()) as any).customField.create({
      data: {
        tableName,
        fieldLabel: fieldLabel.trim(),
        fieldType:  fieldType  || "TEXT",
        options:    options    || null,
        isRequired: Boolean(isRequired),
        order,
      },
    });
    return NextResponse.json(field, { status: 201 });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: "Failed to create field" }, { status: 500 });
  }
}
