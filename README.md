# AI Report System API

Production-ready backend API that accepts sales data, generates AI-powered analytics, and returns a PDF report.

## Project Structure

```bash
ai-report-system/
├── src/
│   ├── app.ts
│   ├── config/
│   │   └── env.ts
│   ├── controllers/
│   │   └── report.controller.ts
│   ├── middlewares/
│   │   ├── rate-limit.ts
│   │   └── request-logger.ts
│   ├── routes/
│   │   └── report.routes.ts
│   ├── services/
│   │   ├── aggregation.service.ts
│   │   ├── ai.service.ts
│   │   ├── preprocess.service.ts
│   │   └── report.service.ts
│   ├── types/
│   │   └── sales.ts
│   └── utils/
│       ├── async-handler.ts
│       ├── http-error.ts
│       ├── prompt-builder.ts
│       └── validation.ts
├── .env.example
├── .gitignore
├── package.json
├── tsconfig.json
└── README.md
```

## Setup

1. Install dependencies:

```bash
npm install
```

2. Create env file:

```bash
cp .env.example .env
```

3. Add your OpenAI API key to `.env`.

4. Run development server:

```bash
npm run dev
```

Server starts at `http://localhost:3000` by default.

## Environment Variables

```env
PORT=3000
OPENAI_API_KEY=your_openai_api_key
OPENAI_MODEL=gpt-4.1-mini
REPORT_RATE_LIMIT_WINDOW_MS=60000
REPORT_RATE_LIMIT_MAX=30
```

## API

### `POST /report/generate`

Generates and returns a PDF report from sales data.

#### Request Body (JSON)

```json
{
  "companyName": "Acme Inc",
  "period": "Q1 2026",
  "sales": [
    {
      "date": "2026-01-01",
      "product": "Widget A",
      "region": "North America",
      "unitsSold": 120,
      "unitPrice": 49.99
    },
    {
      "date": "2026-01-02",
      "product": "Widget B",
      "region": "Europe",
      "unitsSold": 85,
      "unitPrice": 79.99
    }
  ]
}
```

#### Success Response

- `200 OK`
- `Content-Type: application/pdf`
- Binary PDF file (`sales-report.pdf`)

#### Error Response Shape

```json
{
  "error": {
    "code": "INVALID_PAYLOAD",
    "message": "Request body must include a non-empty 'sales' array.",
    "requestId": "e2ad0f4b-...",
    "details": {}
  }
}
```

## Production Readiness Improvements

- Input validation with clear 4xx errors for malformed sales records.
- In-memory rate limiting on `/report/*` endpoints.
- Structured request logging with `x-request-id` and latency.
- Modular AI prompt builder for maintainability.
- Data preprocessing and normalization before AI analysis.
- Centralized error handling with stable error codes.

## Build & Run

```bash
npm run build
npm start
```
