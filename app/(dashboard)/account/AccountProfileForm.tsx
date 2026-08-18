"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ImageUploader } from "@/components/ImageUploader";
import { ShieldCheck, ChevronRight, CheckCircle2 } from "lucide-react";

export function AccountProfileForm({ username, email, image }: { username: string; email: string; image: string }) {
  const router = useRouter();
  const [photo, setPhoto] = useState(image);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function save(url: string) {
    setPhoto(url);
    setSaving(true);
    setSaved(false);
    try {
      const res = await fetch("/api/account/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: url }),
      });
      if (res.ok) {
        setSaved(true);
        router.refresh();
      }
    } finally {
      setSaving(false);
    }
  }

  const initials = (username || email).slice(0, 2).toUpperCase();

  return (
    <main className="flex-1 p-5 md:p-7">
      <div className="max-w-md mx-auto mt-6 space-y-5">
        {/* Profile photo */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="flex items-center gap-4 mb-5">
            <div className="w-14 h-14 rounded-full bg-indigo-600 flex items-center justify-center text-white text-[16px] font-bold overflow-hidden shrink-0">
              {photo ? <img src={photo} alt={username} className="w-full h-full object-cover" /> : initials}
            </div>
            <div>
              <h1 className="text-[16px] font-semibold text-slate-900">{username}</h1>
              <p className="text-[13px] text-slate-500">{email}</p>
            </div>
          </div>
          <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-2">Profile photo</label>
          <div className="max-w-[180px]">
            <ImageUploader value={photo} onChange={save} aspect="h-32" label="Profile photo" />
          </div>
          {saving && <p className="text-[12px] text-slate-400 mt-2">Saving…</p>}
          {saved && !saving && (
            <p className="text-[12px] text-emerald-600 mt-2 flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5" /> Saved
            </p>
          )}
        </div>

        {/* Security */}
        <Link
          href="/account/security"
          className="flex items-center gap-3 bg-white rounded-xl border border-slate-200 p-5 hover:border-slate-300 transition-colors"
        >
          <div className="w-11 h-11 rounded-xl bg-indigo-50 flex items-center justify-center shrink-0">
            <ShieldCheck className="h-5 w-5 text-indigo-600" />
          </div>
          <div className="flex-1">
            <p className="text-[14px] font-semibold text-slate-900">Change password</p>
            <p className="text-[12px] text-slate-500">Update the password for your account</p>
          </div>
          <ChevronRight className="h-4 w-4 text-slate-300" />
        </Link>
      </div>
    </main>
  );
}
