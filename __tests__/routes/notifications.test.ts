/**
 * @jest-environment node
 */
import { GET, PATCH } from "@/app/api/notifications/route";

jest.mock("@/lib/services/notifications", () => ({
  getUserNotifications: jest.fn(),
  getUnreadCount: jest.fn(),
  markAsRead: jest.fn(),
  markAllAsRead: jest.fn(),
}));

import {
  getUserNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
} from "@/lib/services/notifications";

const mockList = getUserNotifications as jest.Mock;
const mockCount = getUnreadCount as jest.Mock;
const mockRead = markAsRead as jest.Mock;
const mockReadAll = markAllAsRead as jest.Mock;

const makeGet = (params: Record<string, string>) => {
  const url = new URL("http://localhost/api/notifications");
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  return new Request(url.toString(), { method: "GET" });
};

const makePatch = (body: unknown) =>
  new Request("http://localhost/api/notifications", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

describe("GET /api/notifications", () => {
  beforeEach(() => jest.clearAllMocks());

  it("returns 200 with notifications and unread count", async () => {
    mockList.mockResolvedValue([
      { id: "n1", title: "Fee Due", isRead: false },
      { id: "n2", title: "Result Published", isRead: true },
    ]);
    mockCount.mockResolvedValue(1);

    const res = await GET(makeGet({ userId: "user-1" }));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.notifications).toHaveLength(2);
    expect(body.unreadCount).toBe(1);
  });

  it("respects page and pageSize query params", async () => {
    mockList.mockResolvedValue([]);
    mockCount.mockResolvedValue(0);

    await GET(makeGet({ userId: "user-1", page: "2", pageSize: "5" }));

    expect(mockList).toHaveBeenCalledWith("user-1", { page: 2, pageSize: 5 });
  });

  it("returns 400 when userId is missing", async () => {
    const res = await GET(makeGet({}));
    expect(res.status).toBe(400);
  });

  it("returns 500 on unexpected errors", async () => {
    mockList.mockRejectedValue(new Error("db error"));
    const res = await GET(makeGet({ userId: "user-1" }));
    expect(res.status).toBe(500);
  });
});

describe("PATCH /api/notifications", () => {
  beforeEach(() => jest.clearAllMocks());

  it("marks a single notification as read when id is provided", async () => {
    mockRead.mockResolvedValue({ id: "n1", isRead: true });
    const res = await PATCH(makePatch({ id: "n1" }));
    expect(res.status).toBe(200);
    expect(mockRead).toHaveBeenCalledWith("n1");
    expect(mockReadAll).not.toHaveBeenCalled();
  });

  it("marks all as read when markAll is true", async () => {
    mockReadAll.mockResolvedValue({ count: 5 });
    const res = await PATCH(makePatch({ userId: "user-1", markAll: true }));
    expect(res.status).toBe(200);
    expect(mockReadAll).toHaveBeenCalledWith("user-1");
    expect(mockRead).not.toHaveBeenCalled();
  });

  it("returns 400 when neither id nor markAll+userId is provided", async () => {
    const res = await PATCH(makePatch({}));
    expect(res.status).toBe(400);
  });

  it("returns 400 when markAll is true but userId is missing", async () => {
    const res = await PATCH(makePatch({ markAll: true }));
    expect(res.status).toBe(400);
  });

  it("returns 500 on unexpected errors", async () => {
    mockRead.mockRejectedValue(new Error("db error"));
    const res = await PATCH(makePatch({ id: "n1" }));
    expect(res.status).toBe(500);
  });
});
