import { PreprocessedSalesContext, SalesSummary } from "../types/sales";

export class PromptBuilder {
  static buildBusinessInsightsPrompt(input: {
    context: PreprocessedSalesContext;
    summary: SalesSummary;
  }): string {
    const { context, summary } = input;

    return [
      "Role: You are a senior business analyst writing concise executive report content.",
      "Task: Analyze the provided summarized sales metrics and return practical business findings.",
      "Constraints:",
      "- Use only provided facts.",
      "- Keep wording clear and professional.",
      "- Do not mention missing data or model limitations.",
      "Output: Return ONLY valid JSON with this exact schema:",
      '{"executiveSummary":"string","keyInsights":["string","string","string"],"problems":["string","string"],"recommendations":["string","string","string"]}',
      "Section rules:",
      "- executiveSummary: 2-3 sentences.",
      "- keyInsights: exactly 3 bullet-style insights with numbers.",
      "- problems: exactly 2 issues or risks.",
      "- recommendations: exactly 3 concrete next steps.",
      "",
      `Company: ${context.companyName}`,
      `Period: ${context.period}`,
      `Records analyzed: ${context.recordCount}`,
      `Date range: ${context.dateRange ? `${context.dateRange.start} to ${context.dateRange.end}` : "N/A"}`,
      `Total sales: ${summary.totalSales.toFixed(2)}`,
      `Total orders: ${summary.totalOrders}`,
      `Average order value: ${summary.averageOrderValue.toFixed(2)}`,
      `Top product: ${summary.topProduct?.name ?? "N/A"} (${summary.topProduct?.revenue.toFixed(2) ?? "0.00"})`,
      `Lowest product: ${summary.lowestProduct?.name ?? "N/A"} (${summary.lowestProduct?.revenue.toFixed(2) ?? "0.00"})`,
      `Trend: ${summary.trend}`,
      `Data hygiene notes: ${context.sanitizedNotes.join(" ")}`
    ].join("\n");
  }
}
