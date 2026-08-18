"use client";

import { useState, useRef } from "react";
import {
  ImageIcon, Upload, Link2, CheckCircle2, AlertCircle, Loader2, X,
} from "lucide-react";

export function ImageUploader({
  value,
  onChange,
  aspect = "h-40",
  label = "banner",
}: {
  value: string;
  onChange: (url: string) => void;
  aspect?: string;
  label?: string;
}) {
  const [uploading, setUploading] = useState(false);
  const [dragOver,  setDragOver]  = useState(false);
  const [error,     setError]     = useState("");
  const [mode,      setMode]      = useState<"upload" | "url">("upload");
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File) {
    setError("");
    if (!file.type.startsWith("image/")) {
      setError("Only image files are allowed.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("File must be under 5 MB.");
      return;
    }
    setUploading(true);
    try {
      const form = new FormData();
      form.append("file", file);
      const r    = await fetch("/api/upload", { method: "POST", body: form });
      const data = await r.json();
      if (data.url) {
        onChange(data.url);
      } else {
        setError(data.error ?? "Upload failed. Try again.");
      }
    } catch {
      setError("Upload failed. Check your connection.");
    }
    setUploading(false);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }

  return (
    <div className="space-y-3">
      {/* Mode tabs */}
      <div className="flex bg-slate-100 rounded-xl p-0.5 w-fit gap-0.5">
        {(["upload", "url"] as const).map(m => (
          <button key={m} type="button" onClick={() => setMode(m)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-[10px] text-[12px] font-bold transition-all ${
              mode === m ? "bg-white shadow-sm text-slate-900" : "text-slate-500 hover:text-slate-700"
            }`}>
            {m === "upload"
              ? <><Upload className="h-3 w-3" /> Upload File</>
              : <><Link2 className="h-3 w-3" /> Paste URL</>
            }
          </button>
        ))}
      </div>

      {mode === "upload" ? (
        value ? (
          /* Preview with hover overlay */
          <div className={`relative rounded-xl overflow-hidden border border-slate-200 group ${aspect}`}>
            <img src={value} alt={label} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/45 transition-all flex items-center justify-center gap-2.5 opacity-0 group-hover:opacity-100">
              <button type="button" onClick={() => inputRef.current?.click()}
                className="flex items-center gap-1.5 px-3 py-2 bg-white text-slate-900 rounded-xl text-xs font-bold shadow-lg hover:bg-slate-50">
                <Upload className="h-3 w-3" /> Replace
              </button>
              <button type="button" onClick={() => { onChange(""); }}
                className="flex items-center gap-1.5 px-3 py-2 bg-red-500 text-white rounded-xl text-xs font-bold shadow-lg hover:bg-red-600">
                <X className="h-3 w-3" /> Remove
              </button>
            </div>
            <div className="absolute top-2 right-2">
              <span className="bg-emerald-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                <CheckCircle2 className="h-2.5 w-2.5" /> Uploaded
              </span>
            </div>
          </div>
        ) : (
          /* Drop zone */
          <div
            onClick={() => !uploading && inputRef.current?.click()}
            onDrop={handleDrop}
            onDragOver={e => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            className={`border-2 border-dashed rounded-xl ${aspect} flex flex-col items-center justify-center gap-3 transition-all cursor-pointer select-none ${
              dragOver
                ? "border-indigo-400 bg-indigo-50"
                : uploading
                  ? "border-slate-200 bg-slate-50 cursor-default"
                  : "border-slate-200 hover:border-indigo-300 hover:bg-slate-50/60"
            }`}>
            {uploading ? (
              <>
                <Loader2 className="h-7 w-7 text-indigo-400 animate-spin" />
                <p className="text-[13px] font-semibold text-slate-500">Uploading…</p>
              </>
            ) : (
              <>
                <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center">
                  <ImageIcon className="h-6 w-6 text-slate-400" />
                </div>
                <div className="text-center">
                  <p className="text-[13px] font-bold text-slate-600">
                    {dragOver ? "Drop to upload" : "Click to upload"}
                  </p>
                  <p className="text-[11px] text-slate-400 mt-0.5">or drag &amp; drop your image here</p>
                  <p className="text-[10px] text-slate-300 mt-1">JPG · PNG · WebP · max 5 MB</p>
                </div>
              </>
            )}
          </div>
        )
      ) : (
        /* URL mode */
        <div className="space-y-2">
          <input
            type="text"
            placeholder="https://example.com/image.jpg"
            value={value}
            onChange={e => onChange(e.target.value)}
            className="h-11 w-full rounded-xl border border-slate-200 px-3 text-[14px] outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/10 transition-all"
          />
          {value && (
            <div className={`rounded-xl overflow-hidden border border-slate-200 ${aspect} bg-slate-50`}>
              <img src={value} alt="Preview" className="w-full h-full object-cover"
                onError={e => { (e.target as HTMLImageElement).style.display = "none"; }} />
            </div>
          )}
        </div>
      )}

      {error && (
        <p className="text-[12px] text-red-500 flex items-center gap-1.5">
          <AlertCircle className="h-3.5 w-3.5 shrink-0" /> {error}
        </p>
      )}

      <input
        ref={inputRef} type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="hidden"
        onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); e.target.value = ""; }}
      />
    </div>
  );
}
