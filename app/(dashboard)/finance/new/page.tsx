import { prisma } from "@/lib/prisma";
import { Topbar } from "@/components/Topbar";
import { AddTransactionForm } from "./AddTransactionForm";

export default async function NewTransactionPage() {
  const [incomeHeads, expenseHeads] = await Promise.all([
    (prisma as any).incomeHead.findMany({ orderBy: { name: "asc" } }),
    (prisma as any).expenseHead.findMany({ orderBy: { name: "asc" } }),
  ]);

  return (
    <div className="flex flex-col flex-1">
      <Topbar title="Record Transaction" />
      <AddTransactionForm incomeHeads={incomeHeads} expenseHeads={expenseHeads} />
    </div>
  );
}
