import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const student = await (prisma as any).student.findUnique({
    where: { id },
    include: {
      user: { select: { email: true, username: true, role: true, isActive: true } },
      schoolHouse: true,
      sessions: {
        include: {
          session: true,
          classSection: { include: { class: true, section: true } },
        },
        orderBy: { createdAt: "desc" },
      },
      hostelAllocation: { include: { room: { include: { hostel: true, roomType: true } } } },
      transportRoute: { include: { route: true, pickupPoint: true } },
    },
  });
  if (!student) return NextResponse.json({ error: "Student not found" }, { status: 404 });
  return NextResponse.json(student);
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const body = await req.json();
    // Convert date strings
    if (body.dateOfBirth)   body.dateOfBirth   = new Date(body.dateOfBirth);
    if (body.admissionDate) body.admissionDate = new Date(body.admissionDate);
    if (body.measurementDate) body.measurementDate = new Date(body.measurementDate);
    if (body.disabledAt)    body.disabledAt    = new Date(body.disabledAt);

    const student = await (prisma as any).student.update({ where: { id }, data: body });
    return NextResponse.json(student);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const sessions = await (prisma as any).studentSession.count({ where: { studentId: id, isActive: true } });
  if (sessions > 0)
    return NextResponse.json({ error: "Cannot delete student with active enrollments" }, { status: 409 });
  await (prisma as any).student.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
