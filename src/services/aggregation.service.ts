import { AggregatedSales, SaleRecord } from "../types/sales";

export class AggregationService {
  static aggregate(records: SaleRecord[]): AggregatedSales {
    const revenueByProduct = new Map<string, number>();
    const revenueByRegion = new Map<string, number>();

    let totalRevenue = 0;
    let totalUnitsSold = 0;

    for (const record of records) {
      const revenue = record.unitsSold * record.unitPrice;
      totalRevenue += revenue;
      totalUnitsSold += record.unitsSold;

      revenueByProduct.set(record.product, (revenueByProduct.get(record.product) ?? 0) + revenue);
      revenueByRegion.set(record.region, (revenueByRegion.get(record.region) ?? 0) + revenue);
    }

    const topProductByRevenue = this.findTop(revenueByProduct);
    const topRegionByRevenue = this.findTop(revenueByRegion);

    return {
      totalRevenue,
      totalUnitsSold,
      averageOrderValue: records.length ? totalRevenue / records.length : 0,
      topProductByRevenue,
      topRegionByRevenue
    };
  }

  private static findTop(map: Map<string, number>): { name: string; revenue: number } | null {
    let top: { name: string; revenue: number } | null = null;

    for (const [name, revenue] of map.entries()) {
      if (!top || revenue > top.revenue) {
        top = { name, revenue };
      }
    }

    return top;
  }
}
