"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Save, CheckSquare, Square } from "lucide-react";
import { aggregateToGroups, EMPTY_PERM, type PermGroup, type PermState, type ExistingPerm } from "@/lib/permission-grouping";

type Role = {
  id: string;
  name: string;
  isSystem: boolean;
  isSuperAdmin: boolean;
  permissions: ExistingPerm[];
};

const ACTIONS = [
  { key: "canView",   label: "View",   color: "text-blue-600"   },
  { key: "canAdd",    label: "Add",    color: "text-green-600"  },
  { key: "canEdit",   label: "Edit",   color: "text-yellow-600" },
  { key: "canDelete", label: "Delete", color: "text-red-600"    },
] as const;

export function PermissionsMatrix({ role, groups }: { role: Role; groups: PermGroup[] }) {
  const [perms, setPerms] = useState<Record<number, PermState>>(() => aggregateToGroups(role.permissions, groups));
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  function get(groupId: number): PermState {
    return perms[groupId] ?? EMPTY_PERM;
  }

  function toggle(groupId: number, action: keyof PermState) {
    setPerms((prev) => {
      const current = get(groupId);
      const updated = { ...current, [action]: !current[action] };
      // Add/Edit/Delete imply View — a module you can edit but can't see makes no sense.
      if (action !== "canView" && updated[action]) updated.canView = true;
      return { ...prev, [groupId]: updated };
    });
    setSaved(false);
  }

  function selectAll(value: boolean) {
    setPerms(() => {
      const next: Record<number, PermState> = {};
      for (const g of groups) {
        next[g.id] = value
          ? { canView: true, canAdd: true, canEdit: true, canDelete: true }
          : { ...EMPTY_PERM };
      }
      return next;
    });
    setSaved(false);
  }

  async function save() {
    setSaving(true);
    try {
      const payload = groups
        .map((g) => ({ groupId: g.id, ...get(g.id) }))
        .filter((e) => e.canView || e.canAdd || e.canEdit || e.canDelete);

      const res = await fetch(`/api/roles/${role.id}/permissions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error();
      setSaved(true);
    } catch { alert("Failed to save permissions"); }
    finally { setSaving(false); }
  }

  const totalEnabled = groups.filter((g) => {
    const p = get(g.id);
    return p.canView || p.canAdd || p.canEdit || p.canDelete;
  }).length;

  return (
    <main className="flex-1 px-4 py-7 md:p-8 max-w-[1400px] mx-auto w-full space-y-6">
      <div className="flex items-center gap-4 flex-wrap">
        <Link href="/settings/roles" className="inline-flex items-center gap-2 text-[13px] font-medium text-slate-500 hover:text-slate-800 transition-colors">
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Roles
        </Link>
        <div className="flex-1">
          <h2 className="text-lg font-bold">{role.name} — Permissions</h2>
          <p className="text-sm text-gray-500">
            {totalEnabled} module{totalEnabled !== 1 ? "s" : ""} with at least one permission enabled.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => selectAll(true)}>Select All</Button>
          <Button variant="outline" size="sm" onClick={() => selectAll(false)}>Clear All</Button>
          <Button onClick={save} disabled={saving} className="gap-2 min-w-28">
            <Save className="h-4 w-4" />{saving ? "Saving…" : "Save Permissions"}
          </Button>
          {saved && <span className="text-sm text-green-600 font-medium">Saved ✓</span>}
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 text-xs">
        {ACTIONS.map(({ label, color }) => (
          <span key={label} className="flex items-center gap-1">
            <CheckSquare className={`h-3.5 w-3.5 ${color}`} />
            <span className="text-gray-600">{label}</span>
          </span>
        ))}
      </div>

      {/* One row per module — matches exactly what the server enforces */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-y">
                <tr>
                  <th className="text-left px-4 py-2 font-medium text-gray-600">Module</th>
                  {ACTIONS.map(({ label, color }) => (
                    <th key={label} className={`text-center px-4 py-2 font-medium w-20 ${color}`}>{label}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y">
                {groups.map((group) => {
                  const p = get(group.id);
                  const hasAny = p.canView || p.canAdd || p.canEdit || p.canDelete;
                  return (
                    <tr key={group.id} className={`hover:bg-gray-50 ${hasAny ? "" : "opacity-60"}`}>
                      <td className="px-4 py-2.5 font-medium text-gray-800">{group.name}</td>
                      {ACTIONS.map(({ key, color }) => (
                        <td key={key} className="px-4 py-2.5 text-center">
                          <button
                            onClick={() => toggle(group.id, key)}
                            className={`inline-flex items-center justify-center w-6 h-6 rounded transition-colors ${
                              p[key] ? `${color} opacity-100` : "text-gray-200 hover:text-gray-400"
                            }`}
                          >
                            {p[key] ? <CheckSquare className="h-5 w-5" /> : <Square className="h-5 w-5" />}
                          </button>
                        </td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Sticky save bar */}
      <div className="sticky bottom-4 flex justify-end">
        <div className="bg-white border shadow-lg rounded-lg px-4 py-2 flex items-center gap-3">
          <span className="text-sm text-gray-500">{totalEnabled} modules enabled</span>
          <Button onClick={save} disabled={saving} className="gap-2">
            <Save className="h-4 w-4" />{saving ? "Saving…" : "Save Permissions"}
          </Button>
          {saved && <span className="text-sm text-green-600 font-medium">Saved ✓</span>}
        </div>
      </div>
    </main>
  );
}
