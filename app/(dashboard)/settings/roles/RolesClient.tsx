"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Plus, Settings, Trash2, Users, Shield, ShieldCheck, X } from "lucide-react";

type Role = {
  id: string;
  name: string;
  isSystem: boolean;
  isSuperAdmin: boolean;
  isActive: boolean;
  _count: { permissions: number; staffRoles: number };
};

export function RolesClient({ roles: initial }: { roles: Role[] }) {
  const router = useRouter();
  const [roles, setRoles] = useState<Role[]>(initial);
  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState("");
  const [saving, setSaving] = useState(false);

  async function addRole() {
    if (!newName.trim()) return alert("Role name is required");
    setSaving(true);
    try {
      const res = await fetch("/api/roles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newName.trim() }),
      });
      if (!res.ok) { const e = await res.json(); throw new Error(e.error); }
      const created = await res.json();
      setRoles((rs) => [...rs, { ...created, _count: { permissions: 0, staffRoles: 0 } }]);
      setNewName(""); setShowAdd(false);
    } catch (e: any) { alert(e.message || "Failed"); }
    finally { setSaving(false); }
  }

  async function deleteRole(id: string) {
    if (!confirm("Delete this role? Staff assigned to it will lose their custom permissions.")) return;
    try {
      const res = await fetch(`/api/roles/${id}`, { method: "DELETE" });
      if (!res.ok) { const e = await res.json(); throw new Error(e.error); }
      setRoles((rs) => rs.filter((r) => r.id !== id));
    } catch (e: any) { alert(e.message || "Failed"); }
  }

  return (
    <main className="flex-1 p-6 max-w-4xl mx-auto space-y-6">
      <Link href="/settings" className="inline-flex items-center gap-1 text-sm text-white/40 hover:text-white/60">
        <ArrowLeft className="h-3.5 w-3.5" /> Back to Settings
      </Link>

      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-lg font-bold">Roles & Permissions</h2>
          <p className="text-sm text-white/40 mt-0.5">
            Create custom roles and assign granular permissions per module. Staff are then linked to a role.
          </p>
        </div>
        <Button onClick={() => { setShowAdd(true); setNewName(""); }}>
          <Plus className="h-4 w-4 mr-1" /> Add Role
        </Button>
      </div>

      {/* Add Role inline */}
      {showAdd && (
        <Card className="border-blue-500/20 bg-blue-500/10/30">
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="flex-1">
                <Input
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Role name e.g. Receptionist, Bursar, IT Admin"
                  autoFocus
                  onKeyDown={(e) => e.key === "Enter" && addRole()}
                />
              </div>
              <Button onClick={addRole} disabled={saving} size="sm">
                {saving ? "Saving…" : "Create Role"}
              </Button>
              <Button variant="outline" size="sm" onClick={() => setShowAdd(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Role cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {roles.map((role) => (
          <Card key={role.id} className={role.isSuperAdmin ? "border-red-500/20 bg-red-500/10/20" : ""}>
            <CardContent className="pt-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                    role.isSuperAdmin ? "bg-red-500/10" : role.isSystem ? "bg-blue-500/10" : "bg-white/[0.04]"
                  }`}>
                    {role.isSuperAdmin
                      ? <ShieldCheck className="h-5 w-5 text-red-400" />
                      : role.isSystem
                      ? <Shield className="h-5 w-5 text-blue-400" />
                      : <Users className="h-5 w-5 text-white/50" />}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-semibold">{role.name}</p>
                      {role.isSuperAdmin && <Badge className="text-xs bg-red-500/10 text-red-400 border-red-500/20">Super Admin</Badge>}
                      {role.isSystem && !role.isSuperAdmin && <Badge variant="outline" className="text-xs">System</Badge>}
                    </div>
                    <p className="text-xs text-white/40 mt-0.5">
                      {role.isSuperAdmin
                        ? "Full access to everything — bypasses all permission checks"
                        : `${role._count.permissions} permission${role._count.permissions !== 1 ? "s" : ""} · ${role._count.staffRoles} staff assigned`}
                    </p>
                  </div>
                </div>

                <div className="flex gap-1 shrink-0">
                  {!role.isSuperAdmin && (
                    <Link href={`/settings/roles/${role.id}`}>
                      <Button size="sm" variant="outline" className="gap-1">
                        <Settings className="h-3.5 w-3.5" /> Permissions
                      </Button>
                    </Link>
                  )}
                  {!role.isSystem && (
                    <Button size="sm" variant="ghost" onClick={() => deleteRole(role.id)} className="text-red-400 hover:text-red-400">
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* How it works */}
      <Card className="bg-[#0f1015] border-dashed">
        <CardContent className="pt-4 text-sm text-white/40 space-y-1">
          <p className="font-medium text-white/60">How permissions work</p>
          <ul className="list-disc list-inside space-y-1 mt-1">
            <li><strong>Super Admin</strong> bypasses all permission checks — full access always.</li>
            <li>Click <strong>Permissions</strong> to set can_view / can_add / can_edit / can_delete per module.</li>
            <li>Assign a role to a staff member from their <strong>Staff Profile</strong>.</li>
            <li>System roles (Admin, Teacher, Accountant, Librarian) come pre-configured but can be edited.</li>
          </ul>
        </CardContent>
      </Card>
    </main>
  );
}
