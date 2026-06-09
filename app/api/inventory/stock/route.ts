import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const { itemId, type, quantity, purchasePrice, supplierId, storeId, note, date,
            issueType, issuedToId, issuedTo, issuedById, returnDate } = await req.json();

    if (!itemId || !type || !quantity) return NextResponse.json({ error: "itemId, type, quantity required" }, { status: 422 });
    const qty = parseInt(quantity);

    const item = await ((await getDb()) as any).item.findUnique({ where: { id: itemId }, select: { quantity: true } });
    if (!item) return NextResponse.json({ error: "Item not found" }, { status: 404 });
    if (type === "OUT" && item.quantity < qty) return NextResponse.json({ error: "Insufficient stock" }, { status: 409 });

    await ((await getDb()) as any).$transaction(async (tx: any) => {
      // Record stock movement (mirrors item_stock)
      await tx.stockMovement.create({
        data: {
          itemId,
          type,
          quantity: qty,
          purchasePrice: purchasePrice ? parseFloat(purchasePrice) : null,
          supplierId:    supplierId    || null,
          storeId:       storeId       || null,
          note:          note          || null,
          date:          date          ? new Date(date) : new Date(),
        },
      });
      // Update item quantity
      await tx.item.update({ where: { id: itemId }, data: { quantity: type === "IN" ? { increment: qty } : { decrement: qty } } });
      // Create issue record if issuing out (mirrors item_issue)
      if (type === "OUT") {
        await tx.itemIssue.create({
          data: {
            itemId,
            issueType:  issueType   || null,
            issuedToId: issuedToId  || null,
            issuedTo:   issuedTo    || null,
            issuedById: issuedById  || null,
            quantity:   qty,
            returnDate: returnDate  ? new Date(returnDate) : null,
            note:       note        || null,
          },
        });
      }
    });

    return NextResponse.json({ ok: true });
  } catch (err: any) { return NextResponse.json({ error: err.message }, { status: 500 }); }
}
