import { PreprocessedSalesContext, SalesPayload } from "../types/sales";
import { DataService } from "./data.service";

// Kept for backward compatibility with older imports.
export class PreprocessService {
  static normalizePayload(payload: SalesPayload): SalesPayload {
    return DataService.normalizePayload(payload);
  }

  static buildContext(payload: SalesPayload): PreprocessedSalesContext {
    return DataService.process(payload).context;
  }
}
