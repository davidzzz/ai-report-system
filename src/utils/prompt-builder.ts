import { PreprocessedSalesContext, SalesSummary } from "../types/sales";

export class PromptBuilder {
  static buildBusinessInsightsPrompt(input: {
    context: PreprocessedSalesContext;
    summary: SalesSummary;
  }): string {
    const { context, summary } = input;

    return [
      this.buildRoleInstruction(),
      this.buildTaskInstruction(),
      this.buildConstraintBlock(),
      this.buildOutputContract(),
      this.buildSectionRules(),
      this.buildDataBlock({ context, summary })
    ].join("\n\n");
  }

  private static buildRoleInstruction(): string {
    return "Role: You are a senior business analyst preparing executive-ready report content.";
  }

  private static buildTaskInstruction(): string {
    return "Task: Analyze the summarized sales metrics and produce concise, professional, decision-ready insights.";
  }

  private static buildConstraintBlock(): string {
    return [
      "Constraints:",
      "- Maintain a concise and professional tone.",
      "- Do not repeat raw input lines or restate data verbatim.",
      "- Use only the provided facts; no invented metrics.",
      "- Do not mention model limitations or missing context.",
      "- Return structured output only."
    ].join("\n");
  }

  private static buildOutputContract(): string {
    return [
      "Output Contract:",
      "- Return valid JSON matching this exact schema and field order:",
      '{"executiveSummary":"string","keyInsights":["string","string","string"],"problems":["string","string"],"recommendations":["string","string","string"]}'
    ].join("\n");
  }

  private static buildSectionRules(): string {
    return [
      "Section Rules:",
      "- executiveSummary: 2-3 sentences.",
      "- keyInsights: exactly 3 quantified insights.",
      "- problems: exactly 2 concrete issues or risks.",
      "- recommendations: exactly 3 practical next actions."
    ].join("\n");
  }

  private static buildDataBlock(input: {
    context: PreprocessedSalesContext;
    summary: SalesSummary;
  }): string {
    const { context, summary } = input;

    return [
      "Business Context:",
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
