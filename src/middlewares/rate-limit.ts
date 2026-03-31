import { NextFunction, Request, Response } from "express";
import { HttpError } from "../utils/http-error";

type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();

export function createRateLimiter(options?: { windowMs?: number; maxRequests?: number }) {
  const windowMs = options?.windowMs ?? 60_000;
  const maxRequests = options?.maxRequests ?? 30;

  return (req: Request, _res: Response, next: NextFunction): void => {
    const key = req.ip || "unknown";
    const now = Date.now();
    const current = buckets.get(key);

    if (!current || current.resetAt <= now) {
      buckets.set(key, { count: 1, resetAt: now + windowMs });
      next();
      return;
    }

    current.count += 1;

    if (current.count > maxRequests) {
      next(
        new HttpError(429, "Too many requests. Please retry later.", {
          code: "RATE_LIMIT_EXCEEDED",
          details: { windowMs, maxRequests }
        })
      );
      return;
    }

    next();
  };
}
