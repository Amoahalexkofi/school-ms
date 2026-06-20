import { getDb } from "@/lib/db";

/**
 * Idempotent: ensure a Main Branch exists and assign any students/staff that
 * have no branch yet to it. Auto-heals existing data the first time the Multi
 * Branch add-on is used in a tenant.
 */
export async function ensureBranchSetup(): Promise<string> {
  const db = await getDb();
  const mainId = await ensureMainBranchId();
  await Promise.all([
    (db as any).student.updateMany({ where: { branchId: null }, data: { branchId: mainId } }),
    (db as any).staff.updateMany({ where: { branchId: null }, data: { branchId: mainId } }),
    (db as any).feeCategory.updateMany({ where: { branchId: null }, data: { branchId: mainId } }),
    (db as any).feeType.updateMany({ where: { branchId: null }, data: { branchId: mainId } }),
    (db as any).feeGroup.updateMany({ where: { branchId: null }, data: { branchId: mainId } }),
    (db as any).feeDiscount.updateMany({ where: { branchId: null }, data: { branchId: mainId } }),
  ]);
  return mainId;
}

export async function listBranches() {
  const db = await getDb();
  await ensureBranchSetup();
  const branches = await (db as any).branch.findMany({
    orderBy: [{ isMain: "desc" }, { name: "asc" }],
  });
  // Attach member counts per branch
  const withCounts = await Promise.all(
    branches.map(async (b: any) => {
      const [students, staff] = await Promise.all([
        (db as any).student.count({ where: { branchId: b.id } }),
        (db as any).staff.count({ where: { branchId: b.id } }),
      ]);
      return { ...b, _count: { students, staff } };
    })
  );
  return withCounts;
}

/** Ensure a Main Branch exists; returns its id. Safe to call repeatedly. */
export async function ensureMainBranchId(): Promise<string> {
  const db = await getDb();
  const existingMain = await (db as any).branch.findFirst({ where: { isMain: true } });
  if (existingMain) return existingMain.id;
  const anyBranch = await (db as any).branch.findFirst();
  if (anyBranch) return anyBranch.id;
  const created = await (db as any).branch.create({
    data: { name: "Main Branch", isMain: true },
  });
  return created.id;
}

/**
 * Branch a new student/staff record should belong to: the active branch if
 * one is selected, otherwise the Main Branch (created on demand).
 */
export async function resolveBranchForCreate(activeBranchId: string | null): Promise<string> {
  if (activeBranchId) return activeBranchId;
  return ensureMainBranchId();
}

const BRANCH_FIELDS = ["name", "code", "email", "phone", "address", "isActive"] as const;

export async function createBranch(raw: Record<string, unknown>) {
  const db = await getDb();
  if (!String(raw.name ?? "").trim()) throw new Error("Branch name is required");
  const data: Record<string, unknown> = {};
  for (const f of BRANCH_FIELDS) if (f in raw) data[f] = raw[f];
  data.name = String(data.name).trim();
  // First branch created becomes the main branch.
  const count = await (db as any).branch.count();
  if (count === 0) data.isMain = true;
  return (db as any).branch.create({ data });
}

export async function updateBranch(id: string, raw: Record<string, unknown>) {
  const db = await getDb();
  const data: Record<string, unknown> = {};
  for (const f of BRANCH_FIELDS) if (f in raw) data[f] = raw[f];
  if ("name" in data) data.name = String(data.name).trim();
  return (db as any).branch.update({ where: { id }, data });
}

export async function deleteBranch(id: string) {
  const db = await getDb();
  const branch = await (db as any).branch.findUnique({ where: { id } });
  if (!branch) throw new Error("Branch not found");
  if (branch.isMain) throw new Error("The main branch cannot be deleted");
  const [students, staff] = await Promise.all([
    (db as any).student.count({ where: { branchId: id } }),
    (db as any).staff.count({ where: { branchId: id } }),
  ]);
  if (students > 0 || staff > 0)
    throw new Error("Cannot delete a branch that still has students or staff. Reassign them first.");
  return (db as any).branch.delete({ where: { id } });
}
