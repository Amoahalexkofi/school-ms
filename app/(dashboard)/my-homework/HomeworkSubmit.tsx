"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Paperclip, Check, Loader2 } from "lucide-react";

export function HomeworkSubmit({ homeworkId }: { homeworkId: string }) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState<"file" | "mark" | null>(null);
  const [error, setError] = useState("");

  async function submit(attachment?: string) {
    setError("");
    try {
      const res = await fetch(`/api/homework/${homeworkId}/acknowledge`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(attachment ? { attachment } : {}),
      });
      const d = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(d.error || "Failed");
      router.refresh();
    } catch (e: any) {
      setError(e.message || "Failed");
    } finally {
      setBusy(null);
    }
  }

  async function onFile(file: File) {
    setBusy("file"); setError("");
    try {
      const fd = new FormData(); fd.append("file", file);
      const res = await fetch("/api/upload?type=document", { method: "POST", body: fd });
      const d = await res.json();
      if (!res.ok || !d.url) throw new Error(d.error || "Upload failed");
      await submit(d.url);
    } catch (e: any) {
      setError(e.message || "Upload failed");
      setBusy(null);
    }
  }

  return (
    <div className="mt-2 flex items-center gap-2">
      <button
        type="button"
        disabled={busy !== null}
        onClick={() => { setBusy("mark"); submit(); }}
        className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-md border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-50"
      >
        {busy === "mark" ? <Loader2 className="h-3 w-3 animate-spin" /> : <Check className="h-3 w-3" />}
        Mark done
      </button>
      <button
        type="button"
        disabled={busy !== null}
        onClick={() => fileRef.current?.click()}
        className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-md border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-50"
      >
        {busy === "file" ? <Loader2 className="h-3 w-3 animate-spin" /> : <Paperclip className="h-3 w-3" />}
        Attach & submit
      </button>
      <input
        ref={fileRef}
        type="file"
        className="hidden"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) onFile(f); e.target.value = ""; }}
      />
      {error && <span className="text-xs text-rose-600">{error}</span>}
    </div>
  );
}
