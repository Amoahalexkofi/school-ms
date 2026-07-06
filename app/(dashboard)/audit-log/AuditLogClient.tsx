"use client";

import { useCallback, useRef, useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { usePermission } from "@/components/PermissionsProvider";
import { Pagination } from "@/components/Pagination";
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
  student:  "bg-blue-100 text-blue-700",
  staff:    "bg-purple-100 text-purple-700",
  exam:     "bg-red-100 text-red-700",
  "fee":    "bg-amber-100 text-amber-700",
  leave:    "bg-yellow-100 text-yellow-700",
  config:   "bg-slate-100 text-slate-700",
};

const ACTION_COLORS: Record<string, string> = {
  create:  "bg-green-50 text-green-700 border-green-200",
  update:  "bg-blue-50 text-blue-700 border-blue-200",
  delete:  "bg-red-50 text-red-700 border-red-200",
  publish: "bg-emerald-50 text-emerald-700 border-emerald-200",
  collect: "bg-amber-50 text-amber-700 border-amber-200",
  approve: "bg-green-50 text-green-700 border-green-200",
  reject:  "bg-red-50 text-red-700 border-red-200",
};

const SEL = "w-full h-10 rounded-lg border border-slate-200 bg-white px-3 text-[14px] text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-colors";

type Filters = { search: string; entity: string; action: string; user: string; from: string; to: string };

export function AuditLogClient({
  logs, entities, actions, users,
  total, totalEvents, todayCount, userCount,
  page, totalPages, limit, filters,
}: {
  logs: Log[];
  entities: string[];
  actions: string[];
  users: string[];
  total: number;
  totalEvents: number;
  todayCount: number;
  userCount: number;
  page: number;
  totalPages: number;
  limit: number;
  filters: Filters;
}) {
  const perm = usePermission("system_settings");
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [searchInput, setSearchInput] = useState(filters.search);

  // URL-driven filters → server re-queries with skip/take (resets to page 1)
  const setParam = useCallback((updates: Record<string, string>) => {
    const params = new URLSearchParams(searchParams.toString());
    for (const [k, v] of Object.entries(updates)) {
      if (v) params.set(k, v); else params.delete(k);
    }
    params.set("page", "1");
    router.push(`${pathname}?${params}`);
  }, [router, pathname, searchParams]);

  const debounce = useRef<ReturnType<typeof setTimeout>>(undefined);
  function onSearch(v: string) {
    setSearchInput(v);
    clearTimeout(debounce.current);
    debounce.current = setTimeout(() => setParam({ search: v }), 400);
  }

  function clearFilters() {
    setSearchInput("");
    router.push(pathname);
  }
  const hasFilters = filters.search || filters.entity || filters.action || filters.user || filters.from || filters.to;

  // Export all matching rows (not just the page) via a server endpoint that
  // reuses the same filter query string.
  function exportCsv() {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("page");
    window.location.href = `/api/audit-log/export?${params.toString()}`;
  }

  return (
    <main className="flex-1 p-4 md:p-6 space-y-6">
      {/* Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Events", value: totalEvents },
          { label: "Today", value: todayCount },
          { label: "Entities Tracked", value: entities.length },
          { label: "Users Active", value: userCount },
        ].map((s) => (
          <Card key={s.label}>
            <CardContent className="pt-4">
              <p className="text-xs text-gray-500 mb-1">{s.label}</p>
              <p className="text-3xl font-bold">{s.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white border rounded-lg p-4 space-y-3">
        <div className="flex items-center gap-2 flex-wrap">
          <div className="relative flex-1 min-w-48">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search action, entity, user…"
              value={searchInput}
              onChange={(e) => onSearch(e.target.value)}
              className="pl-8"
            />
          </div>
          <select className={SEL + " w-40"} value={filters.entity} onChange={(e) => setParam({ entity: e.target.value })}>
            <option value="">All Entities</option>
            {entities.map((e) => <option key={e} value={e}>{e}</option>)}
          </select>
          <select className={SEL + " w-40"} value={filters.action} onChange={(e) => setParam({ action: e.target.value })}>
            <option value="">All Actions</option>
            {actions.map((a) => <option key={a} value={a}>{a}</option>)}
          </select>
          <select className={SEL + " w-48"} value={filters.user} onChange={(e) => setParam({ user: e.target.value })}>
            <option value="">All Users</option>
            {users.map((u) => <option key={u} value={u}>{u}</option>)}
          </select>
          <div className="flex items-end gap-2">
            <div>
              <Label className="text-xs">From</Label>
              <Input type="date" value={filters.from} onChange={(e) => setParam({ from: e.target.value })} className="w-36 h-9" />
            </div>
            <div>
              <Label className="text-xs">To</Label>
              <Input type="date" value={filters.to} onChange={(e) => setParam({ to: e.target.value })} className="w-36 h-9" />
            </div>
          </div>
          {hasFilters && (
            <Button variant="ghost" size="sm" onClick={clearFilters} className="text-gray-400 hover:text-gray-600">
              <X className="h-4 w-4 mr-1" /> Clear
            </Button>
          )}
          {perm.canView && (
            <Button variant="outline" size="sm" onClick={exportCsv} className="ml-auto">
              <Download className="h-3.5 w-3.5 mr-1" /> Export
            </Button>
          )}
        </div>
        <p className="text-xs text-gray-400">{total} matching event{total !== 1 ? "s" : ""}</p>
      </div>

      {/* Table */}
      {total === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <ShieldCheck className="h-10 w-10 mx-auto mb-3 opacity-30" />
          <p>No audit events match your filters.</p>
        </div>
      ) : (
        <div className="bg-white border rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left px-4 py-2.5 font-medium text-gray-600 whitespace-nowrap">Time</th>
                  <th className="text-left px-4 py-2.5 font-medium text-gray-600">User</th>
                  <th className="text-left px-4 py-2.5 font-medium text-gray-600">Action</th>
                  <th className="text-left px-4 py-2.5 font-medium text-gray-600">Entity</th>
                  <th className="text-left px-4 py-2.5 font-medium text-gray-600">Entity ID</th>
                  <th className="text-left px-4 py-2.5 font-medium text-gray-600">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {logs.map((log) => {
                  const actionKey = Object.keys(ACTION_COLORS).find((k) => log.action.toLowerCase().includes(k)) ?? "";
                  const actionStyle = ACTION_COLORS[actionKey] ?? "bg-gray-50 text-gray-600 border-gray-200";
                  const entityStyle = Object.entries(ENTITY_COLORS).find(([k]) => log.entity.toLowerCase().includes(k))?.[1] ?? "bg-gray-100 text-gray-600";
                  let details = "";
                  try {
                    if (log.metadata) {
                      const m = typeof log.metadata === "string" ? JSON.parse(log.metadata) : log.metadata;
                      details = Object.entries(m).slice(0, 3).map(([k, v]) => `${k}: ${v}`).join(", ");
                    }
                  } catch { /* ignore */ }

                  return (
                    <tr key={log.id} className="hover:bg-gray-50">
                      <td className="px-4 py-2.5 text-xs text-gray-500 whitespace-nowrap">
                        {new Date(log.createdAt).toLocaleString()}
                      </td>
                      <td className="px-4 py-2.5 text-xs text-gray-700 max-w-[160px] truncate">
                        {log.userEmail ?? log.userId ?? <span className="text-gray-400">System</span>}
                      </td>
                      <td className="px-4 py-2.5">
                        <span className={`text-xs px-2 py-0.5 rounded border font-medium ${actionStyle}`}>{log.action}</span>
                      </td>
                      <td className="px-4 py-2.5">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${entityStyle}`}>{log.entity}</span>
                      </td>
                      <td className="px-4 py-2.5 font-mono text-xs text-gray-400 max-w-[120px] truncate" title={log.entityId ?? ""}>
                        {log.entityId ?? "—"}
                      </td>
                      <td className="px-4 py-2.5 text-xs text-gray-400 max-w-[200px] truncate" title={details}>
                        {details || "—"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <Pagination page={page} totalPages={totalPages} total={total} limit={limit} />
        </div>
      )}
    </main>
  );
}
