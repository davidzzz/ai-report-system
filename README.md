# 🤖 AI Report System

Production-grade AI-powered sales analytics engine that transforms structured business data into executive-ready insights using deterministic LLM outputs.

---

## 🚀 Overview

AI Report System is a backend service that:

* Processes sales data
* Generates structured business insights using AI
* Enforces strict output schemas
* Supports both streaming and non-streaming responses

Unlike typical AI demos, this system is built with **reliability, determinism, and production constraints in mind**.

---

## ✨ Key Features

### 🧠 Structured AI Output

* Uses JSON Schema enforcement
* Guarantees predictable responses
* Eliminates hallucinated formats

### 🧱 Prompt Engineering System

* Modular `PromptBuilder`
* Role + Task + Constraints design
* Token-efficient structured prompts

### 🔁 Reliability Layer

* Retry mechanism
* Input size validation
* Schema validation after response

### ⚡ Streaming Support

* Real-time AI response streaming
* Fallback to standard response if streaming unavailable

### 🔒 Type Safety

* Strong TypeScript validation
* Runtime schema enforcement

---

## 🏗️ Architecture

```
                ┌──────────────────────────┐
                │   Client / Frontend      │
                └────────────┬─────────────┘
                             │
                             ▼
                ┌──────────────────────────┐
                │   API Layer / Controller │
                └────────────┬─────────────┘
                             │
                             ▼
                ┌──────────────────────────┐
                │       AiService          │
                │--------------------------│
                │ • Prompt generation      │
                │ • Retry logic            │
                │ • Streaming handling     │
                │ • Schema enforcement     │
                └────────────┬─────────────┘
                             │
                             ▼
                ┌──────────────────────────┐
                │     PromptBuilder        │
                │--------------------------│
                │ • Role instruction       │
                │ • Task definition        │
                │ • Constraints            │
                │ • Output contract        │
                │ • Data injection         │
                └────────────┬─────────────┘
                             │
                             ▼
                ┌──────────────────────────┐
                │      OpenAI API          │
                └────────────┬─────────────┘
                             │
                             ▼
                ┌──────────────────────────┐
                │ Structured JSON Response │
                └────────────┬─────────────┘
                             │
                             ▼
                ┌──────────────────────────┐
                │  Validation Layer        │
                │--------------------------│
                │ • Type checks            │
                │ • Length constraints     │
                │ • Final output shaping   │
                └──────────────────────────┘
```

---

## 📦 Project Structure

```
src/
├── app.ts
├── config/
│   └── env.ts
├── controllers/
│   └── report.controller.ts
├── middlewares/
│   ├── error-handler.ts
│   ├── rate-limit.ts
│   └── request-logger.ts
├── routes/
│   └── report.routes.ts
├── services/
│   ├── ai.service.ts
│   ├── data.service.ts
│   ├── preprocess.service.ts
│   └── report.service.ts
├── types/
│   └── sales.ts
└── utils/
    ├── api-response.ts
    ├── async-handler.ts
    ├── http-error.ts
    ├── logger.ts
    ├── openai-error.ts
    ├── prompt-builder.ts
    └── validation.ts
```

---

## 🧠 How It Works

### 1. Data Input

Preprocessed sales data is passed into the system:

* Business context
* Aggregated metrics

### 2. Prompt Construction

`PromptBuilder` creates a structured prompt:

* Role definition
* Task instruction
* Constraints
* Output contract (strict JSON)

### 3. AI Processing

`AiService` sends request to OpenAI:

* Uses low temperature (0.2)
* Enforces JSON schema output

### 4. Validation

Response is validated:

* Required fields
* Exact array lengths
* Type safety

### 5. Output

Returns clean, structured insights:

```json
{
  "executiveSummary": "...",
  "keyInsights": ["...", "...", "..."],
  "problems": ["...", "..."],
  "recommendations": ["...", "...", "..."]
}
```

---

## 🛠️ Tech Stack

* Node.js
* TypeScript
* OpenAI API (Responses API)

---

## 🌐 API Endpoints

* `GET /health` - basic liveness.
* `GET /ready` - readiness details (OpenAI config + runtime metadata).
* `POST /report/analyze` - returns JSON summary + insights.
* `POST /report/analyze/stream` - streams insight chunks via SSE.
* `POST /report/generate` - returns generated PDF report.

---

## ⚙️ Design Principles

### Determinism over Creativity

AI output is tightly controlled to ensure consistency.

### Validation First

Never trust AI output without validation.

### Modular Prompting

Prompts are treated as first-class architecture.

### Fail Gracefully

Retries + fallbacks prevent system crashes.

---

## 🚧 Future Improvements

* Request-level logging & tracing
* Cost tracking per API call
* Latency monitoring
* Caching layer for repeated queries
* Multi-model fallback strategy

---

## 💡 Why This Project Stands Out

This is not a simple AI integration.

It demonstrates:

* Real-world AI system design
* Controlled LLM usage
* Backend engineering maturity
* Production-aware thinking

---

## 📌 Getting Started

```bash
npm install
npm run dev
```

Set environment variables:

```
OPENAI_API_KEY=your_key
OPENAI_MODEL=your_model
REPORT_PAYLOAD_LIMIT_KB=512
```

Run checks/tests:

```bash
npm run check
npm test
```

---

## 🧑‍💻 Author

Built as a portfolio project to demonstrate production-grade AI backend engineering.
