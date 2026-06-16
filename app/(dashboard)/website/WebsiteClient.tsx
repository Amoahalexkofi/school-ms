"use client";

import { useState } from "react";
import { Plus, Trash2, Edit3, Save, Eye, X, GripVertical, Bell, Layout, Settings2 } from "lucide-react";
import { Button } from "@/components/ui/button";

type Tab = "slides" | "notices" | "settings";

interface Slide { id: string; title: string; subtitle?: string; imageUrl?: string; ctaText: string; ctaLink: string; order: number; isActive: boolean; }
interface Notice { id: string; title: string; body?: string; type: string; isActive: boolean; expiresAt?: string; createdAt: string; }
interface Settings { aboutTitle?: string; aboutText?: string; primaryColor: string; showStats: boolean; }

const SLIDE_EMPTY = { title: "", subtitle: "", imageUrl: "", ctaText: "Sign In to Portal", ctaLink: "/sign-in" };
const NOTICE_EMPTY = { title: "", body: "", type: "info", expiresAt: "" };

const TYPE_OPTS = [
  { value: "info",    label: "Info",      color: "bg-indigo-100 text-indigo-700" },
  { value: "warning", label: "Important", color: "bg-amber-100  text-amber-700"  },
  { value: "urgent",  label: "Urgent",    color: "bg-red-100    text-red-700"    },
];

export function WebsiteClient({
  initialSlides, initialNotices, initialSettings, schoolUrl,
}: {
  initialSlides: Slide[];
  initialNotices: Notice[];
  initialSettings: Settings;
  schoolUrl: string;
}) {
  const [tab, setTab] = useState<Tab>("slides");
  const [slides,   setSlides]   = useState<Slide[]>(initialSlides);
  const [notices,  setNotices]  = useState<Notice[]>(initialNotices);
  const [settings, setSettings] = useState<Settings>(initialSettings);
  const [saving,   setSaving]   = useState(false);
  const [msg,      setMsg]      = useState("");

  // Slide form
  const [slideForm,    setSlideForm]    = useState(SLIDE_EMPTY);
  const [slideEditing, setSlideEditing] = useState<string | null>(null);

  // Notice form
  const [noticeForm,    setNoticeForm]    = useState(NOTICE_EMPTY);
  const [noticeEditing, setNoticeEditing] = useState<string | null>(null);

  function flash(m: string) { setMsg(m); setTimeout(() => setMsg(""), 3000); }

  // ── Slides ──────────────────────────────────────────────────────────────────
  async function saveSlide() {
    if (!slideForm.title.trim()) return;
    setSaving(true);
    if (slideEditing) {
      await fetch("/api/website/slides", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: slideEditing, ...slideForm, isActive: true }) });
      setSlides(ss => ss.map(s => s.id === slideEditing ? { ...s, ...slideForm } : s));
      setSlideEditing(null);
    } else {
      const r = await fetch("/api/website/slides", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(slideForm) });
      const ns = await r.json();
      setSlides(ss => [...ss, ns]);
    }
    setSlideForm(SLIDE_EMPTY);
    setSaving(false);
    flash("Slide saved ✓");
  }
  async function deleteSlide(id: string) {
    if (!confirm("Delete this slide?")) return;
    await fetch("/api/website/slides", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
    setSlides(ss => ss.filter(s => s.id !== id));
    flash("Slide deleted");
  }
  function editSlide(s: Slide) {
    setSlideEditing(s.id);
    setSlideForm({ title: s.title, subtitle: s.subtitle ?? "", imageUrl: s.imageUrl ?? "", ctaText: s.ctaText, ctaLink: s.ctaLink });
  }

  // ── Notices ─────────────────────────────────────────────────────────────────
  async function saveNotice() {
    if (!noticeForm.title.trim()) return;
    setSaving(true);
    if (noticeEditing) {
      await fetch("/api/website/notices", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: noticeEditing, ...noticeForm, isActive: true }) });
      setNotices(ns => ns.map(n => n.id === noticeEditing ? { ...n, ...noticeForm } : n));
      setNoticeEditing(null);
    } else {
      const r = await fetch("/api/website/notices", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(noticeForm) });
      const nn = await r.json();
      setNotices(ns => [nn, ...ns]);
    }
    setNoticeForm(NOTICE_EMPTY);
    setSaving(false);
    flash("Notice saved ✓");
  }
  async function deleteNotice(id: string) {
    if (!confirm("Delete this notice?")) return;
    await fetch("/api/website/notices", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
    setNotices(ns => ns.filter(n => n.id !== id));
    flash("Notice deleted");
  }
  async function toggleNotice(n: Notice) {
    await fetch("/api/website/notices", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...n, isActive: !n.isActive }) });
    setNotices(ns => ns.map(x => x.id === n.id ? { ...x, isActive: !x.isActive } : x));
  }
  function editNotice(n: Notice) {
    setNoticeEditing(n.id);
    setNoticeForm({ title: n.title, body: n.body ?? "", type: n.type, expiresAt: n.expiresAt ? n.expiresAt.slice(0, 10) : "" });
  }

  // ── Settings ────────────────────────────────────────────────────────────────
  async function saveSettings() {
    setSaving(true);
    await fetch("/api/website", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(settings) });
    setSaving(false);
    flash("Settings saved ✓");
  }

  const TABS = [
    { id: "slides"   as Tab, label: "Hero Slides",  icon: Layout  },
    { id: "notices"  as Tab, label: "Notices",       icon: Bell    },
    { id: "settings" as Tab, label: "Site Settings", icon: Settings2 },
  ];

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

      {/* Flash message */}
      {msg && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-[13px] font-semibold px-4 py-3 rounded-xl">
          {msg}
        </div>
      )}

      {/* Tabs */}
      <div className="bg-slate-100/80 p-1 rounded-2xl inline-flex gap-1">
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-[13px] font-bold transition-all ${
              tab === t.id ? "bg-white shadow-sm text-slate-900" : "text-slate-500 hover:text-slate-700"
            }`}>
            <t.icon className="h-3.5 w-3.5" /> {t.label}
          </button>
        ))}
      </div>

      {/* ── Tab: Hero Slides ── */}
      {tab === "slides" && (
        <div className="grid lg:grid-cols-[1fr_400px] gap-6">
          {/* List */}
          <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 4px 16px rgba(99,102,241,0.06)" }}>
            <div className="px-6 py-5 border-b border-slate-100">
              <h2 className="text-[15px] font-black text-slate-900">Hero Slides</h2>
              <p className="text-[12px] text-slate-500 mt-0.5">Full-screen rotating slides shown on your homepage</p>
            </div>
            {slides.length === 0 ? (
              <div className="px-6 py-12 text-center text-slate-400 text-[14px]">
                No slides yet. Add your first slide →
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {slides.map((s, i) => (
                  <div key={s.id} className="px-6 py-4 flex items-start gap-4">
                    <GripVertical className="h-4 w-4 text-slate-300 mt-1 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-[11px] font-bold text-slate-400">#{i + 1}</span>
                        <p className="text-[14px] font-bold text-slate-900 truncate">{s.title}</p>
                      </div>
                      {s.subtitle && <p className="text-[12px] text-slate-500 truncate">{s.subtitle}</p>}
                      {s.imageUrl && <p className="text-[11px] text-indigo-500 truncate mt-0.5">📷 {s.imageUrl}</p>}
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button onClick={() => editSlide(s)} className="w-7 h-7 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-500">
                        <Edit3 className="h-3.5 w-3.5" />
                      </button>
                      <button onClick={() => deleteSlide(s.id)} className="w-7 h-7 rounded-lg hover:bg-red-50 flex items-center justify-center text-slate-400 hover:text-red-500">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Form */}
          <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 4px 16px rgba(99,102,241,0.06)" }}>
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-[15px] font-black text-slate-900">{slideEditing ? "Edit Slide" : "New Slide"}</h2>
              {slideEditing && (
                <button onClick={() => { setSlideEditing(null); setSlideForm(SLIDE_EMPTY); }} className="text-slate-400 hover:text-slate-700">
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            <div className="px-6 py-5 space-y-4">
              {[
                { k: "title",    label: "Slide Heading *",    placeholder: "Welcome to Our School" },
                { k: "subtitle", label: "Subtitle",            placeholder: "Nurturing minds. Building futures." },
                { k: "imageUrl", label: "Background Image URL", placeholder: "https://... (leave blank for gradient)" },
                { k: "ctaText",  label: "Button Text",          placeholder: "Sign In to Portal" },
                { k: "ctaLink",  label: "Button Link",          placeholder: "/sign-in" },
              ].map(({ k, label, placeholder }) => (
                <div key={k}>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">{label}</label>
                  <input
                    type="text" placeholder={placeholder}
                    value={(slideForm as any)[k]}
                    onChange={e => setSlideForm(f => ({ ...f, [k]: e.target.value }))}
                    className="h-11 w-full rounded-xl border border-slate-200 px-3 text-[14px] outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/10 transition-all"
                  />
                </div>
              ))}
              <Button onClick={saveSlide} disabled={saving} size="lg" className="w-full mt-2">
                <Plus className="h-4 w-4" /> {slideEditing ? "Update Slide" : "Add Slide"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ── Tab: Notices ── */}
      {tab === "notices" && (
        <div className="grid lg:grid-cols-[1fr_380px] gap-6">
          {/* List */}
          <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 4px 16px rgba(99,102,241,0.06)" }}>
            <div className="px-6 py-5 border-b border-slate-100">
              <h2 className="text-[15px] font-black text-slate-900">Public Notices</h2>
              <p className="text-[12px] text-slate-500 mt-0.5">Appear on your website's notice board and ticker</p>
            </div>
            {notices.length === 0 ? (
              <div className="px-6 py-12 text-center text-slate-400 text-[14px]">No notices yet.</div>
            ) : (
              <div className="divide-y divide-slate-100">
                {notices.map(n => {
                  const typeOpt = TYPE_OPTS.find(t => t.value === n.type) ?? TYPE_OPTS[0];
                  return (
                    <div key={n.id} className="px-6 py-4 flex items-start gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${typeOpt.color}`}>
                            {typeOpt.label}
                          </span>
                          <span className={`text-[11px] font-semibold ${n.isActive ? "text-emerald-600" : "text-slate-400"}`}>
                            {n.isActive ? "● Live" : "○ Hidden"}
                          </span>
                        </div>
                        <p className="text-[14px] font-bold text-slate-900 truncate">{n.title}</p>
                        {n.body && <p className="text-[12px] text-slate-500 truncate mt-0.5">{n.body}</p>}
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <button onClick={() => toggleNotice(n)} className={`w-7 h-7 rounded-lg flex items-center justify-center text-[11px] font-bold transition-colors ${n.isActive ? "bg-emerald-50 text-emerald-600 hover:bg-emerald-100" : "bg-slate-100 text-slate-500 hover:bg-slate-200"}`} title={n.isActive ? "Hide" : "Show"}>
                          {n.isActive ? "●" : "○"}
                        </button>
                        <button onClick={() => editNotice(n)} className="w-7 h-7 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-500">
                          <Edit3 className="h-3.5 w-3.5" />
                        </button>
                        <button onClick={() => deleteNotice(n.id)} className="w-7 h-7 rounded-lg hover:bg-red-50 flex items-center justify-center text-slate-400 hover:text-red-500">
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
          <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 4px 16px rgba(99,102,241,0.06)" }}>
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-[15px] font-black text-slate-900">{noticeEditing ? "Edit Notice" : "New Notice"}</h2>
              {noticeEditing && (
                <button onClick={() => { setNoticeEditing(null); setNoticeForm(NOTICE_EMPTY); }} className="text-slate-400 hover:text-slate-700">
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            <div className="px-6 py-5 space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Title *</label>
                <input type="text" placeholder="e.g. Term 2 begins January 15"
                  value={noticeForm.title}
                  onChange={e => setNoticeForm(f => ({ ...f, title: e.target.value }))}
                  className="h-11 w-full rounded-xl border border-slate-200 px-3 text-[14px] outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/10 transition-all"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Details</label>
                <textarea placeholder="Additional details (optional)" rows={3}
                  value={noticeForm.body}
                  onChange={e => setNoticeForm(f => ({ ...f, body: e.target.value }))}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-[14px] outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/10 transition-all resize-none"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Type</label>
                <div className="flex gap-2">
                  {TYPE_OPTS.map(t => (
                    <button key={t.value} onClick={() => setNoticeForm(f => ({ ...f, type: t.value }))}
                      className={`flex-1 h-9 rounded-xl text-[12px] font-bold transition-all border ${noticeForm.type === t.value ? t.color + " border-current" : "bg-slate-50 text-slate-500 border-slate-200"}`}>
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Expires On (optional)</label>
                <input type="date"
                  value={noticeForm.expiresAt}
                  onChange={e => setNoticeForm(f => ({ ...f, expiresAt: e.target.value }))}
                  className="h-11 w-full rounded-xl border border-slate-200 px-3 text-[14px] outline-none focus:border-indigo-400 transition-all"
                />
              </div>
              <Button onClick={saveNotice} disabled={saving} size="lg" className="w-full">
                <Plus className="h-4 w-4" /> {noticeEditing ? "Update Notice" : "Publish Notice"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ── Tab: Settings ── */}
      {tab === "settings" && (
        <div className="max-w-2xl">
          <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 4px 16px rgba(99,102,241,0.06)" }}>
            <div className="px-6 py-5 border-b border-slate-100">
              <h2 className="text-[15px] font-black text-slate-900">Site Settings</h2>
              <p className="text-[12px] text-slate-500 mt-0.5">Customize your public website appearance</p>
            </div>
            <div className="px-6 py-5 space-y-5">
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Primary Colour</label>
                <div className="flex items-center gap-3">
                  <input type="color" value={settings.primaryColor}
                    onChange={e => setSettings(s => ({ ...s, primaryColor: e.target.value }))}
                    className="h-11 w-16 rounded-xl border border-slate-200 cursor-pointer p-1" />
                  <input type="text" value={settings.primaryColor}
                    onChange={e => setSettings(s => ({ ...s, primaryColor: e.target.value }))}
                    className="h-11 flex-1 rounded-xl border border-slate-200 px-3 text-[14px] font-mono outline-none focus:border-indigo-400 transition-all" />
                </div>
                <p className="text-[11px] text-slate-400 mt-1.5">Used for navbar, buttons, hero elements and section accents.</p>
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">About Section Title</label>
                <input type="text" placeholder="e.g. Our Story"
                  value={settings.aboutTitle ?? ""}
                  onChange={e => setSettings(s => ({ ...s, aboutTitle: e.target.value }))}
                  className="h-11 w-full rounded-xl border border-slate-200 px-3 text-[14px] outline-none focus:border-indigo-400 transition-all" />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">About Text</label>
                <textarea rows={5} placeholder="Tell visitors about your school..."
                  value={settings.aboutText ?? ""}
                  onChange={e => setSettings(s => ({ ...s, aboutText: e.target.value }))}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-[14px] outline-none focus:border-indigo-400 transition-all resize-none" />
              </div>
              <div className="flex items-center justify-between py-3 border-t border-slate-100">
                <div>
                  <p className="text-[14px] font-bold text-slate-900">Show Stats Section</p>
                  <p className="text-[12px] text-slate-500">Display student, staff and class counts on homepage</p>
                </div>
                <button onClick={() => setSettings(s => ({ ...s, showStats: !s.showStats }))}
                  className={`w-12 h-6 rounded-full transition-colors relative ${settings.showStats ? "bg-indigo-600" : "bg-slate-200"}`}>
                  <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all ${settings.showStats ? "left-6" : "left-0.5"}`} />
                </button>
              </div>
              <Button onClick={saveSettings} disabled={saving} size="lg" className="w-full">
                <Save className="h-4 w-4" /> Save Settings
              </Button>
            </div>
          </div>
          <p className="text-[12px] text-slate-400 mt-4 text-center">
            To update your school logo, address, phone and motto go to{" "}
            <a href="/settings" className="text-indigo-600 font-bold hover:underline">School Settings →</a>
          </p>
        </div>
      )}
    </div>
  );
}
