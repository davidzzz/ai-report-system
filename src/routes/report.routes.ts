import { Router } from "express";
import { ReportController } from "../controllers/report.controller";
import { asyncHandler } from "../utils/async-handler";

const reportRouter = Router();

reportRouter.post("/generate", asyncHandler(ReportController.generate));
reportRouter.post("/analyze", asyncHandler(ReportController.analyze));
reportRouter.post("/analyze/stream", asyncHandler(ReportController.analyzeStream));

export { reportRouter };
