import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function GET() {
  const roles = await ((await getDb()) as any).appRole.findMany({
    // Exclude auto-generated per-staff roles (created by the direct
    // Permissions screen on a staff profile) — this list is for reusable,
    // admin-named roles only.
    where: { isSystem: false },
    include: {
      _count: { select: { permissions: true, staffRoles: true } },
    },
    orderBy: { name: "asc" },
  });
  return NextResponse.json(roles);
}

export async function POST(req: NextRequest) {
  try {
    const { name } = await req.json();
    if (!name?.trim()) return NextResponse.json({ error: "Name required" }, { status: 422 });
    const role = await ((await getDb()) as any).appRole.create({ data: { name: name.trim() } });
    return NextResponse.json(role, { status: 201 });
  } catch (err: any) {
    if (err.code === "P2002") return NextResponse.json({ error: "Role already exists" }, { status: 409 });
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
