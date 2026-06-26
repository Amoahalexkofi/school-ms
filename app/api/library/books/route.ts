import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { getActiveBranchId } from "@/lib/branch";
import { resolveBranchForCreate } from "@/lib/services/branches";

export async function GET(req: NextRequest) {
  const search = req.nextUrl.searchParams.get("search");
  const where: any = { isActive: true };
  const activeBranch = await getActiveBranchId();
  if (activeBranch) where.branchId = activeBranch;
  if (search) where.OR = [
    { title:  { contains: search, mode: "insensitive" } },
    { author: { contains: search, mode: "insensitive" } },
    { bookNo: { contains: search, mode: "insensitive" } },
    { isbn:   { contains: search, mode: "insensitive" } },
  ];
  const books = await ((await getDb()) as any).book.findMany({ where, include: { _count: { select: { issues: true } } }, orderBy: { title: "asc" } });
  return NextResponse.json(books);
}
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body.title?.trim() || !body.author?.trim()) return NextResponse.json({ error: "Title and author required" }, { status: 422 });
    const qty = parseInt(body.quantity) || 1;
    const branchId = await resolveBranchForCreate(await getActiveBranchId());
    const b = await ((await getDb()) as any).book.create({ data: { branchId, title: body.title.trim(), author: body.author.trim(), bookNo: body.bookNo || null, isbn: body.isbn || null, subject: body.subject || null, rackNo: body.rackNo || null, publisher: body.publisher || null, quantity: qty, available: qty, perUnitCost: body.perUnitCost ? parseFloat(body.perUnitCost) : null, description: body.description || null } });
    return NextResponse.json(b, { status: 201 });
  } catch (err: any) {
    if (err.code === "P2002") return NextResponse.json({ error: "Book number or ISBN already exists" }, { status: 409 });
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
