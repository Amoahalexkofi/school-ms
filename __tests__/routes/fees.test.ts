/**
 * @jest-environment node
 */
import { POST as generateInvoicePOST } from "@/app/api/fees/invoices/route";
import { POST as recordPaymentPOST } from "@/app/api/fees/payments/route";

jest.mock("@/lib/services/fee-invoices", () => ({
  generateInvoice: jest.fn(),
  recordPayment: jest.fn(),
  applyDiscount: jest.fn(),
}));

import { generateInvoice, recordPayment } from "@/lib/services/fee-invoices";
const mockGenerate = generateInvoice as jest.Mock;
const mockPayment = recordPayment as jest.Mock;

const makeRequest = (url: string, body: unknown) =>
  new Request(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

describe("POST /api/fees/invoices", () => {
  beforeEach(() => jest.clearAllMocks());

  it("returns 201 with the created invoice", async () => {
    mockGenerate.mockResolvedValue({
      id: "inv-1",
      totalAmount: 650,
      status: "UNPAID",
    });

    const res = await generateInvoicePOST(
      makeRequest("http://localhost/api/fees/invoices", {
        studentId: "stu-1",
        feeGroupId: "fg-1",
        dueDate: "2026-09-01",
      })
    );

    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.totalAmount).toBe(650);
    expect(body.status).toBe("UNPAID");
  });

  it("returns 400 when required fields are missing", async () => {
    const res = await generateInvoicePOST(
      makeRequest("http://localhost/api/fees/invoices", { studentId: "stu-1" })
    );
    expect(res.status).toBe(400);
  });

  it("returns 404 when fee group is not found", async () => {
    mockGenerate.mockRejectedValue(new Error("fee group not found"));
    const res = await generateInvoicePOST(
      makeRequest("http://localhost/api/fees/invoices", {
        studentId: "stu-1",
        feeGroupId: "bad-id",
        dueDate: "2026-09-01",
      })
    );
    expect(res.status).toBe(404);
  });

  it("returns 422 when dueDate is in the past", async () => {
    mockGenerate.mockRejectedValue(new Error("dueDate cannot be in the past"));
    const res = await generateInvoicePOST(
      makeRequest("http://localhost/api/fees/invoices", {
        studentId: "stu-1",
        feeGroupId: "fg-1",
        dueDate: "2020-01-01",
      })
    );
    expect(res.status).toBe(422);
  });

  it("returns 500 on unexpected errors", async () => {
    mockGenerate.mockRejectedValue(new Error("db error"));
    const res = await generateInvoicePOST(
      makeRequest("http://localhost/api/fees/invoices", {
        studentId: "stu-1",
        feeGroupId: "fg-1",
        dueDate: "2026-09-01",
      })
    );
    expect(res.status).toBe(500);
  });
});

describe("POST /api/fees/payments", () => {
  beforeEach(() => jest.clearAllMocks());

  it("returns 200 with the updated invoice", async () => {
    mockPayment.mockResolvedValue({ id: "inv-1", paidAmount: 300, status: "PARTIAL" });

    const res = await recordPaymentPOST(
      makeRequest("http://localhost/api/fees/payments", {
        invoiceId: "inv-1",
        amount: 300,
        method: "CASH",
      })
    );

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.status).toBe("PARTIAL");
  });

  it("returns 400 when required fields are missing", async () => {
    const res = await recordPaymentPOST(
      makeRequest("http://localhost/api/fees/payments", { invoiceId: "inv-1" })
    );
    expect(res.status).toBe(400);
  });

  it("returns 404 when invoice is not found", async () => {
    mockPayment.mockRejectedValue(new Error("invoice not found"));
    const res = await recordPaymentPOST(
      makeRequest("http://localhost/api/fees/payments", {
        invoiceId: "bad-id",
        amount: 100,
        method: "CASH",
      })
    );
    expect(res.status).toBe(404);
  });

  it("returns 409 when invoice is already paid", async () => {
    mockPayment.mockRejectedValue(new Error("invoice is already paid"));
    const res = await recordPaymentPOST(
      makeRequest("http://localhost/api/fees/payments", {
        invoiceId: "inv-1",
        amount: 100,
        method: "CASH",
      })
    );
    expect(res.status).toBe(409);
  });

  it("returns 422 when payment amount is invalid", async () => {
    mockPayment.mockRejectedValue(new Error("payment amount must be greater than 0"));
    const res = await recordPaymentPOST(
      makeRequest("http://localhost/api/fees/payments", {
        invoiceId: "inv-1",
        amount: 0,
        method: "CASH",
      })
    );
    expect(res.status).toBe(422);
  });
});
