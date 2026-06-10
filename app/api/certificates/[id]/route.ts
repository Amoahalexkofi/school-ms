import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const db = await getDb();
  const cert = await (db as any).certificate.findUnique({ where: { id } });
  if (!cert) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(cert);
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const {
      certificateName, certificateText,
      leftHeader, centerHeader, rightHeader,
      leftFooter, rightFooter, centerFooter,
      backgroundImage, createdFor, status,
      headerHeight, contentHeight, footerHeight, contentWidth,
      enableStudentImage, enableImageHeight,
    } = await req.json();
    const data: any = {};
    if (certificateName    !== undefined) data.certificateName    = certificateName.trim();
    if (certificateText    !== undefined) data.certificateText    = certificateText.trim();
    if (leftHeader         !== undefined) data.leftHeader         = leftHeader;
    if (centerHeader       !== undefined) data.centerHeader       = centerHeader;
    if (rightHeader        !== undefined) data.rightHeader        = rightHeader;
    if (leftFooter         !== undefined) data.leftFooter         = leftFooter;
    if (rightFooter        !== undefined) data.rightFooter        = rightFooter;
    if (centerFooter       !== undefined) data.centerFooter       = centerFooter;
    if (backgroundImage    !== undefined) data.backgroundImage    = backgroundImage || null;
    if (createdFor         !== undefined) data.createdFor         = createdFor;
    if (status             !== undefined) data.status             = status;
    if (headerHeight       !== undefined) data.headerHeight       = headerHeight;
    if (contentHeight      !== undefined) data.contentHeight      = contentHeight;
    if (footerHeight       !== undefined) data.footerHeight       = footerHeight;
    if (contentWidth       !== undefined) data.contentWidth       = contentWidth;
    if (enableStudentImage !== undefined) data.enableStudentImage = Boolean(enableStudentImage);
    if (enableImageHeight  !== undefined) data.enableImageHeight  = enableImageHeight;
    const db = await getDb();
    const cert = await (db as any).certificate.update({ where: { id }, data });
    return NextResponse.json(cert);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const db = await getDb();
  await (db as any).certificate.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
