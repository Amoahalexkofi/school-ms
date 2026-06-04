import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const { itemId, type, quantity, note, issuedTo } = await req.json();
    if (!itemId || !type || !quantity) return NextResponse.json({ error: "itemId, type, quantity required" }, { status: 422 });
    const qty = parseInt(quantity);

    const item = await (prisma as any).item.findUnique({ where: { id: itemId }, select: { quantity: true } });
    if (!item) return NextResponse.json({ error: "Item not found" }, { status: 404 });
    if (type === "OUT" && item.quantity < qty) return NextResponse.json({ error: "Insufficient stock" }, { status: 409 });

    await (prisma as any).$transaction(async (tx: any) => {
      await tx.stockMovement.create({ data: { itemId, type, quantity: qty, note: note || null } });
      await tx.item.update({ where: { id: itemId }, data: { quantity: type === "IN" ? { increment: qty } : { decrement: qty } } });
      if (type === "OUT" && issuedTo) {
        await tx.itemIssue.create({ data: { itemId, issuedTo, quantity: qty, note: note || null } });
      }
    });

    return NextResponse.json({ ok: true });
  } catch (err: any) { return NextResponse.json({ error: err.message }, { status: 500 }); }
}
