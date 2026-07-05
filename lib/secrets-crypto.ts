import crypto from "crypto";

// Encryption-at-rest for provider credentials (SMS/WhatsApp/email/payment
// configs). AES-256-GCM with a key from CONFIG_SECRETS_KEY (64 hex chars).
//
// Stored format: enc:v1:<iv b64>:<authTag b64>:<ciphertext b64>
// - encryptSecret() no-ops on blank values and on already-encrypted values,
//   so keepSecret() round-trips can never double-encrypt.
// - decryptSecret() passes through legacy plaintext rows (no prefix), so the
//   backfill can run at any time without breaking senders in between.
// - Without the env key, encryption is skipped with a one-time warning
//   (self-hosted installs keep today's behavior); decryption of an encrypted
//   value without the key returns "" so senders treat it as unconfigured
//   instead of authenticating with garbage.

const PREFIX = "enc:v1:";
let warned = false;

function getKey(): Buffer | null {
  const hex = process.env.CONFIG_SECRETS_KEY;
  if (!hex || !/^[0-9a-fA-F]{64}$/.test(hex)) {
    if (hex && !warned) { console.warn("[secrets] CONFIG_SECRETS_KEY is set but not 64 hex chars — ignoring"); warned = true; }
    return null;
  }
  return Buffer.from(hex, "hex");
}

export function encryptSecret(value: string | null | undefined): string {
  if (!value) return value ?? "";
  if (value.startsWith(PREFIX)) return value; // already encrypted
  const key = getKey();
  if (!key) {
    if (!warned) { console.warn("[secrets] CONFIG_SECRETS_KEY unset — storing provider credentials unencrypted"); warned = true; }
    return value;
  }
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);
  const ct = Buffer.concat([cipher.update(value, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return PREFIX + [iv.toString("base64"), tag.toString("base64"), ct.toString("base64")].join(":");
}

export function decryptSecret(value: string | null | undefined): string {
  if (!value) return value ?? "";
  if (!value.startsWith(PREFIX)) return value; // legacy plaintext
  const key = getKey();
  if (!key) {
    if (!warned) { console.warn("[secrets] encrypted credential found but CONFIG_SECRETS_KEY unset — treating as unconfigured"); warned = true; }
    return "";
  }
  try {
    const [ivB64, tagB64, ctB64] = value.slice(PREFIX.length).split(":");
    const decipher = crypto.createDecipheriv("aes-256-gcm", key, Buffer.from(ivB64, "base64"));
    decipher.setAuthTag(Buffer.from(tagB64, "base64"));
    return Buffer.concat([decipher.update(Buffer.from(ctB64, "base64")), decipher.final()]).toString("utf8");
  } catch {
    console.warn("[secrets] failed to decrypt a stored credential (key changed?) — treating as unconfigured");
    return "";
  }
}

// Copy of obj with the given fields decrypted — for senders that consume configs.
export function decryptSecrets<T extends Record<string, any> | null>(obj: T, fields: string[]): T {
  if (!obj) return obj;
  const out: any = { ...obj };
  for (const f of fields) out[f] = decryptSecret(out[f]);
  return out;
}
