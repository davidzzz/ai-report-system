const RETRYABLE_STATUS_CODES = new Set([408, 409, 429, 500, 502, 503, 504]);

export interface OpenAiErrorMeta {
  status: number | null;
  code: string | null;
  type: string | null;
  message: string;
  retryable: boolean;
}

export function parseOpenAiError(error: unknown): OpenAiErrorMeta {
  if (!error || typeof error !== "object") {
    return {
      status: null,
      code: null,
      type: null,
      message: String(error ?? "Unknown error"),
      retryable: false
    };
  }

  const candidate = error as {
    status?: number;
    code?: string;
    type?: string;
    message?: string;
    error?: { code?: string; type?: string; message?: string };
  };

  const status = typeof candidate.status === "number" ? candidate.status : null;
  const code =
    typeof candidate.code === "string"
      ? candidate.code
      : typeof candidate.error?.code === "string"
        ? candidate.error.code
        : null;
  const type =
    typeof candidate.type === "string"
      ? candidate.type
      : typeof candidate.error?.type === "string"
        ? candidate.error.type
        : null;
  const message =
    typeof candidate.message === "string"
      ? candidate.message
      : typeof candidate.error?.message === "string"
        ? candidate.error.message
        : "Unknown error";

  return {
    status,
    code,
    type,
    message,
    retryable: status !== null ? RETRYABLE_STATUS_CODES.has(status) : true
  };
}
