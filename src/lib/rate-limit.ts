const attempts = new Map<string, { count: number; lastAttempt: number }>();

const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000;
const BLOCK_MS = 15 * 60 * 1000;

export function checkRateLimit(identifier: string): { allowed: boolean; retryAfterMs?: number } {
  const now = Date.now();
  const record = attempts.get(identifier);

  if (!record) {
    attempts.set(identifier, { count: 1, lastAttempt: now });
    return { allowed: true };
  }

  if (now - record.lastAttempt > WINDOW_MS) {
    attempts.set(identifier, { count: 1, lastAttempt: now });
    return { allowed: true };
  }

  if (record.count >= MAX_ATTEMPTS) {
    const retryAfterMs = BLOCK_MS - (now - record.lastAttempt);
    return { allowed: false, retryAfterMs: Math.max(retryAfterMs, 0) };
  }

  record.count++;
  return { allowed: true };
}

export function resetRateLimit(identifier: string) {
  attempts.delete(identifier);
}

setInterval(() => {
  const now = Date.now();
  for (const [key, record] of attempts) {
    if (now - record.lastAttempt > WINDOW_MS + BLOCK_MS) {
      attempts.delete(key);
    }
  }
}, 60 * 1000);
