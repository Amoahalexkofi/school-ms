import { auth } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { Topbar } from "@/components/Topbar";
import { MyLeaveClient } from "./MyLeaveClient";

export default async function MyLeavePage() {
  const session = await auth();
  const userId = (session?.user as any)?.id;
  const db = (await getDb()) as any;

  const student = userId
    ? await db.student.findFirst({ where: { userId }, select: { id: true, firstName: true, lastName: true } })
    : null;

  const requests = student
    ? await db.studentLeaveRequest.findMany({
        where: { studentId: student.id },
        orderBy: { createdAt: "desc" },
      })
    : [];

  return (
    <div className="flex flex-col flex-1">
      <Topbar title="My Leave" />
      <MyLeaveClient hasProfile={!!student} initialRequests={requests} />
    </div>
  );
}
