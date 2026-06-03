import {
  generateInvoice,
  recordPayment,
  applyDiscount,
  type GenerateInvoiceInput,
  type RecordPaymentInput,
} from "@/lib/services/fee-invoices";

jest.mock("@/lib/prisma", () => ({
  prisma: {
    feeInvoice: {
      create: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    feeGroup: {
      findUnique: jest.fn(),
    },
    feePayment: {
      create: jest.fn(),
    },
    feeDiscount: {
      create: jest.fn(),
    },
  },
}));

import { prisma } from "@/lib/prisma";
const mock = prisma as jest.Mocked<typeof prisma>;

const feeGroup = {
  id: "fg-1",
  items: [
    { feeType: { amount: 500 } }, // Tuition
    { feeType: { amount: 100 } }, // Sports
    { feeType: { amount: 50 } },  // Library
  ],
};

describe("generateInvoice", () => {
  beforeEach(() => jest.clearAllMocks());

  const input: GenerateInvoiceInput = {
    studentId: "stu-1",
    feeGroupId: "fg-1",
    dueDate: new Date("2026-07-01"),
  };

  it("creates an invoice with correct total from fee group items", async () => {
    (mock.feeGroup.findUnique as jest.Mock).mockResolvedValue(feeGroup);
    (mock.feeInvoice.create as jest.Mock).mockResolvedValue({
      id: "inv-1",
      totalAmount: 650,
      paidAmount: 0,
      status: "UNPAID",
    });

    const invoice = await generateInvoice(input);

    expect(invoice.totalAmount).toBe(650);
    expect(invoice.status).toBe("UNPAID");

    const createArg = (mock.feeInvoice.create as jest.Mock).mock.calls[0][0];
    expect(Number(createArg.data.totalAmount)).toBe(650);
    expect(createArg.data.status).toBe("UNPAID");
  });

  it("throws when fee group is not found", async () => {
    (mock.feeGroup.findUnique as jest.Mock).mockResolvedValue(null);
    await expect(generateInvoice(input)).rejects.toThrow("fee group not found");
  });

  it("throws when fee group has no items", async () => {
    (mock.feeGroup.findUnique as jest.Mock).mockResolvedValue({ ...feeGroup, items: [] });
    await expect(generateInvoice(input)).rejects.toThrow("fee group has no fee types");
  });

  it("throws when dueDate is in the past", async () => {
    (mock.feeGroup.findUnique as jest.Mock).mockResolvedValue(feeGroup);
    const pastDate = new Date("2020-01-01");
    await expect(
      generateInvoice({ ...input, dueDate: pastDate })
    ).rejects.toThrow("dueDate cannot be in the past");
  });
});

describe("recordPayment", () => {
  beforeEach(() => jest.clearAllMocks());

  const input: RecordPaymentInput = {
    invoiceId: "inv-1",
    amount: 300,
    method: "CASH",
  };

  it("creates a payment and updates invoice paidAmount and status to PARTIAL", async () => {
    (mock.feeInvoice.findUnique as jest.Mock).mockResolvedValue({
      id: "inv-1",
      totalAmount: 650,
      paidAmount: 0,
      status: "UNPAID",
    });
    (mock.feePayment.create as jest.Mock).mockResolvedValue({ id: "pay-1" });
    (mock.feeInvoice.update as jest.Mock).mockResolvedValue({
      id: "inv-1",
      paidAmount: 300,
      status: "PARTIAL",
    });

    const result = await recordPayment(input);

    expect(result.status).toBe("PARTIAL");
    expect(mock.feePayment.create).toHaveBeenCalledTimes(1);
    expect(mock.feeInvoice.update).toHaveBeenCalledTimes(1);

    const updateArg = (mock.feeInvoice.update as jest.Mock).mock.calls[0][0];
    expect(Number(updateArg.data.paidAmount)).toBe(300);
    expect(updateArg.data.status).toBe("PARTIAL");
  });

  it("sets status to PAID when payment covers full amount", async () => {
    (mock.feeInvoice.findUnique as jest.Mock).mockResolvedValue({
      id: "inv-1",
      totalAmount: 650,
      paidAmount: 0,
      status: "UNPAID",
    });
    (mock.feePayment.create as jest.Mock).mockResolvedValue({ id: "pay-1" });
    (mock.feeInvoice.update as jest.Mock).mockResolvedValue({
      id: "inv-1",
      paidAmount: 650,
      status: "PAID",
    });

    const result = await recordPayment({ ...input, amount: 650 });
    expect(result.status).toBe("PAID");
  });

  it("throws when invoice is not found", async () => {
    (mock.feeInvoice.findUnique as jest.Mock).mockResolvedValue(null);
    await expect(recordPayment(input)).rejects.toThrow("invoice not found");
  });

  it("throws when invoice is already fully paid", async () => {
    (mock.feeInvoice.findUnique as jest.Mock).mockResolvedValue({
      id: "inv-1",
      totalAmount: 650,
      paidAmount: 650,
      status: "PAID",
    });
    await expect(recordPayment(input)).rejects.toThrow("invoice is already paid");
  });

  it("throws when payment amount is zero or negative", async () => {
    (mock.feeInvoice.findUnique as jest.Mock).mockResolvedValue({
      id: "inv-1",
      totalAmount: 650,
      paidAmount: 0,
      status: "UNPAID",
    });
    await expect(recordPayment({ ...input, amount: 0 })).rejects.toThrow(
      "payment amount must be greater than 0"
    );
  });
});

describe("applyDiscount", () => {
  beforeEach(() => jest.clearAllMocks());

  it("creates a discount record for an invoice", async () => {
    (mock.feeInvoice.findUnique as jest.Mock).mockResolvedValue({
      id: "inv-1",
      totalAmount: 650,
      paidAmount: 0,
      status: "UNPAID",
    });
    (mock.feeDiscount.create as jest.Mock).mockResolvedValue({ id: "disc-1" });

    await applyDiscount({
      invoiceId: "inv-1",
      discountTypeId: "dt-1",
      amount: 100,
    });

    expect(mock.feeDiscount.create).toHaveBeenCalledTimes(1);
  });

  it("throws when discount exceeds remaining balance", async () => {
    (mock.feeInvoice.findUnique as jest.Mock).mockResolvedValue({
      id: "inv-1",
      totalAmount: 650,
      paidAmount: 600,
      status: "PARTIAL",
    });

    await expect(
      applyDiscount({ invoiceId: "inv-1", discountTypeId: "dt-1", amount: 200 })
    ).rejects.toThrow("discount exceeds remaining balance");
  });

  it("throws when invoice is already paid", async () => {
    (mock.feeInvoice.findUnique as jest.Mock).mockResolvedValue({
      id: "inv-1",
      totalAmount: 650,
      paidAmount: 650,
      status: "PAID",
    });

    await expect(
      applyDiscount({ invoiceId: "inv-1", discountTypeId: "dt-1", amount: 50 })
    ).rejects.toThrow("cannot apply discount to a paid invoice");
  });
});
