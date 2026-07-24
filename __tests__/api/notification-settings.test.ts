/**
 * @jest-environment node
 *
 * isChannelEnabled backs the gate on every real notification send site
 * (fee_payment, fee_due, attendance_student, exam_result). The default when
 * no row exists yet is load-bearing: those events all send unconditionally
 * today, so "no row" must mean "keep working", not "off".
 */
const mockFindUnique = jest.fn();

jest.mock("@/lib/db", () => ({
  getDb: async () => ({ notificationSetting: { findUnique: mockFindUnique } }),
}));

import { isChannelEnabled } from "@/lib/services/notification-settings";

describe("isChannelEnabled", () => {
  beforeEach(() => jest.clearAllMocks());

  it("defaults to enabled when no row exists yet", async () => {
    mockFindUnique.mockResolvedValue(null);
    const db = { notificationSetting: { findUnique: mockFindUnique } };
    expect(await isChannelEnabled(db, "fee_payment", "email")).toBe(true);
    expect(await isChannelEnabled(db, "fee_payment", "sms")).toBe(true);
  });

  it("respects an explicit false", async () => {
    mockFindUnique.mockResolvedValue({ emailEnabled: false, smsEnabled: true, pushEnabled: false });
    const db = { notificationSetting: { findUnique: mockFindUnique } };
    expect(await isChannelEnabled(db, "fee_payment", "email")).toBe(false);
    expect(await isChannelEnabled(db, "fee_payment", "sms")).toBe(true);
  });

  it("defaults to enabled if the lookup throws", async () => {
    mockFindUnique.mockRejectedValue(new Error("db blip"));
    const db = { notificationSetting: { findUnique: mockFindUnique } };
    expect(await isChannelEnabled(db, "attendance_student", "sms")).toBe(true);
  });
});
