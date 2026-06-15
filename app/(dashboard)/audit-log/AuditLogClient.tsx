"use client";

import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Search, Download, ShieldCheck, X } from "lucide-react";

type Log = {
  id: string;
  userId?: string;
  userEmail?: string;
  action: string;
  entity: string;
  entityId?: string;
  metadata?: any;
  createdAt: string;
};

const ENTITY_COLORS: Record<string, string> = {
  Student:    "bg-blue-500/10 text-blue-400",
  Staff:      "bg-violet-500/10 text-violet-400",
  Attendance: "bg-orange-500/10 text-orange-400",
  ExamGroup:  "bg-red-500/10 text-red-400",
  MarkEntry:  "bg-pink-500/10 text-pink-400",
  Leave:      "bg-amber-500/10 text-amber-400",
  Notice:     "bg-teal-500/10 text-teal-400",
  Visitor:    "bg-cyan-500/10 text-cyan-400",
  Library:    "bg-indigo-500/10 text-indigo-400",
  Payroll:    "bg-emerald-500/10 text-emerald-400",
  Fee:        "bg-amber-500/10 text-amber-400",
};

const ACTION_COLORS: Record<string, string> = {
  CREATE: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  UPDATE: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  DELETE: "bg-red-500/10 text-red-400 border-red-500/20",
  LOGIN:  "bg-[#0f1015] text-white/60 border-white/[0.06]",
};

const SEL = "w-full h-9 rounded-lg border border-white/[0.08] px-3 text-sm bg-[#111318] focus:outline-none focus:ring-2 focus:ring-blue-500";

function downloadCSV(rows: Log[]) {
  if (!rows.length) return alert("No data to export");
  const cols = ["Time", "User", "Action", "Entity", "EntityId"];
  const lines = [
    cols.join(","),
    ...rows.map((r) =>
      [
        new Date(r.createdAt).toLocaleString(),
        r.userEmail ?? r.userId ?? "System",
        r.action,
        r.entity,
        r.entityId ?? "",
      ]
        .map((v) => `"${String(v).replace(/"/g, '""')}"`)
        .join(",")
    ),
  ];
  const blob = new Blob([lines.join("\n")], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "audit-log.csv";
  a.click();
  URL.revokeObjectURL(url);
}

export function AuditLogClient({
  logs,
  entities,
  actions,
}: {
  logs: Log[];
  users: { id: string; email: string }[];
  entities: string[];
  actions: string[];
}) {
  const [search, setSearch] = useState("");
  const [filterEntity, setFilterEntity] = useState("");
  const [filterAction, setFilterAction] = useState("");
  const [filterUser, setFilterUser] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [page, setPage] = useState(1);
  const PER_PAGE = 50;

  const filtered = useMemo(() => {
    return logs.filter((l) => {
      if (search) {
        const s = search.toLowerCase();
        if (
          !l.action.toLowerCase().includes(s) &&
          !l.entity.toLowerCase().includes(s) &&
          !(l.userEmail ?? "").toLowerCase().includes(s) &&
          !(l.entityId ?? "").toLowerCase().includes(s)
        ) return false;
      }
      if (filterEntity && l.entity !== filterEntity) return false;
      if (filterAction && !l.action.includes(filterAction)) return false;
      if (filterUser && (l.userEmail ?? l.userId ?? "") !== filterUser) return false;
      if (from) {
        if (new Date(l.createdAt) < new Date(from)) return false;
      }
      if (to) {
        const toDate = new Date(to);
        toDate.setHours(23, 59, 59, 999);
        if (new Date(l.createdAt) > toDate) return false;
      }
      return true;
    });
  }, [logs, search, filterEntity, filterAction, filterUser, from, to]);

  const paginated = filtered.slice(0, page * PER_PAGE);
  const hasMore = paginated.length < filtered.length;

  const today = logs.filter((l) => new Date(l.createdAt).toDateString() === new Date().toDateString()).length;
  const uniqueUsers = [...new Set(logs.map((l) => l.userEmail ?? l.userId ?? "System"))];

  function clearFilters() {
    setSearch(""); setFilterEntity(""); setFilterAction(""); setFilterUser(""); setFrom(""); setTo("");
    setPage(1);
  }
  const hasFilters = search || filterEntity || filterAction || filterUser || from || to;

  return (
    <main className="flex-1 p-6 space-y-6">
      {/* Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Events", value: logs.length },
          { label: "Today", value: today },
          { label: "Entities Tracked", value: entities.length },
          { label: "Users Active", value: uniqueUsers.length },
        ].map((s) => (
          <Card key={s.label}>
            <CardContent className="pt-4">
              <p className="text-xs text-white/40 mb-1">{s.label}</p>
              <p className="text-3xl font-bold">{s.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-[#111318] border rounded-lg p-4 space-y-3">
        <div className="flex items-center gap-2 flex-wrap">
          <div className="relative flex-1 min-w-48">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-white/30" />
            <Input
              placeholder="Search action, entity, user…"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="pl-8"
            />
          </div>
          <select
            className={SEL + " w-40"}
            value={filterEntity}
            onChange={(e) => { setFilterEntity(e.target.value); setPage(1); }}
          >
            <option value="">All Entities</option>
            {entities.map((e) => <option key={e} value={e}>{e}</option>)}
          </select>
          <select
            className={SEL + " w-40"}
            value={filterAction}
            onChange={(e) => { setFilterAction(e.target.value); setPage(1); }}
          >
            <option value="">All Actions</option>
            {actions.map((a) => <option key={a} value={a}>{a}</option>)}
          </select>
          <div className="flex items-end gap-2">
            <div>
              <Label className="text-xs">From</Label>
              <Input type="date" value={from} onChange={(e) => { setFrom(e.target.value); setPage(1); }} className="w-36 h-9" />
            </div>
            <div>
              <Label className="text-xs">To</Label>
              <Input type="date" value={to} onChange={(e) => { setTo(e.target.value); setPage(1); }} className="w-36 h-9" />
            </div>
          </div>
          {hasFilters && (
            <Button variant="ghost" size="sm" onClick={clearFilters} className="text-white/30 hover:text-white/50">
              <X className="h-4 w-4 mr-1" /> Clear
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={() => downloadCSV(filtered)} className="ml-auto">
            <Download className="h-3.5 w-3.5 mr-1" /> Export
          </Button>
        </div>
        <p className="text-xs text-white/30">
          Showing {Math.min(paginated.length, filtered.length)} of {filtered.length} events
          {logs.length > 500 && " (last 500 loaded)"}
        </p>
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 text-white/30">
          <ShieldCheck className="h-10 w-10 mx-auto mb-3 opacity-30" />
          <p>No audit events match your filters.</p>
        </div>
      ) : (
        <>
          <div className="bg-[#111318] border rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-[#0f1015] border-b sticky top-0">
                  <tr>
                    <th className="text-left px-4 py-2.5 font-medium text-white/50 whitespace-nowrap">Time</th>
                    <th className="text-left px-4 py-2.5 font-medium text-white/50">User</th>
                    <th className="text-left px-4 py-2.5 font-medium text-white/50">Action</th>
                    <th className="text-left px-4 py-2.5 font-medium text-white/50">Entity</th>
                    <th className="text-left px-4 py-2.5 font-medium text-white/50">Entity ID</th>
                    <th className="text-left px-4 py-2.5 font-medium text-white/50">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {paginated.map((log) => {
                    const actionKey = Object.keys(ACTION_COLORS).find((k) => log.action.includes(k)) ?? "";
                    const actionStyle = ACTION_COLORS[actionKey] ?? "bg-[#0f1015] text-white/50 border-white/[0.06]";
                    const entityStyle = Object.entries(ENTITY_COLORS).find(([k]) => log.entity.includes(k))?.[1] ?? "bg-white/[0.04] text-white/50";
                    let details = "";
                    try {
                      if (log.metadata) {
                        const m = typeof log.metadata === "string" ? JSON.parse(log.metadata) : log.metadata;
                        details = Object.entries(m).slice(0, 3).map(([k, v]) => `${k}: ${v}`).join(", ");
                      }
                    } catch { /* ignore */ }

                    return (
                      <tr key={log.id} className="hover:bg-[#0f1015]">
                        <td className="px-4 py-2.5 text-xs text-white/40 whitespace-nowrap">
                          {new Date(log.createdAt).toLocaleString()}
                        </td>
                        <td className="px-4 py-2.5 text-xs text-white/60 max-w-[160px] truncate">
                          {log.userEmail ?? log.userId ?? <span className="text-white/30">System</span>}
                        </td>
                        <td className="px-4 py-2.5">
                          <span className={`text-xs px-2 py-0.5 rounded border font-medium ${actionStyle}`}>
                            {log.action}
                          </span>
                        </td>
                        <td className="px-4 py-2.5">
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${entityStyle}`}>
                            {log.entity}
                          </span>
                        </td>
                        <td className="px-4 py-2.5 font-mono text-xs text-white/30 max-w-[120px] truncate" title={log.entityId ?? ""}>
                          {log.entityId ?? "—"}
                        </td>
                        <td className="px-4 py-2.5 text-xs text-white/30 max-w-[200px] truncate" title={details}>
                          {details || "—"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {hasMore && (
            <div className="text-center">
              <Button variant="outline" onClick={() => setPage((p) => p + 1)}>
                Load more ({filtered.length - paginated.length} remaining)
              </Button>
            </div>
          )}
        </>
      )}
    </main>
  );
}
