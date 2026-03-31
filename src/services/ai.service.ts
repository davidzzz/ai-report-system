import OpenAI from "openai";
import { env } from "../config/env";
import { AggregatedSales, StructuredInsights } from "../types/sales";

export class AiService {
  private readonly client: OpenAI;

  constructor() {
    this.client = new OpenAI({ apiKey: env.openAiApiKey });
  }

  async generateInsights(input: {
    companyName?: string;
    period?: string;
    aggregated: AggregatedSales;
  }): Promise<StructuredInsights> {
    const prompt = this.buildPrompt(input);

    const response = await this.client.responses.create({
      model: env.openAiModel,
      input: prompt,
      temperature: 0.3
    });

    const raw = response.output_text?.trim();
    if (!raw) {
      throw new Error("AI service returned an empty response.");
    }

    const parsed = this.parseStructuredOutput(raw);
    return parsed;
  }

  private buildPrompt(input: {
    companyName?: string;
    period?: string;
    aggregated: AggregatedSales;
  }): string {
    const { companyName = "Unknown Company", period = "Unknown Period", aggregated } = input;

    return [
      "You are a senior business analyst.",
      "Analyze the following sales aggregate data and produce concise executive-level insights.",
      "Return ONLY valid JSON with this exact schema:",
      '{"summary":"string","insights":["string"],"recommendations":["string"]}',
      "Constraints:",
      "- summary: 2-3 sentences",
      "- insights: exactly 3 bullet-style strings",
      "- recommendations: exactly 3 action-oriented strings",
      "- Ground every point in the provided numbers",
      "",
      `Company: ${companyName}`,
      `Period: ${period}`,
      `Total Revenue: ${aggregated.totalRevenue.toFixed(2)}`,
      `Total Units Sold: ${aggregated.totalUnitsSold}`,
      `Average Order Value: ${aggregated.averageOrderValue.toFixed(2)}`,
      `Top Product by Revenue: ${aggregated.topProductByRevenue?.name ?? "N/A"} (${aggregated.topProductByRevenue?.revenue.toFixed(2) ?? "0.00"})`,
      `Top Region by Revenue: ${aggregated.topRegionByRevenue?.name ?? "N/A"} (${aggregated.topRegionByRevenue?.revenue.toFixed(2) ?? "0.00"})`
    ].join("\n");
  }

  private parseStructuredOutput(raw: string): StructuredInsights {
    try {
      const cleaned = raw.replace(/^```json\s*/i, "").replace(/```$/i, "").trim();
      const parsed = JSON.parse(cleaned) as Partial<StructuredInsights>;

      if (
        typeof parsed.summary !== "string" ||
        !Array.isArray(parsed.insights) ||
        !Array.isArray(parsed.recommendations)
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
