import {
  calculateInvoiceTotal,
  calculateBalanceDue,
  calculateNetAfterDiscounts,
  determineInvoiceStatus,
  type FeeLineItem,
  type Discount,
} from "@/lib/domain/fees";

const tuition: FeeLineItem = { name: "Tuition", amount: 500 };
const sports: FeeLineItem = { name: "Sports", amount: 100 };
const library: FeeLineItem = { name: "Library", amount: 50 };

describe("calculateInvoiceTotal", () => {
  it("sums all fee line items", () => {
    expect(calculateInvoiceTotal([tuition, sports, library])).toBe(650);
  });

  it("returns 0 for empty fee items", () => {
    expect(calculateInvoiceTotal([])).toBe(0);
  });

  it("handles a single fee item", () => {
    expect(calculateInvoiceTotal([tuition])).toBe(500);
  });

  it("throws when any fee amount is negative", () => {
    const badFee: FeeLineItem = { name: "Bad", amount: -100 };
    expect(() => calculateInvoiceTotal([tuition, badFee])).toThrow("fee amount cannot be negative");
  });
});

describe("calculateNetAfterDiscounts", () => {
  it("subtracts discounts from gross total", () => {
    const discounts: Discount[] = [
      { name: "Sibling", amount: 50 },
      { name: "Merit", amount: 100 },
    ];
    expect(calculateNetAfterDiscounts(650, discounts)).toBe(500);
  });

  it("returns gross total when no discounts", () => {
    expect(calculateNetAfterDiscounts(650, [])).toBe(650);
  });

  it("does not go below 0 even with excessive discounts", () => {
    const discounts: Discount[] = [{ name: "Full", amount: 1000 }];
    expect(calculateNetAfterDiscounts(650, discounts)).toBe(0);
  });

  it("throws when any discount amount is negative", () => {
    const badDiscount: Discount = { name: "Bad", amount: -50 };
    expect(() => calculateNetAfterDiscounts(650, [badDiscount])).toThrow(
      "discount amount cannot be negative"
    );
  });
});

describe("calculateBalanceDue", () => {
  it("returns the remaining amount after payments", () => {
    expect(calculateBalanceDue(500, 200)).toBe(300);
  });

  it("returns 0 when fully paid", () => {
    expect(calculateBalanceDue(500, 500)).toBe(0);
  });

  it("returns 0 when overpaid (no negative balance)", () => {
    expect(calculateBalanceDue(500, 600)).toBe(0);
  });

  it("throws when paidAmount is negative", () => {
    expect(() => calculateBalanceDue(500, -10)).toThrow("paid amount cannot be negative");
  });

  it("throws when netAmount is negative", () => {
    expect(() => calculateBalanceDue(-100, 0)).toThrow("net amount cannot be negative");
  });
});

describe("determineInvoiceStatus", () => {
  it('returns UNPAID when nothing has been paid', () => {
    expect(determineInvoiceStatus(500, 0)).toBe("UNPAID");
  });

  it('returns PARTIAL when some but not all has been paid', () => {
    expect(determineInvoiceStatus(500, 200)).toBe("PARTIAL");
  });

  it('returns PAID when fully paid', () => {
    expect(determineInvoiceStatus(500, 500)).toBe("PAID");
  });

  it('returns PAID when overpaid', () => {
    expect(determineInvoiceStatus(500, 600)).toBe("PAID");
  });
});
