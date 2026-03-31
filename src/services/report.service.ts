import PDFDocument from "pdfkit";
import { SalesSummary, StructuredInsights } from "../types/sales";

const CURRENCY_FORMATTER = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 2
});

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

      doc.font("Helvetica-Bold").fontSize(22).fillColor("#111111").text("AI Sales Analytics Report", { align: "center" });
      doc.moveDown(0.8);
      doc.font("Helvetica").fontSize(11).fillColor("#444444").text(`Company: ${companyName}`);
      doc.text(`Period: ${period}`);
      doc.moveDown(1.2);

      this.renderSection(doc, "Executive Summary", [insights.executiveSummary]);
      this.renderSection(doc, "Key Metrics", [
        `Total Sales: ${CURRENCY_FORMATTER.format(summary.totalSales)}`,
        `Total Orders: ${summary.totalOrders}`,
        `Average Order Value: ${CURRENCY_FORMATTER.format(summary.averageOrderValue)}`,
        `Top Product: ${summary.topProduct?.name ?? "N/A"} (${CURRENCY_FORMATTER.format(summary.topProduct?.revenue ?? 0)})`,
        `Lowest Product: ${summary.lowestProduct?.name ?? "N/A"} (${CURRENCY_FORMATTER.format(summary.lowestProduct?.revenue ?? 0)})`,
        `Trend: ${summary.trend.toUpperCase()}`
      ]);
      this.renderSection(doc, "Key Insights", insights.keyInsights, true);
      this.renderSection(doc, "Problems", insights.problems, true);
      this.renderSection(doc, "Recommendations", insights.recommendations, true);

      doc.end();
    });
  }

  private renderSection(doc: PDFKit.PDFDocument, title: string, lines: string[], numbered = false): void {
    this.ensureSpace(doc, 80);

    doc.font("Helvetica-Bold").fontSize(14).fillColor("#111111").text(title);
    doc.moveDown(0.5);

    lines.forEach((line, index) => {
      this.ensureSpace(doc, 40);
      const text = numbered ? `${index + 1}. ${line}` : line;

      doc
        .font("Helvetica")
        .fontSize(11)
        .fillColor("#222222")
        .text(text, {
          paragraphGap: 6,
          lineGap: 2
        });
    });

    doc.moveDown(0.9);
    doc
      .moveTo(doc.page.margins.left, doc.y)
      .lineTo(doc.page.width - doc.page.margins.right, doc.y)
      .strokeColor("#E6E6E6")
      .lineWidth(1)
      .stroke();
    doc.moveDown(0.9);
  }

  private ensureSpace(doc: PDFKit.PDFDocument, minimumHeight: number): void {
    const bottomLimit = doc.page.height - doc.page.margins.bottom;
    if (doc.y + minimumHeight > bottomLimit) {
      doc.addPage();
    }
  }
}
