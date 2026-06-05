import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { auth } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    const { subject, message, channel, sessionId, classId } = await req.json();

    if (!subject?.trim()) return NextResponse.json({ error: "Subject is required" }, { status: 422 });
    if (!message?.trim()) return NextResponse.json({ error: "Message is required" }, { status: 422 });

    // Build filter matching Smart School's alumniMail() — join via StudentSession
    const alumniWhere: any = {};
    if (sessionId || classId) {
      const sessionFilter: any = {};
      if (sessionId) sessionFilter.sessionId = sessionId;
      if (classId) sessionFilter.classSection = { classId };
      alumniWhere.student = { sessions: { some: sessionFilter } };
    }

    const alumni = await ((await getDb()) as any).alumni.findMany({
      where: alumniWhere,
      include: {
        student: {
          select: {
            id: true, firstName: true, lastName: true,
            user: { select: { id: true } },
          },
        },
      },
    });

    const recipientCount = alumni.length;

    // IN_APP: create a notification for each alumni user account (if they have one)
    if (channel === "IN_APP") {
      const userIds = alumni
        .map((a: any) => a.student?.user?.id)
        .filter(Boolean);

      if (userIds.length > 0) {
        await ((await getDb()) as any).notification.createMany({
          data: userIds.map((uid: string) => ({
            userId: uid,
            type: "GENERAL",
            title: subject.trim(),
            message: message.trim(),
          })),
        });
      }
    }

    // Build a human-readable label
    let recipientLabel = "All Alumni";
    if (sessionId || classId) {
      const parts: string[] = [];
      if (sessionId) {
        const s = await ((await getDb()) as any).academicSession.findUnique({ where: { id: sessionId } });
        if (s) parts.push(s.session);
      }
      if (classId) {
        const c = await ((await getDb()) as any).class.findUnique({ where: { id: classId } });
        if (c) parts.push(`Class ${c.name}`);
      }
      recipientLabel = `Alumni — ${parts.join(", ")}`;
    }

    const staff = session?.user?.id
      ? await ((await getDb()) as any).staff.findUnique({ where: { userId: session.user.id } })
      : null;

    const log = await ((await getDb()) as any).messageLog.create({
      data: {
        subject: subject.trim(),
        message: message.trim(),
        channel,
        recipientType: recipientLabel,
        recipientCount,
        sentById: staff?.id ?? null,
      },
    });

    return NextResponse.json({ ...log, recipientCount }, { status: 201 });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: "Failed to send" }, { status: 500 });
  }
}
