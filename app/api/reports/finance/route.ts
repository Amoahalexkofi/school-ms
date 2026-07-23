import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

// Finance report — income/expense transactions (Smart School Financereports::income/expense).
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type"); // "INCOME" | "EXPENSE" | null (both)
  const from = searchParams.get("from");
  const to = searchParams.get("to");

  const where: any = { isActive: true };
  if (type) where.type = type;
  if (from || to) {
    where.date = {};
    if (from) where.date.gte = new Date(from);
    if (to) where.date.lte = new Date(`${to}T23:59:59.999Z`);
  }

  const transactions = await ((await getDb()) as any).transaction.findMany({
    where,
    include: { incomeHead: { select: { name: true } }, expenseHead: { select: { name: true } } },
    orderBy: { date: "desc" },
  });

  const rows: { date: Date; type: string; head: string; name: string; invoiceNo: string; amount: number; note: string }[] =
    transactions.map((t: any) => ({
      date: t.date,
      type: t.type,
      head: t.type === "INCOME" ? t.incomeHead?.name ?? "" : t.expenseHead?.name ?? "",
      name: t.name ?? "",
      invoiceNo: t.invoiceNo ?? "",
      amount: Number(t.amount),
      note: t.note ?? "",
    }));

  const totalIncome = rows.filter((r) => r.type === "INCOME").reduce((s, r) => s + r.amount, 0);
  const totalExpense = rows.filter((r) => r.type === "EXPENSE").reduce((s, r) => s + r.amount, 0);

  return NextResponse.json({ rows, totalIncome, totalExpense, balance: totalIncome - totalExpense });
}
