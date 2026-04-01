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
├── services/
│   └── ai.service.ts        # Core AI orchestration
├── utils/
│   └── prompt-builder.ts    # Prompt construction
├── types/
│   └── sales.ts             # Domain types
├── config/
│   └── env.ts               # Environment config
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

## 🔄 Before vs After (What This System Actually Does)

### 📥 Raw Input (Before)

```json
{
  "companyName": "Acme Corp",
  "period": "Jan 2026",
  "recordCount": 1240,
  "totalSales": 125000.5,
  "totalOrders": 320,
  "averageOrderValue": 390.63,
  "topProduct": { "name": "Product A", "revenue": 45000 },
  "lowestProduct": { "name": "Product D", "revenue": 5000 },
  "trend": "upward",
  "notes": ["minor missing dates", "duplicates removed"]
}
```

👉 This is **useful but not decision-ready**. A human still needs to:

* Interpret trends
* Identify risks
* Suggest actions

---

### 📤 AI Output (After)

```json
{
  "executiveSummary": "Sales performance shows a strong upward trend driven primarily by Product A, with overall revenue growth supported by stable order volume.",
  "keyInsights": [
    "Product A contributes ~36% of total revenue, indicating strong product-market fit",
    "Average order value remains high at 390.63, suggesting effective pricing strategy",
    "Overall sales trend is upward, signaling sustained demand growth"
  ],
  "problems": [
    "Revenue concentration risk due to heavy reliance on a single product",
    "Data quality issues detected in date records and duplicates"
  ],
  "recommendations": [
    "Diversify revenue by promoting mid-tier products",
    "Implement stricter data validation during ingestion",
    "Monitor Product A performance to anticipate demand shifts"
  ]
}
```

👉 This is **executive-ready output**:

* Clear summary
* Quantified insights
* Identified risks
* Actionable recommendations

---

### 🧠 Transformation Value

| Stage     | Value          |
| --------- | -------------- |
| Raw Data  | Informational  |
| AI Output | Decision-ready |

This system bridges the gap between:

> **Data → Insight → Action**

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
```

---

## 🧑‍💻 Author

Built as a portfolio project to demonstrate production-grade AI backend engineering.
