import { getDb } from "@/lib/db";

export async function listRoutes() {
  const prisma = await getDb();
  return (prisma as any).route.findMany({
    include: { vehicle: true, pickupPoints: { orderBy: { order: "asc" } }, students: { include: { student: true } } },
    orderBy: { name: "asc" },
  });
}

export async function addRoute(input: { name: string; vehicleId?: string }) {
  if (!input.name.trim()) throw Object.assign(new Error("Route name is required"), { code: "VALIDATION" });
  const prisma = await getDb();
  const existing = await (prisma as any).route.findUnique({ where: { name: input.name.trim() } });
  if (existing) throw Object.assign(new Error("Route already exists"), { code: "CONFLICT" });
  return (prisma as any).route.create({ data: { name: input.name.trim(), vehicleId: input.vehicleId } });
}

export async function listVehicles() {
  const prisma = await getDb();
  return (prisma as any).vehicle.findMany({ orderBy: { number: "asc" } });
}

export async function addVehicle(input: { number: string; type: string; capacity: number; driverName?: string; driverPhone?: string }) {
  if (!input.number.trim()) throw Object.assign(new Error("Vehicle number is required"), { code: "VALIDATION" });
  const prisma = await getDb();
  const existing = await (prisma as any).vehicle.findUnique({ where: { number: input.number.trim() } });
  if (existing) throw Object.assign(new Error("Vehicle number already exists"), { code: "CONFLICT" });
  return (prisma as any).vehicle.create({
    data: {
      number:      input.number.trim(),
      type:        input.type,
      capacity:    input.capacity,
      driverName:  input.driverName  || null,
      driverPhone: input.driverPhone || null,
    },
  });
}

export async function assignStudentToRoute(studentId: string, routeId: string, pickupPointId?: string) {
  const prisma = await getDb();
  return (prisma as any).studentRoute.upsert({
    where: { studentId },
    create: { studentId, routeId, pickupPointId },
    update: { routeId, pickupPointId },
  });
}
