import { getDb } from "@/lib/db";
import { Topbar } from "@/components/Topbar";
import { FinanceClient } from "./FinanceClient";

async function getData() {
  const [transactions, payrolls, incomeHeads, expenseHeads] = await Promise.all([
    ((await getDb()) as any).transaction.findMany({ include: { incomeHead: true, expenseHead: true }, orderBy: { date: "desc" }, take: 50 }),
    ((await getDb()) as any).payroll.findMany({ include: { entries: { include: { staff: true } } }, orderBy: [{ year: "desc" }, { month: "desc" }], take: 12 }),
    ((await getDb()) as any).incomeHead.findMany({ orderBy: { name: "asc" } }),
    ((await getDb()) as any).expenseHead.findMany({ orderBy: { name: "asc" } }),
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
