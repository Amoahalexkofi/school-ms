"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AvatarUpload } from "@/components/AvatarUpload";
import { ShieldCheck, ChevronRight, CheckCircle2 } from "lucide-react";

export function AccountProfileForm({ username, email, image }: { username: string; email: string; image: string }) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function save(url: string) {
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
    <main className="flex-1 p-5 md:p-8">
      <div className="max-w-xl mx-auto mt-6 space-y-4">

        {/* Profile */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6">
          <div className="flex items-center gap-5">
            <AvatarUpload currentUrl={image} initials={initials} onUploaded={save} size={88} />
            <div className="flex-1 min-w-0">
              <h1 className="text-[18px] font-bold text-slate-900 truncate">{username}</h1>
              <p className="text-[13.5px] text-slate-500 truncate mt-0.5">{email}</p>
              <div className="h-4 mt-2">
                {saving && <p className="text-[12px] text-slate-400">Saving photo…</p>}
                {saved && !saving && (
                  <p className="text-[12px] text-emerald-600 flex items-center gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5" /> Photo saved
                  </p>
                )}
                {!saving && !saved && (
                  <p className="text-[12px] text-slate-400">Click your photo to change it</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Security */}
        <Link
          href="/account/security"
          className="flex items-center gap-3.5 bg-white rounded-2xl border border-slate-200/80 p-5 hover:border-slate-300 transition-colors"
        >
          <div className="w-11 h-11 rounded-xl bg-indigo-50 flex items-center justify-center shrink-0">
            <ShieldCheck className="h-5 w-5 text-indigo-600" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[14px] font-semibold text-slate-900">Change password</p>
            <p className="text-[12px] text-slate-500">Update the password for your account</p>
          </div>
          <ChevronRight className="h-4 w-4 text-slate-300 shrink-0" />
        </Link>
      </div>
    </main>
  );
}
