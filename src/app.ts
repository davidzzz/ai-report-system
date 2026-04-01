import express, { Request, Response } from "express";
import { env } from "./config/env";
import { errorHandler, notFoundHandler } from "./middlewares/error-handler";
import { createRateLimiter } from "./middlewares/rate-limit";
import { requestLogger } from "./middlewares/request-logger";
import { reportRouter } from "./routes/report.routes";
import { sendSuccess } from "./utils/api-response";
import { logger } from "./utils/logger";

const app = express();

app.use(requestLogger);

app.get("/health", (_req: Request, res: Response) => {
  sendSuccess(res, 200, { status: "ok" });
});

app.use(
  "/report",
  express.json({ limit: `${env.reportPayloadLimitKb}kb` }),
  createRateLimiter({
    windowMs: env.reportRateLimitWindowMs,
    maxRequests: env.reportRateLimitMax
  }),
  reportRouter
);

app.get("/ready", (_req: Request, res: Response) => {
  const checks = {
    openAiApiKeyConfigured: Boolean(env.openAiApiKey),
    openAiModelConfigured: Boolean(env.openAiModel.trim()),
    reportPayloadLimitKb: env.reportPayloadLimitKb,
    uptimeSeconds: Math.floor(process.uptime())
  };
  const ok = checks.openAiApiKeyConfigured && checks.openAiModelConfigured;

  sendSuccess(res, ok ? 200 : 503, {
    status: ok ? "ready" : "not_ready",
    checks
  });
});

app.use(notFoundHandler);
app.use(errorHandler);

app.listen(env.port, () => {
  logger.info("server_started", { port: env.port, baseUrl: `http://localhost:${env.port}` });
});
