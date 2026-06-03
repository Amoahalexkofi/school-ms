import { getDashboardStats } from "@/lib/services/dashboard";

jest.mock("@/lib/prisma", () => ({
  prisma: {
    student: { count: jest.fn() },
    staff: { count: jest.fn() },
    studentAttendance: { count: jest.fn() },
    feeInvoice: { aggregate: jest.fn() },
    examGroup: { count: jest.fn() },
  },
}));

import { prisma } from "@/lib/prisma";
const mock = prisma as jest.Mocked<typeof prisma>;

describe("getDashboardStats", () => {
  beforeEach(() => jest.clearAllMocks());

  it("returns correct stats for all counts", async () => {
    (mock.student.count as jest.Mock).mockResolvedValue(320);
    (mock.staff.count as jest.Mock).mockResolvedValue(28);
    (mock.studentAttendance.count as jest.Mock)
      .mockResolvedValueOnce(295) // present today
      .mockResolvedValueOnce(25); // absent today
    (mock.feeInvoice.aggregate as jest.Mock)
      .mockResolvedValueOnce({ _sum: { paidAmount: 48500 } })  // collected
      .mockResolvedValueOnce({ _sum: { totalAmount: 60500 } }); // total invoiced (pending = total - paid)
    (mock.examGroup.count as jest.Mock).mockResolvedValue(3);

    const stats = await getDashboardStats("sess-1");

    expect(stats.totalStudents).toBe(320);
    expect(stats.totalStaff).toBe(28);
    expect(stats.presentToday).toBe(295);
    expect(stats.absentToday).toBe(25);
    expect(stats.collectedFees).toBe(48500);
    expect(stats.pendingFees).toBe(12000); // 60500 - 48500
    expect(stats.upcomingExams).toBe(3);
  });

  it("handles null aggregates gracefully (empty DB)", async () => {
    (mock.student.count as jest.Mock).mockResolvedValue(0);
    (mock.staff.count as jest.Mock).mockResolvedValue(0);
    (mock.studentAttendance.count as jest.Mock).mockResolvedValue(0);
    (mock.feeInvoice.aggregate as jest.Mock).mockResolvedValue({ _sum: { paidAmount: null } });
    (mock.examGroup.count as jest.Mock).mockResolvedValue(0);

    const stats = await getDashboardStats("sess-1");

    expect(stats.totalStudents).toBe(0);
    expect(stats.collectedFees).toBe(0);
    expect(stats.pendingFees).toBe(0);
  });
});
