import { getDb } from "@/lib/db";
import {
  calculateInvoiceTotal,
  calculateBalanceDue,
  determineInvoiceStatus,
} from "@/lib/domain/fees";

export interface GenerateInvoiceInput {
  studentId: string;
  feeGroupId: string;
  dueDate: Date;
}

export interface RecordPaymentInput {
  invoiceId: string;
  amount: number;
  method: string;
  reference?: string;
}

export interface ApplyDiscountInput {
  invoiceId: string;
  discountTypeId: string;
  amount: number;
}

export async function generateInvoice(input: GenerateInvoiceInput) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(input.dueDate);
  due.setHours(0, 0, 0, 0);
  if (due < today) throw new Error("dueDate cannot be in the past");

  const prisma = await getDb();
  const feeGroup = await (prisma as any).feeGroup.findUnique({
    where: { id: input.feeGroupId },
    include: { items: { include: { feeType: true } } },
  });
  if (!feeGroup) throw new Error("fee group not found");
  if (!feeGroup.items.length) throw new Error("fee group has no fee types");

  const lineItems = feeGroup.items.map((item: any) => ({
    name: item.feeType.name,
    amount: Number(item.feeType.amount),
  }));
  const total = calculateInvoiceTotal(lineItems);

  return (prisma as any).feeInvoice.create({
    data: {
      studentId: input.studentId,
      feeGroupId: input.feeGroupId,
      dueDate: input.dueDate,
      totalAmount: total,
      paidAmount: 0,
      status: "UNPAID",
    },
  });
}

export async function recordPayment(input: RecordPaymentInput) {
  if (input.amount <= 0) throw new Error("payment amount must be greater than 0");

  const prisma = await getDb();
  const invoice = await (prisma as any).feeInvoice.findUnique({
    where: { id: input.invoiceId },
  });
  if (!invoice) throw new Error("invoice not found");
  if (invoice.status === "PAID") throw new Error("invoice is already paid");

  const newPaid = Number(invoice.paidAmount) + input.amount;
  const status = determineInvoiceStatus(Number(invoice.totalAmount), newPaid);

  await (prisma as any).feePayment.create({
    data: {
      invoiceId: input.invoiceId,
      amount: input.amount,
      method: input.method,
      reference: input.reference,
    },
  });

  return (prisma as any).feeInvoice.update({
    where: { id: input.invoiceId },
    data: { paidAmount: newPaid, status },
  });
}

export async function applyDiscount(input: ApplyDiscountInput) {
  const prisma = await getDb();
  const invoice = await (prisma as any).feeInvoice.findUnique({
    where: { id: input.invoiceId },
  });
  if (!invoice) throw new Error("invoice not found");
  if (invoice.status === "PAID") throw new Error("cannot apply discount to a paid invoice");

  const balance = calculateBalanceDue(
    Number(invoice.totalAmount),
    Number(invoice.paidAmount)
  );
  if (input.amount > balance) throw new Error("discount exceeds remaining balance");

  return (prisma as any).feeDiscount.create({
    data: {
      invoiceId: input.invoiceId,
      discountTypeId: input.discountTypeId,
      amount: input.amount,
    },
  });
}
