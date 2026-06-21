// Receipt ownership guard. Staff (admin/accountant) see any receipt; a STUDENT
// may only see their own, a PARENT only their linked children's. Prevents IDOR
// now that /fees/receipt is reachable by students/parents.
export async function assertCanViewReceipt(
  db: any,
  session: any,
  studentId: string
): Promise<boolean> {
  const role = session?.user?.role;
  const uid = session?.user?.id;
  if (!role || !uid) return false;

  if (["SUPER_ADMIN", "ADMIN", "ACCOUNTANT", "TEACHER"].includes(role)) return true;

  if (role === "STUDENT") {
    const me = await db.student.findFirst({ where: { userId: uid }, select: { id: true } });
    return me?.id === studentId;
  }

  if (role === "PARENT") {
    const parent = await db.user.findUnique({ where: { id: uid }, select: { childs: true } });
    const ids = (parent?.childs ?? "").split(",").map((s: string) => s.trim()).filter(Boolean);
    return ids.includes(studentId);
  }

  return false;
}
