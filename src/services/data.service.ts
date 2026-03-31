import { PreprocessedSalesContext, ProductMetric, SaleRecord, SalesPayload, SalesSummary, SalesTrend } from "../types/sales";

export interface ProcessedSalesData {
  context: PreprocessedSalesContext;
  summary: SalesSummary;
}

export class DataService {
  static normalizePayload(payload: SalesPayload): SalesPayload {
    return {
      companyName: payload.companyName?.trim() || "Unknown Company",
      period: payload.period?.trim() || "Unknown Period",
      sales: payload.sales.map((record) => this.normalizeRecord(record))
    };
  }

  static process(payload: SalesPayload): ProcessedSalesData {
    const normalized = this.normalizePayload(payload);

    return {
      context: this.buildContext(normalized),
      summary: this.buildSummary(normalized.sales)
    };
  }

  private static buildContext(payload: SalesPayload): PreprocessedSalesContext {
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
        "Product and region values are trimmed and normalized.",
        "Records with invalid/negative numeric values are rejected by validation.",
        "Computed metrics are rounded to 2 decimals for stable prompting."
      ]
    };
  }

  private static buildSummary(records: SaleRecord[]): SalesSummary {
    const productTotals = new Map<string, ProductMetric>();
    const dailyRevenue = new Map<string, number>();

    let totalSales = 0;
    for (const record of records) {
      const revenue = record.unitsSold * record.unitPrice;
      totalSales += revenue;

      const currentProduct = productTotals.get(record.product) ?? { name: record.product, revenue: 0, orders: 0 };
      currentProduct.revenue += revenue;
      currentProduct.orders += 1;
      productTotals.set(record.product, currentProduct);

      const day = record.date;
      dailyRevenue.set(day, (dailyRevenue.get(day) ?? 0) + revenue);
    }

    const products = Array.from(productTotals.values()).map((product) => ({
      ...product,
      revenue: Number(product.revenue.toFixed(2))
    }));

    const topProduct = this.findByRevenue(products, "max");
    const lowestProduct = this.findByRevenue(products, "min");

    return {
      totalSales: Number(totalSales.toFixed(2)),
      totalOrders: records.length,
      averageOrderValue: records.length ? Number((totalSales / records.length).toFixed(2)) : 0,
      topProduct,
      lowestProduct,
      trend: this.calculateTrend(dailyRevenue)
    };
  }

  private static findByRevenue(products: ProductMetric[], mode: "max" | "min"): ProductMetric | null {
    if (!products.length) return null;

    return products.reduce((selected, current) => {
      if (mode === "max") {
        return current.revenue > selected.revenue ? current : selected;
      }
      return current.revenue < selected.revenue ? current : selected;
    });
  }

  private static calculateTrend(dailyRevenue: Map<string, number>): SalesTrend {
    if (dailyRevenue.size < 2) return "stable";

    const points = Array.from(dailyRevenue.entries()).sort(([a], [b]) => a.localeCompare(b));
    const first = points[0][1];
    const last = points[points.length - 1][1];

    if (last > first * 1.05) return "up";
    if (last < first * 0.95) return "down";
    return "stable";
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
