import { getDb } from "@/lib/db";
import { Topbar } from "@/components/Topbar";
import { NotificationsClient } from "./NotificationsClient";

// `implemented: true` means email/SMS actually send for this event today
// (fees/collect, cron/fee-reminders, attendance, exams) — those default to
// enabled so this page can't silently turn off something that already
// works the moment an admin saves without touching every row. The other
// event types have no send logic anywhere yet; their toggles are disabled
// in the UI rather than pretending to control something real. Push is
// dead for every type (no in-app notification is ever created anywhere),
// so it's disabled everywhere too — see GAP_AUDIT.md.
const DEFAULT_NOTIFICATIONS = [
  { type: "fee_payment",         label: "Fee Payment Received",              implemented: true },
  { type: "fee_due",              label: "Fee Due Reminder",                  implemented: true },
  { type: "attendance_student",  label: "Student Absent Alert",              implemented: true },
  { type: "attendance_low",      label: "Low Attendance Warning",            implemented: false },
  { type: "exam_result",         label: "Exam Result Published",             implemented: true },
  { type: "leave_approved",      label: "Leave Request Approved/Rejected",   implemented: false },
  { type: "new_admission",       label: "New Admission",                     implemented: false },
  { type: "homework",            label: "Homework Assigned",                 implemented: false },
  { type: "notice_board",        label: "New Notice Posted",                 implemented: false },
  { type: "library_due",         label: "Library Book Due",                  implemented: false },
  { type: "payslip",             label: "Payslip Generated",                 implemented: false },
];

async function getData() {
  const saved = await ((await getDb()) as any).notificationSetting.findMany({ orderBy: { id: "asc" } });
  const savedMap = Object.fromEntries(saved.map((s: any) => [s.type, s]));
  const settings = DEFAULT_NOTIFICATIONS.map((n) => ({
    ...n,
    emailEnabled: savedMap[n.type]?.emailEnabled ?? n.implemented,
    smsEnabled:   savedMap[n.type]?.smsEnabled   ?? n.implemented,
    pushEnabled:  savedMap[n.type]?.pushEnabled  ?? false,
  }));
  return { settings };
}

export default async function NotificationsPage() {
  const data = await getData();
  return (
    <div className="flex flex-col flex-1">
      <Topbar title="Notification Settings" />
      <NotificationsClient {...data} />
    </div>
  );
}
