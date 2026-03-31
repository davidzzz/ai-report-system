import { Request, Response } from "express";
import { AiService } from "../services/ai.service";
import { DataService } from "../services/data.service";
import { ReportService } from "../services/report.service";
import { HttpError } from "../utils/http-error";
import { validateSalesPayload } from "../utils/validation";

const aiService = new AiService();
const reportService = new ReportService();

export class ReportController {
  static async generate(req: Request, res: Response): Promise<void> {
    const payload = validateSalesPayload(req.body);
    const processed = DataService.process(payload);

    let insights;
    try {
      insights = await aiService.generateInsights({
        context: processed.context,
        summary: processed.summary
      });
    } catch (error) {
      throw new HttpError(502, "Failed to generate AI insights", {
        code: "AI_SERVICE_ERROR",
        details: (error as Error).message
      });
    }

    const pdfBuffer = await reportService.generatePdfReport({
      companyName: processed.context.companyName,
      period: processed.context.period,
      summary: processed.summary,
      insights
    });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", 'attachment; filename="sales-report.pdf"');
    res.status(200).send(pdfBuffer);
  }
}
