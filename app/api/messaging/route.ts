import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { sendEmail, bulkMessageEmail } from "@/lib/email";
import { sendSms } from "@/lib/services/sms";
import { sendWhatsApp } from "@/lib/services/whatsapp";

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
      title, message, sendThrough, sendMail, sendSms: wantSms, sendWhatsApp: wantWhatsApp,
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
        sendSms:         Boolean(wantSms),
        sendWhatsApp:    Boolean(wantWhatsApp),
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

    // Fire-and-forget email if sendMail is true and not a scheduled message
    if (sendMail && !isSchedule) {
      collectEmailRecipients(db, { isClass, isIndividual, scheduleClass, scheduleSection, userList, sendTo })
        .then(async (recipients) => {
          if (!recipients.length) return;
          const profile = await (db as any).schoolProfile.findFirst({ select: { name: true } });
          const schoolName = profile?.name ?? "School";
          const subject = title?.trim() || "Message from " + schoolName;

          for (const r of recipients) {
            if (!r.email) continue;
            await sendEmail(db, {
              to: r.email,
              subject,
              html: bulkMessageEmail({ recipientName: r.name, message: message.trim(), schoolName, subject }),
            }).catch(() => null);
          }
        })
        .catch(() => null);
    }

    // Fire-and-forget SMS / WhatsApp if requested and not a scheduled message
    if ((wantSms || wantWhatsApp) && !isSchedule) {
      collectPhoneRecipients(db, { isClass, isIndividual, scheduleClass, scheduleSection, userList, sendTo })
        .then(async (recipients) => {
          const phones = [...new Set(recipients.map((r) => r.phone).filter(Boolean))];
          if (!phones.length) return;
          if (wantSms) {
            for (let i = 0; i < phones.length; i += 100) {
              await sendSms(phones.slice(i, i + 100), message.trim(), db).catch(() => null);
            }
          }
          if (wantWhatsApp) {
            await Promise.all(phones.map((phone) => sendWhatsApp(phone, message.trim(), db).catch(() => null)));
          }
        })
        .catch(() => null);
    }

    return NextResponse.json(log, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

async function collectPhoneRecipients(
  db: any,
  opts: {
    isClass?: boolean;
    isIndividual?: boolean;
    scheduleClass?: string;
    scheduleSection?: string;
    userList?: any;
    sendTo?: string;
  }
): Promise<{ name: string; phone: string }[]> {
  const results: { name: string; phone: string }[] = [];

  if (opts.isIndividual && opts.userList) {
    const ids: string[] = Array.isArray(opts.userList) ? opts.userList : JSON.parse(opts.userList);
    const users = await db.user.findMany({ where: { id: { in: ids } }, select: { phone: true, username: true } });
    for (const u of users) {
      if (u.phone) results.push({ name: u.username || u.phone, phone: u.phone });
    }
    return results;
  }

  if (opts.isClass && opts.scheduleClass) {
    const where: any = { classSection: { classId: opts.scheduleClass } };
    if (opts.scheduleSection) where.classSection.sectionId = opts.scheduleSection;

    const sessions = await db.studentSession.findMany({
      where: { isActive: true, ...where },
      include: { student: { select: { firstName: true, lastName: true, guardianPhone: true, fatherPhone: true, motherPhone: true } } },
    });
    for (const s of sessions) {
      const name = `${s.student.firstName} ${s.student.lastName}`;
      const phone = s.student.guardianPhone || s.student.fatherPhone || s.student.motherPhone;
      if (phone) results.push({ name, phone });
    }
    return results;
  }

  if (opts.sendTo === "all_students") {
    const students = await db.student.findMany({ where: { isActive: true }, select: { firstName: true, lastName: true, phone: true } });
    for (const s of students) {
      if (s.phone) results.push({ name: `${s.firstName} ${s.lastName}`, phone: s.phone });
    }
  } else if (opts.sendTo === "all_staff") {
    const staff = await db.user.findMany({
      where: { role: { in: ["ADMIN", "TEACHER", "ACCOUNTANT", "LIBRARIAN"] }, isActive: true },
      select: { phone: true, username: true },
    });
    for (const u of staff) {
      if (u.phone) results.push({ name: u.username || u.phone, phone: u.phone });
    }
  } else if (opts.sendTo === "all_parents") {
    const students = await db.student.findMany({
      where: { isActive: true },
      select: { firstName: true, lastName: true, guardianPhone: true, fatherPhone: true, motherPhone: true },
    });
    for (const s of students) {
      const phone = s.guardianPhone || s.fatherPhone || s.motherPhone;
      if (phone) results.push({ name: `Parent of ${s.firstName} ${s.lastName}`, phone });
    }
  }

  return results;
}

async function collectEmailRecipients(
  db: any,
  opts: {
    isClass?: boolean;
    isIndividual?: boolean;
    scheduleClass?: string;
    scheduleSection?: string;
    userList?: any;
    sendTo?: string;
  }
): Promise<{ name: string; email: string }[]> {
  const results: { name: string; email: string }[] = [];

  // Individual users by ID list
  if (opts.isIndividual && opts.userList) {
    const ids: string[] = Array.isArray(opts.userList)
      ? opts.userList
      : JSON.parse(opts.userList);

    const users = await db.user.findMany({
      where: { id: { in: ids } },
      select: { email: true, username: true },
    });
    for (const u of users) {
      if (u.email) results.push({ name: u.username || u.email, email: u.email });
    }
    return results;
  }

  // By class/section — look up students
  if (opts.isClass && opts.scheduleClass) {
    const where: any = { classSection: { classId: opts.scheduleClass } };
    if (opts.scheduleSection) where.classSection.sectionId = opts.scheduleSection;

    const sessions = await db.studentSession.findMany({
      where: { isActive: true, ...where },
      include: { student: { select: { firstName: true, lastName: true, email: true, guardianEmail: true } } },
    });

    for (const s of sessions) {
      const name = `${s.student.firstName} ${s.student.lastName}`;
      if (s.student.email) results.push({ name, email: s.student.email });
      else if (s.student.guardianEmail) results.push({ name, email: s.student.guardianEmail });
    }
    return results;
  }

  // sendTo = "all_students" | "all_staff" | "all_parents"
  if (opts.sendTo === "all_students") {
    const students = await db.student.findMany({
      where: { isActive: true },
      select: { firstName: true, lastName: true, email: true },
    });
    for (const s of students) {
      if (s.email) results.push({ name: `${s.firstName} ${s.lastName}`, email: s.email });
    }
  } else if (opts.sendTo === "all_staff") {
    const staff = await db.user.findMany({
      where: { role: { in: ["ADMIN", "TEACHER", "ACCOUNTANT", "LIBRARIAN"] }, isActive: true },
      select: { email: true, username: true },
    });
    for (const u of staff) {
      if (u.email) results.push({ name: u.username || u.email, email: u.email });
    }
  } else if (opts.sendTo === "all_parents") {
    const students = await db.student.findMany({
      where: { isActive: true },
      select: { firstName: true, lastName: true, guardianEmail: true, fatherEmail: true, motherEmail: true },
    });
    for (const s of students) {
      const email = s.guardianEmail || s.fatherEmail || s.motherEmail;
      if (email) results.push({ name: `Parent of ${s.firstName} ${s.lastName}`, email });
    }
  }

  return results;
}
