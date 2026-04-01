import OpenAI from "openai";
import { ResponseStreamEvent } from "openai/resources/responses/responses";
import { env } from "../config/env";
import { logger } from "../utils/logger";
import { parseOpenAiError } from "../utils/openai-error";
import { PromptBuilder } from "../utils/prompt-builder";
import { PreprocessedSalesContext, SalesSummary, StructuredInsights } from "../types/sales";

const MAX_PROMPT_CHARACTERS = 12_000;
const AI_SCHEMA = {
  name: "business_insights",
  strict: true,
  schema: {
    type: "object",
    additionalProperties: false,
    required: ["executiveSummary", "keyInsights", "problems", "recommendations"],
    properties: {
      executiveSummary: { type: "string" },
      keyInsights: {
        type: "array",
        items: { type: "string" },
        minItems: 3,
        maxItems: 3
      },
      problems: {
        type: "array",
        items: { type: "string" },
        minItems: 2,
        maxItems: 2
      },
      recommendations: {
        type: "array",
        items: { type: "string" },
        minItems: 3,
        maxItems: 3
      }
    }
  }
} as const;

interface InsightsInput {
  context: PreprocessedSalesContext;
  summary: SalesSummary;
}

export class AiService {
  private readonly client: OpenAI;

  constructor() {
    this.client = new OpenAI({ apiKey: env.openAiApiKey });
  }

  async generateInsights(input: InsightsInput): Promise<StructuredInsights> {
    if (this.shouldUseFallbackInsights(input)) {
      return this.buildFallbackInsights(input.context);
    }

    const prompt = PromptBuilder.buildBusinessInsightsPrompt(input);
    this.assertInputWithinSizeLimit(prompt);

    return this.generateInsightsWithRetry(prompt);
  }

  async *streamInsights(input: InsightsInput): AsyncGenerator<string> {
    if (this.shouldUseFallbackInsights(input)) {
      yield JSON.stringify(this.buildFallbackInsights(input.context));
      return;
    }

    const prompt = PromptBuilder.buildBusinessInsightsPrompt(input);
    this.assertInputWithinSizeLimit(prompt);

    try {
      const stream = await this.executeWithRetry<AsyncIterable<ResponseStreamEvent>>(
        async () => this.client.responses.stream(this.buildRequest(prompt), { timeout: env.openAiTimeoutMs }),
        "streamInsights.start"
      );

      for await (const event of stream) {
        if (this.isTextDeltaEvent(event) && event.delta) {
          yield event.delta;
        }
      }
    } catch (error) {
      logger.error("AI stream request failed", { error: this.formatError(error) });
      throw error;
    }
  }

  private async generateInsightsWithRetry(prompt: string): Promise<StructuredInsights> {
    return this.executeWithRetry(async () => {
      const response = await this.client.responses.parse<
        ReturnType<AiService["buildRequest"]>,
        StructuredInsights
      >(this.buildRequest(prompt), { timeout: env.openAiTimeoutMs });

      if (!response.output_parsed) {
        throw new Error("AI service did not return parsed structured output.");
      }

      return this.validateStructuredInsights(response.output_parsed);
    }, "generateInsights");
  }

  private buildRequest(prompt: string) {
    return {
      model: env.openAiModel,
      input: prompt,
      temperature: 0,
      text: {
        format: {
          type: "json_schema" as const,
          name: AI_SCHEMA.name,
          schema: AI_SCHEMA.schema,
          strict: true
        }
      }
    };
  }

  private async executeWithRetry<T>(operation: () => Promise<T>, label: string): Promise<T> {
    let lastError: unknown;

    for (let attempt = 1; attempt <= env.openAiRetryAttempts; attempt += 1) {
      try {
        return await operation();
      } catch (error) {
        lastError = error;
        const errorMeta = parseOpenAiError(error);
        const retryable = errorMeta.retryable;
        logger.warn("AI request attempt failed", {
          label,
          attempt,
          retryable: errorMeta.retryable,
          status: errorMeta.status,
          code: errorMeta.code,
          type: errorMeta.type,
          error: errorMeta.message
        });

        if (!retryable || attempt >= env.openAiRetryAttempts) {
          break;
        }

        await this.sleep(this.getBackoffDelay(attempt));
      }
    }

    throw new Error(`AI service failed after retries: ${this.formatError(lastError)}`);
  }

  private validateStructuredInsights(candidate: unknown): StructuredInsights {
    if (!candidate || typeof candidate !== "object") {
      throw new Error("AI response schema is invalid.");
    }

    const record = candidate as Record<string, unknown>;
    const executiveSummary = record.executiveSummary;
    const keyInsights = record.keyInsights;
    const problems = record.problems;
    const recommendations = record.recommendations;

    if (
      typeof executiveSummary !== "string" ||
      !this.isStringArrayOfLength(keyInsights, 3) ||
      !this.isStringArrayOfLength(problems, 2) ||
      !this.isStringArrayOfLength(recommendations, 3)
    ) {
      throw new Error("AI response schema is invalid.");
    }

    return {
      executiveSummary,
      keyInsights,
      problems,
      recommendations
    };
  }

  private shouldUseFallbackInsights(input: InsightsInput): boolean {
    return (
      input.context.recordCount < 2 ||
      input.summary.totalOrders < 2 ||
      (input.summary.totalSales === 0 && input.summary.averageOrderValue === 0)
    );
  }

  private buildFallbackInsights(context: PreprocessedSalesContext): StructuredInsights {
    return {
      executiveSummary:
        "Available sales data is too limited for reliable trend analysis. Add more complete records for stronger insight quality.",
      keyInsights: [
        `Only ${context.recordCount} record(s) are available in the selected period.`,
        "Current data volume is insufficient to infer stable business patterns.",
        "Key performance comparisons may be noisy until more transactions are collected."
      ],
      problems: [
        "Low sample size limits confidence in generated insights.",
        "Decision risk is elevated because trend signals are weak."
      ],
      recommendations: [
        "Provide at least several days of records before requesting strategic analysis.",
        "Verify missing or incomplete transactions in the source system.",
        "Treat this output as preliminary until higher-quality data is available."
      ]
    };
  }

  private isStringArrayOfLength(value: unknown, length: number): value is string[] {
    return Array.isArray(value) && value.length === length && value.every((item) => typeof item === "string");
  }

  private getBackoffDelay(attempt: number): number {
    const base = env.openAiRetryBaseDelayMs * 2 ** (attempt - 1);
    const jitter = Math.floor(Math.random() * env.openAiRetryJitterMs);
    return Math.min(base + jitter, env.openAiRetryMaxDelayMs);
  }

  private isTextDeltaEvent(event: ResponseStreamEvent): event is ResponseStreamEvent & { delta: string } {
    return event.type === "response.output_text.delta";
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  private formatError(error: unknown): string {
    return parseOpenAiError(error).message;
  }

  private assertInputWithinSizeLimit(prompt: string): void {
    if (prompt.length > MAX_PROMPT_CHARACTERS) {
      throw new Error(`Prompt is too large (${prompt.length} chars). Maximum is ${MAX_PROMPT_CHARACTERS}.`);
    }
  }
}
