import { Router } from "express";
import { ReportController } from "../controllers/report.controller";
import { asyncHandler } from "../utils/async-handler";

const reportRouter = Router();

reportRouter.post("/generate", asyncHandler(ReportController.generate));

export { reportRouter };
