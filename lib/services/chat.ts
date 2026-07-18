import { getDb } from "@/lib/db";

/** How many messages one page of a thread holds. */
export const PAGE_SIZE = 50;

const userShape = { include: { staff: true, student: true } };

/**
 * Rooms I'm in, most recently active first, each with its last message and my
 * unread count. Sorting happens in memory because "last activity" lives on
 * ChatMessage, not ChatRoom — a room has no column to order by.
 */
export async function getUserRooms(userId: string) {
  const prisma = await getDb();
  const rooms = await (prisma as any).chatRoom.findMany({
    where: { participants: { some: { userId } } },
    include: {
      participants: { include: { user: userShape } },
      messages: { orderBy: { createdAt: "desc" }, take: 1, include: { sender: userShape } },
    },
  });

  const withMeta = await Promise.all(
    rooms.map(async (room: any) => {
      const me = room.participants.find((p: any) => p.userId === userId);
      // Unread = messages from other people since I last opened the room.
      const unreadCount = await (prisma as any).chatMessage.count({
        where: {
          roomId: room.id,
          senderId: { not: userId },
          ...(me?.lastReadAt ? { createdAt: { gt: me.lastReadAt } } : {}),
        },
      });
      return {
        ...room,
        unreadCount,
        lastMessageAt: room.messages[0]?.createdAt ?? room.createdAt,
      };
    })
  );

  withMeta.sort(
    (a: any, b: any) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime()
  );
  return withMeta;
}

/** Is this user actually in this room? Every room-scoped route must ask first. */
export async function isParticipant(roomId: string, userId: string) {
  const prisma = await getDb();
  const n = await (prisma as any).chatParticipant.count({ where: { roomId, userId } });
  return n > 0;
}

export async function getOrCreateDirectRoom(userIdA: string, userIdB: string) {
  if (userIdA === userIdB) {
    throw Object.assign(new Error("Cannot start a chat with yourself"), { code: "VALIDATION" });
  }
  const prisma = await getDb();

  // Both users must be in the room — `every` alone is a subset test that also
  // matches empty rooms, which is how duplicate threads got created.
  const candidates = await (prisma as any).chatRoom.findMany({
    where: {
      type: "DIRECT",
      AND: [
        { participants: { some: { userId: userIdA } } },
        { participants: { some: { userId: userIdB } } },
      ],
    },
    include: { participants: { include: { user: userShape } } },
  });
  const existing = candidates.find((r: any) => r.participants.length === 2);
  if (existing) return existing;

  return (prisma as any).chatRoom.create({
    data: {
      type: "DIRECT",
      participants: { create: [{ userId: userIdA }, { userId: userIdB }] },
    },
    include: { participants: { include: { user: userShape } } },
  });
}

export async function createGroupRoom(name: string, userIds: string[]) {
  if (!name.trim()) throw Object.assign(new Error("Room name is required"), { code: "VALIDATION" });
  const unique = [...new Set(userIds)];
  if (unique.length < 2) {
    throw Object.assign(new Error("At least 2 participants required"), { code: "VALIDATION" });
  }
  const prisma = await getDb();
  return (prisma as any).chatRoom.create({
    data: {
      name: name.trim(),
      type: "GROUP",
      participants: { create: unique.map((uid) => ({ userId: uid })) },
    },
    include: { participants: { include: { user: userShape } } },
  });
}

/**
 * One page of a thread, oldest→newest for rendering.
 *
 * Takes the *newest* PAGE_SIZE and reverses. Ordering ascending and taking 50
 * returns the oldest 50 instead, which silently freezes any thread past 50
 * messages — new messages are never in the page.
 */
export async function getRoomMessages(roomId: string, before?: Date) {
  const prisma = await getDb();
  const page = await (prisma as any).chatMessage.findMany({
    where: { roomId, ...(before ? { createdAt: { lt: before } } : {}) },
    include: { sender: userShape },
    orderBy: { createdAt: "desc" },
    take: PAGE_SIZE + 1, // one extra tells us whether older messages exist
  });
  const hasMore = page.length > PAGE_SIZE;
  return { messages: page.slice(0, PAGE_SIZE).reverse(), hasMore };
}

export async function sendMessage(roomId: string, senderId: string, content: string) {
  const trimmed = content?.trim() ?? "";
  if (!trimmed) throw Object.assign(new Error("Message cannot be empty"), { code: "VALIDATION" });
  if (trimmed.length > 4000) {
    throw Object.assign(new Error("Message is too long (4000 characters max)"), { code: "VALIDATION" });
  }
  const prisma = await getDb();
  return (prisma as any).chatMessage.create({
    data: { roomId, senderId, content: trimmed },
    include: { sender: userShape },
  });
}

/** Opening a room clears its unread badge. */
export async function markRoomRead(roomId: string, userId: string) {
  const prisma = await getDb();
  return (prisma as any).chatParticipant.updateMany({
    where: { roomId, userId },
    data: { lastReadAt: new Date() },
  });
}
