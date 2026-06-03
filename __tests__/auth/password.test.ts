/**
 * @jest-environment node
 */
import { hashPassword, verifyPassword } from "@/lib/auth/password";

describe("hashPassword", () => {
  it("returns a bcrypt hash (starts with $2)", async () => {
    const hash = await hashPassword("Secret123!");
    expect(hash).toMatch(/^\$2/);
  });

  it("returns a different hash each time (salt is random)", async () => {
    const h1 = await hashPassword("Secret123!");
    const h2 = await hashPassword("Secret123!");
    expect(h1).not.toBe(h2);
  });

  it("throws when password is empty", async () => {
    await expect(hashPassword("")).rejects.toThrow("password cannot be empty");
  });

  it("throws when password is shorter than 8 characters", async () => {
    await expect(hashPassword("abc")).rejects.toThrow(
      "password must be at least 8 characters"
    );
  });
});

describe("verifyPassword", () => {
  it("returns true when the password matches the hash", async () => {
    const hash = await hashPassword("Secret123!");
    await expect(verifyPassword("Secret123!", hash)).resolves.toBe(true);
  });

  it("returns false when the password does not match", async () => {
    const hash = await hashPassword("Secret123!");
    await expect(verifyPassword("WrongPass!", hash)).resolves.toBe(false);
  });
});
