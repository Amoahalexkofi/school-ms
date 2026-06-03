import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MarkEntryForm } from "@/components/MarkEntryForm";

const schedule = {
  id: "sched-1",
  subjectName: "Mathematics",
  maxMarks: 100,
  passingMarks: 40,
  hasPractical: false,
};

describe("MarkEntryForm", () => {
  const onSubmit = jest.fn();

  beforeEach(() => jest.clearAllMocks());

  it("renders the subject name and mark limits", () => {
    render(
      <MarkEntryForm
        examSchedule={schedule}
        studentId="stu-1"
        onSubmit={onSubmit}
      />
    );

    expect(screen.getByText(/mathematics/i)).toBeInTheDocument();
    expect(screen.getByText(/max.*100/i)).toBeInTheDocument();
  });

  it("renders only theory marks input when hasPractical is false", () => {
    render(
      <MarkEntryForm
        examSchedule={schedule}
        studentId="stu-1"
        onSubmit={onSubmit}
      />
    );

    expect(screen.getByLabelText(/theory marks/i)).toBeInTheDocument();
    expect(screen.queryByLabelText(/practical marks/i)).not.toBeInTheDocument();
  });

  it("renders both inputs when hasPractical is true", () => {
    render(
      <MarkEntryForm
        examSchedule={{ ...schedule, hasPractical: true }}
        studentId="stu-1"
        onSubmit={onSubmit}
      />
    );

    expect(screen.getByLabelText(/theory marks/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/practical marks/i)).toBeInTheDocument();
  });

  it("submits with entered theory marks", async () => {
    const user = userEvent.setup();
    render(
      <MarkEntryForm
        examSchedule={schedule}
        studentId="stu-1"
        onSubmit={onSubmit}
      />
    );

    await user.type(screen.getByLabelText(/theory marks/i), "78");
    await user.click(screen.getByRole("button", { name: /save marks/i }));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith({
        examScheduleId: "sched-1",
        studentId: "stu-1",
        theoryMarks: 78,
        practicalMarks: undefined,
      });
    });
  });

  it("submits both theory and practical marks", async () => {
    const user = userEvent.setup();
    render(
      <MarkEntryForm
        examSchedule={{ ...schedule, hasPractical: true }}
        studentId="stu-1"
        onSubmit={onSubmit}
      />
    );

    await user.type(screen.getByLabelText(/theory marks/i), "60");
    await user.type(screen.getByLabelText(/practical marks/i), "25");
    await user.click(screen.getByRole("button", { name: /save marks/i }));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith({
        examScheduleId: "sched-1",
        studentId: "stu-1",
        theoryMarks: 60,
        practicalMarks: 25,
      });
    });
  });

  it("shows a validation error when theory marks exceed maxMarks", async () => {
    const user = userEvent.setup();
    render(
      <MarkEntryForm
        examSchedule={schedule}
        studentId="stu-1"
        onSubmit={onSubmit}
      />
    );

    await user.type(screen.getByLabelText(/theory marks/i), "110");
    await user.click(screen.getByRole("button", { name: /save marks/i }));

    expect(await screen.findByRole("alert")).toHaveTextContent(/cannot exceed/i);
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("shows a validation error when marks are negative", async () => {
    const user = userEvent.setup();
    render(
      <MarkEntryForm
        examSchedule={schedule}
        studentId="stu-1"
        onSubmit={onSubmit}
      />
    );

    await user.type(screen.getByLabelText(/theory marks/i), "-5");
    await user.click(screen.getByRole("button", { name: /save marks/i }));

    expect(await screen.findByRole("alert")).toHaveTextContent(/negative/i);
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("disables the button and shows loading text while submitting", async () => {
    const user = userEvent.setup();
    const slowSubmit = jest.fn(() => new Promise((r) => setTimeout(r, 500)));

    render(
      <MarkEntryForm
        examSchedule={schedule}
        studentId="stu-1"
        onSubmit={slowSubmit}
      />
    );

    await user.type(screen.getByLabelText(/theory marks/i), "75");
    await user.click(screen.getByRole("button", { name: /save marks/i }));

    expect(screen.getByRole("button", { name: /saving/i })).toBeDisabled();
  });
});
