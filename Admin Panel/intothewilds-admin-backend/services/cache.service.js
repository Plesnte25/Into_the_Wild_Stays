let client = null;
let mem = new Map();

const url = process.env.REDIS_URL;

if (url) {
  const { createClient } = await import("redis");
  client = createClient({ url });
  client.on("error", (e) => console.warn("Redis error", e.message));
  client
    .connect()
    .then(() => console.log("Redis connected"))
    .catch(() => {});
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
    await client.set(key, JSON.stringify(value), { EX: ttlSec });
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
