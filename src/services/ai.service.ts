import OpenAI from "openai";
import { env } from "../config/env";
import { PreprocessedSalesContext, SalesSummary, StructuredInsights } from "../types/sales";
import { PromptBuilder } from "../utils/prompt-builder";

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

type StreamableResponsesClient = {
  stream?: (params: unknown) => Promise<AsyncIterable<unknown>>;
};

export class AiService {
  private readonly client: OpenAI;

  constructor() {
    this.client = new OpenAI({ apiKey: env.openAiApiKey });
  }

  async generateInsights(input: {
    context: PreprocessedSalesContext;
    summary: SalesSummary;
  }): Promise<StructuredInsights> {
    const prompt = PromptBuilder.buildBusinessInsightsPrompt(input);
    this.assertInputWithinSizeLimit(prompt);

    return this.generateInsightsWithRetry(prompt);
  }

  async *streamInsights(input: {
    context: PreprocessedSalesContext;
    summary: SalesSummary;
  }): AsyncGenerator<string> {
    const prompt = PromptBuilder.buildBusinessInsightsPrompt(input);
    this.assertInputWithinSizeLimit(prompt);

    const streamFactory = (this.client.responses as unknown as StreamableResponsesClient).stream;
    if (!streamFactory) {
      const insights = await this.generateInsightsWithRetry(prompt);
      yield JSON.stringify(insights);
      return;
    }

    const stream = await streamFactory({
      model: env.openAiModel,
      input: prompt,
      temperature: 0.2,
      text: {
        format: {
          type: "json_schema",
          name: AI_SCHEMA.name,
          schema: AI_SCHEMA.schema,
          strict: true
        }
      }
    });

    for await (const event of stream) {
      const typedEvent = event as { type?: string; delta?: string };
      if (typedEvent.type === "response.output_text.delta" && typedEvent.delta) {
        yield typedEvent.delta;
      }
    }
  }

  private async generateInsightsWithRetry(prompt: string): Promise<StructuredInsights> {
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= 2; attempt += 1) {
      try {
        return await this.generateInsightsOnce(prompt);
      } catch (error) {
        lastError = error as Error;
      }
    }

    throw new Error(`AI service failed after retry: ${lastError?.message ?? "Unknown error"}`);
  }

  private async generateInsightsOnce(prompt: string): Promise<StructuredInsights> {
    const response = await this.client.responses.create({
      model: env.openAiModel,
      input: prompt,
      temperature: 0.2,
      text: {
        format: {
          type: "json_schema",
          name: AI_SCHEMA.name,
          schema: AI_SCHEMA.schema,
          strict: true
        }
      }
    });

    const parsed = (response as unknown as { output_parsed?: unknown }).output_parsed;
    if (!parsed) {
      throw new Error("AI service did not return parsed structured output.");
    }

    return this.validateStructuredInsights(parsed);
  }

  private validateStructuredInsights(candidate: unknown): StructuredInsights {
    const parsed = candidate as Partial<StructuredInsights>;

    if (
      typeof parsed.executiveSummary !== "string" ||
      !Array.isArray(parsed.keyInsights) ||
      !Array.isArray(parsed.problems) ||
      !Array.isArray(parsed.recommendations) ||
      parsed.keyInsights.length !== 3 ||
      parsed.problems.length !== 2 ||
      parsed.recommendations.length !== 3 ||
      !parsed.keyInsights.every((item) => typeof item === "string") ||
      !parsed.problems.every((item) => typeof item === "string") ||
      !parsed.recommendations.every((item) => typeof item === "string")
    ) {
      throw new Error("AI response schema is invalid.");
    }

    return {
      executiveSummary: parsed.executiveSummary,
      keyInsights: parsed.keyInsights,
      problems: parsed.problems,
      recommendations: parsed.recommendations
    };
  }

  private assertInputWithinSizeLimit(prompt: string): void {
    if (prompt.length > MAX_PROMPT_CHARACTERS) {
      throw new Error(`Prompt is too large (${prompt.length} chars). Maximum is ${MAX_PROMPT_CHARACTERS}.`);
    }
  }
}
