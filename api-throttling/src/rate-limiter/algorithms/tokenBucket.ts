import { RateLimiterAlgorithm } from "./rateLimiterAlgorithm";
import { StorageStrategy } from "../storage/storageStrategy";
import { ClientConfig } from "../../config/clients";

export class TokenBucketLimiter implements RateLimiterAlgorithm {
  async isAllowed(clientId: string, config: ClientConfig, storage: StorageStrategy): Promise<boolean> {
    const key = `bucket:${clientId}`;
    const now = Date.now();

    const data = await storage.hgetall(key);
    
    let tokens = data.tokens ? parseFloat(data.tokens) : config.bucketCapacity;
    let lastRefill = data.lastRefill ? parseInt(data.lastRefill, 10) : now;

    // Vul tokens aan op basis van verstreken tijd
    const timePassedSec = (now - lastRefill) / 1000;
    tokens = Math.min(config.bucketCapacity, tokens + timePassedSec * config.refillRatePerSec);

    if (tokens >= 1) {
      tokens -= 1;
      await storage.hmset(key, { tokens: tokens.toString(), lastRefill: now.toString() }, 60000);
      return true;
    }

    await storage.hmset(key, { tokens: tokens.toString(), lastRefill: lastRefill.toString() }, 60000);
    return false;
  }
}