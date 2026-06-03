import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SignInForm } from "@/components/SignInForm";

describe("SignInForm", () => {
  const onSubmit = jest.fn();

  beforeEach(() => jest.clearAllMocks());

  it("renders email and password fields", () => {
    render(<SignInForm onSubmit={onSubmit} />);
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
  });

  it("renders a sign in button", () => {
    render(<SignInForm onSubmit={onSubmit} />);
    expect(screen.getByRole("button", { name: /sign in/i })).toBeInTheDocument();
  });

  it("calls onSubmit with email and password on valid submission", async () => {
    const user = userEvent.setup();
    onSubmit.mockResolvedValue(undefined);
    render(<SignInForm onSubmit={onSubmit} />);

    await user.type(screen.getByLabelText(/email/i), "admin@school.edu");
    await user.type(screen.getByLabelText(/password/i), "Secret123!");
    await user.click(screen.getByRole("button", { name: /sign in/i }));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith({
        email: "admin@school.edu",
        password: "Secret123!",
      });
    });
  });

  it("shows a validation error when email is empty", async () => {
    const user = userEvent.setup();
    render(<SignInForm onSubmit={onSubmit} />);

    await user.type(screen.getByLabelText(/password/i), "Secret123!");
    await user.click(screen.getByRole("button", { name: /sign in/i }));

    expect(await screen.findByRole("alert")).toHaveTextContent(/email.*required/i);
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("shows a validation error when password is empty", async () => {
    const user = userEvent.setup();
    render(<SignInForm onSubmit={onSubmit} />);

    await user.type(screen.getByLabelText(/email/i), "admin@school.edu");
    await user.click(screen.getByRole("button", { name: /sign in/i }));

    expect(await screen.findByRole("alert")).toHaveTextContent(/password.*required/i);
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("shows a validation error for invalid email format", async () => {
    const user = userEvent.setup();
    render(<SignInForm onSubmit={onSubmit} />);

    await user.type(screen.getByLabelText(/email/i), "not-an-email");
    await user.type(screen.getByLabelText(/password/i), "Secret123!");
    await user.click(screen.getByRole("button", { name: /sign in/i }));

    expect(await screen.findByRole("alert")).toHaveTextContent(/valid email/i);
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("shows a loading state while signing in", async () => {
    const user = userEvent.setup();
    const slowSubmit = jest.fn(() => new Promise((r) => setTimeout(r, 500)));
    render(<SignInForm onSubmit={slowSubmit} />);

    await user.type(screen.getByLabelText(/email/i), "admin@school.edu");
    await user.type(screen.getByLabelText(/password/i), "Secret123!");
    await user.click(screen.getByRole("button", { name: /sign in/i }));

    expect(screen.getByRole("button", { name: /signing in/i })).toBeDisabled();
  });

  it("shows an error message when onSubmit rejects", async () => {
    const user = userEvent.setup();
    onSubmit.mockRejectedValue(new Error("Invalid credentials"));
    render(<SignInForm onSubmit={onSubmit} />);

    await user.type(screen.getByLabelText(/email/i), "admin@school.edu");
    await user.type(screen.getByLabelText(/password/i), "WrongPass!");
    await user.click(screen.getByRole("button", { name: /sign in/i }));

    expect(await screen.findByRole("alert")).toHaveTextContent(/invalid credentials/i);
  });

  it("clears the error when the user starts typing again", async () => {
    const user = userEvent.setup();
    onSubmit.mockRejectedValue(new Error("Invalid credentials"));
    render(<SignInForm onSubmit={onSubmit} />);

    await user.type(screen.getByLabelText(/email/i), "admin@school.edu");
    await user.type(screen.getByLabelText(/password/i), "WrongPass!");
    await user.click(screen.getByRole("button", { name: /sign in/i }));

    await screen.findByRole("alert");
    await user.type(screen.getByLabelText(/password/i), "x");

    await waitFor(() => {
      expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    });
  });
});
