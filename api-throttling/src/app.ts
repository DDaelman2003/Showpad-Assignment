import express, { Request, Response, NextFunction } from "express";
import { authenticate } from "./middleware/auth";
import { createRateLimiter } from "./rate-limiter/rateLimiterMiddleware";
import { FixedWindowLimiter } from "./rate-limiter/algorithms/fixedWindow";
import { TokenBucketLimiter } from "./rate-limiter/algorithms/tokenBucket";
import { MemoryStorage } from "./rate-limiter/storage/memoryStorage";
import { RedisStorage } from "./rate-limiter/storage/redisStorage";

const app = express();
app.use(express.json());

const memoryStorage = new MemoryStorage();
const redisStorage = new RedisStorage();

const getStorage = (req: Request) => {
  return req.headers["x-storage-type"] === "redis" ? redisStorage : memoryStorage;
};

// Endpoints /foo (Fixed Window)
app.get(
  "/foo",
  authenticate,
  (req: Request, res: Response, next: NextFunction) => {
    const storage = getStorage(req);
    const limiter = createRateLimiter(new FixedWindowLimiter(), storage);
    return limiter(req as any, res, next);
  },
  (req: Request, res: Response) => {
    res.status(200).json({ succes: true });
  }
);

// Endpoints /bar (Token Bucket)
app.get(
  "/bar",
  authenticate,
  (req: Request, res: Response, next: NextFunction) => {
    const storage = getStorage(req);
    const limiter = createRateLimiter(new TokenBucketLimiter(), storage);
    return limiter(req as any, res, next);
  },
  (req: Request, res: Response) => {
    res.status(200).json({ succes: true });
  }
);

const PORT = process.env.PORT || 3000;
if (process.env.NODE_ENV !== "test") {
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

export default app;