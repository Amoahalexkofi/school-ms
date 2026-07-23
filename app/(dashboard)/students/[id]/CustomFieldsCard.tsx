"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ListPlus, Pencil } from "lucide-react";

type Definition = {
  id: string;
  fieldLabel: string;
  fieldType: "TEXT" | "NUMBER" | "DATE" | "SELECT" | "TEXTAREA";
  options: string | null;
  isRequired: boolean;
};

type Value = { customFieldId: string; fieldValue: string | null };

export function CustomFieldsCard({
  studentId, definitions, values,
}: {
  studentId: string; definitions: Definition[]; values: Value[];
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const valueById = Object.fromEntries(values.map(v => [v.customFieldId, v.fieldValue ?? ""]));
  const [form, setForm] = useState<Record<string, string>>(() => {
    const init: Record<string, string> = {};
    for (const d of definitions) init[d.id] = valueById[d.id] ?? "";
    return init;
  });

  async function save() {
    for (const d of definitions) {
      if (d.isRequired && !form[d.id]?.trim()) {
        setError(`${d.fieldLabel} is required`);
        return;
      }
    }
    setLoading(true); setError("");
    try {
      const res = await fetch(`/api/students/${studentId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customFieldValues: form }),
      });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error || "Failed"); }
      setOpen(false);
      router.refresh();
    } catch (e: any) {
      setError(e.message || "Failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader className="pb-2 flex flex-row items-center justify-between">
        <CardTitle className="text-sm font-semibold flex items-center gap-2">
          <ListPlus className="h-4 w-4 text-indigo-600" /> Additional Information
        </CardTitle>
        <Button size="sm" variant="outline" onClick={() => { setError(""); setOpen(true); }}>
          <Pencil className="h-3.5 w-3.5 mr-1" /> Edit
        </Button>
      </CardHeader>
      <CardContent>
        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
          {definitions.map(d => (
            <div key={d.id}>
              <dt className="text-xs text-gray-400">{d.fieldLabel}</dt>
              <dd className="text-sm text-gray-800 mt-0.5">{valueById[d.id] || "—"}</dd>
            </div>
          ))}
        </dl>
      </CardContent>

      <Dialog open={open} onOpenChange={o => !o && setOpen(false)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Additional Information</DialogTitle></DialogHeader>
          <div className="space-y-4">
            {definitions.map(d => (
              <div key={d.id}>
                <Label>{d.fieldLabel}{d.isRequired && " *"}</Label>
                {d.fieldType === "TEXTAREA" ? (
                  <textarea
                    className="mt-1 w-full border rounded-md px-3 py-2 text-sm"
                    rows={3}
                    value={form[d.id] ?? ""}
                    onChange={e => setForm(f => ({ ...f, [d.id]: e.target.value }))}
                  />
                ) : d.fieldType === "SELECT" ? (
                  <select
                    className="mt-1 w-full border rounded-md px-3 py-2 text-sm"
                    value={form[d.id] ?? ""}
                    onChange={e => setForm(f => ({ ...f, [d.id]: e.target.value }))}
                  >
                    <option value="">Select…</option>
                    {(d.options ?? "").split(",").map(o => o.trim()).filter(Boolean).map(o => (
                      <option key={o} value={o}>{o}</option>
                    ))}
                  </select>
                ) : (
                  <Input
                    className="mt-1"
                    type={d.fieldType === "NUMBER" ? "number" : d.fieldType === "DATE" ? "date" : "text"}
                    value={form[d.id] ?? ""}
                    onChange={e => setForm(f => ({ ...f, [d.id]: e.target.value }))}
                  />
                )}
              </div>
            ))}
            {error && <p className="text-sm text-red-600">{error}</p>}
            <Button className="w-full" disabled={loading} onClick={save}>
              {loading ? "Saving…" : "Save"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
