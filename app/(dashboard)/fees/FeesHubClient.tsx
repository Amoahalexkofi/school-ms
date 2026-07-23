"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { DollarSign, Settings, Users, Search, ArrowRight, BarChart3, ArrowRightLeft, Tag, Loader2, Bell } from "lucide-react";
import { usePermission } from "@/components/PermissionsProvider";

type ClassSection = { id: string; class: { id: string; name: string }; section: { id: string; name: string } };
type Props = {
  totalStudents: number;
  totalMasters: number;
  totalCollected: number;
  classSections: ClassSection[];
  activeSessionId: string | null;
};

const SEL = "w-full h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-colors";

export function FeesHubClient({ totalStudents, totalMasters, totalCollected, classSections, activeSessionId }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const perm = usePermission("fees_collection");

  // Mirrors Smart School's studentfeeSearch: two search modes — by class/section,
  // and by keyword — feeding one student list with a Collect action per student.
  // Class/section live in the URL so "Collect next student" round-trips keep the
  // list loaded — the accountant's fee-day loop must not reset between students.
  const [mode, setMode] = useState<"class" | "keyword">("class");
  const [classId, setClassId] = useState(searchParams.get("classId") ?? "");
  const [sectionId, setSectionId] = useState(searchParams.get("sectionId") ?? "");
  const [search, setSearch] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [searchError, setSearchError] = useState("");
  // studentId → outstanding balance, so the collect list answers "who owes?"
  // without a trip to the reports screen.
  const [balances, setBalances] = useState<Record<string, number> | null>(null);
  const [owingOnly, setOwingOnly] = useState(false);

  // Distinct classes, and sections available for the selected class
  const classes = useMemo(() => {
    const map = new Map<string, { id: string; name: string }>();
    for (const cs of classSections) if (!map.has(cs.class.id)) map.set(cs.class.id, cs.class);
    return [...map.values()];
  }, [classSections]);

  const sections = useMemo(
    () => classSections.filter((cs) => cs.class.id === classId).map((cs) => cs.section),
    [classSections, classId]
  );

  async function fetchBalances() {
    if (!activeSessionId) return;
    try {
      const res = await fetch(`/api/fees/report?sessionId=${activeSessionId}`);
      if (!res.ok) return;
      const rows = await res.json();
      const map: Record<string, number> = {};
      for (const r of rows) {
        const sid = r?.student?.id;
        if (!sid) continue;
        map[sid] = (map[sid] ?? 0) + Number(r.balance ?? 0);
      }
      setBalances(map);
    } catch { /* badge is progressive enhancement — the list still works */ }
  }

  async function fetchStudents(qs: string) {
    setLoading(true);
    setSearched(true);
    setSearchError("");
    if (!balances) fetchBalances();
    try {
      const res = await fetch(`/api/students?isActive=true&${qs}`);
      if (res.ok) {
        setResults(await res.json());
      } else {
        // Don't disguise failures as an empty class — a 403 here once hid a
        // missing role rule as "No students found".
        setResults([]);
        setSearchError(
          res.status === 403 || res.status === 401
            ? "Your account doesn't have permission to search students. Ask an admin to check your role."
            : `Student search failed (HTTP ${res.status}). Try again.`
        );
      }
    } catch {
      setResults([]);
      setSearchError("Student search failed — check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  function classSearch() {
    if (!classId) return;
    const params = new URLSearchParams({ classId, limit: "100" });
    if (sectionId) params.set("sectionId", sectionId);
    // remember the selection in the URL (no history spam)
    const url = new URLSearchParams({ classId });
    if (sectionId) url.set("sectionId", sectionId);
    window.history.replaceState(null, "", `/fees?${url}`);
    fetchStudents(params.toString());
  }

  // Arriving with ?classId= (back from a collect) → reload the list unprompted
  useEffect(() => {
    if (classId) classSearch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Keyword: debounced live search (kept from the original quick-search UX)
  useEffect(() => {
    if (mode !== "keyword") return;
    const q = search.trim();
    if (q.length < 2) { setResults([]); setSearched(false); return; }
    const ctrl = new AbortController();
    setLoading(true);
    const t = setTimeout(async () => {
      try {
        const res = await fetch(`/api/students?isActive=true&limit=20&search=${encodeURIComponent(q)}`, { signal: ctrl.signal });
        if (res.ok) {
          setResults(await res.json());
          setSearchError("");
        } else {
          setResults([]);
          setSearchError(
            res.status === 403 || res.status === 401
              ? "Your account doesn't have permission to search students. Ask an admin to check your role."
              : `Student search failed (HTTP ${res.status}). Try again.`
          );
        }
        setSearched(true);
      } catch (e) {
        if ((e as any)?.name !== "AbortError") setResults([]);
      } finally {
        setLoading(false);
      }
    }, 250);
    return () => { ctrl.abort(); clearTimeout(t); };
  }, [search, mode]);

  function switchMode(m: "class" | "keyword") {
    setMode(m);
    setResults([]);
    setSearched(false);
    setSearchError("");
  }

  function rosterName(s: any) {
    return `${s.firstName} ${s.middleName ? s.middleName + " " : ""}${s.lastName}`;
  }
  function rosterClass(s: any) {
    const cs = s.sessions?.[0]?.classSection;
    return cs ? `${cs.class?.name ?? ""}${cs.section?.name ? " · " + cs.section.name : ""}` : "";
  }

  return (
    <main className="flex-1 p-4 md:p-6 space-y-6 bg-gray-50">

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: "Total Collected", value: `₵${totalCollected.toLocaleString()}`, icon: DollarSign, color: "text-green-600 bg-green-50" },
          { label: "Fee Assignments", value: totalMasters, icon: Users, color: "text-blue-600 bg-blue-50" },
          { label: "Active Students", value: totalStudents, icon: Users, color: "text-purple-600 bg-purple-50" },
        ].map(({ label, value, icon: Icon, color }) => (
          <Card key={label}>
            <CardContent className="pt-5 flex items-center gap-4">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs text-gray-500">{label}</p>
                <p className="text-2xl font-bold text-gray-900">{value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Collect fees — class/section OR keyword search */}
      {perm.canAdd && (
        <Card>
          <CardContent className="pt-5 space-y-4">
            <h2 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-green-600" /> Collect Fees
            </h2>

            {/* Mode toggle */}
            <div className="inline-flex rounded-lg border border-slate-200 p-0.5 bg-slate-50">
              <button
                onClick={() => switchMode("class")}
                className={`px-3 h-8 rounded-md text-xs font-semibold transition-colors ${mode === "class" ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500"}`}
              >
                By Class
              </button>
              <button
                onClick={() => switchMode("keyword")}
                className={`px-3 h-8 rounded-md text-xs font-semibold transition-colors ${mode === "keyword" ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500"}`}
              >
                By Name / Admission No.
              </button>
            </div>

            {mode === "class" ? (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Class <span className="text-red-400">*</span></label>
                  <select className={SEL} value={classId} onChange={(e) => { setClassId(e.target.value); setSectionId(""); }}>
                    <option value="">Select class</option>
                    {classes.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Section</label>
                  <select className={SEL} value={sectionId} onChange={(e) => setSectionId(e.target.value)} disabled={!classId}>
                    <option value="">All sections</option>
                    {sections.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
                <div className="flex items-end">
                  <button
                    onClick={classSearch}
                    disabled={!classId || loading}
                    className="w-full h-10 rounded-lg bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />} Search
                  </button>
                </div>
              </div>
            ) : (
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input className="pl-9" placeholder="Type name or admission number…" value={search} onChange={(e) => setSearch(e.target.value)} />
                {loading && <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 animate-spin" />}
              </div>
            )}

            {/* Student list */}
            {results.length > 0 && (
              <>
                {balances && (
                  <div className="flex items-center justify-between">
                    <label className="inline-flex items-center gap-2 cursor-pointer select-none">
                      <input type="checkbox" checked={owingOnly} onChange={(e) => setOwingOnly(e.target.checked)}
                        className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500/30" />
                      <span className="text-sm font-medium text-slate-700">Show only students owing</span>
                    </label>
                    <span className="text-xs text-slate-500 tabular-nums">
                      {results.filter((s) => (balances[s.id] ?? 0) > 0).length} of {results.length} owing
                    </span>
                  </div>
                )}
                <div className="border rounded-lg divide-y overflow-hidden">
                  {results
                    .filter((s) => !owingOnly || !balances || (balances[s.id] ?? 0) > 0)
                    .map((s) => {
                      const bal = balances?.[s.id];
                      return (
                        <button
                          key={s.id}
                          onClick={() => router.push(`/fees/collect/${s.id}${classId ? `?classId=${classId}${sectionId ? `&sectionId=${sectionId}` : ""}` : ""}`)}
                          className="w-full flex items-center justify-between px-4 py-2.5 text-sm hover:bg-blue-50 transition-colors text-left"
                        >
                          <div className="min-w-0">
                            <span className="font-medium text-gray-900">{rosterName(s)}</span>
                            <span className="text-xs text-gray-400 ml-2 font-mono">{s.admissionNo}</span>
                            {rosterClass(s) && <span className="text-xs text-gray-400 ml-2">· {rosterClass(s)}</span>}
                          </div>
                          <span className="flex items-center gap-3 shrink-0">
                            {bal != null && (
                              bal > 0 ? (
                                <span className="text-xs font-semibold text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-full tabular-nums">
                                  Owes ₵{bal.toLocaleString()}
                                </span>
                              ) : (
                                <span className="text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                                  Paid up
                                </span>
                              )
                            )}
                            <span className="flex items-center gap-1 text-xs font-semibold text-green-600">
                              <DollarSign className="h-3.5 w-3.5" /> Collect <ArrowRight className="h-3.5 w-3.5" />
                            </span>
                          </span>
                        </button>
                      );
                    })}
                </div>
                {owingOnly && balances && results.every((s) => (balances[s.id] ?? 0) <= 0) && (
                  <p className="text-sm text-slate-500 text-center py-4">Nobody owes in this class — fully collected. 🎉</p>
                )}
              </>
            )}
            {searchError && !loading && (
              <p role="alert" className="text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded-lg px-3 py-2 text-center">
                {searchError}
              </p>
            )}
            {searched && !loading && !searchError && results.length === 0 && (
              <p className="text-xs text-gray-400 text-center py-3">No students found.</p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Fee management quick links */}
      <Card>
        <CardContent className="pt-5 space-y-3">
          <h2 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
            <Settings className="h-4 w-4 text-gray-600" /> Fee Management
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {[
              { href: "/fees/setup",         label: "Fee Setup",        sub: "Categories, types, groups & discounts", icon: Settings,       color: "bg-indigo-50 text-indigo-600" },
              { href: "/fees/assign",        label: "Assign Fees",      sub: "Assign fee groups to a class",          icon: Users,          color: "bg-blue-50 text-blue-600" },
              { href: "/fees/discounts",     label: "Assign Discounts", sub: "Assign discounts to students by class", icon: Tag,            color: "bg-green-50 text-green-600" },
              { href: "/fees/carry-forward", label: "Carry Forward",    sub: "Roll over outstanding balances",        icon: ArrowRightLeft, color: "bg-orange-50 text-orange-600" },
              { href: "/fees/report",        label: "Fee Reports",      sub: "Collection & due fee reports",          icon: BarChart3,      color: "bg-amber-50 text-amber-600" },
              { href: "/fees/reminders",     label: "Fee Reminders",    sub: "SMS/WhatsApp rules for due fees",       icon: Bell,           color: "bg-rose-50 text-rose-600" },
            ].map(({ href, label, sub, icon: Icon, color }) => (
              <Link key={href} href={href}>
                <div className="flex items-center gap-3 p-3 rounded-lg border border-gray-100 hover:border-blue-200 hover:bg-blue-50/50 transition-colors cursor-pointer">
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${color}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-800">{label}</p>
                    <p className="text-xs text-gray-400">{sub}</p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-gray-300 ml-auto" />
                </div>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
