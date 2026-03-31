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

export interface AggregatedSales {
  totalRevenue: number;
  totalUnitsSold: number;
  averageOrderValue: number;
  topProductByRevenue: { name: string; revenue: number } | null;
  topRegionByRevenue: { name: string; revenue: number } | null;
}

export interface PreprocessedSalesContext {
  companyName: string;
  period: string;
  recordCount: number;
  dateRange: { start: string; end: string } | null;
  sanitizedNotes: string[];
}

export interface StructuredInsights {
  summary: string;
  insights: string[];
  recommendations: string[];
}
