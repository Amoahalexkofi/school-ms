import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

// Mirrors Smart School's Sharecontent_model — share_contents table

export async function GET() {
  const db = await getDb();
  const contents = await (db as any).shareContent.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json(contents);
}

export async function POST(req: NextRequest) {
  try {
    const { sendTo, title, shareDate, validUpto, description, createdById } = await req.json();
    const db = await getDb();
    const content = await (db as any).shareContent.create({
      data: {
        sendTo:      sendTo      || null,
        title:       title       || null,
        shareDate:   shareDate   ? new Date(shareDate)  : null,
        validUpto:   validUpto   ? new Date(validUpto)  : null,
        description: description || null,
        createdById: createdById || null,
      },
    });
    return NextResponse.json(content, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
