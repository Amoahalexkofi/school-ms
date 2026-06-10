import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

// Mirrors Smart School's Messages_model — messages table (bulk/scheduled messaging)

export async function GET() {
  const db = await getDb();
  const logs = await (db as any).messageLog.findMany({
    orderBy: { createdAt: "desc" },
    include: { sentBy: { select: { firstName: true, lastName: true, employeeId: true } } },
  });
  return NextResponse.json(logs);
}

export async function POST(req: NextRequest) {
  try {
    const {
      title, message, sendThrough, sendMail, sendSms,
      isGroup, isIndividual, isClass, isSchedule,
      scheduleDatetime, groupList, userList, sendTo,
      scheduleClass, scheduleSection, templateId, sentById,
    } = await req.json();

    if (!message?.trim())
      return NextResponse.json({ error: "message is required" }, { status: 422 });

    const db = await getDb();
    const log = await (db as any).messageLog.create({
      data: {
        title:           title           || null,
        message:         message.trim(),
        sendThrough:     sendThrough     || null,
        sendMail:        Boolean(sendMail),
        sendSms:         Boolean(sendSms),
        isGroup:         Boolean(isGroup),
        isIndividual:    Boolean(isIndividual),
        isClass:         Boolean(isClass),
        isSchedule:      Boolean(isSchedule),
        scheduleDatetime: scheduleDatetime ? new Date(scheduleDatetime) : null,
        groupList:       groupList        ? JSON.stringify(groupList)   : null,
        userList:        userList         ? JSON.stringify(userList)    : null,
        sendTo:          sendTo           || null,
        scheduleClass:   scheduleClass    || null,
        scheduleSection: scheduleSection  || null,
        templateId:      templateId       || null,
        sentById:        sentById         || null,
        sent:            !isSchedule,
      },
    });
    return NextResponse.json(log, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
