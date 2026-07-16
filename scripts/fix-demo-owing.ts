// Re-create owing students: the activity seeder overpaid the demo. Remove the
// synthetic "Demo activity" deposits from ~8 masters (preferring those with no
// other payments) so the owing filter/badges have something real to show.
import { PrismaClient } from "../app/generated/prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";

const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter }) as any;

const sum = (d: any) => Object.values(d?.amountDetail ?? {}).reduce((s: number, v: any) => s + Number(v?.amount ?? 0), 0);
const isSynthetic = (d: any) => JSON.stringify(d.amountDetail).includes("Demo activity");

async function main() {
  const masters = await prisma.studentFeesMaster.findMany({
    where: { isActive: true },
    include: { deposits: { where: { isActive: true } } },
  });
  // rank: masters whose only payments are synthetic first (deleting → fully unpaid)
  const candidates = masters
    .map((m: any) => ({
      m,
      synthetic: m.deposits.filter(isSynthetic),
      realPaid: m.deposits.filter((d: any) => !isSynthetic(d)).reduce((s: number, d: any) => s + sum(d), 0),
    }))
    .filter((c: any) => c.synthetic.length > 0)
    .sort((a: any, b: any) => a.realPaid - b.realPaid)
    .slice(0, 8);

  let removed = 0;
  for (const c of candidates) {
    for (const d of c.synthetic) {
      await prisma.feeDeposit.delete({ where: { id: d.id } });
      removed++;
    }
  }
  console.log(`✓ removed ${removed} synthetic deposits from ${candidates.length} masters — they owe again`);
}

main().then(() => process.exit(0)).catch((e) => { console.error(e); process.exit(1); });
