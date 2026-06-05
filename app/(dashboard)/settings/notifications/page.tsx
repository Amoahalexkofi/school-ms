import { getDb } from "@/lib/db";
import { Topbar } from "@/components/Topbar";
import { NotificationsClient } from "./NotificationsClient";

const DEFAULT_NOTIFICATIONS = [
  { type: "fee_payment",         label: "Fee Payment Received" },
  { type: "fee_due",             label: "Fee Due Reminder" },
  { type: "attendance_student",  label: "Student Absent Alert" },
  { type: "attendance_low",      label: "Low Attendance Warning" },
  { type: "exam_result",         label: "Exam Result Published" },
  { type: "leave_approved",      label: "Leave Request Approved/Rejected" },
  { type: "new_admission",       label: "New Admission" },
  { type: "homework",            label: "Homework Assigned" },
  { type: "notice_board",        label: "New Notice Posted" },
  { type: "library_due",         label: "Library Book Due" },
  { type: "payslip",             label: "Payslip Generated" },
];

async function getData() {
  const saved = await ((await getDb()) as any).notificationSetting.findMany({ orderBy: { id: "asc" } });
  const savedMap = Object.fromEntries(saved.map((s: any) => [s.type, s]));
  const settings = DEFAULT_NOTIFICATIONS.map((n) => ({
    ...n,
    emailEnabled: savedMap[n.type]?.emailEnabled ?? false,
    smsEnabled:   savedMap[n.type]?.smsEnabled   ?? false,
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
