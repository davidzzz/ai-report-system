import OpenAI from "openai";
import { env } from "../config/env";
import { PreprocessedSalesContext, SalesSummary, StructuredInsights } from "../types/sales";
import { PromptBuilder } from "../utils/prompt-builder";

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
        typeof parsed.executiveSummary !== "string" ||
        !Array.isArray(parsed.keyInsights) ||
        !Array.isArray(parsed.problems) ||
        !Array.isArray(parsed.recommendations) ||
        parsed.keyInsights.length !== 3 ||
        parsed.problems.length !== 2 ||
        parsed.recommendations.length !== 3
      ) {
        throw new Error("AI response schema is invalid.");
      }

      return {
        executiveSummary: parsed.executiveSummary,
        keyInsights: parsed.keyInsights.map(String),
        problems: parsed.problems.map(String),
        recommendations: parsed.recommendations.map(String)
      };
    } catch (error) {
      throw new Error(`Failed to parse AI output: ${(error as Error).message}`);
    }
  }
}
