import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { FeeInvoiceCard } from "@/components/FeeInvoiceCard";

const unpaidInvoice = {
  id: "inv-1",
  totalAmount: 650,
  paidAmount: 0,
  status: "UNPAID" as const,
  dueDate: new Date("2026-07-01"),
  feeGroup: { name: "Term 1 Fees" },
};

const partialInvoice = {
  ...unpaidInvoice,
  paidAmount: 300,
  status: "PARTIAL" as const,
};

const paidInvoice = {
  ...unpaidInvoice,
  paidAmount: 650,
  status: "PAID" as const,
};

describe("FeeInvoiceCard", () => {
  const onPay = jest.fn();

  beforeEach(() => jest.clearAllMocks());

  it("renders the fee group name", () => {
    render(<FeeInvoiceCard invoice={unpaidInvoice} onPay={onPay} />);
    expect(screen.getByText("Term 1 Fees")).toBeInTheDocument();
  });

  it("renders total amount and paid amount", () => {
    render(<FeeInvoiceCard invoice={partialInvoice} onPay={onPay} />);
    expect(screen.getByText(/650/)).toBeInTheDocument();
    expect(screen.getByText(/300/)).toBeInTheDocument();
  });

  it("renders the balance due correctly", () => {
    render(<FeeInvoiceCard invoice={partialInvoice} onPay={onPay} />);
    expect(screen.getByText(/350/)).toBeInTheDocument();
  });

  it("shows UNPAID status badge", () => {
    render(<FeeInvoiceCard invoice={unpaidInvoice} onPay={onPay} />);
    expect(screen.getByText("UNPAID")).toBeInTheDocument();
  });

  it("shows PARTIAL status badge", () => {
    render(<FeeInvoiceCard invoice={partialInvoice} onPay={onPay} />);
    expect(screen.getByText("PARTIAL")).toBeInTheDocument();
  });

  it("shows PAID status badge", () => {
    render(<FeeInvoiceCard invoice={paidInvoice} onPay={onPay} />);
    expect(screen.getByText("PAID")).toBeInTheDocument();
  });

  it("shows a Pay Now button for UNPAID invoices", () => {
    render(<FeeInvoiceCard invoice={unpaidInvoice} onPay={onPay} />);
    expect(screen.getByRole("button", { name: /pay now/i })).toBeInTheDocument();
  });

  it("shows a Pay Now button for PARTIAL invoices", () => {
    render(<FeeInvoiceCard invoice={partialInvoice} onPay={onPay} />);
    expect(screen.getByRole("button", { name: /pay now/i })).toBeInTheDocument();
  });

  it("does not show a Pay Now button for PAID invoices", () => {
    render(<FeeInvoiceCard invoice={paidInvoice} onPay={onPay} />);
    expect(screen.queryByRole("button", { name: /pay now/i })).not.toBeInTheDocument();
  });

  it("calls onPay with the invoice id when Pay Now is clicked", async () => {
    const user = userEvent.setup();
    render(<FeeInvoiceCard invoice={unpaidInvoice} onPay={onPay} />);
    await user.click(screen.getByRole("button", { name: /pay now/i }));
    expect(onPay).toHaveBeenCalledWith("inv-1");
  });

  it("shows overdue label when dueDate is in the past and invoice is not paid", () => {
    const overdue = { ...unpaidInvoice, dueDate: new Date("2020-01-01") };
    render(<FeeInvoiceCard invoice={overdue} onPay={onPay} />);
    expect(screen.getByText(/overdue/i)).toBeInTheDocument();
  });

  it("does not show overdue label for paid invoices even if dueDate is past", () => {
    const overduePaid = { ...paidInvoice, dueDate: new Date("2020-01-01") };
    render(<FeeInvoiceCard invoice={overduePaid} onPay={onPay} />);
    expect(screen.queryByText(/overdue/i)).not.toBeInTheDocument();
  });

  it("shows a loading state while onPay is in progress", async () => {
    const user = userEvent.setup();
    const slowPay = jest.fn(() => new Promise((r) => setTimeout(r, 500)));
    render(<FeeInvoiceCard invoice={unpaidInvoice} onPay={slowPay} />);
    await user.click(screen.getByRole("button", { name: /pay now/i }));
    expect(screen.getByRole("button", { name: /processing/i })).toBeDisabled();
  });
});
