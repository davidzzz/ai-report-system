export interface LogMeta {
  [key: string]: unknown;
}

function write(level: "info" | "warn" | "error", message: string, meta?: LogMeta): void {
  const payload = {
    level,
    message,
    timestamp: new Date().toISOString(),
    ...(meta ?? {})
  };

  const serialized = JSON.stringify(payload);
  if (level === "error") {
    // eslint-disable-next-line no-console
    console.error(serialized);
    return;
  }

  // eslint-disable-next-line no-console
  console.log(serialized);
}

export const logger = {
  info: (message: string, meta?: LogMeta) => write("info", message, meta),
  warn: (message: string, meta?: LogMeta) => write("warn", message, meta),
  error: (message: string, meta?: LogMeta) => write("error", message, meta)
};
