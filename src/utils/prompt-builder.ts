import { PreprocessedSalesContext, SalesSummary } from "../types/sales";

interface PromptInput {
  context: PreprocessedSalesContext;
  summary: SalesSummary;
}

export class PromptBuilder {
  static buildBusinessInsightsPrompt(input: PromptInput): string {
    const { context, summary } = input;
    const dateRange = context.dateRange ? `${context.dateRange.start}..${context.dateRange.end}` : "N/A";
    const topProduct = summary.topProduct ? `${summary.topProduct.name}:${summary.topProduct.revenue.toFixed(2)}` : "N/A:0.00";
    const lowProduct = summary.lowestProduct ? `${summary.lowestProduct.name}:${summary.lowestProduct.revenue.toFixed(2)}` : "N/A:0.00";

    return [
      "You are a senior business analyst.",
      "Use only provided facts. No invented metrics. Output valid JSON only.",
      "Schema:{\"executiveSummary\":\"string\",\"keyInsights\":[\"string\",\"string\",\"string\"],\"problems\":[\"string\",\"string\"],\"recommendations\":[\"string\",\"string\",\"string\"]}",
      "Rules: executiveSummary=2 sentences; keyInsights=3 quantified items; problems=2 concrete risks; recommendations=3 specific actions; concise tone.",
      `Data: company=${context.companyName}; period=${context.period}; records=${context.recordCount}; range=${dateRange}; totalSales=${summary.totalSales.toFixed(2)}; totalOrders=${summary.totalOrders}; avgOrderValue=${summary.averageOrderValue.toFixed(2)}; topProduct=${topProduct}; lowestProduct=${lowProduct}; trend=${summary.trend}; notes=${context.sanitizedNotes.join(" ")}`
    ].join("\n");
  }
}
