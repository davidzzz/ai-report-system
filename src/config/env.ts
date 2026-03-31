import dotenv from "dotenv";

dotenv.config();

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

function toPositiveInt(input: string | undefined, fallback: number): number {
  if (!input) return fallback;
  const parsed = Number(input);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}

export const env = {
  port: toPositiveInt(process.env.PORT, 3000),
  openAiApiKey: requireEnv("OPENAI_API_KEY"),
  openAiModel: process.env.OPENAI_MODEL ?? "gpt-4.1-mini",
  reportRateLimitWindowMs: toPositiveInt(process.env.REPORT_RATE_LIMIT_WINDOW_MS, 60_000),
  reportRateLimitMax: toPositiveInt(process.env.REPORT_RATE_LIMIT_MAX, 30),
  openAiTimeoutMs: toPositiveInt(process.env.OPENAI_TIMEOUT_MS, 12_000),
  openAiRetryAttempts: toPositiveInt(process.env.OPENAI_RETRY_ATTEMPTS, 3),
  openAiRetryBaseDelayMs: toPositiveInt(process.env.OPENAI_RETRY_BASE_DELAY_MS, 300),
  openAiRetryMaxDelayMs: toPositiveInt(process.env.OPENAI_RETRY_MAX_DELAY_MS, 2_000),
  openAiRetryJitterMs: toPositiveInt(process.env.OPENAI_RETRY_JITTER_MS, 150)
};
