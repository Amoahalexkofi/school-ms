import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

// Mirrors Smart School's Certificate_model
// createdFor: 1 = staff, 2 = students

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const createdFor = searchParams.get("createdFor");
  const db = await getDb();
  const where: any = { status: 1 };
  if (createdFor) where.createdFor = parseInt(createdFor);
  const certs = await (db as any).certificate.findMany({ where, orderBy: { certificateName: "asc" } });
  return NextResponse.json(certs);
}

export async function POST(req: NextRequest) {
  try {
    const {
      certificateName, certificateText,
      leftHeader, centerHeader, rightHeader,
      leftFooter, rightFooter, centerFooter,
      backgroundImage, createdFor,
      headerHeight, contentHeight, footerHeight, contentWidth,
      enableStudentImage, enableImageHeight,
    } = await req.json();
    if (!certificateName?.trim()) return NextResponse.json({ error: "certificateName is required" }, { status: 422 });
    if (!certificateText?.trim()) return NextResponse.json({ error: "certificateText is required" }, { status: 422 });
    const db = await getDb();
    const cert = await (db as any).certificate.create({
      data: {
        certificateName:   certificateName.trim(),
        certificateText:   certificateText.trim(),
        leftHeader:        leftHeader    || "",
        centerHeader:      centerHeader  || "",
        rightHeader:       rightHeader   || "",
        leftFooter:        leftFooter    || "",
        rightFooter:       rightFooter   || "",
        centerFooter:      centerFooter  || "",
        backgroundImage:   backgroundImage || null,
        createdFor:        createdFor     ?? 2,
        headerHeight:      headerHeight   ?? 0,
        contentHeight:     contentHeight  ?? 0,
        footerHeight:      footerHeight   ?? 0,
        contentWidth:      contentWidth   ?? 0,
        enableStudentImage: enableStudentImage ?? false,
        enableImageHeight:  enableImageHeight  ?? 0,
      },
    });
    return NextResponse.json(cert, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
