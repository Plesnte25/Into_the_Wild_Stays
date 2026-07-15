// Uses ioredis (already a project dependency, and the client bullmq expects
// too — see KNOWN_ISSUES.md) when REDIS_URL is set; otherwise falls back to
// an in-memory Map so single-instance/dev deployments keep working.
let client = null;
let mem = new Map();

const url = process.env.REDIS_URL;

if (url) {
  const { default: Redis } = await import("ioredis");
  client = new Redis(url);
  client.on("error", (e) => console.warn("Redis error", e.message));
  client.on("connect", () => console.log("Redis connected"));
}

export async function getCache(key) {
  if (client) {
    const v = await client.get(key);
    return v ? JSON.parse(v) : null;
  }
  return mem.has(key) ? mem.get(key) : null;
}

export async function setCache(key, value, ttlSec = 300) {
  if (client) {
    await client.set(key, JSON.stringify(value), "EX", ttlSec);
    return;
  }
  mem.set(key, value);
  setTimeout(() => mem.delete(key), ttlSec * 1000).unref?.();
}

export async function withCache(key, ttlSec, fn) {
  const cached = await getCache(key);
  if (cached) return cached;
  const data = await fn();
  await setCache(key, data, ttlSec);
  return data;
}
