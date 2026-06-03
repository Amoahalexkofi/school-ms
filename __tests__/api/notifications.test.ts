import {
  createNotification,
  markAsRead,
  markAllAsRead,
  getUnreadCount,
  getUserNotifications,
  type CreateNotificationInput,
} from "@/lib/services/notifications";

jest.mock("@/lib/prisma", () => ({
  prisma: {
    notification: {
      create: jest.fn(),
      update: jest.fn(),
      updateMany: jest.fn(),
      count: jest.fn(),
      findMany: jest.fn(),
    },
  },
}));

import { prisma } from "@/lib/prisma";
const mock = prisma as jest.Mocked<typeof prisma>;

describe("createNotification", () => {
  beforeEach(() => jest.clearAllMocks());

  it("creates a notification for a user", async () => {
    (mock.notification.create as jest.Mock).mockResolvedValue({
      id: "notif-1",
      userId: "user-1",
      type: "FEE_DUE",
      title: "Fee Due",
      message: "Your term 1 fee is due",
      isRead: false,
    });

    const input: CreateNotificationInput = {
      userId: "user-1",
      type: "FEE_DUE",
      title: "Fee Due",
      message: "Your term 1 fee is due",
    };

    const result = await createNotification(input);
    expect(result.id).toBe("notif-1");
    expect(result.isRead).toBe(false);
    expect(mock.notification.create).toHaveBeenCalledTimes(1);
  });

  it("throws when userId is missing", async () => {
    await expect(
      createNotification({ userId: "", type: "FEE_DUE", title: "t", message: "m" })
    ).rejects.toThrow("userId is required");
  });

  it("throws when title is missing", async () => {
    await expect(
      createNotification({ userId: "u1", type: "FEE_DUE", title: "", message: "m" })
    ).rejects.toThrow("title is required");
  });
});

describe("markAsRead", () => {
  beforeEach(() => jest.clearAllMocks());

  it("marks a single notification as read", async () => {
    (mock.notification.update as jest.Mock).mockResolvedValue({
      id: "notif-1",
      isRead: true,
    });

    const result = await markAsRead("notif-1");
    expect(result.isRead).toBe(true);
    expect(mock.notification.update).toHaveBeenCalledWith({
      where: { id: "notif-1" },
      data: { isRead: true },
    });
  });
});

describe("markAllAsRead", () => {
  beforeEach(() => jest.clearAllMocks());

  it("marks all unread notifications as read for a user", async () => {
    (mock.notification.updateMany as jest.Mock).mockResolvedValue({ count: 5 });

    const result = await markAllAsRead("user-1");
    expect(result.count).toBe(5);
    expect(mock.notification.updateMany).toHaveBeenCalledWith({
      where: { userId: "user-1", isRead: false },
      data: { isRead: true },
    });
  });
});

describe("getUnreadCount", () => {
  beforeEach(() => jest.clearAllMocks());

  it("returns the count of unread notifications for a user", async () => {
    (mock.notification.count as jest.Mock).mockResolvedValue(7);

    const count = await getUnreadCount("user-1");
    expect(count).toBe(7);
    expect(mock.notification.count).toHaveBeenCalledWith({
      where: { userId: "user-1", isRead: false },
    });
  });

  it("returns 0 when there are no unread notifications", async () => {
    (mock.notification.count as jest.Mock).mockResolvedValue(0);
    expect(await getUnreadCount("user-1")).toBe(0);
  });
});

describe("getUserNotifications", () => {
  beforeEach(() => jest.clearAllMocks());

  it("returns paginated notifications for a user, newest first", async () => {
    const notifications = [
      { id: "n1", title: "Fee Due", isRead: false, createdAt: new Date() },
      { id: "n2", title: "Exam Result", isRead: true, createdAt: new Date() },
    ];
    (mock.notification.findMany as jest.Mock).mockResolvedValue(notifications);

    const result = await getUserNotifications("user-1");
    expect(result).toHaveLength(2);
    expect(mock.notification.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { userId: "user-1" },
        orderBy: { createdAt: "desc" },
      })
    );
  });

  it("applies take and skip for pagination", async () => {
    (mock.notification.findMany as jest.Mock).mockResolvedValue([]);

    await getUserNotifications("user-1", { page: 2, pageSize: 10 });

    expect(mock.notification.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ take: 10, skip: 10 })
    );
  });

  it("defaults to page 1 with 20 items", async () => {
    (mock.notification.findMany as jest.Mock).mockResolvedValue([]);

    await getUserNotifications("user-1");

    expect(mock.notification.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ take: 20, skip: 0 })
    );
  });
});
