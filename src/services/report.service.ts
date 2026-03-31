import PDFDocument from "pdfkit";
import { AggregatedSales, StructuredInsights } from "../types/sales";

export class ReportService {
  async generatePdfReport(input: {
    companyName?: string;
    period?: string;
    aggregated: AggregatedSales;
    insights: StructuredInsights;
  }): Promise<Buffer> {
    const { companyName = "Unknown Company", period = "Unknown Period", aggregated, insights } = input;

    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ margin: 50 });
      const chunks: Buffer[] = [];

      doc.on("data", (chunk) => chunks.push(Buffer.from(chunk)));
      doc.on("end", () => resolve(Buffer.concat(chunks)));
      doc.on("error", reject);

      doc.fontSize(20).text("AI Sales Analytics Report", { align: "center" });
      doc.moveDown();

      doc.fontSize(12).text(`Company: ${companyName}`);
      doc.text(`Period: ${period}`);
      doc.moveDown();

      doc.fontSize(14).text("Summary", { underline: true });
      doc.fontSize(11).text(insights.summary);
      doc.moveDown();

      doc.fontSize(14).text("Key Metrics", { underline: true });
      doc.fontSize(11).text(`Total Revenue: $${aggregated.totalRevenue.toFixed(2)}`);
      doc.text(`Total Units Sold: ${aggregated.totalUnitsSold}`);
      doc.text(`Average Order Value: $${aggregated.averageOrderValue.toFixed(2)}`);
      doc.text(
        `Top Product by Revenue: ${aggregated.topProductByRevenue?.name ?? "N/A"} ($${
          aggregated.topProductByRevenue?.revenue.toFixed(2) ?? "0.00"
        })`
      );
      doc.text(
        `Top Region by Revenue: ${aggregated.topRegionByRevenue?.name ?? "N/A"} ($${
          aggregated.topRegionByRevenue?.revenue.toFixed(2) ?? "0.00"
        })`
      );
      doc.moveDown();

      doc.fontSize(14).text("Insights", { underline: true });
      insights.insights.forEach((point, index) => {
        doc.fontSize(11).text(`${index + 1}. ${point}`);
      });
      doc.moveDown();

      doc.fontSize(14).text("Recommendations", { underline: true });
      insights.recommendations.forEach((item, index) => {
        doc.fontSize(11).text(`${index + 1}. ${item}`);
      });

      doc.end();
    });
  }
}
