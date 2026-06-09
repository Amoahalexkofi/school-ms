import { getDb } from "@/lib/db";

export async function listTransactions(filters?: { type?: "INCOME" | "EXPENSE"; from?: Date; to?: Date }) {
  const where: any = {};
  if (filters?.type) where.type = filters.type;
  if (filters?.from || filters?.to) {
    where.date = {};
    if (filters.from) where.date.gte = filters.from;
    if (filters.to) where.date.lte = filters.to;
  }
  const prisma = await getDb();
  return (prisma as any).transaction.findMany({
    where,
    include: { incomeHead: true, expenseHead: true },
    orderBy: { date: "desc" },
  });
}

export async function createTransaction(input: {
  type: "INCOME" | "EXPENSE";
  amount: number;
  date: Date;
  name?: string;
  invoiceNo?: string;
  note?: string;
  attachment?: string;
  headId: string;
}) {
  if (input.amount <= 0) throw Object.assign(new Error("Amount must be positive"), { code: "VALIDATION" });
  const data: any = {
    type:       input.type,
    name:       input.name      || null,
    invoiceNo:  input.invoiceNo || null,
    amount:     input.amount,
    date:       input.date,
    note:       input.note       || null,
    attachment: input.attachment || null,
  };
  if (input.type === "INCOME") data.incomeHeadId = input.headId;
  else data.expenseHeadId = input.headId;
  const prisma = await getDb();
  return (prisma as any).transaction.create({ data });
}

export async function getFinanceSummary() {
  const prisma = await getDb();
  const [incomeAgg, expenseAgg] = await Promise.all([
    (prisma as any).transaction.aggregate({ where: { type: "INCOME" }, _sum: { amount: true } }),
    (prisma as any).transaction.aggregate({ where: { type: "EXPENSE" }, _sum: { amount: true } }),
  ]);
  const totalIncome = Number(incomeAgg._sum.amount ?? 0);
  const totalExpense = Number(expenseAgg._sum.amount ?? 0);
  return { totalIncome, totalExpense, balance: totalIncome - totalExpense };
}

export async function generatePayroll(month: number, year: number) {
  const prisma = await getDb();
  const existing = await (prisma as any).payroll.findUnique({ where: { month_year: { month, year } } });
  if (existing) throw Object.assign(new Error("Payroll already generated for this month"), { code: "CONFLICT" });

  const staffList = await (prisma as any).staff.findMany();
  if (staffList.length === 0) throw Object.assign(new Error("No staff found"), { code: "VALIDATION" });

  return (prisma as any).payroll.create({
    data: {
      month,
      year,
      entries: {
        create: staffList.map((s: any) => ({
          staffId: s.id,
          basicSalary: s.basicSalary ?? 0,
          allowances: s.allowances ?? 0,
          deductions: s.deductions ?? 0,
          netSalary: (Number(s.basicSalary ?? 0) + Number(s.allowances ?? 0)) - Number(s.deductions ?? 0),
        })),
      },
    },
    include: { entries: { include: { staff: true } } },
  });
}

export async function markPayrollPaid(payrollId: string) {
  const prisma = await getDb();
  const payroll = await (prisma as any).payroll.findUnique({ where: { id: payrollId } });
  if (!payroll) throw Object.assign(new Error("Payroll not found"), { code: "NOT_FOUND" });
  if (payroll.status === "PAID") throw Object.assign(new Error("Payroll already paid"), { code: "CONFLICT" });
  return (prisma as any).payroll.update({ where: { id: payrollId }, data: { status: "PAID" } });
}
