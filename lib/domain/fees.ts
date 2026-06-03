export interface FeeLineItem {
  name: string;
  amount: number;
}

export interface Discount {
  name: string;
  amount: number;
}

export type InvoiceStatus = "UNPAID" | "PARTIAL" | "PAID";

export function calculateInvoiceTotal(items: FeeLineItem[]): number {
  for (const item of items) {
    if (item.amount < 0) throw new Error("fee amount cannot be negative");
  }
  return items.reduce((sum, item) => sum + item.amount, 0);
}

export function calculateNetAfterDiscounts(
  grossTotal: number,
  discounts: Discount[]
): number {
  for (const d of discounts) {
    if (d.amount < 0) throw new Error("discount amount cannot be negative");
  }
  const totalDiscount = discounts.reduce((sum, d) => sum + d.amount, 0);
  return Math.max(0, grossTotal - totalDiscount);
}

export function calculateBalanceDue(
  netAmount: number,
  paidAmount: number
): number {
  if (netAmount < 0) throw new Error("net amount cannot be negative");
  if (paidAmount < 0) throw new Error("paid amount cannot be negative");
  return Math.max(0, netAmount - paidAmount);
}

export function determineInvoiceStatus(
  netAmount: number,
  paidAmount: number
): InvoiceStatus {
  if (paidAmount <= 0) return "UNPAID";
  if (paidAmount >= netAmount) return "PAID";
  return "PARTIAL";
}
