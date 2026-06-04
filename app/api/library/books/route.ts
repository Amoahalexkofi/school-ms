import { NextRequest, NextResponse } from "next/server";
import { addBook, listBooks } from "@/lib/services/library";

export async function GET(req: NextRequest) {
  const search = req.nextUrl.searchParams.get("search") ?? undefined;
  return NextResponse.json(await listBooks(search));
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const book = await addBook({ ...body, quantity: Number(body.quantity ?? 1) });
    return NextResponse.json(book, { status: 201 });
  } catch (err: any) {
    if (err.code === "VALIDATION") return NextResponse.json({ error: err.message }, { status: 422 });
    if (err.code === "P2002") return NextResponse.json({ error: "ISBN already exists" }, { status: 409 });
    return NextResponse.json({ error: "Failed to add book" }, { status: 500 });
  }
}
