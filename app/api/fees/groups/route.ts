import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { getActiveBranchId } from "@/lib/branch";
import { resolveBranchForCreate } from "@/lib/services/branches";

export async function GET() {
  const activeBranchId = await getActiveBranchId();
  const groups = await ((await getDb()) as any).feeGroup.findMany({
    where: { isSystem: false, ...(activeBranchId ? { branchId: activeBranchId } : {}) },
    include: {
      sessionGroups: {
        include: {
          session: { select: { session: true } },
          _count: { select: { items: true, studentFeesMasters: true } },
        },
      },
    },
    orderBy: { name: "asc" },
  });
  return NextResponse.json(groups);
}

export async function POST(req: NextRequest) {
  try {
    const { name, description } = await req.json();
    if (!name?.trim()) return NextResponse.json({ error: "Name is required" }, { status: 422 });
    const branchId = await resolveBranchForCreate(await getActiveBranchId());
    const group = await ((await getDb()) as any).feeGroup.create({ data: { name: name.trim(), description: description || null, branchId } });
    return NextResponse.json(group, { status: 201 });
  } catch (err: any) {
    if (err.code === "P2002") return NextResponse.json({ error: "Group already exists" }, { status: 409 });
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
