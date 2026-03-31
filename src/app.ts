import express, { NextFunction, Request, Response } from "express";
import { env } from "./config/env";
import { createRateLimiter } from "./middlewares/rate-limit";
import { requestLogger } from "./middlewares/request-logger";
import { reportRouter } from "./routes/report.routes";
import { HttpError, isHttpError } from "./utils/http-error";

const app = express();

app.use(express.json({ limit: "1mb" }));
app.use(requestLogger);

app.get("/health", (_req: Request, res: Response) => {
  res.status(200).json({ status: "ok" });
});

app.use(
  "/report",
  createRateLimiter({
    windowMs: env.reportRateLimitWindowMs,
    maxRequests: env.reportRateLimitMax
  }),
  reportRouter
);

app.use((req: Request, _res: Response, next: NextFunction) => {
  next(new HttpError(404, `Route not found: ${req.method} ${req.originalUrl}`, { code: "ROUTE_NOT_FOUND" }));
});

app.use((error: unknown, req: Request, res: Response, _next: NextFunction) => {
  const requestId = String(req.headers["x-request-id"] ?? "unknown");

  if (isHttpError(error)) {
    res.status(error.statusCode).json({
      error: {
        code: error.code,
        message: error.message,
        requestId,
        details: error.details
      }
    });
    return;
  }

  // eslint-disable-next-line no-console
  console.error({ level: "error", requestId, error });

  res.status(500).json({
    error: {
      code: "INTERNAL_SERVER_ERROR",
      message: "Internal server error",
      requestId
    }
  });
});

app.listen(env.port, () => {
  // eslint-disable-next-line no-console
  console.log(`Server is running on http://localhost:${env.port}`);
});
