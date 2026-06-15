"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, CheckCircle2, AlertCircle } from "lucide-react";

type Props = { sessions: any[]; classSections: any[]; sessionGroups: any[] };

export function FeeAssignClient({ sessions, classSections, sessionGroups }: Props) {
  const [feeSessionGroupId, setFsgId]      = useState("");
  const [sessionId,         setSessionId]  = useState(sessions[0]?.id ?? "");
  const [classSectionId,    setCsId]       = useState("");
  const [loading,           setLoading]    = useState(false);
  const [result,            setResult]     = useState<{ created: number; skipped: number } | null>(null);
  const [error,             setError]      = useState("");

  const selectedSg = sessionGroups.find((sg: any) => sg.id === feeSessionGroupId);
  const totalAmt   = selectedSg?.items.reduce((s: number, i: any) => s + Number(i.amount), 0) ?? 0;

  async function handleAssign() {
    if (!feeSessionGroupId || !sessionId || !classSectionId) {
      setError("Please select a fee group, session, and class."); return;
    }
    setLoading(true); setError(""); setResult(null);
    try {
      const res  = await fetch("/api/fees/assign", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ feeSessionGroupId, sessionId, classSectionId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setResult(data);
    } catch (e: any) { setError(e.message); }
    finally { setLoading(false); }
  }

  return (
    <main className="flex-1 p-6 space-y-5 bg-[#0f1015]">
      <Link href="/fees" className="inline-flex items-center gap-1.5 text-sm text-white/40 hover:text-white/70 transition-colors">
        <ArrowLeft className="h-4 w-4" /> Back to Fees
      </Link>

      <div className="max-w-xl space-y-5">
        <Card>
          <CardContent className="pt-5 space-y-5">
            <h2 className="text-sm font-semibold text-white/70">Assign Fee Group to a Class</h2>
            <p className="text-xs text-white/30">
              This will create fee records for every active student enrolled in the selected class/section for the selected session.
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white/60 mb-1">Fee Group *</label>
                <select className="w-full h-9 rounded-lg border border-white/[0.08] px-3 text-sm bg-[#111318] focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={feeSessionGroupId} onChange={e => setFsgId(e.target.value)}>
                  <option value="">— Select fee group —</option>
                  {sessionGroups.map((sg: any) => (
                    <option key={sg.id} value={sg.id}>
                      {sg.feeGroup.name} — {sg.session.session} ({sg.items.length} items)
                    </option>
                  ))}
                </select>
                {selectedSg && (
                  <p className="text-xs text-emerald-400 mt-1">Total: ₵{totalAmt.toLocaleString()} per student</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-white/60 mb-1">Academic Session *</label>
                <select className="w-full h-9 rounded-lg border border-white/[0.08] px-3 text-sm bg-[#111318] focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={sessionId} onChange={e => setSessionId(e.target.value)}>
                  {sessions.map((s: any) => <option key={s.id} value={s.id}>{s.session}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-white/60 mb-1">Class / Section *</label>
                <select className="w-full h-9 rounded-lg border border-white/[0.08] px-3 text-sm bg-[#111318] focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={classSectionId} onChange={e => setCsId(e.target.value)}>
                  <option value="">— Select class —</option>
                  {classSections.map((cs: any) => (
                    <option key={cs.id} value={cs.id}>{cs.class.name} – {cs.section.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
                <AlertCircle className="h-4 w-4 shrink-0" /> {error}
              </div>
            )}
            {result && (
              <div className="flex items-start gap-2 text-sm text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-lg px-3 py-2">
                <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium">Assignment complete</p>
                  <p className="text-xs text-emerald-400 mt-0.5">
                    {result.created} student(s) assigned · {result.skipped} already had this fee group (skipped)
                  </p>
                </div>
              </div>
            )}

            <Button disabled={loading} onClick={handleAssign} className="w-full">
              {loading ? "Assigning…" : "Assign to Class"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
