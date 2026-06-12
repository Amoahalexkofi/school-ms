"use client";

import { useRef, useState } from "react";
import { Camera, Loader2 } from "lucide-react";

interface Props {
  currentUrl?: string | null;
  initials: string;
  onUploaded: (url: string) => void;
  size?: number;
  color?: string;
}

export function AvatarUpload({ currentUrl, initials, onUploaded, size = 72, color = "#4f46e5" }: Props) {
  const [preview, setPreview] = useState<string | null>(currentUrl ?? null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File) {
    setError(null);
    setLoading(true);
    const localPreview = URL.createObjectURL(file);
    setPreview(localPreview);

    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: form });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Upload failed");
      onUploaded(data.url);
    } catch (e: any) {
      setError(e.message);
      setPreview(currentUrl ?? null);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative shrink-0 cursor-pointer group" style={{ width: size, height: size }}
      onClick={() => !loading && inputRef.current?.click()}>
      {/* Circle */}
      <div
        className="w-full h-full rounded-full overflow-hidden flex items-center justify-center text-white font-bold select-none"
        style={{
          fontSize: size * 0.3,
          background: preview ? undefined : color,
        }}
      >
        {preview ? (
          <img src={preview} alt="avatar" className="w-full h-full object-cover" />
        ) : (
          initials
        )}
      </div>

      {/* Hover overlay */}
      <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
        {loading
          ? <Loader2 className="h-5 w-5 text-white animate-spin" />
          : <Camera className="h-5 w-5 text-white" />
        }
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); e.target.value = ""; }}
      />

      {error && (
        <p className="absolute top-full left-1/2 -translate-x-1/2 mt-1 text-xs text-red-600 whitespace-nowrap bg-white border rounded shadow px-2 py-1 z-10">
          {error}
        </p>
      )}
    </div>
  );
}
