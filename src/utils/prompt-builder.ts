import { AggregatedSales, PreprocessedSalesContext } from "../types/sales";

export class PromptBuilder {
  static buildBusinessInsightsPrompt(input: {
    context: PreprocessedSalesContext;
    aggregated: AggregatedSales;
  }): string {
    const { context, aggregated } = input;

    return [
      "You are a senior business analyst creating an executive sales report.",
      "Use the provided facts only. Avoid inventing metrics.",
      "Return ONLY valid JSON in this exact format:",
      '{"summary":"string","insights":["string","string","string"],"recommendations":["string","string","string"]}',
      "Requirements:",
      "- summary: 2-3 concise sentences",
      "- insights: exactly 3 quantified observations",
      "- recommendations: exactly 3 practical action items",
      "",
      `Company: ${context.companyName}`,
      `Period: ${context.period}`,
      `Records Analyzed: ${context.recordCount}`,
      `Date Range: ${context.dateRange ? `${context.dateRange.start} to ${context.dateRange.end}` : "N/A"}`,
      `Total Revenue: ${aggregated.totalRevenue.toFixed(2)}`,
      `Total Units Sold: ${aggregated.totalUnitsSold}`,
      `Average Order Value: ${aggregated.averageOrderValue.toFixed(2)}`,
      `Top Product by Revenue: ${aggregated.topProductByRevenue?.name ?? "N/A"} (${aggregated.topProductByRevenue?.revenue.toFixed(2) ?? "0.00"})`,
      `Top Region by Revenue: ${aggregated.topRegionByRevenue?.name ?? "N/A"} (${aggregated.topRegionByRevenue?.revenue.toFixed(2) ?? "0.00"})`,
      `Preprocessing Notes: ${context.sanitizedNotes.join(" ")}`
    ].join("\n");
  }
}
