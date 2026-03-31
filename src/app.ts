import express, { NextFunction, Request, Response } from "express";
import { env } from "./config/env";
import { reportRouter } from "./routes/report.routes";
import { HttpError } from "./utils/http-error";

const app = express();

app.use(express.json({ limit: "1mb" }));

app.get("/health", (_req: Request, res: Response) => {
  res.status(200).json({ status: "ok" });
});

app.use("/report", reportRouter);

app.use((req: Request, _res: Response, next: NextFunction) => {
  next(new HttpError(404, `Route not found: ${req.method} ${req.originalUrl}`));
});

app.use((err: Error | HttpError, _req: Request, res: Response, _next: NextFunction) => {
  const statusCode = err instanceof HttpError ? err.statusCode : 500;
  const message = statusCode === 500 ? "Internal server error" : err.message;

  if (statusCode === 500) {
    // eslint-disable-next-line no-console
    console.error(err);
  }

  res.status(statusCode).json({ error: message });
});

app.listen(env.port, () => {
  // eslint-disable-next-line no-console
  console.log(`Server is running on http://localhost:${env.port}`);
});
