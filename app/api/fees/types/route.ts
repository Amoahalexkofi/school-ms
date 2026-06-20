import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { getActiveBranchId } from "@/lib/branch";
import { resolveBranchForCreate } from "@/lib/services/branches";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const nature           = searchParams.get("nature");
  const studentSessionId = searchParams.get("studentSessionId");
  const activeBranchId   = await getActiveBranchId();

  const where: any = { isActive: true };
  if (nature) where.nature = nature;
  if (studentSessionId) where.studentSessionId = studentSessionId;
  if (activeBranchId) where.branchId = activeBranchId;
  // Smart School: regular fee types exclude is_system and nature!='custom'
  // Pass nature=custom to get custom fees for a specific student session

  const types = await ((await getDb()) as any).feeType.findMany({
    where,
    include: { feeCategory: { select: { name: true } } },
    orderBy: { name: "asc" },
  });
  return NextResponse.json(types);
}

export async function POST(req: NextRequest) {
  try {
    const { name, code, feeCategoryId, description, nature, studentSessionId } = await req.json();
    if (!name?.trim()) return NextResponse.json({ error: "Name is required" }, { status: 422 });
    if (!code?.trim()) return NextResponse.json({ error: "Code is required" }, { status: 422 });
    const branchId = await resolveBranchForCreate(await getActiveBranchId());
    const type = await ((await getDb()) as any).feeType.create({
      data: {
        name:             name.trim(),
        code:             code.trim().toUpperCase(),
        feeCategoryId:    feeCategoryId    || null,
        description:      description      || null,
        nature:           nature           || null,
        studentSessionId: studentSessionId || null,
        branchId,
      },
    });
    return NextResponse.json(type, { status: 201 });
  } catch (err: any) {
    if (err.code === "P2002") return NextResponse.json({ error: "Code already exists" }, { status: 409 });
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
