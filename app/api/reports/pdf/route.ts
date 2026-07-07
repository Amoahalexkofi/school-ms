import { NextRequest, NextResponse } from "next/server";
import React from "react";
import { renderToBuffer } from "@react-pdf/renderer";
import { getDb } from "@/lib/db";
import { TabularReportDoc } from "@/lib/pdf/tabular-report";

// Generic report → PDF. The client posts the flat rows it already built for
// CSV export ({ "Column": value } objects); columns come from the first row.
const MAX_ROWS = 2000;

export async function POST(req: NextRequest) {
  try {
    const { title, subtitle, rows } = await req.json();
    if (!title || !Array.isArray(rows) || rows.length === 0)
      return NextResponse.json({ error: "title and rows are required" }, { status: 422 });
    if (rows.length > MAX_ROWS)
      return NextResponse.json({ error: `PDF export is limited to ${MAX_ROWS} rows — narrow the filters` }, { status: 422 });

    const db = (await getDb()) as any;
    const profile = await db.schoolProfile.findFirst({ select: { name: true, address: true } }).catch(() => null);

    const columns = Object.keys(rows[0]).map(String);
    const body = rows.map((r: Record<string, unknown>) => columns.map((c) => String(r[c] ?? "")));

    const buffer = await renderToBuffer(
      React.createElement(TabularReportDoc, {
        data: {
          schoolName: profile?.name ?? "School",
          address: profile?.address ?? null,
          title: String(title),
          subtitle: subtitle ? String(subtitle) : null,
          columns,
          rows: body,
          generatedAt: new Date().toLocaleString(),
        },
      }) as any
    );

    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${String(title).toLowerCase().replace(/[^a-z0-9]+/g, "-")}.pdf"`,
      },
    });
  } catch (err: any) {
    console.error("[reports/pdf]", err);
    return NextResponse.json({ error: "Failed to generate PDF" }, { status: 500 });
  }
}
