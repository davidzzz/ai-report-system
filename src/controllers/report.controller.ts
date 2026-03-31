import { Request, Response } from "express";
import { AggregationService } from "../services/aggregation.service";
import { AiService } from "../services/ai.service";
import { PreprocessService } from "../services/preprocess.service";
import { ReportService } from "../services/report.service";
import { HttpError } from "../utils/http-error";
import { validateSalesPayload } from "../utils/validation";

const aiService = new AiService();
const reportService = new ReportService();

export class ReportController {
  static async generate(req: Request, res: Response): Promise<void> {
    const payload = validateSalesPayload(req.body);
    const normalizedPayload = PreprocessService.normalizePayload(payload);

    const aggregated = AggregationService.aggregate(normalizedPayload.sales);
    const context = PreprocessService.buildContext(normalizedPayload);

    let insights;
    try {
      insights = await aiService.generateInsights({ context, aggregated });
    } catch (error) {
      throw new HttpError(502, "Failed to generate AI insights", {
        code: "AI_SERVICE_ERROR",
        details: (error as Error).message
      });
    }

    const pdfBuffer = await reportService.generatePdfReport({
      companyName: normalizedPayload.companyName,
      period: normalizedPayload.period,
      aggregated,
      insights
    });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", 'attachment; filename="sales-report.pdf"');
    res.status(200).send(pdfBuffer);
  }
}
