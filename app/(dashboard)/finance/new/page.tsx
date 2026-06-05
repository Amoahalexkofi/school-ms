import { getDb } from "@/lib/db";
import { Topbar } from "@/components/Topbar";
import { AddTransactionForm } from "./AddTransactionForm";

export default async function NewTransactionPage() {
  const [incomeHeads, expenseHeads] = await Promise.all([
    ((await getDb()) as any).incomeHead.findMany({ orderBy: { name: "asc" } }),
    ((await getDb()) as any).expenseHead.findMany({ orderBy: { name: "asc" } }),
  ]);

  return (
    <div className="flex flex-col flex-1">
      <Topbar title="Record Transaction" />
      <AddTransactionForm incomeHeads={incomeHeads} expenseHeads={expenseHeads} />
    </div>
  );
}
