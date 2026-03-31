import OpenAI from "openai";
import { env } from "../config/env";
import { AggregatedSales, PreprocessedSalesContext, StructuredInsights } from "../types/sales";
import { PromptBuilder } from "../utils/prompt-builder";

export class AiService {
  private readonly client: OpenAI;

  constructor() {
    this.client = new OpenAI({ apiKey: env.openAiApiKey });
  }

  async generateInsights(input: {
    context: PreprocessedSalesContext;
    aggregated: AggregatedSales;
  }): Promise<StructuredInsights> {
    const prompt = PromptBuilder.buildBusinessInsightsPrompt(input);

    const response = await this.client.responses.create({
      model: env.openAiModel,
      input: prompt,
      temperature: 0.2
    });

    const raw = response.output_text?.trim();
    if (!raw) {
      throw new Error("AI service returned an empty response.");
    }

    return this.parseStructuredOutput(raw);
  }

  private parseStructuredOutput(raw: string): StructuredInsights {
    try {
      const cleaned = raw.replace(/^```json\s*/i, "").replace(/```$/i, "").trim();
      const parsed = JSON.parse(cleaned) as Partial<StructuredInsights>;

      if (
        typeof parsed.summary !== "string" ||
        !Array.isArray(parsed.insights) ||
        !Array.isArray(parsed.recommendations) ||
        parsed.insights.length !== 3 ||
        parsed.recommendations.length !== 3
      ) {
        throw new Error("AI response schema is invalid.");
      }

      return {
        summary: parsed.summary,
        insights: parsed.insights.map(String),
        recommendations: parsed.recommendations.map(String)
      };
    } catch (error) {
      throw new Error(`Failed to parse AI output: ${(error as Error).message}`);
    }
  }
}
