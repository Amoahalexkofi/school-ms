import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { feeSessionGroupId, feeTypeId, amount, dueDate, fineType, finePercentage, fineAmount, finePerDay } = body;
    if (!feeSessionGroupId || !feeTypeId) return NextResponse.json({ error: "feeSessionGroupId and feeTypeId required" }, { status: 422 });
    if (!amount || Number(amount) <= 0) return NextResponse.json({ error: "Amount must be positive" }, { status: 422 });

    const item = await (prisma as any).feeGroupItem.create({
      data: {
        feeSessionGroupId,
        feeTypeId,
        amount:        parseFloat(amount),
        dueDate:       dueDate ? new Date(dueDate) : null,
        fineType:      fineType      || "NONE",
        finePercentage: finePercentage ? parseFloat(finePercentage) : 0,
        fineAmount:    fineAmount    ? parseFloat(fineAmount)    : 0,
        finePerDay:    finePerDay    ? parseInt(finePerDay)      : 0,
      },
      include: { feeType: { select: { name: true, code: true } } },
    });
    return NextResponse.json(item, { status: 201 });
  } catch (err: any) {
    if (err.code === "P2002") return NextResponse.json({ error: "Fee type already added to this group" }, { status: 409 });
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
