"use client";

import { useState, useRef } from "react";
import {
  Plus, Trash2, Edit3, Save, Eye, X, Bell, Layout,
  Settings2, ImageIcon, Upload, Link2, Palette, Globe,
  AlignLeft, CheckCircle2, AlertCircle, Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";

type Tab = "slides" | "notices" | "settings";

interface Slide {
  id: string;
  title: string;
  subtitle?: string;
  imageUrl?: string;
  ctaText: string;
  ctaLink: string;
  order: number;
  isActive: boolean;
}
interface Notice {
  id: string;
  title: string;
  body?: string;
  type: string;
  isActive: boolean;
  expiresAt?: string;
  createdAt: string;
}
interface Settings {
  aboutTitle?: string;
  aboutText?: string;
  primaryColor: string;
  showStats: boolean;
}

const SLIDE_EMPTY = {
  title: "",
  subtitle: "",
  imageUrl: "",
  ctaText: "Sign In to Portal",
  ctaLink: "/sign-in",
};
const NOTICE_EMPTY = { title: "", body: "", type: "info", expiresAt: "" };

const TYPE_OPTS = [
  { value: "info",    label: "Info",      color: "bg-indigo-100 text-indigo-700" },
  { value: "warning", label: "Important", color: "bg-amber-100 text-amber-700"  },
  { value: "urgent",  label: "Urgent",    color: "bg-red-100 text-red-700"      },
];

const COLOR_PRESETS = [
  "#6366f1", "#8b5cf6", "#ec4899", "#ef4444",
  "#f97316", "#eab308", "#22c55e", "#14b8a6",
  "#0ea5e9", "#3b82f6", "#1d4ed8", "#0f172a",
];

// ── Image Uploader ──────────────────────────────────────────────────────────
function ImageUploader({
  value,
  onChange,
}: {
  value: string;
  onChange: (url: string) => void;
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
          <button key={m} onClick={() => setMode(m)}
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
          <div className="relative rounded-xl overflow-hidden border border-slate-200 group">
            <img src={value} alt="Banner" className="w-full h-40 object-cover" />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/45 transition-all flex items-center justify-center gap-2.5 opacity-0 group-hover:opacity-100">
              <button onClick={() => inputRef.current?.click()}
                className="flex items-center gap-1.5 px-3 py-2 bg-white text-slate-900 rounded-xl text-xs font-bold shadow-lg hover:bg-slate-50">
                <Upload className="h-3 w-3" /> Replace
              </button>
              <button onClick={() => { onChange(""); }}
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
            className={`border-2 border-dashed rounded-xl h-40 flex flex-col items-center justify-center gap-3 transition-all cursor-pointer select-none ${
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
            placeholder="https://example.com/banner.jpg"
            value={value}
            onChange={e => onChange(e.target.value)}
            className="h-11 w-full rounded-xl border border-slate-200 px-3 text-[14px] outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/10 transition-all"
          />
          {value && (
            <div className="rounded-xl overflow-hidden border border-slate-200 h-32 bg-slate-50">
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

// ── Slide Mini Preview ──────────────────────────────────────────────────────
function SlideMiniPreview({
  slide,
  color,
}: {
  slide: typeof SLIDE_EMPTY;
  color: string;
}) {
  return (
    <div
      className="relative rounded-xl overflow-hidden h-28 flex items-end"
      style={{
        background: slide.imageUrl
          ? `linear-gradient(to bottom, rgba(0,0,0,0.08) 0%, rgba(0,0,0,0.65) 100%), url(${slide.imageUrl}) center/cover`
          : `linear-gradient(135deg, ${color}e0, ${color}80)`,
      }}>
      {/* Dot grid overlay */}
      <div className="absolute inset-0 pointer-events-none"
        style={{ backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.06) 1px, transparent 1px)", backgroundSize: "18px 18px" }} />
      <div className="relative p-3 text-white">
        <p className="text-[12px] font-black leading-tight truncate max-w-[220px]">
          {slide.title || <span className="opacity-40">Slide heading…</span>}
        </p>
        {slide.subtitle && (
          <p className="text-[10px] opacity-60 truncate mt-0.5 max-w-[220px]">{slide.subtitle}</p>
        )}
        {slide.ctaText && (
          <span
            className="inline-block mt-2 text-[10px] font-bold px-2.5 py-1 rounded-lg"
            style={{ background: color }}>
            {slide.ctaText}
          </span>
        )}
      </div>
      {!slide.imageUrl && (
        <div className="absolute top-2 right-3">
          <span className="text-[9px] font-bold text-white/50 uppercase tracking-widest">Gradient</span>
        </div>
      )}
    </div>
  );
}

// ── Field ───────────────────────────────────────────────────────────────────
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">
        {label}
      </label>
      {children}
    </div>
  );
}

// ── Flash Banner ────────────────────────────────────────────────────────────
function Flash({ msg }: { msg: { text: string; ok: boolean } | null }) {
  if (!msg) return null;
  return (
    <div className={`flex items-center gap-2.5 text-[13px] font-semibold px-4 py-3 rounded-xl border ${
      msg.ok
        ? "bg-emerald-50 border-emerald-200 text-emerald-700"
        : "bg-red-50 border-red-200 text-red-700"
    }`}>
      {msg.ok
        ? <CheckCircle2 className="h-4 w-4 shrink-0" />
        : <AlertCircle className="h-4 w-4 shrink-0" />
      }
      {msg.text}
    </div>
  );
}

// ── Main Component ──────────────────────────────────────────────────────────
export function WebsiteClient({
  initialSlides,
  initialNotices,
  initialSettings,
  schoolUrl,
}: {
  initialSlides: Slide[];
  initialNotices: Notice[];
  initialSettings: Settings;
  schoolUrl: string;
}) {
  const [tab,      setTab]      = useState<Tab>("slides");
  const [slides,   setSlides]   = useState<Slide[]>(initialSlides);
  const [notices,  setNotices]  = useState<Notice[]>(initialNotices);
  const [settings, setSettings] = useState<Settings>(initialSettings);
  const [saving,   setSaving]   = useState(false);
  const [msg,      setMsg]      = useState<{ text: string; ok: boolean } | null>(null);

  const [slideForm,    setSlideForm]    = useState(SLIDE_EMPTY);
  const [slideEditing, setSlideEditing] = useState<string | null>(null);
  const [noticeForm,    setNoticeForm]    = useState(NOTICE_EMPTY);
  const [noticeEditing, setNoticeEditing] = useState<string | null>(null);

  function flash(text: string, ok = true) {
    setMsg({ text, ok });
    setTimeout(() => setMsg(null), 3500);
  }

  // ── Slides ────────────────────────────────────────────────────────────────
  async function saveSlide() {
    if (!slideForm.title.trim()) return;
    setSaving(true);
    try {
      if (slideEditing) {
        await fetch("/api/website/slides", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: slideEditing, ...slideForm, isActive: true }),
        });
        setSlides(ss => ss.map(s => s.id === slideEditing ? { ...s, ...slideForm } : s));
        setSlideEditing(null);
      } else {
        const r  = await fetch("/api/website/slides", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(slideForm),
        });
        const ns = await r.json();
        setSlides(ss => [...ss, ns]);
      }
      setSlideForm(SLIDE_EMPTY);
      flash(slideEditing ? "Slide updated ✓" : "Slide added ✓");
    } catch {
      flash("Failed to save. Try again.", false);
    }
    setSaving(false);
  }

  async function deleteSlide(id: string) {
    if (!confirm("Delete this slide?")) return;
    await fetch("/api/website/slides", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    setSlides(ss => ss.filter(s => s.id !== id));
    if (slideEditing === id) { setSlideEditing(null); setSlideForm(SLIDE_EMPTY); }
    flash("Slide deleted");
  }

  async function toggleSlide(s: Slide) {
    await fetch("/api/website/slides", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...s, isActive: !s.isActive }),
    });
    setSlides(ss => ss.map(x => x.id === s.id ? { ...x, isActive: !x.isActive } : x));
  }

  function editSlide(s: Slide) {
    setSlideEditing(s.id);
    setSlideForm({
      title:    s.title,
      subtitle: s.subtitle  ?? "",
      imageUrl: s.imageUrl  ?? "",
      ctaText:  s.ctaText,
      ctaLink:  s.ctaLink,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  // ── Notices ───────────────────────────────────────────────────────────────
  async function saveNotice() {
    if (!noticeForm.title.trim()) return;
    setSaving(true);
    try {
      if (noticeEditing) {
        await fetch("/api/website/notices", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: noticeEditing, ...noticeForm, isActive: true }),
        });
        setNotices(ns => ns.map(n => n.id === noticeEditing ? { ...n, ...noticeForm } : n));
        setNoticeEditing(null);
      } else {
        const r  = await fetch("/api/website/notices", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(noticeForm),
        });
        const nn = await r.json();
        setNotices(ns => [nn, ...ns]);
      }
      setNoticeForm(NOTICE_EMPTY);
      flash(noticeEditing ? "Notice updated ✓" : "Notice published ✓");
    } catch {
      flash("Failed to save. Try again.", false);
    }
    setSaving(false);
  }

  async function deleteNotice(id: string) {
    if (!confirm("Delete this notice?")) return;
    await fetch("/api/website/notices", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    setNotices(ns => ns.filter(n => n.id !== id));
    if (noticeEditing === id) { setNoticeEditing(null); setNoticeForm(NOTICE_EMPTY); }
    flash("Notice deleted");
  }

  async function toggleNotice(n: Notice) {
    await fetch("/api/website/notices", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...n, isActive: !n.isActive }),
    });
    setNotices(ns => ns.map(x => x.id === n.id ? { ...x, isActive: !x.isActive } : x));
  }

  function editNotice(n: Notice) {
    setNoticeEditing(n.id);
    setNoticeForm({
      title:     n.title,
      body:      n.body ?? "",
      type:      n.type,
      expiresAt: n.expiresAt ? n.expiresAt.slice(0, 10) : "",
    });
  }

  // ── Settings ──────────────────────────────────────────────────────────────
  async function saveSettings() {
    setSaving(true);
    try {
      await fetch("/api/website", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      flash("Settings saved ✓");
    } catch {
      flash("Failed to save.", false);
    }
    setSaving(false);
  }

  const TABS = [
    { id: "slides"   as Tab, label: "Hero Slides",  Icon: Layout    },
    { id: "notices"  as Tab, label: "Notices",       Icon: Bell      },
    { id: "settings" as Tab, label: "Site Settings", Icon: Settings2 },
  ];

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[22px] font-black text-slate-900 tracking-tight">Website Manager</h1>
          <p className="text-[13px] text-slate-500 mt-0.5">Edit your public school website content</p>
        </div>
        <a href={schoolUrl} target="_blank" rel="noopener noreferrer">
          <Button variant="outline" size="sm" className="gap-2">
            <Eye className="h-3.5 w-3.5" /> View Site
          </Button>
        </a>
      </div>

      <Flash msg={msg} />

      {/* Tabs */}
      <div className="bg-slate-100/80 p-1 rounded-2xl inline-flex gap-1">
        {TABS.map(({ id, label, Icon }) => (
          <button key={id} onClick={() => setTab(id)}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-[13px] font-bold transition-all ${
              tab === id ? "bg-white shadow-sm text-slate-900" : "text-slate-500 hover:text-slate-700"
            }`}>
            <Icon className="h-3.5 w-3.5" /> {label}
          </button>
        ))}
      </div>

      {/* ─── Hero Slides ─────────────────────────────────────────────────── */}
      {tab === "slides" && (
        <div className="grid lg:grid-cols-[1fr_420px] gap-6 items-start">

          {/* List */}
          <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden"
            style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 4px 16px rgba(99,102,241,0.06)" }}>
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h2 className="text-[15px] font-black text-slate-900">Hero Slides</h2>
                <p className="text-[12px] text-slate-500 mt-0.5">Full-screen rotating banners on your school homepage</p>
              </div>
              <span className="text-[12px] font-bold text-slate-400 bg-slate-100 px-2.5 py-1 rounded-lg">
                {slides.length} slide{slides.length !== 1 ? "s" : ""}
              </span>
            </div>

            {slides.length === 0 ? (
              <div className="px-6 py-16 text-center">
                <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <ImageIcon className="h-8 w-8 text-slate-300" />
                </div>
                <p className="text-[15px] font-bold text-slate-400">No slides yet</p>
                <p className="text-[13px] text-slate-400 mt-1">Add your first banner using the form →</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {slides.map((s, i) => (
                  <div key={s.id}
                    className={`flex gap-4 p-4 transition-colors ${!s.isActive ? "opacity-50" : ""} ${slideEditing === s.id ? "bg-indigo-50/60" : "hover:bg-slate-50/60"}`}>
                    {/* Thumbnail */}
                    <div
                      className="shrink-0 w-[88px] h-14 rounded-xl overflow-hidden border border-slate-100"
                      style={{
                        background: s.imageUrl
                          ? `url(${s.imageUrl}) center/cover`
                          : `linear-gradient(135deg, ${settings.primaryColor}cc, ${settings.primaryColor}55)`,
                      }}>
                      {!s.imageUrl && (
                        <div className="w-full h-full flex items-center justify-center">
                          <span className="text-[9px] font-bold text-white/70 uppercase tracking-wider">Gradient</span>
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <span className="text-[10px] font-bold text-slate-300">#{i + 1}</span>
                        <p className="text-[14px] font-bold text-slate-900 truncate">{s.title}</p>
                      </div>
                      {s.subtitle && (
                        <p className="text-[12px] text-slate-500 truncate">{s.subtitle}</p>
                      )}
                      <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                        <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md">
                          {s.ctaText}
                        </span>
                        {s.imageUrl && (
                          <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-0.5">
                            <CheckCircle2 className="h-2.5 w-2.5" /> Image
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => toggleSlide(s)}
                        title={s.isActive ? "Hide slide" : "Show slide"}
                        className={`h-7 px-2.5 rounded-lg text-[10px] font-black tracking-wide transition-colors ${
                          s.isActive
                            ? "bg-emerald-50 text-emerald-600 hover:bg-emerald-100"
                            : "bg-slate-100 text-slate-400 hover:bg-slate-200"
                        }`}>
                        {s.isActive ? "ON" : "OFF"}
                      </button>
                      <button onClick={() => editSlide(s)}
                        className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-500 transition-colors">
                        <Edit3 className="h-3.5 w-3.5" />
                      </button>
                      <button onClick={() => deleteSlide(s.id)}
                        className="w-8 h-8 rounded-lg hover:bg-red-50 flex items-center justify-center text-slate-400 hover:text-red-500 transition-colors">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Form */}
          <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden"
            style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 4px 16px rgba(99,102,241,0.06)" }}>
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-[15px] font-black text-slate-900">
                {slideEditing ? "Edit Slide" : "New Slide"}
              </h2>
              {slideEditing && (
                <button
                  onClick={() => { setSlideEditing(null); setSlideForm(SLIDE_EMPTY); }}
                  className="w-7 h-7 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-400 transition-colors">
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            <div className="px-6 py-5 space-y-5">
              {/* Live preview */}
              <Field label="Preview">
                <SlideMiniPreview slide={slideForm} color={settings.primaryColor} />
              </Field>

              {/* Banner image */}
              <Field label="Banner Image">
                <ImageUploader
                  value={slideForm.imageUrl}
                  onChange={url => setSlideForm(f => ({ ...f, imageUrl: url }))}
                />
              </Field>

              {/* Text fields */}
              {([
                { k: "title",    label: "Slide Heading *",  ph: "Welcome to Our School"            },
                { k: "subtitle", label: "Subtitle",          ph: "Nurturing minds. Building futures." },
                { k: "ctaText",  label: "Button Text",       ph: "Sign In to Portal"                },
                { k: "ctaLink",  label: "Button Link",       ph: "/sign-in"                         },
              ] as const).map(({ k, label, ph }) => (
                <Field key={k} label={label}>
                  <input
                    type="text"
                    placeholder={ph}
                    value={(slideForm as any)[k]}
                    onChange={e => setSlideForm(f => ({ ...f, [k]: e.target.value }))}
                    className="h-11 w-full rounded-xl border border-slate-200 px-3 text-[14px] outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/10 transition-all"
                  />
                </Field>
              ))}

              <Button
                onClick={saveSlide}
                disabled={saving || !slideForm.title.trim()}
                size="lg" className="w-full gap-2 mt-1">
                {saving
                  ? <Loader2 className="h-4 w-4 animate-spin" />
                  : <Plus className="h-4 w-4" />
                }
                {slideEditing ? "Update Slide" : "Add Slide"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Notices ─────────────────────────────────────────────────────── */}
      {tab === "notices" && (
        <div className="grid lg:grid-cols-[1fr_380px] gap-6 items-start">

          {/* List */}
          <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden"
            style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 4px 16px rgba(99,102,241,0.06)" }}>
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h2 className="text-[15px] font-black text-slate-900">Public Notices</h2>
                <p className="text-[12px] text-slate-500 mt-0.5">Appear on your website notice board and ticker</p>
              </div>
              <span className="text-[12px] font-bold text-slate-400 bg-slate-100 px-2.5 py-1 rounded-lg">
                {notices.filter(n => n.isActive).length} live
              </span>
            </div>

            {notices.length === 0 ? (
              <div className="px-6 py-14 text-center">
                <Bell className="h-8 w-8 text-slate-200 mx-auto mb-3" />
                <p className="text-[14px] font-bold text-slate-400">No notices yet</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {notices.map(n => {
                  const t = TYPE_OPTS.find(x => x.value === n.type) ?? TYPE_OPTS[0];
                  return (
                    <div key={n.id}
                      className={`px-5 py-4 flex gap-4 transition-colors ${!n.isActive ? "opacity-50" : ""} ${noticeEditing === n.id ? "bg-indigo-50/60" : ""}`}>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${t.color}`}>
                            {t.label}
                          </span>
                          <span className={`text-[11px] font-bold ${n.isActive ? "text-emerald-600" : "text-slate-300"}`}>
                            {n.isActive ? "● Live" : "○ Hidden"}
                          </span>
                          {n.expiresAt && (
                            <span className="text-[10px] text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md">
                              Exp {new Date(n.expiresAt).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
                            </span>
                          )}
                        </div>
                        <p className="text-[14px] font-bold text-slate-900 truncate">{n.title}</p>
                        {n.body && (
                          <p className="text-[12px] text-slate-500 truncate mt-0.5">{n.body}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => toggleNotice(n)}
                          className={`h-7 px-2.5 rounded-lg text-[10px] font-black tracking-wide transition-colors ${
                            n.isActive
                              ? "bg-emerald-50 text-emerald-600 hover:bg-emerald-100"
                              : "bg-slate-100 text-slate-400 hover:bg-slate-200"
                          }`}>
                          {n.isActive ? "ON" : "OFF"}
                        </button>
                        <button onClick={() => editNotice(n)}
                          className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-500 transition-colors">
                          <Edit3 className="h-3.5 w-3.5" />
                        </button>
                        <button onClick={() => deleteNotice(n.id)}
                          className="w-8 h-8 rounded-lg hover:bg-red-50 flex items-center justify-center text-slate-400 hover:text-red-500 transition-colors">
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Form */}
          <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden"
            style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 4px 16px rgba(99,102,241,0.06)" }}>
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-[15px] font-black text-slate-900">
                {noticeEditing ? "Edit Notice" : "New Notice"}
              </h2>
              {noticeEditing && (
                <button
                  onClick={() => { setNoticeEditing(null); setNoticeForm(NOTICE_EMPTY); }}
                  className="w-7 h-7 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-400 transition-colors">
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            <div className="px-6 py-5 space-y-4">
              <Field label="Title *">
                <input type="text" placeholder="e.g. Term 2 begins January 15"
                  value={noticeForm.title}
                  onChange={e => setNoticeForm(f => ({ ...f, title: e.target.value }))}
                  className="h-11 w-full rounded-xl border border-slate-200 px-3 text-[14px] outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/10 transition-all"
                />
              </Field>
              <Field label="Details">
                <textarea
                  placeholder="Additional details (optional)" rows={3}
                  value={noticeForm.body}
                  onChange={e => setNoticeForm(f => ({ ...f, body: e.target.value }))}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-[14px] outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/10 transition-all resize-none"
                />
              </Field>
              <Field label="Type">
                <div className="grid grid-cols-3 gap-2">
                  {TYPE_OPTS.map(t => (
                    <button key={t.value}
                      onClick={() => setNoticeForm(f => ({ ...f, type: t.value }))}
                      className={`h-9 rounded-xl text-[12px] font-bold transition-all border-2 ${
                        noticeForm.type === t.value
                          ? t.color + " border-current"
                          : "bg-slate-50 text-slate-500 border-transparent hover:border-slate-200"
                      }`}>
                      {t.label}
                    </button>
                  ))}
                </div>
              </Field>
              <Field label="Expires On (optional)">
                <input type="date"
                  value={noticeForm.expiresAt}
                  onChange={e => setNoticeForm(f => ({ ...f, expiresAt: e.target.value }))}
                  className="h-11 w-full rounded-xl border border-slate-200 px-3 text-[14px] outline-none focus:border-indigo-400 transition-all"
                />
              </Field>
              <Button
                onClick={saveNotice}
                disabled={saving || !noticeForm.title.trim()}
                size="lg" className="w-full gap-2">
                {saving
                  ? <Loader2 className="h-4 w-4 animate-spin" />
                  : <Plus className="h-4 w-4" />
                }
                {noticeEditing ? "Update Notice" : "Publish Notice"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Site Settings ───────────────────────────────────────────────── */}
      {tab === "settings" && (
        <div className="max-w-2xl space-y-5">

          {/* Brand colour */}
          <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden"
            style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 4px 16px rgba(99,102,241,0.06)" }}>
            <div className="px-6 py-5 border-b border-slate-100 flex items-center gap-2">
              <Palette className="h-4 w-4 text-slate-400" />
              <h2 className="text-[15px] font-black text-slate-900">Brand Colour</h2>
            </div>
            <div className="px-6 py-5 space-y-5">
              {/* Presets */}
              <div>
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-3">Quick pick</p>
                <div className="flex flex-wrap gap-2.5">
                  {COLOR_PRESETS.map(c => (
                    <button
                      key={c}
                      onClick={() => setSettings(s => ({ ...s, primaryColor: c }))}
                      title={c}
                      className={`w-9 h-9 rounded-xl transition-all border-2 ${
                        settings.primaryColor === c
                          ? "border-slate-900 scale-110 shadow-md"
                          : "border-transparent hover:scale-105 hover:shadow-sm"
                      }`}
                      style={{ background: c }}
                    />
                  ))}
                </div>
              </div>

              {/* Custom + preview */}
              <div>
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2">Custom</p>
                <div className="flex items-center gap-3">
                  <input type="color" value={settings.primaryColor}
                    onChange={e => setSettings(s => ({ ...s, primaryColor: e.target.value }))}
                    className="h-11 w-12 rounded-xl border border-slate-200 cursor-pointer p-1 shrink-0" />
                  <input type="text" value={settings.primaryColor}
                    onChange={e => setSettings(s => ({ ...s, primaryColor: e.target.value }))}
                    className="h-11 flex-1 rounded-xl border border-slate-200 px-3 text-[14px] font-mono outline-none focus:border-indigo-400 transition-all" />
                  <div
                    className="h-11 px-5 rounded-xl flex items-center text-white text-[12px] font-bold shrink-0"
                    style={{ background: settings.primaryColor }}>
                    Preview
                  </div>
                </div>
                <p className="text-[11px] text-slate-400 mt-1.5">Used for buttons, hero accents, and navbar.</p>
              </div>
            </div>
          </div>

          {/* About section */}
          <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden"
            style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 4px 16px rgba(99,102,241,0.06)" }}>
            <div className="px-6 py-5 border-b border-slate-100 flex items-center gap-2">
              <AlignLeft className="h-4 w-4 text-slate-400" />
              <h2 className="text-[15px] font-black text-slate-900">About Section</h2>
            </div>
            <div className="px-6 py-5 space-y-4">
              <Field label="Section Title">
                <input type="text" placeholder="e.g. Our Story"
                  value={settings.aboutTitle ?? ""}
                  onChange={e => setSettings(s => ({ ...s, aboutTitle: e.target.value }))}
                  className="h-11 w-full rounded-xl border border-slate-200 px-3 text-[14px] outline-none focus:border-indigo-400 transition-all" />
              </Field>
              <Field label="About Text">
                <textarea rows={5} placeholder="Tell visitors about your school — history, values, vision…"
                  value={settings.aboutText ?? ""}
                  onChange={e => setSettings(s => ({ ...s, aboutText: e.target.value }))}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-[14px] outline-none focus:border-indigo-400 transition-all resize-none" />
              </Field>
            </div>
          </div>

          {/* Display options */}
          <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden"
            style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 4px 16px rgba(99,102,241,0.06)" }}>
            <div className="px-6 py-5 border-b border-slate-100 flex items-center gap-2">
              <Globe className="h-4 w-4 text-slate-400" />
              <h2 className="text-[15px] font-black text-slate-900">Display Options</h2>
            </div>
            <div className="px-6 py-1 divide-y divide-slate-100">
              <div className="flex items-center justify-between py-4">
                <div>
                  <p className="text-[14px] font-bold text-slate-900">Stats Section</p>
                  <p className="text-[12px] text-slate-500 mt-0.5">Show student, staff and class counts on homepage</p>
                </div>
                <button
                  onClick={() => setSettings(s => ({ ...s, showStats: !s.showStats }))}
                  className={`w-12 h-6 rounded-full transition-colors relative shrink-0 ${settings.showStats ? "bg-indigo-600" : "bg-slate-200"}`}>
                  <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all ${settings.showStats ? "left-[26px]" : "left-0.5"}`} />
                </button>
              </div>
            </div>
          </div>

          <Button onClick={saveSettings} disabled={saving} size="lg" className="w-full gap-2">
            {saving
              ? <Loader2 className="h-4 w-4 animate-spin" />
              : <Save className="h-4 w-4" />
            }
            Save Settings
          </Button>

          <p className="text-[12px] text-slate-400 text-center pb-2">
            To update school logo, address, and motto go to{" "}
            <a href="/settings/school-profile" className="text-indigo-600 font-bold hover:underline">
              School Profile →
            </a>
          </p>
        </div>
      )}
    </div>
  );
}
