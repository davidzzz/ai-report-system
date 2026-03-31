import { Request, Response } from "express";
import { AggregationService } from "../services/aggregation.service";
import { AiService } from "../services/ai.service";
import { ReportService } from "../services/report.service";
import { SalesPayload } from "../types/sales";
import { HttpError } from "../utils/http-error";

const aiService = new AiService();
const reportService = new ReportService();

export class ReportController {
  static async generate(req: Request, res: Response): Promise<void> {
    const payload = req.body as SalesPayload;

    if (!payload?.sales || !Array.isArray(payload.sales) || payload.sales.length === 0) {
      throw new HttpError(400, "Request body must include a non-empty 'sales' array.");
    }

    for (const sale of payload.sales) {
      if (
        typeof sale.product !== "string" ||
        typeof sale.region !== "string" ||
        typeof sale.unitsSold !== "number" ||
        typeof sale.unitPrice !== "number"
      ) {
        throw new HttpError(
          400,
          "Each sales record must include product, region, unitsSold(number), and unitPrice(number)."
        );
      }
    }

    const aggregated = AggregationService.aggregate(payload.sales);
    const insights = await aiService.generateInsights({
      companyName: payload.companyName,
      period: payload.period,
      aggregated
    });

    const pdfBuffer = await reportService.generatePdfReport({
      companyName: payload.companyName,
      period: payload.period,
      aggregated,
      insights
    });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", 'attachment; filename="sales-report.pdf"');
    res.status(200).send(pdfBuffer);
  }
}
