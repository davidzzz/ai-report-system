import crypto from "node:crypto";
import { NextFunction, Request, Response } from "express";

export function requestLogger(req: Request, res: Response, next: NextFunction): void {
  const start = process.hrtime.bigint();
  const requestId = crypto.randomUUID();

  req.headers["x-request-id"] = requestId;
  res.setHeader("x-request-id", requestId);

  res.on("finish", () => {
    const durationMs = Number(process.hrtime.bigint() - start) / 1_000_000;
    const event = {
      level: "info",
      requestId,
      method: req.method,
      path: req.originalUrl,
      statusCode: res.statusCode,
      durationMs: Number(durationMs.toFixed(2)),
      timestamp: new Date().toISOString()
    };

    // eslint-disable-next-line no-console
    console.log(JSON.stringify(event));
  });

  next();
}
