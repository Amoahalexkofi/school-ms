import { getDb } from "@/lib/db";

// ── Visitors ──────────────────────────────────────────────────────────────────

export async function listVisitors(date?: Date) {
  const where = date
    ? { inTime: { gte: new Date(date.setHours(0, 0, 0, 0)), lt: new Date(date.setHours(23, 59, 59, 999)) } }
    : {};
  const prisma = await getDb();
  return (prisma as any).visitor.findMany({ where, orderBy: { inTime: "desc" } });
}

export async function logVisitor(input: { name: string; phone?: string; purpose: string; host?: string }) {
  if (!input.name.trim()) throw Object.assign(new Error("Visitor name is required"), { code: "VALIDATION" });
  if (!input.purpose.trim()) throw Object.assign(new Error("Purpose is required"), { code: "VALIDATION" });
  const prisma = await getDb();
  return (prisma as any).visitor.create({ data: { ...input, name: input.name.trim() } });
}

export async function checkOutVisitor(id: string) {
  const prisma = await getDb();
  const v = await (prisma as any).visitor.findUnique({ where: { id } });
  if (!v) throw Object.assign(new Error("Visitor not found"), { code: "NOT_FOUND" });
  if (v.outTime) throw Object.assign(new Error("Already checked out"), { code: "CONFLICT" });
  return (prisma as any).visitor.update({ where: { id }, data: { outTime: new Date() } });
}

// ── Complaints ────────────────────────────────────────────────────────────────

export async function listComplaints() {
  const prisma = await getDb();
  return (prisma as any).complaint.findMany({ orderBy: { createdAt: "desc" } });
}

export async function createComplaint(input: { title: string; description: string; raisedBy: string }) {
  if (!input.title.trim()) throw Object.assign(new Error("Title is required"), { code: "VALIDATION" });
  const prisma = await getDb();
  return (prisma as any).complaint.create({ data: { ...input, title: input.title.trim() } });
}

export async function updateComplaintStatus(
  id: string,
  status: "OPEN" | "IN_PROGRESS" | "RESOLVED",
  resolution?: string,
) {
  const prisma = await getDb();
  return (prisma as any).complaint.update({ where: { id }, data: { status, resolution } });
}

// ── Enquiries ─────────────────────────────────────────────────────────────────

export async function listEnquiries() {
  const prisma = await getDb();
  return (prisma as any).enquiry.findMany({ orderBy: { createdAt: "desc" } });
}

export async function createEnquiry(input: { name: string; phone?: string; email?: string; message: string }) {
  if (!input.name.trim()) throw Object.assign(new Error("Name is required"), { code: "VALIDATION" });
  if (!input.message.trim()) throw Object.assign(new Error("Message is required"), { code: "VALIDATION" });
  const prisma = await getDb();
  return (prisma as any).enquiry.create({ data: { ...input, name: input.name.trim() } });
}

export async function updateEnquiryStatus(
  id: string,
  status: "NEW" | "CONTACTED" | "CONVERTED" | "CLOSED",
  followUpNote?: string,
) {
  const prisma = await getDb();
  return (prisma as any).enquiry.update({ where: { id }, data: { status, followUpNote } });
}
