import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { getActiveBranchId } from "@/lib/branch";
import { resolveBranchForCreate } from "@/lib/services/branches";

export async function GET() {
  const db = await getDb();
  const activeBranchId = await getActiveBranchId();
  const discounts = await (db as any).feeDiscount.findMany({
    where: { isActive: true, ...(activeBranchId ? { branchId: activeBranchId } : {}) }, orderBy: { name: "asc" },
  });
  return NextResponse.json(discounts);
}

export async function POST(req: NextRequest) {
  try {
    const { name, code, type, percentage, amount, description, expireDate } = await req.json();
    if (!name?.trim() || !code?.trim() || !type)
      return NextResponse.json({ error: "name, code and type required" }, { status: 422 });
    const db = await getDb();
    const branchId = await resolveBranchForCreate(await getActiveBranchId());
    const d = await (db as any).feeDiscount.create({
      data: {
        name: name.trim(), code: code.trim().toUpperCase(), type,
        percentage: percentage ? parseFloat(percentage) : 0,
        amount:     amount     ? parseFloat(amount)     : 0,
        description: description || null,
        expireDate:  expireDate  ? new Date(expireDate) : null,
        branchId,
      },
    });
    return NextResponse.json(d, { status: 201 });
  } catch (err: any) {
    if (err.code === "P2002") return NextResponse.json({ error: "Code already exists" }, { status: 409 });
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
