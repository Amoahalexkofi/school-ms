"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Save, CheckSquare, Square, Minus } from "lucide-react";

type PermCat = {
  id: number;
  name: string;
  shortCode: string;
  enableView: boolean;
  enableAdd: boolean;
  enableEdit: boolean;
  enableDelete: boolean;
};

type Group = {
  id: number;
  name: string;
  shortCode: string;
  categories: PermCat[];
};

type ExistingPerm = {
  permCatId: number;
  canView: boolean;
  canAdd: boolean;
  canEdit: boolean;
  canDelete: boolean;
};

type PermState = {
  canView: boolean;
  canAdd: boolean;
  canEdit: boolean;
  canDelete: boolean;
};

const ACTIONS = [
  { key: "canView",   label: "View",   color: "text-blue-600"   },
  { key: "canAdd",    label: "Add",    color: "text-green-600"  },
  { key: "canEdit",   label: "Edit",   color: "text-yellow-600" },
  { key: "canDelete", label: "Delete", color: "text-red-600"    },
] as const;

export function StaffPermissionsMatrix({
  staffId,
  staffName,
  baseRole,
  groups,
  existingPermissions,
}: {
  staffId: string;
  staffName: string;
  baseRole: string;
  groups: Group[];
  existingPermissions: ExistingPerm[];
}) {
  const [perms, setPerms] = useState<Record<number, PermState>>(() => {
    const map: Record<number, PermState> = {};
    for (const p of existingPermissions) {
      map[p.permCatId] = { canView: p.canView, canAdd: p.canAdd, canEdit: p.canEdit, canDelete: p.canDelete };
    }
    return map;
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  function get(catId: number): PermState {
    return perms[catId] ?? { canView: false, canAdd: false, canEdit: false, canDelete: false };
  }

  function toggle(catId: number, action: keyof PermState) {
    setPerms((prev) => {
      const current = get(catId);
      const updated = { ...current, [action]: !current[action] };
      if (action !== "canView" && updated[action]) updated.canView = true;
      return { ...prev, [catId]: updated };
    });
    setSaved(false);
  }

  async function save() {
    setSaving(true);
    try {
      // Only send categories the admin actually touched (has at least one
      // box checked) plus any that were explicitly cleared to all-false —
      // both are meaningful overrides. A category never touched at all
      // stays absent, so it doesn't accidentally lock in "no access" for a
      // module this person's base role would otherwise grant.
      const payload = Object.entries(perms).map(([catId, p]) => ({ permCatId: parseInt(catId), ...p }));

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

  const totalEnabled = Object.values(perms).filter((p) =>
    p.canView || p.canAdd || p.canEdit || p.canDelete
  ).length;

  return (
    <main className="flex-1 p-4 md:p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex items-center gap-4 flex-wrap">
        <Link href={`/staff/${staffId}`} className="inline-flex items-center gap-2 text-[13px] font-medium text-slate-500 hover:text-slate-800 transition-colors">
          <ArrowLeft className="h-3.5 w-3.5" /> Back to {staffName}
        </Link>
        <div className="flex-1">
          <h2 className="text-lg font-bold">{staffName} — Permissions</h2>
          <p className="text-sm text-gray-500">
            Base role: <Badge variant="outline" className="text-xs">{baseRole.replace(/_/g, " ")}</Badge>{" "}
            — check a box below to grant something beyond the normal {baseRole.replace(/_/g, " ").toLowerCase()} defaults,
            or uncheck one to take something away just for {staffName.split(" ")[0]}.
          </p>
        </div>
        <div className="flex items-center gap-2">
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
        <span className="flex items-center gap-1">
          <Minus className="h-3.5 w-3.5 text-gray-300" />
          <span className="text-gray-400">Not applicable for this module</span>
        </span>
      </div>

      {/* Permission groups */}
      {groups.map((group) => (
        <Card key={group.id}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-gray-800">
              {group.name}
              <Badge variant="outline" className="ml-2 text-xs">{group.categories.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-y">
                <tr>
                  <th className="text-left px-4 py-2 font-medium text-gray-600 w-64">Module</th>
                  {ACTIONS.map(({ label, color }) => (
                    <th key={label} className={`text-center px-4 py-2 font-medium w-20 ${color}`}>{label}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y">
                {group.categories.map((cat) => {
                  const p = get(cat.id);
                  const enabledMap = {
                    canView:   cat.enableView,
                    canAdd:    cat.enableAdd,
                    canEdit:   cat.enableEdit,
                    canDelete: cat.enableDelete,
                  };
                  const hasAny = p.canView || p.canAdd || p.canEdit || p.canDelete;
                  return (
                    <tr key={cat.id} className={`hover:bg-gray-50 ${hasAny ? "" : "opacity-60"}`}>
                      <td className="px-4 py-2.5 font-medium text-gray-800">{cat.name}</td>
                      {ACTIONS.map(({ key, color }) => (
                        <td key={key} className="px-4 py-2.5 text-center">
                          {enabledMap[key] ? (
                            <button
                              onClick={() => toggle(cat.id, key)}
                              className={`inline-flex items-center justify-center w-6 h-6 rounded transition-colors ${
                                p[key]
                                  ? `${color} opacity-100`
                                  : "text-gray-200 hover:text-gray-400"
                              }`}
                            >
                              {p[key]
                                ? <CheckSquare className="h-5 w-5" />
                                : <Square className="h-5 w-5" />}
                            </button>
                          ) : (
                            <Minus className="h-4 w-4 text-gray-200 mx-auto" />
                          )}
                        </td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </CardContent>
        </Card>
      ))}

      {/* Sticky save bar */}
      <div className="sticky bottom-4 flex justify-end">
        <div className="bg-white border shadow-lg rounded-lg px-4 py-2 flex items-center gap-3">
          <span className="text-sm text-gray-500">{totalEnabled} module{totalEnabled !== 1 ? "s" : ""} customized</span>
          <Button onClick={save} disabled={saving} className="gap-2">
            <Save className="h-4 w-4" />{saving ? "Saving…" : "Save Permissions"}
          </Button>
          {saved && <span className="text-sm text-green-600 font-medium">Saved ✓</span>}
        </div>
      </div>
    </main>
  );
}
