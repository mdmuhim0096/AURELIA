const memory = globalThis.__rateLimitMemory || new Map();
globalThis.__rateLimitMemory = memory;

async function upstashLimit(key, limit, windowSeconds) {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  const nowWindow = Math.floor(Date.now() / (windowSeconds * 1000));
  const redisKey = `rl:${key}:${nowWindow}`;
  const response = await fetch(`${url}/pipeline`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify([["INCR", redisKey], ["EXPIRE", redisKey, windowSeconds]])
  });
  if (!response.ok) return null;
  const data = await response.json();
  return Number(data?.[0]?.result || 0) <= limit;
}

export async function rateLimit(key, { limit = 10, windowSeconds = 60 } = {}) {
  try {
    const remote = await upstashLimit(key, limit, windowSeconds);
    if (remote !== null) return remote;
  } catch (error) {
    console.warn("Rate limit provider unavailable", error?.message);
  }
  const now = Date.now();
  const current = memory.get(key);
  if (!current || current.expiresAt <= now) {
    memory.set(key, { count: 1, expiresAt: now + windowSeconds * 1000 });
    return true;
  }
  current.count += 1;
  memory.set(key, current);
  return current.count <= limit;
}

export function requestKey(request, scope = "api") {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "unknown";
  return `${scope}:${ip}`;
}
