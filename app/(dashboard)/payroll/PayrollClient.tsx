"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UserCog, Eye, AlertCircle, Loader2, Zap } from "lucide-react";

type Props = { departments: any[] };

const MONTHS = [
  { value: "01", label: "January" }, { value: "02", label: "February" },
  { value: "03", label: "March" },   { value: "04", label: "April" },
  { value: "05", label: "May" },     { value: "06", label: "June" },
  { value: "07", label: "July" },    { value: "08", label: "August" },
  { value: "09", label: "September"},{ value: "10", label: "October" },
  { value: "11", label: "November"}, { value: "12", label: "December" },
];

const now     = new Date();
const CUR_MONTH = String(now.getMonth() + 1).padStart(2, "0");
const CUR_YEAR  = String(now.getFullYear());

const STATUS_STYLE: Record<string, string> = {
  DRAFT:    "bg-gray-100 text-gray-600",
  APPROVED: "bg-blue-100 text-blue-700",
  PAID:     "bg-green-100 text-green-700",
};

export function PayrollClient({ departments }: Props) {
  const router = useRouter();
  const [month,        setMonth]        = useState(CUR_MONTH);
  const [year,         setYear]         = useState(CUR_YEAR);
  const [departmentId, setDepartmentId] = useState("");
  const [rows,         setRows]         = useState<any[]>([]);
  const [loaded,       setLoaded]       = useState(false);
  const [loading,      setLoading]      = useState(false);
  const [generating,   setGenerating]   = useState<string | null>(null);
  const [bulkLoading,  setBulkLoading]  = useState(false);
  const [bulkResult,   setBulkResult]   = useState<{ created: number; skipped: number } | null>(null);
  const [error,        setError]        = useState("");

  const years = Array.from({ length: 5 }, (_, i) => String(now.getFullYear() - i));

  async function loadPayroll() {
    setLoading(true); setError("");
    try {
      const params = new URLSearchParams({ month, year });
      if (departmentId) params.set("departmentId", departmentId);
      const res  = await fetch(`/api/payroll?${params}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setRows(data); setLoaded(true);
    } catch (e: any) { setError(e.message); }
    finally { setLoading(false); }
  }

  async function generateAll() {
    setBulkLoading(true); setBulkResult(null); setError("");
    try {
      const body: any = { month, year };
      if (departmentId) body.departmentId = departmentId;
      const res  = await fetch("/api/payroll/bulk", {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setBulkResult(data);
      await loadPayroll();
    } catch (e: any) { setError(e.message); }
    finally { setBulkLoading(false); }
  }

  async function generatePayslip(staffId: string) {
    setGenerating(staffId); setError("");
    try {
      const res  = await fetch("/api/payroll", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ staffId, month, year }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      router.push(`/payroll/${data.id}`);
    } catch (e: any) { setError(e.message); setGenerating(null); }
  }

  const totalNetSalary  = rows.reduce((s, r) => s + (r.payslip ? Number(r.payslip.netSalary) : 0), 0);
  const paidCount       = rows.filter(r => r.payslip?.status === "PAID").length;
  const pendingCount    = rows.filter(r => !r.payslip || r.payslip.status !== "PAID").length;
  const noPayslipCount  = rows.filter(r => !r.payslip && r.staff.basicSalary).length;

  return (
    <main className="flex-1 p-6 space-y-5 bg-gray-50">

      {/* Filter bar */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
        <div className="flex flex-wrap items-end gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Month</label>
            <select className="h-9 rounded-lg border border-gray-300 px-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={month} onChange={e => setMonth(e.target.value)}>
              {MONTHS.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Year</label>
            <select className="h-9 rounded-lg border border-gray-300 px-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={year} onChange={e => setYear(e.target.value)}>
              {years.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Department</label>
            <select className="h-9 rounded-lg border border-gray-300 px-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={departmentId} onChange={e => setDepartmentId(e.target.value)}>
              <option value="">All Departments</option>
              {departments.map((d: any) => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>
          </div>
          <Button onClick={loadPayroll} disabled={loading}>
            {loading ? <><Loader2 className="h-4 w-4 mr-1.5 animate-spin" />Loading…</> : "Load Payroll"}
          </Button>
          {loaded && noPayslipCount > 0 && (
            <Button variant="outline" onClick={generateAll} disabled={bulkLoading} className="border-green-300 text-green-700 hover:bg-green-50">
              {bulkLoading
                ? <><Loader2 className="h-4 w-4 mr-1.5 animate-spin" />Generating…</>
                : <><Zap className="h-4 w-4 mr-1.5" />Generate All ({noPayslipCount})</>
              }
            </Button>
          )}
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
          <AlertCircle className="h-4 w-4 shrink-0" /> {error}
        </div>
      )}

      {bulkResult && (
        <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg px-4 py-3">
          <Zap className="h-4 w-4 shrink-0" />
          Generated {bulkResult.created} payslip{bulkResult.created !== 1 ? "s" : ""}.
          {bulkResult.skipped > 0 && ` ${bulkResult.skipped} already had payslips or had no salary set.`}
        </div>
      )}

      {loaded && (
        <>
          {/* Summary */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { label: `Total Net Salary (${MONTHS.find(m => m.value === month)?.label} ${year})`, value: `₵${totalNetSalary.toLocaleString()}`, cls: "text-gray-900" },
              { label: "Paid",    value: paidCount,    cls: "text-green-700" },
              { label: "Pending", value: pendingCount, cls: "text-amber-700" },
            ].map(({ label, value, cls }) => (
              <Card key={label}>
                <CardContent className="pt-4">
                  <p className="text-xs text-gray-400">{label}</p>
                  <p className={`text-2xl font-bold ${cls}`}>{value}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Table */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  {["Employee", "Department", "Designation", "Basic (₵)", "Allowances (₵)", "Deductions (₵)", "Net (₵)", "Status", ""].map(h => (
                    <th key={h} className="text-left px-4 py-3 font-medium text-gray-600 whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y">
                {rows.length === 0 ? (
                  <tr><td colSpan={9} className="px-4 py-10 text-center text-sm text-gray-400">
                    <UserCog className="h-8 w-8 mx-auto mb-2 opacity-30" />
                    No staff found.
                  </td></tr>
                ) : rows.map((row: any) => {
                  const s = row.staff;
                  const p = row.payslip;
                  return (
                    <tr key={s.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className="font-medium text-gray-900">{s.firstName} {s.lastName}</div>
                        <div className="text-xs text-gray-400 font-mono">{s.employeeId}</div>
                      </td>
                      <td className="px-4 py-3 text-gray-600">{s.department?.name ?? "—"}</td>
                      <td className="px-4 py-3 text-gray-600">{s.designation?.name ?? "—"}</td>
                      <td className="px-4 py-3 font-medium">{s.basicSalary ? Number(s.basicSalary).toLocaleString() : "—"}</td>
                      <td className="px-4 py-3 text-green-700">{p ? Number(p.totalAllowance).toLocaleString() : "—"}</td>
                      <td className="px-4 py-3 text-red-600">{p ? Number(p.totalDeduction).toLocaleString() : "—"}</td>
                      <td className="px-4 py-3 font-semibold">{p ? Number(p.netSalary).toLocaleString() : "—"}</td>
                      <td className="px-4 py-3">
                        {p ? (
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_STYLE[p.status]}`}>{p.status}</span>
                        ) : (
                          <span className="text-xs text-gray-400">No payslip</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {p ? (
                          <Link href={`/payroll/${p.id}`}>
                            <Button size="sm" variant="outline"><Eye className="h-3.5 w-3.5 mr-1" />View</Button>
                          </Link>
                        ) : (
                          <Button size="sm" disabled={generating === s.id || !s.basicSalary}
                            onClick={() => generatePayslip(s.id)}>
                            {generating === s.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Generate"}
                          </Button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}

      {!loaded && !loading && (
        <Card><CardContent className="py-16 text-center text-gray-400">
          <UserCog className="h-10 w-10 mx-auto mb-2 opacity-30" />
          <p className="text-sm">Select a month and year then click Load Payroll.</p>
        </CardContent></Card>
      )}
    </main>
  );
}
