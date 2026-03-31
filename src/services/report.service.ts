import PDFDocument from "pdfkit";
import { SalesSummary, StructuredInsights } from "../types/sales";

export class ReportService {
  async generatePdfReport(input: {
    companyName?: string;
    period?: string;
    summary: SalesSummary;
    insights: StructuredInsights;
  }): Promise<Buffer> {
    const { companyName = "Unknown Company", period = "Unknown Period", summary, insights } = input;

    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ margin: 50 });
      const chunks: Buffer[] = [];

      doc.on("data", (chunk) => chunks.push(Buffer.from(chunk)));
      doc.on("end", () => resolve(Buffer.concat(chunks)));
      doc.on("error", reject);

      doc.fontSize(20).text("AI Sales Analytics Report", { align: "center" });
      doc.moveDown(0.8);
      doc.fontSize(12).fillColor("#444444").text(`Company: ${companyName}`);
      doc.text(`Period: ${period}`);
      doc.moveDown(1);

      this.renderSection(doc, "Executive Summary", [insights.executiveSummary]);
      this.renderSection(doc, "Key Metrics", [
        `Total Sales: $${summary.totalSales.toFixed(2)}`,
        `Total Orders: ${summary.totalOrders}`,
        `Average Order Value: $${summary.averageOrderValue.toFixed(2)}`,
        `Top Product: ${summary.topProduct?.name ?? "N/A"} ($${summary.topProduct?.revenue.toFixed(2) ?? "0.00"})`,
        `Lowest Product: ${summary.lowestProduct?.name ?? "N/A"} ($${summary.lowestProduct?.revenue.toFixed(2) ?? "0.00"})`,
        `Trend: ${summary.trend.toUpperCase()}`
      ]);
      this.renderSection(doc, "Key Insights", insights.keyInsights, true);
      this.renderSection(doc, "Problems", insights.problems, true);
      this.renderSection(doc, "Recommendations", insights.recommendations, true);

      doc.end();
    });
  }

  private renderSection(doc: PDFKit.PDFDocument, title: string, lines: string[], numbered = false): void {
    doc.fontSize(14).fillColor("#111111").text(title, { underline: true });
    doc.moveDown(0.4);

    lines.forEach((line, index) => {
      const text = numbered ? `${index + 1}. ${line}` : line;
      doc.fontSize(11).fillColor("#222222").text(text, {
        paragraphGap: 4,
        lineGap: 1
      });
    });

    doc.moveDown(0.8);
  }
}
