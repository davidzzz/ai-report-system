import { NextFunction, Request, Response } from "express";
import { ApiFailure } from "../utils/api-response";
import { HttpError, isHttpError } from "../utils/http-error";
import { logger } from "../utils/logger";

export function notFoundHandler(req: Request, _res: Response, next: NextFunction): void {
  next(new HttpError(404, `Route not found: ${req.method} ${req.originalUrl}`, { code: "ROUTE_NOT_FOUND" }));
}

export function errorHandler(error: unknown, req: Request, res: Response, _next: NextFunction): void {
  const requestId = String(req.headers["x-request-id"] ?? "unknown");

  if (isHttpError(error)) {
    const body: ApiFailure = {
      success: false,
      error: {
        code: error.code,
        message: error.message,
        requestId,
        details: error.details
      }
    };

    logger.warn("http_error", { requestId, statusCode: error.statusCode, code: error.code });
    res.status(error.statusCode).json(body);
    return;
  }

  logger.error("unhandled_error", { requestId, error: error instanceof Error ? error.message : error });

  const body: ApiFailure = {
    success: false,
    error: {
      code: "INTERNAL_SERVER_ERROR",
      message: "Internal server error",
      requestId
    }
  };

  res.status(500).json(body);
}
