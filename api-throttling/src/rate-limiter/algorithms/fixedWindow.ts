import { RateLimiterAlgorithm } from "./rateLimiterAlgorithm";
import { StorageStrategy } from "../storage/storageStrategy";
import { ClientConfig } from "../../config/clients";

export class FixedWindowLimiter implements RateLimiterAlgorithm {
  async isAllowed(clientId: string, config: ClientConfig, storage: StorageStrategy): Promise<boolean> {
    const windowKey = Math.floor(Date.now() / config.fixedWindowMs);
    const key = `fixed:${clientId}:${windowKey}`;

    const currentRequests = await storage.incr(key, config.fixedWindowMs);
    return currentRequests <= config.fixedWindowLimit;
  }
}