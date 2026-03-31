import express, { Request, Response } from "express";
import { env } from "./config/env";
import { errorHandler, notFoundHandler } from "./middlewares/error-handler";
import { createRateLimiter } from "./middlewares/rate-limit";
import { requestLogger } from "./middlewares/request-logger";
import { reportRouter } from "./routes/report.routes";
import { sendSuccess } from "./utils/api-response";
import { logger } from "./utils/logger";

const app = express();

app.use(express.json({ limit: "1mb" }));
app.use(requestLogger);

app.get("/health", (_req: Request, res: Response) => {
  sendSuccess(res, 200, { status: "ok" });
});

app.use(
  "/report",
  createRateLimiter({
    windowMs: env.reportRateLimitWindowMs,
    maxRequests: env.reportRateLimitMax
  }),
  reportRouter
);

app.use(notFoundHandler);
app.use(errorHandler);

app.listen(env.port, () => {
  logger.info("server_started", { port: env.port, baseUrl: `http://localhost:${env.port}` });
});
