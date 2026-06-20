import { randomBytes } from "crypto";

/**
 * Generates a unique, reasonably memorable temporary password for an
 * auto-created account. Avoids shared defaults (e.g. "Student@1234") that make
 * every account guessable. Returned once to the admin at creation time.
 * Example: "Skula-7Kp2Qm"
 */
export function generateTempPassword(): string {
  const token = randomBytes(6).toString("base64url").replace(/[-_]/g, "").slice(0, 8);
  return `Skula-${token}`;
}
