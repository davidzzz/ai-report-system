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
  reportRateLimitMax: toPositiveInt(process.env.REPORT_RATE_LIMIT_MAX, 30)
};
