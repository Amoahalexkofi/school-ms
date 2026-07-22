/**
 * @jest-environment node
 *
 * Tests for lib/permission-defaults.ts — mergePerms is the core of the
 * Roles & Permissions matrix: a custom AppRole must be able to both extend
 * AND restrict the base auth-role default. Regression test for the bug where
 * mergePerms OR'd custom onto base, so unchecking a box in the UI had no
 * effect if the base role already granted it.
 */
import { mergePerms, type PermissionMap } from "@/lib/permission-defaults";

describe("mergePerms", () => {
  const ALLOW = { canView: true, canAdd: true, canEdit: true, canDelete: true };

  it("grants a module the base role never had (extend)", () => {
    const base: PermissionMap = {};
    const custom: PermissionMap = { library: { canView: true, canAdd: false, canEdit: false, canDelete: false } };
    expect(mergePerms(base, custom).library).toEqual(custom.library);
  });

  it("restricts a module the base role fully granted (revoke)", () => {
    const base: PermissionMap = { examination: ALLOW };
    const custom: PermissionMap = { examination: { canView: true, canAdd: true, canEdit: true, canDelete: false } };
    const merged = mergePerms(base, custom);
    expect(merged.examination.canDelete).toBe(false);
    expect(merged.examination.canView).toBe(true);
  });

  it("can fully revoke a module (all four false) despite a base grant", () => {
    const base: PermissionMap = { student_information: ALLOW };
    const custom: PermissionMap = { student_information: { canView: false, canAdd: false, canEdit: false, canDelete: false } };
    expect(mergePerms(base, custom).student_information).toEqual({
      canView: false, canAdd: false, canEdit: false, canDelete: false,
    });
  });

  it("falls back to the base default for modules the custom role never touches", () => {
    const base: PermissionMap = { examination: ALLOW, homework: ALLOW };
    const custom: PermissionMap = { examination: { canView: true, canAdd: false, canEdit: false, canDelete: false } };
    expect(mergePerms(base, custom).homework).toEqual(ALLOW);
  });
});
