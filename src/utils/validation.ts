import { SalesPayload, SaleRecord } from "../types/sales";
import { HttpError } from "./http-error";

const MAX_RECORDS = 5000;

function assertValidSaleRecord(record: unknown, index: number): asserts record is SaleRecord {
  if (!record || typeof record !== "object") {
    throw new HttpError(400, `sales[${index}] must be an object`, { code: "INVALID_SALES_RECORD" });
  }

  const candidate = record as Record<string, unknown>;
  const requiredStringFields = ["date", "product", "region"] as const;
  for (const field of requiredStringFields) {
    if (typeof candidate[field] !== "string" || !candidate[field]?.trim()) {
      throw new HttpError(400, `sales[${index}].${field} must be a non-empty string`, {
        code: "INVALID_SALES_FIELD"
      });
    }
  }

  if (typeof candidate.unitsSold !== "number" || !Number.isFinite(candidate.unitsSold) || candidate.unitsSold < 0) {
    throw new HttpError(400, `sales[${index}].unitsSold must be a non-negative number`, {
      code: "INVALID_SALES_FIELD"
    });
  }

  if (typeof candidate.unitPrice !== "number" || !Number.isFinite(candidate.unitPrice) || candidate.unitPrice < 0) {
    throw new HttpError(400, `sales[${index}].unitPrice must be a non-negative number`, {
      code: "INVALID_SALES_FIELD"
    });
  }

  if (Number.isNaN(Date.parse(String(candidate.date)))) {
    throw new HttpError(400, `sales[${index}].date must be a valid date string`, {
      code: "INVALID_SALES_FIELD"
    });
  }
}

export function validateSalesPayload(payload: unknown): SalesPayload {
  if (!payload || typeof payload !== "object") {
    throw new HttpError(400, "Request body must be a JSON object", { code: "INVALID_PAYLOAD" });
  }

  const body = payload as Record<string, unknown>;
  if (!Array.isArray(body.sales) || body.sales.length === 0) {
    throw new HttpError(400, "Request body must include a non-empty 'sales' array.", {
      code: "INVALID_PAYLOAD"
    });
  }

  if (body.sales.length > MAX_RECORDS) {
    throw new HttpError(413, `Too many records. Max allowed is ${MAX_RECORDS}.`, {
      code: "PAYLOAD_TOO_LARGE"
    });
  }

  body.sales.forEach((record, index) => assertValidSaleRecord(record, index));

  return {
    companyName: typeof body.companyName === "string" ? body.companyName.trim() : undefined,
    period: typeof body.period === "string" ? body.period.trim() : undefined,
    sales: body.sales as SaleRecord[]
  };
}
