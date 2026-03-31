import { Request, Response } from "express";
import { AiService } from "../services/ai.service";
import { DataService } from "../services/data.service";
import { ReportService } from "../services/report.service";
import { sendSuccess } from "../utils/api-response";
import { HttpError } from "../utils/http-error";
import { validateSalesPayload } from "../utils/validation";

const aiService = new AiService();
const reportService = new ReportService();

export class ReportController {
  static async generate(req: Request, res: Response): Promise<void> {
    const payload = validateSalesPayload(req.body);
    const processed = DataService.process(payload);

    const insights = await ReportController.generateInsightsOrThrow(processed.context, processed.summary);

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

  static async analyze(req: Request, res: Response): Promise<void> {
    const payload = validateSalesPayload(req.body);
    const processed = DataService.process(payload);
    const insights = await ReportController.generateInsightsOrThrow(processed.context, processed.summary);

    sendSuccess(res, 200, {
      context: processed.context,
      summary: processed.summary,
      insights
    });
  }

  static async analyzeStream(req: Request, res: Response): Promise<void> {
    const payload = validateSalesPayload(req.body);
    const processed = DataService.process(payload);

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    let fullText = "";
    try {
      for await (const chunk of aiService.streamInsights({
        context: processed.context,
        summary: processed.summary
      })) {
        fullText += chunk;
        res.write(`event: chunk\ndata: ${JSON.stringify({ chunk })}\n\n`);
      }

      const insights = aiService.parseStructuredOutput(fullText);
      res.write(`event: done\ndata: ${JSON.stringify({ insights })}\n\n`);
      res.end();
    } catch (error) {
      res.write(
        `event: error\ndata: ${JSON.stringify({ message: (error as Error).message, code: "AI_STREAM_ERROR" })}\n\n`
      );
      res.end();
    }
  }

  private static async generateInsightsOrThrow(
    context: Parameters<AiService["generateInsights"]>[0]["context"],
    summary: Parameters<AiService["generateInsights"]>[0]["summary"]
  ) {
    try {
      return await aiService.generateInsights({ context, summary });
    } catch (error) {
      throw new HttpError(502, "Failed to generate AI insights", {
        code: "AI_SERVICE_ERROR",
        details: (error as Error).message
      });
    }
  }
}
