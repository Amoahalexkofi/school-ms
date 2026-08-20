"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Save, CheckSquare, Square, RotateCcw } from "lucide-react";
import { ROLE_DEFAULTS } from "@/lib/permission-defaults";
import { aggregateToGroups, EMPTY_PERM, type PermGroup, type PermState, type ExistingPerm } from "@/lib/permission-grouping";

const ACTIONS = [
  { key: "canView",   label: "View",   color: "text-blue-600"   },
  { key: "canAdd",    label: "Add",    color: "text-green-600"  },
  { key: "canEdit",   label: "Edit",   color: "text-yellow-600" },
  { key: "canDelete", label: "Delete", color: "text-red-600"    },
] as const;

type NamedRole = { id: string; name: string; permissions: ExistingPerm[] };

export function StaffPermissionsMatrix({
  staffId,
  staffName,
  baseRole,
  groups,
  existingPermissions,
  namedRoles,
}: {
  staffId: string;
  staffName: string;
  baseRole: string;
  groups: PermGroup[];
  existingPermissions: ExistingPerm[];
  namedRoles: NamedRole[];
}) {
  // What this person gets from their base role alone, with no overrides —
  // used to pre-fill each module's display so the grid always shows their
  // real, current access, not a blank slate.
  function defaultFor(group: PermGroup): PermState {
    const base = ROLE_DEFAULTS[baseRole];
    if (base === null) return { canView: true, canAdd: true, canEdit: true, canDelete: true }; // unrestricted (Admin/Super Admin)
    if (!base) return { ...EMPTY_PERM };
    return base[group.shortCode] ? { ...base[group.shortCode] } : { ...EMPTY_PERM };
  }

  const [perms, setPerms] = useState<Record<number, PermState>>(() => aggregateToGroups(existingPermissions, groups));
  // Groups the admin has explicitly customized (either edited, or the group
  // already had a saved override when the page loaded). Only these are sent
  // on save — everything else stays exactly at the person's base-role default.
  const [touched, setTouched] = useState<Set<number>>(() => new Set(Object.keys(perms).map(Number)));
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  function get(group: PermGroup): PermState {
    return perms[group.id] ?? defaultFor(group);
  }

  function applyNamedRole(roleId: string) {
    if (!roleId) return;
    const role = namedRoles.find((r) => r.id === roleId);
    if (!role) return;
    const map = aggregateToGroups(role.permissions, groups);
    setPerms(map);
    setTouched(new Set(Object.keys(map).map(Number)));
    setSaved(false);
  }

  function toggle(group: PermGroup, action: keyof PermState) {
    setPerms((prev) => {
      // Seed from the CURRENT effective value (default if never touched) so
      // unchecking one box only removes that one thing — it can't silently
      // wipe the other three flags this person already had by default.
      const current = prev[group.id] ?? defaultFor(group);
      const updated = { ...current, [action]: !current[action] };
      if (action !== "canView" && updated[action]) updated.canView = true;
      return { ...prev, [group.id]: updated };
    });
    setTouched((prev) => new Set(prev).add(group.id));
    setSaved(false);
  }

  function resetToDefault(group: PermGroup) {
    setPerms((prev) => {
      const next = { ...prev };
      delete next[group.id];
      return next;
    });
    setTouched((prev) => {
      const next = new Set(prev);
      next.add(group.id); // still send it — as an explicit "clear the override"
      return next;
    });
    setSaved(false);
  }

  async function save() {
    setSaving(true);
    try {
      const payload = Array.from(touched).map((groupId) => {
        const g = groups.find((gr) => gr.id === groupId)!;
        return perms[groupId]
          ? { groupId, mode: "override" as const, ...perms[groupId] }
          : { groupId, mode: "default" as const };
      });

      const res = await fetch(`/api/staff/${staffId}/permissions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error();
      setSaved(true);
    } catch { alert("Failed to save permissions"); }
    finally { setSaving(false); }
  }

  const customizedCount = Array.from(touched).filter((id) => perms[id]).length;

  return (
    <main className="flex-1 p-4 md:p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4 flex-wrap">
        <Link href={`/staff/${staffId}`} className="inline-flex items-center gap-2 text-[13px] font-medium text-slate-500 hover:text-slate-800 transition-colors">
          <ArrowLeft className="h-3.5 w-3.5" /> Back to {staffName}
        </Link>
        <div className="flex-1">
          <h2 className="text-lg font-bold">{staffName} — Permissions</h2>
          <p className="text-sm text-gray-500">
            Base role: <Badge variant="outline" className="text-xs">{baseRole.replace(/_/g, " ")}</Badge>{" "}
            — every module below already shows what {staffName.split(" ")[0]} gets from that role.
            Check a box to grant more, uncheck one to take it away just for her, or reset a module back to the role default.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={save} disabled={saving} className="gap-2 min-w-28">
            <Save className="h-4 w-4" />{saving ? "Saving…" : "Save Permissions"}
          </Button>
          {saved && <span className="text-sm text-green-600 font-medium">Saved ✓</span>}
        </div>
      </div>

      {namedRoles.length > 0 && (
        <div className="flex items-center gap-2 text-sm bg-slate-50 border border-slate-200 rounded-lg px-3 py-2">
          <span className="text-gray-500 shrink-0">Start from an existing role:</span>
          <select
            className="border rounded-md px-2 py-1 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            defaultValue=""
            onChange={(e) => { applyNamedRole(e.target.value); e.target.value = ""; }}
          >
            <option value="">— Select a role to pre-fill from —</option>
            {namedRoles.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
          </select>
          <span className="text-gray-400 text-xs">Replaces every module below with that role's permissions — you can still adjust before saving.</span>
        </div>
      )}

      {/* Legend */}
      <div className="flex flex-wrap gap-4 text-xs">
        {ACTIONS.map(({ label, color }) => (
          <span key={label} className="flex items-center gap-1">
            <CheckSquare className={`h-3.5 w-3.5 ${color}`} />
            <span className="text-gray-600">{label}</span>
          </span>
        ))}
        <span className="flex items-center gap-1">
          <Badge variant="outline" className="text-[10px] px-1.5 py-0">Customized</Badge>
          <span className="text-gray-400">Overrides the {baseRole.replace(/_/g, " ").toLowerCase()} default for this person only</span>
        </span>
      </div>

      {/* One row per module — matches exactly what the server enforces */}
      <Card>
        <CardContent className="p-0">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-y">
              <tr>
                <th className="text-left px-4 py-2 font-medium text-gray-600">Module</th>
                {ACTIONS.map(({ label, color }) => (
                  <th key={label} className={`text-center px-4 py-2 font-medium w-20 ${color}`}>{label}</th>
                ))}
                <th className="w-10" />
              </tr>
            </thead>
            <tbody className="divide-y">
              {groups.map((group) => {
                const p = get(group);
                const isCustomized = touched.has(group.id);
                const hasAny = p.canView || p.canAdd || p.canEdit || p.canDelete;
                return (
                  <tr key={group.id} className={`hover:bg-gray-50 ${hasAny ? "" : "opacity-60"}`}>
                    <td className="px-4 py-2.5 font-medium text-gray-800">
                      <div className="flex items-center gap-2">
                        {group.name}
                        {isCustomized && <Badge variant="outline" className="text-[10px] px-1.5 py-0 shrink-0">Customized</Badge>}
                      </div>
                    </td>
                    {ACTIONS.map(({ key, color }) => (
                      <td key={key} className="px-4 py-2.5 text-center">
                        <button
                          onClick={() => toggle(group, key)}
                          className={`inline-flex items-center justify-center w-6 h-6 rounded transition-colors ${
                            p[key] ? `${color} opacity-100` : "text-gray-200 hover:text-gray-400"
                          }`}
                        >
                          {p[key] ? <CheckSquare className="h-5 w-5" /> : <Square className="h-5 w-5" />}
                        </button>
                      </td>
                    ))}
                    <td className="px-2 text-center">
                      {isCustomized && (
                        <button
                          onClick={() => resetToDefault(group)}
                          title={`Reset to ${baseRole.replace(/_/g, " ").toLowerCase()} default`}
                          className="text-gray-300 hover:text-gray-500"
                        >
                          <RotateCcw className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* Sticky save bar */}
      <div className="sticky bottom-4 flex justify-end">
        <div className="bg-white border shadow-lg rounded-lg px-4 py-2 flex items-center gap-3">
          <span className="text-sm text-gray-500">{customizedCount} module{customizedCount !== 1 ? "s" : ""} customized</span>
          <Button onClick={save} disabled={saving} className="gap-2">
            <Save className="h-4 w-4" />{saving ? "Saving…" : "Save Permissions"}
          </Button>
          {saved && <span className="text-sm text-green-600 font-medium">Saved ✓</span>}
        </div>
      </div>
    </main>
  );
}
