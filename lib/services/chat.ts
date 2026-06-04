import { prisma } from "@/lib/prisma";

export async function getUserRooms(userId: string) {
  return (prisma as any).chatRoom.findMany({
    where: { participants: { some: { userId } } },
    include: {
      participants: { include: { user: { include: { staff: true, student: true } } } },
      messages: { orderBy: { createdAt: "desc" }, take: 1 },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getOrCreateDirectRoom(userIdA: string, userIdB: string) {
  // Find existing direct room between these two users
  const existing = await (prisma as any).chatRoom.findFirst({
    where: {
      type: "DIRECT",
      participants: { every: { userId: { in: [userIdA, userIdB] } } },
    },
    include: { participants: true },
  });
  if (existing && existing.participants.length === 2) return existing;

  return (prisma as any).chatRoom.create({
    data: {
      type: "DIRECT",
      participants: {
        create: [{ userId: userIdA }, { userId: userIdB }],
      },
    },
    include: { participants: true },
  });
}

export async function createGroupRoom(name: string, userIds: string[]) {
  if (!name.trim()) throw Object.assign(new Error("Room name is required"), { code: "VALIDATION" });
  if (userIds.length < 2) throw Object.assign(new Error("At least 2 participants required"), { code: "VALIDATION" });
  return (prisma as any).chatRoom.create({
    data: {
      name: name.trim(),
      type: "GROUP",
      participants: { create: userIds.map((uid) => ({ userId: uid })) },
    },
    include: { participants: { include: { user: true } } },
  });
}

export async function getRoomMessages(roomId: string, before?: Date) {
  return (prisma as any).chatMessage.findMany({
    where: {
      roomId,
      ...(before ? { createdAt: { lt: before } } : {}),
    },
    include: { sender: { include: { staff: true, student: true } } },
    orderBy: { createdAt: "asc" },
    take: 50,
  });
}

export async function sendMessage(roomId: string, senderId: string, content: string) {
  if (!content.trim()) throw Object.assign(new Error("Message cannot be empty"), { code: "VALIDATION" });
  return (prisma as any).chatMessage.create({
    data: { roomId, senderId, content: content.trim() },
    include: { sender: { include: { staff: true, student: true } } },
  });
}
