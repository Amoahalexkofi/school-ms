import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { getActiveBranchId } from "@/lib/branch";
import { resolveBranchForCreate } from "@/lib/services/branches";

export async function GET() {
  return NextResponse.json(await ((await getDb()) as any).hostel.findMany({
    where: { isActive: true },
    include: { rooms: { where: { isActive: true }, include: { roomType: true, _count: { select: { allocations: true } } } } },
    orderBy: { name: "asc" },
  }));
}
export async function POST(req: NextRequest) {
  try {
    const { name, type, address, intake, description } = await req.json();
    if (!name?.trim()) return NextResponse.json({ error: "Name required" }, { status: 422 });
    const branchId = await resolveBranchForCreate(await getActiveBranchId());
    return NextResponse.json(await ((await getDb()) as any).hostel.create({
      data: {
        branchId,
        name: name.trim(),
        type: type || null,
        address: address || null,
        intake: intake ? parseInt(intake) : null,
        description: description || null,
      },
    }), { status: 201 });
  } catch (err: any) {
    if (err.code === "P2002") return NextResponse.json({ error: "Already exists" }, { status: 409 });
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
