export const RegexForEmail = /^([a-zA-Z])^/;
export const RegexForPassword = "";

//Rate Limiter here
import { LRUCache } from "lru-cache";

type Options = {
  uniqueTokenPerInterval?: number;
  interval?: number;
};

export default function rateLimit(options?: Options) {
  const tokenCache = new LRUCache({
    max: options?.uniqueTokenPerInterval || 500,
    ttl: options?.interval || 60000,
  });

  const headers = new Headers();

  return {
    check: (limit: number, token: string) =>
      new Promise<void>((resolve, reject) => {
        const tokenCount = (tokenCache.get(token) as number[]) || [0];
        if (tokenCount[0] === 0) {
          tokenCache.set(token, tokenCount);
        }
        tokenCount[0] += 1;

        const currentUsage = tokenCount[0];
        const isRateLimited = currentUsage >= limit;
        headers.set("X-RateLimit-Limit", limit.toString());
        headers.set(
          "X-RateLimit-Remaining",
          String(isRateLimited ? 0 : limit - currentUsage)
        );

        return isRateLimited ? reject() : resolve();
      }),
  };
}
