/**
 * @jest-environment node
 *
 * Tests for lib/services/homework.ts — acknowledgeHomework is the only
 * export; it backs the student "mark done / submit a file" self-service
 * action. Replaces a previous test file that covered createHomework/
 * listHomework, functions that never matched the real schema (sectionId/
 * assignedById/acknowledgedAt don't exist on Homework/HomeworkAcknowledgement)
 * and had zero real callers.
 */
const mockFindUnique = jest.fn();
const mockUpsert = jest.fn();

jest.mock("@/lib/db", () => ({
  getDb: async () => ({
    homework: { findUnique: mockFindUnique },
    homeworkAcknowledgement: { upsert: mockUpsert },
  }),
}));

import { acknowledgeHomework } from "@/lib/services/homework";

describe("acknowledgeHomework", () => {
  beforeEach(() => jest.clearAllMocks());

  it("marks done with no attachment", async () => {
    mockFindUnique.mockResolvedValue({ id: "hw-1" });
    mockUpsert.mockResolvedValue({ id: "ack-1", acknowledged: true });

    await acknowledgeHomework("hw-1", "stu-1");

    const call = mockUpsert.mock.calls[0][0];
    expect(call.create).toEqual({ homeworkId: "hw-1", studentId: "stu-1", acknowledged: true });
    expect(call.update).toEqual({ acknowledged: true });
  });

  it("records the attachment and submittedAt when a file is submitted", async () => {
    mockFindUnique.mockResolvedValue({ id: "hw-1" });
    mockUpsert.mockResolvedValue({ id: "ack-1", acknowledged: true, attachment: "docs/x.pdf" });

    await acknowledgeHomework("hw-1", "stu-1", "docs/x.pdf");

    const call = mockUpsert.mock.calls[0][0];
    expect(call.update.attachment).toBe("docs/x.pdf");
    expect(call.update.submittedAt).toBeInstanceOf(Date);
  });

  it("throws when the homework does not exist", async () => {
    mockFindUnique.mockResolvedValue(null);
    await expect(acknowledgeHomework("bad-id", "stu-1")).rejects.toThrow("homework not found");
    expect(mockUpsert).not.toHaveBeenCalled();
  });
});
