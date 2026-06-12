import { notFound } from "next/navigation";
import { getDb } from "@/lib/db";
import { PrintTrigger } from "./PrintTrigger";

export default async function PayslipPrintPage({ params }: { params: Promise<{ payslipId: string }> }) {
  const { payslipId } = await params;
  const db = await getDb();

  const [payslip, school] = await Promise.all([
    (db as any).staffPayslip.findUnique({
      where: { id: payslipId },
      include: {
        staff: {
          include: {
            department:  { select: { name: true } },
            designation: { select: { name: true } },
          },
        },
        allowances: { orderBy: { createdAt: "asc" } },
      },
    }),
    (db as any).schoolProfile.findFirst(),
  ]);

  if (!payslip) notFound();

  const earnings   = payslip.allowances.filter((a: any) => a.type === "EARNING");
  const deductions = payslip.allowances.filter((a: any) => a.type === "DEDUCTION");
  const maxRows    = Math.max(earnings.length, deductions.length);
  const rows       = Array.from({ length: Math.max(maxRows, 1) });

  const currency   = school?.currency ?? "GHS";
  const fmt        = (n: number) => `${currency} ${Number(n ?? 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const basic      = Number(payslip.basicSalary ?? 0);
  const totalEarn  = earnings.reduce((s: number, a: any) => s + Number(a.amount ?? 0), 0);
  const totalDed   = deductions.reduce((s: number, a: any) => s + Number(a.amount ?? 0), 0);
  const gross      = basic + totalEarn - totalDed;
  const net        = Number(payslip.netSalary ?? gross);

  const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
  const monthLabel = MONTHS[(payslip.month ?? 1) - 1] ?? payslip.month;

  return (
    <>
      <PrintTrigger />
      <html>
        <head>
          <meta charSet="utf-8" />
          <title>Payslip — {payslip.staff.firstName} {payslip.staff.lastName} — {monthLabel} {payslip.year}</title>
          <style>{`
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: Arial, sans-serif; font-size: 12px; color: #111; background: #fff; }
            .page { width: 210mm; min-height: 297mm; margin: 0 auto; padding: 18mm 15mm; }
            .header { text-align: center; border-bottom: 2px solid #4f46e5; padding-bottom: 12px; margin-bottom: 18px; }
            .header .school-name { font-size: 20px; font-weight: 800; color: #4f46e5; letter-spacing: -0.5px; }
            .header .school-sub  { font-size: 11px; color: #555; margin-top: 2px; }
            .slip-title { text-align: center; font-size: 15px; font-weight: 700; margin-bottom: 16px; color: #1e1b4b; text-transform: uppercase; letter-spacing: 1px; }
            .meta-table { width: 100%; border-collapse: collapse; margin-bottom: 18px; }
            .meta-table td, .meta-table th { padding: 5px 8px; font-size: 11.5px; }
            .meta-table th { color: #555; font-weight: 600; width: 22%; }
            .meta-table td { color: #111; font-weight: 500; }
            .meta-table tr { border-bottom: 1px solid #f0f0f0; }
            .earn-table { width: 100%; border-collapse: collapse; margin-bottom: 14px; }
            .earn-table th { background: #4f46e5; color: #fff; padding: 7px 10px; font-size: 11px; text-align: left; }
            .earn-table td { padding: 6px 10px; border-bottom: 1px solid #f0f0f0; font-size: 11.5px; }
            .earn-table td.amount { text-align: right; font-variant-numeric: tabular-nums; }
            .earn-table tr.total td { background: #f5f3ff; font-weight: 700; border-top: 2px solid #4f46e5; }
            .summary { margin-top: 14px; border: 1px solid #e5e7eb; border-radius: 6px; overflow: hidden; }
            .summary-row { display: flex; justify-content: space-between; padding: 7px 14px; border-bottom: 1px solid #f0f0f0; font-size: 11.5px; }
            .summary-row:last-child { border: none; background: #1e1b4b; color: #fff; font-weight: 800; font-size: 13px; }
            .summary-label { color: inherit; }
            .summary-value { font-variant-numeric: tabular-nums; }
            .footer { margin-top: 30px; display: flex; justify-content: space-between; font-size: 11px; color: #888; }
            .sig { text-align: center; }
            .sig-line { border-top: 1px solid #aaa; width: 150px; margin: 28px auto 4px; }
            .badge { display: inline-block; padding: 2px 8px; border-radius: 20px; font-size: 10px; font-weight: 700; text-transform: uppercase; }
            .badge-paid { background: #d1fae5; color: #065f46; }
            .badge-pending { background: #fef3c7; color: #92400e; }
            @media print {
              body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
              .no-print { display: none !important; }
            }
          `}</style>
        </head>
        <body>
          <div className="page">
            {/* School header */}
            <div className="header">
              {school?.logo && <img src={school.logo} alt="logo" style={{ height: 50, marginBottom: 6 }} />}
              <div className="school-name">{school?.name ?? "Skola"}</div>
              <div className="school-sub">
                {[school?.address, school?.phone, school?.email].filter(Boolean).join("  ·  ")}
              </div>
            </div>

            <div className="slip-title">Payslip — {monthLabel} {payslip.year}</div>

            {/* Staff meta */}
            <table className="meta-table">
              <tbody>
                <tr>
                  <th>Employee ID</th><td>{payslip.staff.employeeId ?? "—"}</td>
                  <th>Name</th><td>{payslip.staff.firstName} {payslip.staff.lastName}</td>
                </tr>
                <tr>
                  <th>Department</th><td>{payslip.staff.department?.name ?? "—"}</td>
                  <th>Designation</th><td>{payslip.staff.designation?.name ?? "—"}</td>
                </tr>
                <tr>
                  <th>Payslip #</th><td style={{ fontFamily: "monospace", fontSize: 10 }}>{payslip.id.slice(-8).toUpperCase()}</td>
                  <th>Status</th>
                  <td>
                    <span className={`badge ${payslip.status === "PAID" ? "badge-paid" : "badge-pending"}`}>
                      {payslip.status}
                    </span>
                    {payslip.paymentDate && (
                      <span style={{ marginLeft: 6, color: "#555" }}>
                        · Paid {new Date(payslip.paymentDate).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                      </span>
                    )}
                  </td>
                </tr>
              </tbody>
            </table>

            {/* Earnings vs Deductions */}
            <table className="earn-table">
              <thead>
                <tr>
                  <th style={{ width: "42%" }}>Earnings</th>
                  <th style={{ width: "16%", textAlign: "right" }}>Amount ({currency})</th>
                  <th style={{ width: "42%", borderLeft: "2px solid #fff" }}>Deductions</th>
                  <th style={{ width: "16%", textAlign: "right" }}>Amount ({currency})</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((_: any, i: number) => {
                  const e = earnings[i];
                  const d = deductions[i];
                  return (
                    <tr key={i}>
                      <td>{e?.name ?? ""}</td>
                      <td className="amount">{e ? fmt(e.amount) : ""}</td>
                      <td style={{ borderLeft: "1px solid #e5e7eb" }}>{d?.name ?? ""}</td>
                      <td className="amount">{d ? fmt(d.amount) : ""}</td>
                    </tr>
                  );
                })}
                <tr className="total">
                  <td>Total Earnings</td>
                  <td className="amount">{fmt(totalEarn)}</td>
                  <td style={{ borderLeft: "1px solid #e5e7eb" }}>Total Deductions</td>
                  <td className="amount">{fmt(totalDed)}</td>
                </tr>
              </tbody>
            </table>

            {/* Summary */}
            <div className="summary">
              <div className="summary-row"><span className="summary-label">Basic Salary</span><span className="summary-value">{fmt(basic)}</span></div>
              <div className="summary-row"><span className="summary-label">Total Earnings</span><span className="summary-value">{fmt(totalEarn)}</span></div>
              <div className="summary-row"><span className="summary-label">Total Deductions</span><span className="summary-value">− {fmt(totalDed)}</span></div>
              <div className="summary-row"><span className="summary-label">Gross Salary</span><span className="summary-value">{fmt(gross)}</span></div>
              <div className="summary-row"><span className="summary-label">Net Salary (Take Home)</span><span className="summary-value">{fmt(net)}</span></div>
            </div>

            {/* Signatures */}
            <div className="footer">
              <div className="sig">
                <div className="sig-line" />
                <div>Employee Signature</div>
              </div>
              <div className="sig">
                <div className="sig-line" />
                <div>Authorised Signature</div>
              </div>
            </div>
          </div>
        </body>
      </html>
    </>
  );
}
