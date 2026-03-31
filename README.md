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
│   ├── routes/
│   │   └── report.routes.ts
│   ├── services/
│   │   ├── aggregation.service.ts
│   │   ├── ai.service.ts
│   │   └── report.service.ts
│   ├── types/
│   │   └── sales.ts
│   └── utils/
│       ├── async-handler.ts
│       └── http-error.ts
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

3. Add your OpenAI API key to `.env`:

```env
OPENAI_API_KEY=your_openai_api_key
```

4. Run development server:

```bash
npm run dev
```

Server starts at `http://localhost:3000` by default.

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

#### Response

- `200 OK`
- `Content-Type: application/pdf`
- Binary PDF file (`sales-report.pdf`)

## Build & Run

```bash
npm run build
npm start
```
