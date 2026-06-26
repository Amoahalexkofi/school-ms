"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Link2, Unlink, Copy, CheckCircle2 } from "lucide-react";

export function ParentLinkCard({ studentId, linkedEmail, defaultEmail }: {
  studentId: string; linkedEmail: string | null; defaultEmail?: string | null;
}) {
  const router = useRouter();
  const [email, setEmail] = useState(defaultEmail ?? "");
  const [loading, setLoading] = useState(false);
  const [tempPw, setTempPw] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  async function link() {
    if (!email.trim()) { alert("Enter the parent's email"); return; }
    setLoading(true); setTempPw(null);
    try {
      const res = await fetch("/api/parents/link", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentId, email }),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error);
      if (d.tempPassword) setTempPw(d.tempPassword);
      else { alert(`Linked to existing parent account (${d.email}).`); router.refresh(); }
      router.refresh();
    } catch (e: any) { alert(e.message); } finally { setLoading(false); }
  }

  async function unlink() {
    if (!linkedEmail) return;
    if (!confirm(`Unlink ${linkedEmail} from this student?`)) return;
    setLoading(true);
    try {
      const res = await fetch("/api/parents/link", {
        method: "DELETE", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentId, parentEmail: linkedEmail }),
      });
      if (!res.ok) throw new Error((await res.json()).error);
      router.refresh();
    } catch (e: any) { alert(e.message); } finally { setLoading(false); }
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold flex items-center gap-2">
          <Users className="h-4 w-4 text-gray-600" /> Parent Login
        </CardTitle>
      </CardHeader>
      <CardContent>
        {linkedEmail ? (
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="text-sm">
              <p className="text-gray-700">Linked to <strong>{linkedEmail}</strong></p>
              <p className="text-xs text-gray-400 mt-0.5">This parent can sign in to see this child's results, attendance and fees.</p>
            </div>
            <Button size="sm" variant="outline" className="text-red-600 border-red-200 hover:bg-red-50" disabled={loading} onClick={unlink}>
              <Unlink className="h-3.5 w-3.5 mr-1" /> Unlink
            </Button>
          </div>
        ) : tempPw ? (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-green-700 font-medium">
              <CheckCircle2 className="h-4 w-4" /> Parent account created for {email}
            </div>
            <div className="flex items-center gap-2 bg-slate-50 border rounded-lg px-3 py-2 text-sm">
              <span className="text-gray-500">Temp password:</span>
              <code className="font-mono font-semibold">{tempPw}</code>
              <button onClick={() => { navigator.clipboard.writeText(tempPw); setCopied(true); }} className="ml-auto text-gray-400 hover:text-gray-700" title="Copy">
                {copied ? <CheckCircle2 className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
              </button>
            </div>
            <p className="text-xs text-gray-400">Share this with the parent — it's shown only once. They sign in with the email above.</p>
          </div>
        ) : (
          <div className="space-y-2">
            <p className="text-xs text-gray-500">No parent login linked. Create or link one so the parent can access this child's portal.</p>
            <div className="flex gap-2">
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="parent@email.com" className="max-w-xs" />
              <Button size="sm" disabled={loading} onClick={link}>
                <Link2 className="h-3.5 w-3.5 mr-1" /> {loading ? "…" : "Link Parent"}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
