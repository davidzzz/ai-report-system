export interface SaleRecord {
  date: string;
  product: string;
  region: string;
  unitsSold: number;
  unitPrice: number;
}

export interface SalesPayload {
  companyName?: string;
  period?: string;
  sales: SaleRecord[];
}

export type SalesTrend = "up" | "down" | "stable";

export interface ProductMetric {
  name: string;
  revenue: number;
  orders: number;
}

export interface SalesSummary {
  totalSales: number;
  totalOrders: number;
  averageOrderValue: number;
  topProduct: ProductMetric | null;
  lowestProduct: ProductMetric | null;
  trend: SalesTrend;
}

export interface PreprocessedSalesContext {
  companyName: string;
  period: string;
  recordCount: number;
  dateRange: { start: string; end: string } | null;
  sanitizedNotes: string[];
}

export interface StructuredInsights {
  executiveSummary: string;
  keyInsights: string[];
  problems: string[];
  recommendations: string[];
}

// Backward-compatible alias used by existing code while migration completes.
export type AggregatedSales = SalesSummary;
