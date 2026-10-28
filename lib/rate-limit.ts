import { Redis } from "@upstash/redis";
import { Ratelimit } from "@upstash/ratelimit";

export const inquiryRateLimit = new Ratelimit({
    redis: Redis.fromEnv(),
    limiter: Ratelimit.slidingWindow(5, "10 m"),
    prefix: "society:inquiry",
});