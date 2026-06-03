/**
 * @jest-environment node
 *
 * Tests for lib/auth/middleware-utils.ts
 * Tests the route-guard logic in isolation (pure functions, no Next.js runtime needed).
 */
import {
  isPublicRoute,
  canAccessRoute,
  type UserRole,
} from "@/lib/auth/middleware-utils";

describe("isPublicRoute", () => {
  it("returns true for /api/auth paths", () => {
    expect(isPublicRoute("/api/auth/signin")).toBe(true);
    expect(isPublicRoute("/api/auth/callback/credentials")).toBe(true);
  });

  it("returns true for the sign-in page", () => {
    expect(isPublicRoute("/sign-in")).toBe(true);
  });

  it("returns true for the admission form", () => {
    expect(isPublicRoute("/apply")).toBe(true);
  });

  it("returns false for authenticated routes", () => {
    expect(isPublicRoute("/dashboard")).toBe(false);
    expect(isPublicRoute("/students")).toBe(false);
    expect(isPublicRoute("/api/students")).toBe(false);
  });
});

describe("canAccessRoute", () => {
  const adminRoutes = ["/admin", "/admin/settings", "/users"];
  const teacherRoutes = ["/attendance", "/marks", "/homework"];
  const studentRoutes = ["/my-results", "/timetable", "/fees/pay"];
  const accountantRoutes = ["/fees", "/fees/invoices", "/payroll"];

  it("SUPER_ADMIN can access all routes", () => {
    const role: UserRole = "SUPER_ADMIN";
    expect(canAccessRoute("/admin/settings", role)).toBe(true);
    expect(canAccessRoute("/fees/invoices", role)).toBe(true);
    expect(canAccessRoute("/my-results", role)).toBe(true);
    expect(canAccessRoute("/dashboard", role)).toBe(true);
  });

  it("ADMIN can access admin routes and most management routes", () => {
    const role: UserRole = "ADMIN";
    expect(canAccessRoute("/admin", role)).toBe(true);
    expect(canAccessRoute("/students", role)).toBe(true);
    expect(canAccessRoute("/fees", role)).toBe(true);
  });

  it("ADMIN cannot access super-admin-only routes", () => {
    expect(canAccessRoute("/admin/system", "ADMIN")).toBe(false);
  });

  it("TEACHER can access teacher routes", () => {
    const role: UserRole = "TEACHER";
    for (const route of teacherRoutes) {
      expect(canAccessRoute(route, role)).toBe(true);
    }
  });

  it("TEACHER cannot access admin routes", () => {
    expect(canAccessRoute("/admin", "TEACHER")).toBe(false);
    expect(canAccessRoute("/admin/settings", "TEACHER")).toBe(false);
  });

  it("TEACHER cannot access accountant routes", () => {
    expect(canAccessRoute("/payroll", "TEACHER")).toBe(false);
    expect(canAccessRoute("/fees/invoices", "TEACHER")).toBe(false);
  });

  it("STUDENT can access student routes", () => {
    const role: UserRole = "STUDENT";
    for (const route of studentRoutes) {
      expect(canAccessRoute(route, role)).toBe(true);
    }
  });

  it("STUDENT cannot access admin, teacher, or accountant routes", () => {
    expect(canAccessRoute("/admin", "STUDENT")).toBe(false);
    expect(canAccessRoute("/attendance", "STUDENT")).toBe(false);
    expect(canAccessRoute("/payroll", "STUDENT")).toBe(false);
  });

  it("ACCOUNTANT can access fee and payroll routes", () => {
    const role: UserRole = "ACCOUNTANT";
    for (const route of accountantRoutes) {
      expect(canAccessRoute(route, role)).toBe(true);
    }
  });

  it("ACCOUNTANT cannot access admin or teacher routes", () => {
    expect(canAccessRoute("/admin", "ACCOUNTANT")).toBe(false);
    expect(canAccessRoute("/marks", "ACCOUNTANT")).toBe(false);
  });

  it("PARENT can access parent portal routes", () => {
    expect(canAccessRoute("/parent/dashboard", "PARENT")).toBe(true);
    expect(canAccessRoute("/parent/attendance", "PARENT")).toBe(true);
  });

  it("PARENT cannot access admin or staff routes", () => {
    expect(canAccessRoute("/admin", "PARENT")).toBe(false);
    expect(canAccessRoute("/marks", "PARENT")).toBe(false);
    expect(canAccessRoute("/payroll", "PARENT")).toBe(false);
  });

  it("all roles can access /dashboard", () => {
    const roles: UserRole[] = ["SUPER_ADMIN", "ADMIN", "TEACHER", "ACCOUNTANT", "LIBRARIAN", "STUDENT", "PARENT"];
    for (const role of roles) {
      expect(canAccessRoute("/dashboard", role)).toBe(true);
    }
  });
});
