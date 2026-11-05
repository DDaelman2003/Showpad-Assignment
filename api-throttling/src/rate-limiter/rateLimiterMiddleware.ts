import { Response, NextFunction } from "express";
import { AuthenticatedRequest } from "../middleware/auth";
import { StorageStrategy } from "./storage/storageStrategy";
import { RateLimiterAlgorithm } from "./algorithms/rateLimiterAlgorithm";
import { CLIENT_CONFIGS } from "../config/clients";
import { MemoryStorage } from "./storage/memoryStorage";

// Optionele fallback storage als Redis uitvalt
const fallbackStorage = new MemoryStorage();

export const createRateLimiter = (algorithm: RateLimiterAlgorithm, storage: StorageStrategy) => {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const clientId = req.clientId;

      if (!clientId || !CLIENT_CONFIGS[clientId]) {
        return res.status(403).json({ error: "Unauthorized client or missing config" });
      }

      const config = CLIENT_CONFIGS[clientId];
      
      let allowed = false;
      try {
        // Probeer de gekozen storage te gebruiken
        allowed = await algorithm.isAllowed(clientId, config, storage);
      } catch (storageError) {
        console.warn("Storage (bijv. Redis) faalde, valt tijdelijk terug op in-memory:", storageError);
        // Fallback naar in-memory storage zodat de request alsnog lukt in plaats van te crashen
        allowed = await algorithm.isAllowed(clientId, config, fallbackStorage);
      }

      if (!allowed) {
        return res.status(429).json({ error: "rate limit exceeded" });
      }

      next();
    } catch (error) {
      console.error("Onverwachte fout in rate limiter middleware:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  };
};