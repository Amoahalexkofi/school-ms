import { prisma } from "@/lib/prisma";

export async function listHostels() {
  return (prisma as any).hostel.findMany({
    include: { rooms: { include: { allocations: { include: { student: true } } } } },
    orderBy: { name: "asc" },
  });
}

export async function addHostel(input: { name: string; type?: string }) {
  if (!input.name.trim()) throw Object.assign(new Error("Hostel name is required"), { code: "VALIDATION" });
  const existing = await (prisma as any).hostel.findUnique({ where: { name: input.name.trim() } });
  if (existing) throw Object.assign(new Error("Hostel already exists"), { code: "CONFLICT" });
  return (prisma as any).hostel.create({ data: { name: input.name.trim(), type: input.type } });
}

export async function addRoom(input: { hostelId: string; roomNumber: string; capacity?: number; type?: string }) {
  if (!input.roomNumber.trim()) throw Object.assign(new Error("Room number is required"), { code: "VALIDATION" });
  return (prisma as any).hostelRoom.create({
    data: { hostelId: input.hostelId, roomNumber: input.roomNumber.trim(), capacity: input.capacity ?? 1, type: input.type },
  });
}

export async function allocateStudent(studentId: string, roomId: string) {
  const room = await (prisma as any).hostelRoom.findUnique({
    where: { id: roomId },
    include: { allocations: true },
  });
  if (!room) throw Object.assign(new Error("Room not found"), { code: "NOT_FOUND" });
  if (room.allocations.length >= room.capacity) throw Object.assign(new Error("Room is full"), { code: "CONFLICT" });

  return (prisma as any).hostelAllocation.upsert({
    where: { studentId },
    create: { studentId, roomId },
    update: { roomId },
  });
}
