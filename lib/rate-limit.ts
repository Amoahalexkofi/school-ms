// Lightweight, in-memory rate limiting for low-volume, already-authenticated
// endpoints (e.g. "Send Test" buttons) that could otherwise be hammered to
// drain a school's SMS/email provider credits. Deliberately not backed by
// Redis/Upstash — this is a soft speed bump for a low-severity abuse case,
// not a hard guarantee: it resets on cold start and isn't shared across
// concurrent serverless instances. Good enough for its purpose without
// adding new infrastructure just for this.
const buckets = new Map<string, number[]>();

export function isRateLimited(key: string, maxHits: number, windowMs: number): boolean {
  const now = Date.now();
  const hits = (buckets.get(key) ?? []).filter((t) => now - t < windowMs);
  if (hits.length >= maxHits) {
    buckets.set(key, hits);
    return true;
  }
  hits.push(now);
  buckets.set(key, hits);
  return false;
}
