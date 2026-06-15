"use client";

import { createContext, useContext } from "react";
import type { PermEntry, PermissionMap } from "@/lib/services/permissions";

const PermissionsContext = createContext<PermissionMap | null>(null);

export function PermissionsProvider({
  permissions,
  children,
}: {
  permissions: PermissionMap | null;
  children: React.ReactNode;
}) {
  return (
    <PermissionsContext.Provider value={permissions}>
      {children}
    </PermissionsContext.Provider>
  );
}

const ALLOW_ALL: PermEntry = { canView: true, canAdd: true, canEdit: true, canDelete: true };
const DENY_ALL:  PermEntry = { canView: false, canAdd: false, canEdit: false, canDelete: false };

/**
 * Returns the permission entry for a given shortCode.
 * - If permissions === null → no custom role assigned → full access (ALLOW_ALL)
 * - If the code isn't in the map → not explicitly granted → deny
 */
export function usePermission(code: string): PermEntry {
  const perms = useContext(PermissionsContext);
  if (perms === null) return ALLOW_ALL;
  return perms[code] ?? DENY_ALL;
}

export function usePermissions(): PermissionMap | null {
  return useContext(PermissionsContext);
}
