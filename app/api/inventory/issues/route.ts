import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const itemId     = searchParams.get("itemId");
  const issueType  = searchParams.get("issueType"); // "student" | "staff"
  const isReturned = searchParams.get("isReturned");

  const where: any = {};
  if (itemId)     where.itemId    = itemId;
  if (issueType)  where.issueType = issueType;
  if (isReturned !== null) where.isReturned = isReturned === "true";

  const issues = await ((await getDb()) as any).itemIssue.findMany({
    where,
    include: { item: { select: { name: true, quantity: true, available: true } } },
    orderBy: { issuedAt: "desc" },
  });
  return NextResponse.json(issues);
}

export async function POST(req: NextRequest) {
  try {
    const { itemId, issueType, issuedToId, issuedTo, issuedById, quantity, returnDate, note } = await req.json();
    if (!itemId || !quantity) {
      return NextResponse.json({ error: "itemId and quantity are required" }, { status: 422 });
    }
    const db = await getDb();
    const item = await (db as any).item.findUnique({ where: { id: itemId } });
    if (!item) return NextResponse.json({ error: "Item not found" }, { status: 404 });
    if (item.available < parseInt(quantity)) {
      return NextResponse.json({ error: `Only ${item.available} available` }, { status: 422 });
    }
    const [issue] = await (db as any).$transaction([
      (db as any).itemIssue.create({
        data: {
          itemId,
          issueType:  issueType  || null,
          issuedToId: issuedToId || null,
          issuedTo:   issuedTo   || null,
          issuedById: issuedById || null,
          quantity:   parseInt(quantity),
          returnDate: returnDate ? new Date(returnDate) : null,
          note:       note       || null,
        },
      }),
      (db as any).item.update({
        where: { id: itemId },
        data: { available: { decrement: parseInt(quantity) } },
      }),
    ]);
    return NextResponse.json(issue, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
