import { Response, NextFunction } from "express";
import { AuthenticatedRequest } from "../middleware/auth";
import { StorageStrategy } from "./storage/storageStrategy";
import { RateLimiterAlgorithm } from "./algorithms/rateLimiterAlgorithm";
import { CLIENT_CONFIGS } from "../config/clients";

export const createRateLimiter = (algorithm: RateLimiterAlgorithm, storage: StorageStrategy) => {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const clientId = req.clientId;

    if (!clientId || !CLIENT_CONFIGS[clientId]) {
      return res.status(403).json({ error: "Unauthorized client or missing config" });
    }

    const config = CLIENT_CONFIGS[clientId];
    const allowed = await algorithm.isAllowed(clientId, config, storage);

    if (!allowed) {
      return res.status(429).json({ error: "rate limit exceeded" });
    }

    next();
  };
};