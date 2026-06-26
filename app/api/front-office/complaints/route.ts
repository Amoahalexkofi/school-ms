import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { getActiveBranchId } from "@/lib/branch";
import { resolveBranchForCreate } from "@/lib/services/branches";

export async function GET() {
  return NextResponse.json(await ((await getDb()) as any).complaint.findMany({
    include: { complaintType: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
  }));
}
export async function POST(req: NextRequest) {
  try {
    const { title, raisedBy, phone, complaintTypeId, description, source, assignedTo, date, image } = await req.json();
    if (!title?.trim() || !raisedBy?.trim() || !description?.trim())
      return NextResponse.json({ error: "Title, raised by, and description required" }, { status: 422 });
    const branchId = await resolveBranchForCreate(await getActiveBranchId());
    const c = await ((await getDb()) as any).complaint.create({
      data: {
        branchId,
        title:          title.trim(),
        raisedBy:       raisedBy.trim(),
        phone:          phone          || null,
        complaintTypeId:complaintTypeId|| null,
        description:    description.trim(),
        source:         source         || null,
        assignedTo:     assignedTo     || null,
        date:           date ? new Date(date) : new Date(),
        image:          image          || null,
      },
    });
    return NextResponse.json(c, { status: 201 });
  } catch (err: any) { return NextResponse.json({ error: err.message }, { status: 500 }); }
}
