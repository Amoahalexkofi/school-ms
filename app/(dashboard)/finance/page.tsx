import { prisma } from "@/lib/prisma";
import { Topbar } from "@/components/Topbar";
import { FinanceClient } from "./FinanceClient";

async function getData() {
  const [transactions, payrolls, incomeHeads, expenseHeads] = await Promise.all([
    (prisma as any).transaction.findMany({ include: { incomeHead: true, expenseHead: true }, orderBy: { date: "desc" }, take: 50 }),
    (prisma as any).payroll.findMany({ include: { entries: { include: { staff: true } } }, orderBy: [{ year: "desc" }, { month: "desc" }], take: 12 }),
    (prisma as any).incomeHead.findMany({ orderBy: { name: "asc" } }),
    (prisma as any).expenseHead.findMany({ orderBy: { name: "asc" } }),
  ]);
  return { transactions, payrolls, incomeHeads, expenseHeads };
}

export default async function FinancePage() {
  const data = await getData();
  return (
    <div className="flex flex-col flex-1">
      <Topbar title="Finance & Accounting" />
      <FinanceClient {...data} />
    </div>
  );
}
