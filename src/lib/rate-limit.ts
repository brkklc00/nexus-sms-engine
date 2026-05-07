import { redis } from "@/lib/redis";

export async function applyRateLimit(key: string, limit: number, windowSec: number) {
  await redis.connect().catch(() => undefined);
  const now = Math.floor(Date.now() / 1000);
  const bucket = `${key}:${Math.floor(now / windowSec)}`;
  const count = await redis.incr(bucket);
  if (count === 1) {
    await redis.expire(bucket, windowSec);
  }
  return {
    ok: count <= limit,
    count,
    limit,
  };
}
