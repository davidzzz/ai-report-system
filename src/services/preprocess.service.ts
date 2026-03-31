import { PreprocessedSalesContext, SaleRecord, SalesPayload } from "../types/sales";

export class PreprocessService {
  static normalizePayload(payload: SalesPayload): SalesPayload {
    const normalizedSales = payload.sales.map((record) => this.normalizeRecord(record));

    return {
      companyName: payload.companyName?.trim() || "Unknown Company",
      period: payload.period?.trim() || "Unknown Period",
      sales: normalizedSales
    };
  }

  static buildContext(payload: SalesPayload): PreprocessedSalesContext {
    const sortedDates = payload.sales.map((item) => new Date(item.date).toISOString().slice(0, 10)).sort();
    const dateRange = sortedDates.length
      ? { start: sortedDates[0], end: sortedDates[sortedDates.length - 1] }
      : null;

    return {
      companyName: payload.companyName || "Unknown Company",
      period: payload.period || "Unknown Period",
      recordCount: payload.sales.length,
      dateRange,
      sanitizedNotes: [
        "Product/region names trimmed and normalized.",
        "Negative or invalid numerics blocked at validation.",
        "Revenue-based aggregates rounded to 2 decimals for prompt consistency."
      ]
    };
  }

  private static normalizeRecord(record: SaleRecord): SaleRecord {
    return {
      date: new Date(record.date).toISOString().slice(0, 10),
      product: record.product.trim(),
      region: record.region.trim(),
      unitsSold: Number(record.unitsSold.toFixed(2)),
      unitPrice: Number(record.unitPrice.toFixed(2))
    };
  }
}
