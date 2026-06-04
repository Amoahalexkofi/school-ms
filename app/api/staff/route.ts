import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth/password";

export async function GET() {
  const staff = await (prisma as any).staff.findMany({
    include: { user: { select: { email: true, role: true } } },
    orderBy: { joinDate: "desc" },
  });
  return NextResponse.json(staff);
}

export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try { body = await request.json(); }
  catch { return NextResponse.json({ error: "invalid JSON" }, { status: 400 }); }

  const required = ["firstName", "lastName", "email", "role", "employeeCode", "joinDate"];
  for (const f of required) {
    if (!body[f]) return NextResponse.json({ error: `${f} is required` }, { status: 400 });
  }

  try {
    const existing = await (prisma as any).user.findUnique({ where: { email: body.email as string } });
    if (existing) return NextResponse.json({ error: "email already registered" }, { status: 409 });

    const password = await hashPassword("Staff@1234");

    const result = await (prisma as any).$transaction(async (tx: any) => {
      const user = await tx.user.create({
        data: { email: body.email as string, password, role: body.role as string },
      });
      const staff = await tx.staff.create({
        data: {
          userId: user.id,
          firstName: (body.firstName as string).trim(),
          lastName: (body.lastName as string).trim(),
          employeeCode: body.employeeCode as string,
          department: (body.department as string) || null,
          designation: (body.designation as string) || null,
          joinDate: new Date(body.joinDate as string),
        },
      });
      return staff;
    });

    return NextResponse.json(result, { status: 201 });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
