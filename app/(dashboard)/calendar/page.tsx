import { auth } from "@/lib/auth";
import { Topbar } from "@/components/Topbar";
import { listCalendarItems, isBroadcastRole } from "@/lib/services/calendar";
import { CalendarClient } from "./CalendarClient";

export default async function CalendarPage() {
  const session = await auth();
  const now = new Date();
  const from = new Date(now.getFullYear(), now.getMonth(), 1);
  const to = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  const { events, holidays } = await listCalendarItems({
    userId: session!.user!.id!,
    role: (session!.user as any).role,
    from,
    to,
  });

  return (
    <div className="flex flex-col flex-1">
      <Topbar title="Calendar" />
      <CalendarClient
        initialEvents={JSON.parse(JSON.stringify(events))}
        initialHolidays={JSON.parse(JSON.stringify(holidays))}
        initialMonth={from.toISOString()}
        userId={session!.user!.id!}
        role={(session!.user as any).role}
        canBroadcast={isBroadcastRole((session!.user as any).role)}
      />
    </div>
  );
}
