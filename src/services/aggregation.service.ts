import { SaleRecord, SalesSummary } from "../types/sales";
import { DataService } from "./data.service";

// Kept for backward compatibility with older imports.
export class AggregationService {
  static aggregate(records: SaleRecord[]): SalesSummary {
    return DataService.process({ sales: records }).summary;
  }
}
