import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AttendanceForm } from "@/components/AttendanceForm";

const students = [
  { id: "stu-1", firstName: "John", lastName: "Doe" },
  { id: "stu-2", firstName: "Jane", lastName: "Smith" },
  { id: "stu-3", firstName: "Bob", lastName: "Jones" },
];

describe("AttendanceForm", () => {
  const onSubmit = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders a row for every student", () => {
    render(
      <AttendanceForm
        students={students}
        sectionId="sec-1"
        sessionId="sess-1"
        date={new Date("2026-06-03")}
        onSubmit={onSubmit}
      />
    );

    expect(screen.getByText("John Doe")).toBeInTheDocument();
    expect(screen.getByText("Jane Smith")).toBeInTheDocument();
    expect(screen.getByText("Bob Jones")).toBeInTheDocument();
  });

  it("defaults all students to PRESENT", () => {
    render(
      <AttendanceForm
        students={students}
        sectionId="sec-1"
        sessionId="sess-1"
        date={new Date("2026-06-03")}
        onSubmit={onSubmit}
      />
    );

    const presentRadios = screen.getAllByRole("radio", { name: /present/i });
    presentRadios.forEach((radio) => {
      expect(radio).toBeChecked();
    });
  });

  it("allows changing a student status to ABSENT", async () => {
    const user = userEvent.setup();
    render(
      <AttendanceForm
        students={students}
        sectionId="sec-1"
        sessionId="sess-1"
        date={new Date("2026-06-03")}
        onSubmit={onSubmit}
      />
    );

    // Change John's status to Absent
    const absentRadios = screen.getAllByRole("radio", { name: /absent/i });
    await user.click(absentRadios[0]);

    expect(absentRadios[0]).toBeChecked();
  });

  it("submits with correct payload for all students", async () => {
    const user = userEvent.setup();
    render(
      <AttendanceForm
        students={students}
        sectionId="sec-1"
        sessionId="sess-1"
        date={new Date("2026-06-03")}
        onSubmit={onSubmit}
      />
    );

    // Mark stu-2 as LATE
    const lateRadios = screen.getAllByRole("radio", { name: /late/i });
    await user.click(lateRadios[1]);

    await user.click(screen.getByRole("button", { name: /save attendance/i }));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith({
        sectionId: "sec-1",
        sessionId: "sess-1",
        date: new Date("2026-06-03"),
        records: [
          { studentId: "stu-1", status: "PRESENT" },
          { studentId: "stu-2", status: "LATE" },
          { studentId: "stu-3", status: "PRESENT" },
        ],
      });
    });
  });

  it("shows a loading state while submitting", async () => {
    const user = userEvent.setup();
    const slowSubmit = jest.fn(() => new Promise((r) => setTimeout(r, 500)));

    render(
      <AttendanceForm
        students={students}
        sectionId="sec-1"
        sessionId="sess-1"
        date={new Date("2026-06-03")}
        onSubmit={slowSubmit}
      />
    );

    await user.click(screen.getByRole("button", { name: /save attendance/i }));

    expect(screen.getByRole("button", { name: /saving/i })).toBeDisabled();
  });

  it("has a Mark All Present button that sets everyone to PRESENT", async () => {
    const user = userEvent.setup();
    render(
      <AttendanceForm
        students={students}
        sectionId="sec-1"
        sessionId="sess-1"
        date={new Date("2026-06-03")}
        onSubmit={onSubmit}
      />
    );

    // First mark someone absent
    const absentRadios = screen.getAllByRole("radio", { name: /absent/i });
    await user.click(absentRadios[0]);

    // Then reset with the bulk button
    await user.click(screen.getByRole("button", { name: /mark all present/i }));

    const presentRadios = screen.getAllByRole("radio", { name: /present/i });
    presentRadios.forEach((r) => expect(r).toBeChecked());
  });
});
