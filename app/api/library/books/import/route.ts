import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { getActiveBranchId } from "@/lib/branch";
import { resolveBranchForCreate } from "@/lib/services/branches";

// Bulk book import (Smart School Book::import). Accepts parsed CSV rows and
// creates a Book per row; duplicates (same bookNo or ISBN) are skipped.
export async function POST(req: NextRequest) {
  try {
    const { rows } = await req.json();
    if (!Array.isArray(rows) || rows.length === 0)
      return NextResponse.json({ error: "No rows to import" }, { status: 422 });
    if (rows.length > 1000)
      return NextResponse.json({ error: "Import is limited to 1000 rows at a time" }, { status: 422 });

    const db = await getDb();
    const branchId = await resolveBranchForCreate(await getActiveBranchId());
    const results: { row: number; ok: boolean; title?: string; error?: string }[] = [];

    for (let i = 0; i < rows.length; i++) {
      const r = rows[i] ?? {};
      const title  = (r.title ?? "").trim();
      const author = (r.author ?? "").trim();
      if (!title || !author) {
        results.push({ row: i + 1, ok: false, error: "title and author are required" });
        continue;
      }
      try {
        const qty = parseInt(r.quantity ?? "1") || 1;
        await (db as any).book.create({
          data: {
            branchId, title, author,
            bookNo:      (r.book_no ?? r.bookNo ?? "").trim() || null,
            isbn:        (r.isbn ?? "").trim() || null,
            subject:     (r.subject ?? r.category ?? "").trim() || null,
            publisher:   (r.publisher ?? "").trim() || null,
            rackNo:      (r.rack_no ?? r.rackNo ?? "").trim() || null,
            quantity:    qty,
            available:   qty,
            perUnitCost: r.cost ? parseFloat(r.cost) : (r.per_unit_cost ? parseFloat(r.per_unit_cost) : null),
          },
        });
        results.push({ row: i + 1, ok: true, title });
      } catch (err: any) {
        const msg = err.code === "P2002" ? "Duplicate book number or ISBN" : (err.message ?? "Failed");
        results.push({ row: i + 1, ok: false, title, error: msg });
      }
    }

    const created = results.filter((r) => r.ok).length;
    return NextResponse.json({ created, failed: results.length - created, results }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message ?? "Import failed" }, { status: 500 });
  }
}
