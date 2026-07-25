import { getDb } from "@/lib/db";

const VISIBILITIES = ["PUBLIC", "ROLE", "PRIVATE", "TASK"] as const;
export type EventVisibility = (typeof VISIBILITIES)[number];

// Only staff with school-wide authority can post events everyone (or a whole
// role) sees. Everyone else can still create PRIVATE/TASK entries for themselves.
const BROADCAST_ROLES = new Set(["SUPER_ADMIN", "ADMIN", "TEACHER"]);
const ADMIN_ROLES = new Set(["SUPER_ADMIN", "ADMIN"]);

export function isBroadcastRole(role: string) {
  return BROADCAST_ROLES.has(role);
}

function err(message: string, code: string) {
  return Object.assign(new Error(message), { code });
}

export async function listCalendarItems(input: {
  userId: string;
  role: string;
  from: Date;
  to: Date;
}) {
  const prisma = await getDb();
  const { userId, role, from, to } = input;

  const visibilityOr = ADMIN_ROLES.has(role)
    ? [{ visibility: "PUBLIC" }, { visibility: "ROLE" }, { createdById: userId }]
    : [{ visibility: "PUBLIC" }, { visibility: "ROLE", creatorRole: role }, { createdById: userId }];

  const [events, holidays] = await Promise.all([
    (prisma as any).calendarEvent.findMany({
      where: {
        OR: visibilityOr,
        startDate: { lte: to },
        endDate: { gte: from },
      },
      include: { createdBy: { select: { id: true, username: true, role: true } } },
      orderBy: { startDate: "asc" },
    }),
    (prisma as any).holiday.findMany({
      where: {
        isActive: true,
        fromDate: { lte: to },
        toDate: { gte: from },
      },
      include: { holidayType: true },
      orderBy: { fromDate: "asc" },
    }),
  ]);

  return {
    events,
    holidays: holidays.map((h: any) => ({
      id: h.id,
      title: h.holidayType?.name ?? "Holiday",
      description: h.description,
      startDate: h.fromDate,
      endDate: h.toDate,
    })),
  };
}

export async function createCalendarEvent(input: {
  title: string;
  description?: string;
  startDate: string | Date;
  endDate: string | Date;
  color?: string;
  visibility?: string;
  userId: string;
  role: string;
}) {
  const title = input.title?.trim();
  if (!title) throw err("Title is required", "VALIDATION");

  const startDate = new Date(input.startDate);
  const endDate = new Date(input.endDate);
  if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) throw err("Valid start and end dates are required", "VALIDATION");
  if (endDate < startDate) throw err("End date cannot be before start date", "VALIDATION");

  const visibility = (input.visibility ?? "TASK").toUpperCase();
  if (!VISIBILITIES.includes(visibility as EventVisibility)) throw err("Invalid visibility", "VALIDATION");

  if ((visibility === "PUBLIC" || visibility === "ROLE") && !BROADCAST_ROLES.has(input.role)) {
    throw err("Only admins and teachers can post school-wide events", "FORBIDDEN");
  }

  const prisma = await getDb();
  return (prisma as any).calendarEvent.create({
    data: {
      title,
      description: input.description?.trim() || null,
      startDate,
      endDate,
      color: input.color || "#4f46e5",
      visibility,
      createdById: input.userId,
      creatorRole: input.role,
    },
    include: { createdBy: { select: { id: true, username: true, role: true } } },
  });
}

async function loadOwnedEvent(id: string, userId: string, role: string) {
  const prisma = await getDb();
  const event = await (prisma as any).calendarEvent.findUnique({ where: { id } });
  if (!event) throw err("Event not found", "NOT_FOUND");
  if (event.createdById !== userId && !ADMIN_ROLES.has(role)) throw err("You can only manage your own events", "FORBIDDEN");
  return event;
}

export async function updateCalendarEvent(
  id: string,
  input: {
    title?: string;
    description?: string;
    startDate?: string | Date;
    endDate?: string | Date;
    color?: string;
    visibility?: string;
    isDone?: boolean;
  },
  userId: string,
  role: string
) {
  const event = await loadOwnedEvent(id, userId, role);

  const data: Record<string, unknown> = {};
  if (input.title !== undefined) {
    if (!input.title.trim()) throw err("Title is required", "VALIDATION");
    data.title = input.title.trim();
  }
  if (input.description !== undefined) data.description = input.description?.trim() || null;
  if (input.color !== undefined) data.color = input.color;
  if (input.isDone !== undefined) data.isDone = Boolean(input.isDone);

  if (input.visibility !== undefined) {
    const visibility = input.visibility.toUpperCase();
    if (!VISIBILITIES.includes(visibility as EventVisibility)) throw err("Invalid visibility", "VALIDATION");
    if ((visibility === "PUBLIC" || visibility === "ROLE") && !BROADCAST_ROLES.has(role)) {
      throw err("Only admins and teachers can post school-wide events", "FORBIDDEN");
    }
    data.visibility = visibility;
  }

  const startDate = input.startDate !== undefined ? new Date(input.startDate) : event.startDate;
  const endDate = input.endDate !== undefined ? new Date(input.endDate) : event.endDate;
  if (input.startDate !== undefined || input.endDate !== undefined) {
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) throw err("Valid start and end dates are required", "VALIDATION");
    if (endDate < startDate) throw err("End date cannot be before start date", "VALIDATION");
    data.startDate = startDate;
    data.endDate = endDate;
  }

  const prisma = await getDb();
  return (prisma as any).calendarEvent.update({
    where: { id },
    data,
    include: { createdBy: { select: { id: true, username: true, role: true } } },
  });
}

export async function deleteCalendarEvent(id: string, userId: string, role: string) {
  await loadOwnedEvent(id, userId, role);
  const prisma = await getDb();
  return (prisma as any).calendarEvent.delete({ where: { id } });
}
