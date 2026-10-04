# VendorIQ

<div align="center">

```text
██╗   ██╗ ███████╗ ███╗   ██╗ ██████╗   ██████╗  ██████╗  ██╗  ██████╗
██║   ██║ ██╔════╝ ████╗  ██║ ██╔══██╗ ██╔═══██╗ ██╔══██╗ ██║ ██╔═══██╗
██║   ██║ █████╗   ██╔██╗ ██║ ██║  ██║ ██║   ██║ ██████╔╝ ██║ ██║   ██║
╚██╗ ██╔╝ ██╔══╝   ██║╚██╗██║ ██║  ██║ ██║   ██║ ██╔══██╗ ██║ ██║▄▄ ██║
 ╚████╔╝  ███████╗ ██║ ╚████║ ██████╔╝ ╚██████╔╝ ██║  ██║ ██║ ╚██████╔╝
  ╚═══╝   ╚══════╝ ╚═╝  ╚═══╝ ╚═════╝   ╚═════╝  ╚═╝  ╚═╝ ╚═╝   ╚══▀▀═╝
```

### AI-Powered Procurement & Vendor Intelligence Platform

**From supplier signals to procurement decisions.**

<br>

![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![Express](https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white)

![Python](https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)
![scikit--learn](https://img.shields.io/badge/scikit--learn-F7931E?style=for-the-badge&logo=scikit-learn&logoColor=white)
![XGBoost](https://img.shields.io/badge/XGBoost-EC6B23?style=for-the-badge&logo=xgboost&logoColor=white)
![Ollama](https://img.shields.io/badge/Ollama-000000?style=for-the-badge&logo=ollama&logoColor=white)

</div>

---

## Overview

**VendorIQ** is an end-to-end procurement intelligence platform that brings supplier risk analysis, commodity forecasting, contract intelligence, anomaly detection, market intelligence, and scenario simulation into a single application.

The platform combines classical machine learning, local LLM inference, external data sources, persistent storage, and an interactive full-stack interface to support procurement analysis.

### Core architecture

```text
React + Vite
     │
     ▼
Express + Node.js
     │
     ├──────────────► PostgreSQL
     │
     ├──────────────► GNews
     │
     └──────────────► FastAPI ML Service
                              │
                    ┌─────────┼─────────┐
                    ▼         ▼         ▼
               Random     XGBoost   Isolation
               Forest                Forest
                    │         │         │
                    └─────────┼─────────┘
                              │
                              ▼
                           Ollama
                         llama3.2
```

> **Project scope:** VendorIQ is a locally run engineering and portfolio project. Supplier records are application data and do not represent real customers, partners, or business relationships.

---

# What VendorIQ Does

Procurement teams often need to answer several questions simultaneously:

> **Which suppliers are risky? What are input costs likely to do? What does a contract contain? Which supplier records look unusual? What is happening in the market? What happens if conditions change?**

VendorIQ brings these capabilities together into one workflow.

| Capability | Purpose | Technology |
|---|---|---|
| **Vendor Risk Intelligence** | Predict and categorize supplier risk | Random Forest |
| **Commodity Forecasting** | Forecast commodity price movement | XGBoost |
| **Contract Intelligence** | Analyze contracts and identify potential issues | Ollama + `llama3.2` |
| **Supplier Anomaly Detection** | Identify statistically unusual supplier records | Isolation Forest |
| **Market Intelligence** | Retrieve relevant procurement and supply-chain news | GNews + Ollama |
| **What-If Simulator** | Stress-test supplier scenarios | Scenario analysis |
| **Procurement Agents** | Organize task-focused intelligence workflows | Workflow-driven interface |
| **Executive Intelligence** | Surface procurement metrics and business views | React dashboards |

---

# Key Features

## Supplier Risk Intelligence

VendorIQ uses a trained **Random Forest classifier** to estimate supplier risk.

The prediction pipeline:

```text
Supplier Features
       │
       ▼
Feature Preparation
       │
       ▼
Random Forest
       │
       ▼
Risk Probability
       │
       ▼
Optimized Threshold
       │
       ▼
Risk Category
```

### Outputs

- Risk probability
- Risk label
- Risk category
- Supplier-level risk information

The ML service exposes the model through FastAPI, while the Express API integrates the results into the frontend.

---

## Commodity Price Forecasting

VendorIQ forecasts monthly commodity prices using historical data from the **World Bank Pink Sheet** dataset.

### Supported commodities

- Natural Gas (US)
- Aluminum
- Copper
- Nickel
- Zinc

### Forecasting pipeline

```text
World Bank Historical Data
          │
          ▼
Data Cleaning
          │
          ▼
Lag Features
          │
          ▼
Rolling Statistics
          │
          ▼
XGBoost Regression
          │
          ▼
Forecast
          │
          ▼
95% Prediction Interval
```

Each forecast provides:

- Current value
- Forecast value
- Absolute change
- Percentage change
- Direction
- 95% prediction interval

> The prediction interval is an estimated range derived from validation residuals. It is not a probability that the forecast is correct.

---

## Contract Intelligence

VendorIQ uses **local LLM inference through Ollama** to perform structured contract analysis.

### Model

```text
llama3.2:latest
```

### Analysis includes

- Contract summary
- Overall risk score
- Missing clauses
- Compliance issues
- Clause extraction
- Clause type
- Clause risk level
- Clause explanation
- Clause recommendation

### Processing flow

```text
Contract Text
      │
      ▼
Ollama / llama3.2
      │
      ▼
Structured Analysis
      │
      ├── Summary
      ├── Risk Score
      ├── Missing Clauses
      ├── Compliance Issues
      └── Clause Analysis
               │
               ▼
          PostgreSQL
```

The structured results are persisted in PostgreSQL.

> Contract Intelligence is an automated review aid and is **not legal advice**.

---

## Supplier Anomaly Detection

VendorIQ uses **Isolation Forest** to identify supplier records that appear statistically unusual.

### Model configuration

- Isolation Forest
- 400 trees
- Approximately 5% contamination
- RobustScaler preprocessing

### Detection flow

```text
Supplier Dataset
      │
      ▼
Feature Scaling
      │
      ▼
Isolation Forest
      │
      ▼
Anomaly Detection
      │
      ▼
Analyst Review
```

The system generates anomaly alerts that help analysts prioritize unusual supplier records.

> An anomaly alert is **not evidence of fraud**. It identifies an unusual pattern that requires human investigation.

---

## Market Intelligence

VendorIQ retrieves relevant market news through **GNews** and performs local sentiment analysis using Ollama.

### Topics

- Supply chain
- Procurement
- Logistics
- Manufacturing
- Semiconductors

### Processing pipeline

```text
GNews
  │
  ▼
Topic Retrieval
  │
  ▼
Relevance Filtering
  │
  ▼
Title Normalization
  │
  ▼
Deduplication
  │
  ▼
Ollama Sentiment Analysis
  │
  ▼
Market Intelligence Dashboard
```

The backend applies relevance filtering and title deduplication before sentiment analysis.

> Market coverage depends on the configured GNews query and returned articles. It is not comprehensive global news coverage.

---

# What-If Procurement Simulator

The What-If Simulator allows users to select a supplier and stress-test different procurement conditions.

### Scenario controls

- Inflation delta
- Global shipping delay
- Supplier price delta
- Demand shock

### Scenario workflow

```text
Selected Supplier
       │
       ▼
Current Baseline
       │
       ▼
Scenario Parameters
       │
       ├── Inflation
       ├── Shipping Delay
       ├── Supplier Pricing
       └── Demand
       │
       ▼
Scenario Calculation
       │
       ▼
Baseline vs Simulated
       │
       ├── Risk Score
       ├── Predicted Price
       ├── Anomaly Probability
       └── Recommendation Score
```

The simulator allows procurement users to explore how changing conditions affect a supplier's modeled outcome.

> The simulator is a stress-testing tool and should not be interpreted as a causal economic model.

---

# Procurement Agents & Copilot

The **Agents** area organizes VendorIQ around task-focused procurement workflows.

Current workflows include:

- Vendor risk
- Commodity and price intelligence
- Contract analysis
- Supplier anomaly detection
- Procurement copilot

These workflows provide structured access to the platform's intelligence capabilities.

They are designed as **decision-support workflows rather than fully autonomous agents**.

---

# Executive Intelligence

VendorIQ includes an executive-facing intelligence view covering:

- Savings opportunities
- Risk exposure
- Anomaly-related metrics
- Analyst efficiency
- Savings trajectory
- ROI projections

Some savings and ROI figures shown in the executive interface are illustrative demo values rather than measured production business results.

This distinction keeps the dashboard useful for demonstrating the intended product experience without presenting simulated business impact as real-world results.

---

# System Architecture

```mermaid
flowchart TD

    UI["React + Vite Frontend<br/>localhost:5173"]

    API["Express + Node.js API<br/>localhost:5000"]

    DB[("PostgreSQL")]

    ML["Python FastAPI ML Service<br/>127.0.0.1:8000"]

    RF["Random Forest<br/>Vendor Risk"]

    XGB["XGBoost<br/>Commodity Forecasting"]

    IF["Isolation Forest<br/>Anomaly Detection"]

    OLL["Ollama<br/>llama3.2"]

    NEWS["GNews<br/>Market Intelligence"]

    UI --> API

    API --> DB
    API --> ML
    API --> NEWS

    ML --> RF
    ML --> XGB
    ML --> IF
    ML --> OLL
```

### Service responsibilities

| Layer | Responsibility |
|---|---|
| **React / Vite** | Interactive frontend and dashboards |
| **Express / Node.js** | API layer and application orchestration |
| **PostgreSQL** | Persistent supplier and contract data |
| **FastAPI** | Machine-learning and NLP model serving |
| **Ollama** | Local LLM inference |
| **GNews** | External market-news retrieval |

---

# Procurement Workflow

```mermaid
flowchart LR

    A["Supplier<br/>Monitoring"]
    B["Risk<br/>Assessment"]
    C["Market<br/>Monitoring"]
    D["Contract<br/>Review"]
    E["Anomaly<br/>Investigation"]
    F["Scenario<br/>Simulation"]
    G["Procurement<br/>Decision"]

    A --> B
    B --> C
    C --> D
    D --> E
    E --> F
    F --> G
```

### Typical workflow

1. **Monitor suppliers** and review current supplier information.
2. **Assess supplier risk** using ML-generated risk scores.
3. **Monitor market conditions** using commodity forecasts and relevant news.
4. **Review contracts** for potential risks, missing clauses, and compliance issues.
5. **Investigate anomalies** identified by the anomaly detection model.
6. **Stress-test scenarios** using inflation, shipping, pricing, and demand changes.
7. **Make procurement decisions** using the combined evidence.

VendorIQ supports the analyst throughout this process rather than replacing human judgment.

---

# Machine Learning & AI Architecture

## Vendor Risk

| Component | Details |
|---|---|
| **Problem** | Identify suppliers requiring additional risk attention |
| **Model** | Random Forest classifier |
| **Decision** | Optimized classification threshold |
| **Output** | Probability, label, risk category |
| **Serving** | FastAPI |

## Commodity Forecasting

| Component | Details |
|---|---|
| **Problem** | Forecast future commodity price movement |
| **Model** | XGBoost regression |
| **Features** | Lag values and rolling statistics |
| **Evaluation** | Time-series holdout |
| **Output** | Forecast, change, direction, prediction interval |

## Supplier Anomaly Detection

| Component | Details |
|---|---|
| **Problem** | Identify statistically unusual supplier records |
| **Model** | Isolation Forest |
| **Configuration** | 400 trees, approximately 5% contamination |
| **Preprocessing** | RobustScaler |
| **Output** | Anomaly alerts and anomaly signals |

## Contract NLP

| Component | Details |
|---|---|
| **Problem** | Assist with first-pass contract review |
| **Model** | `llama3.2:latest` |
| **Runtime** | Ollama |
| **Output** | Summary, risk, missing clauses, compliance issues, clause analysis |
| **Storage** | PostgreSQL |

## Market Sentiment

| Component | Details |
|---|---|
| **Problem** | Identify sentiment in relevant procurement news |
| **Source** | GNews |
| **Processing** | Relevance filtering, deduplication, sentiment analysis |
| **Model** | Local Ollama inference |
| **Output** | Sentiment label per article |

---

# Technology Stack

| Area | Technologies |
|---|---|
| **Frontend** | React, TypeScript, Vite |
| **UI** | Tailwind CSS, component-based React UI |
| **Backend** | Node.js, Express, TypeScript |
| **ML / Data** | Python, pandas, NumPy, scikit-learn, XGBoost, joblib |
| **ML API** | FastAPI, Uvicorn |
| **AI / NLP** | Ollama, llama3.2 |
| **Database** | PostgreSQL, Drizzle ORM |
| **External Data** | World Bank Pink Sheet, GNews |
| **Package Management** | pnpm |

---

# Data Sources

| Source | Type | Usage |
|---|---|---|
| **World Bank Pink Sheet** | External | Historical monthly commodity prices |
| **GNews** | External | Market and supply-chain news |
| **Supplier Records** | Application data | Supplier intelligence and scenario analysis |
| **Vendor Dataset** | Application/model data | Risk and anomaly detection |

### Application supplier records

The current application contains supplier records including:

- Foxconn
- Vale SA
- Alibaba Cloud
- Evergrande Logistics
- Samsung Electronics
- Siemens AG
- BASF SE
- Petrobras

These are application records used for the project and **do not represent customers, partners, endorsements, or business relationships**.

---

# Database

VendorIQ uses **PostgreSQL** for persistent application data.

### Supplier records

Supplier data includes:

- Supplier ID
- Name
- Country
- Category
- Risk level
- Risk score
- On-time delivery
- Spend
- Status
- Website
- Contact information
- Latitude / longitude
- Created and updated timestamps

### Contract intelligence

Contract analysis results include:

- Summary
- Risk score
- Missing clauses
- Compliance issues
- Extracted clause information
- Clause risk level
- Explanations
- Recommendations

Database access is handled through **Drizzle ORM**.

---

# API & Services

| Service | Role | Address |
|---|---|---|
| **React / Vite** | Frontend | `http://localhost:5173` |
| **Express API** | Backend API | `http://localhost:5000` |
| **FastAPI ML** | ML / NLP service | `http://127.0.0.1:8000` |
| **PostgreSQL** | Persistent storage | `DATABASE_URL` |
| **Ollama** | Local LLM runtime | Local service |
| **GNews** | Market news provider | External API |

---

# Project Structure

```text
VendorIQ/
│
├── artifacts/
│   ├── api-server/
│   │   └── src/
│   │       └── routes/
│   │
│   └── vendor-iq/
│       └── src/
│           ├── pages/
│           ├── components/
│           ├── lib/
│           └── main.tsx
│
├── lib/
│   ├── api-client-react/
│   ├── api-spec/
│   ├── api-zod/
│   └── db/
│
├── ml/
│   ├── data/
│   ├── models/
│   └── src/
│       ├── api/
│       ├── forecast/
│       ├── fraud/
│       └── contract_nlp/
│
├── package.json
├── pnpm-workspace.yaml
└── README.md
```

---

# Local Development

VendorIQ runs locally as three primary services.

## Prerequisites

Install:

- Node.js
- pnpm
- Python 3
- PostgreSQL
- Ollama
- GNews API access

Pull the local LLM used by the application:

```powershell
ollama pull llama3.2
```

---

## 1. Start the ML Service

Open a PowerShell terminal:

```powershell
cd G:\VendorIQ\ml
.\.venv\Scripts\Activate.ps1
uvicorn src.api.main:app --reload --host 127.0.0.1 --port 8000
```

FastAPI:

```text
http://127.0.0.1:8000
```

Interactive API documentation:

```text
http://127.0.0.1:8000/docs
```

---

## 2. Start the Express API

Open a second PowerShell terminal:

```powershell
cd G:\VendorIQ\artifacts\api-server

$env:NODE_ENV="development"
$env:PORT="5000"
$env:DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/vendoriq"
$env:ML_API_URL="http://127.0.0.1:8000"
$env:GNEWS_API_KEY="YOUR_GNEWS_API_KEY"

pnpm run start
```

The Express API will run at:

```text
http://localhost:5000
```

---

## 3. Start the Frontend

Open a third PowerShell terminal:

```powershell
cd G:\VendorIQ

$env:PORT="5173"
$env:BASE_PATH="/"

cd artifacts\vendor-iq
pnpm dev
```

Open the application:

```text
http://localhost:5173
```

---

# Environment Variables

| Variable | Purpose | Example |
|---|---|---|
| `NODE_ENV` | Express runtime environment | `development` |
| `PORT` | Express API port | `5000` |
| `DATABASE_URL` | PostgreSQL connection | `postgresql://postgres:YOUR_PASSWORD@localhost:5432/vendoriq` |
| `ML_API_URL` | FastAPI ML service | `http://127.0.0.1:8000` |
| `GNEWS_API_KEY` | GNews authentication | `YOUR_GNEWS_API_KEY` |

> Never commit API keys, passwords, tokens, or other credentials to GitHub.

---

# Screenshots

## Dashboard

![VendorIQ Dashboard](docs/screenshots/dashboard.png)

## Vendor Risk Intelligence

![Vendor Risk Intelligence](docs/screenshots/risk.png)

## Commodity Forecasting

![Commodity Forecasting](docs/screenshots/forecast.png)

## Contract Intelligence

![Contract Intelligence](docs/screenshots/contracts.png)

## Market Intelligence

![Market Intelligence](docs/screenshots/market.png)

## What-If Simulator

![What-If Simulator](docs/screenshots/simulator.png)

---

# Model & Data Considerations

VendorIQ is designed as a **decision-support platform**. Its outputs should be interpreted within the limitations of the underlying data, models, and assumptions.

### Forecasts are estimates

Commodity forecasts are model outputs and should not be treated as guaranteed future prices.

### Prediction intervals are not guarantees

The displayed 95% prediction interval is an estimated range derived from validation residuals.

### Anomalies are not proof of fraud

Isolation Forest identifies statistically unusual records. Each alert requires human review.

### Contract analysis is not legal advice

Automated NLP can miss, misinterpret, or incorrectly classify contract language.

### Supplier records are application data

The suppliers represented in the application are used for demonstration and system functionality.

### Simulation outputs are scenario estimates

What-If results depend on the scenario assumptions and are intended for stress testing rather than causal prediction.

### Executive metrics may be illustrative

Savings and ROI figures presented in the executive view should not be interpreted as measured production business outcomes.

### Market coverage is limited

Market intelligence depends on the configured GNews query and returned articles.

---

# Engineering Highlights

VendorIQ demonstrates the integration of several areas of modern software and AI engineering.

### Full-Stack Development

- React + TypeScript
- Vite
- Express
- PostgreSQL
- Drizzle ORM
- Shared API/client architecture

### Machine Learning

- Random Forest classification
- XGBoost regression
- Isolation Forest anomaly detection
- Feature engineering
- Time-series evaluation
- Prediction intervals
- FastAPI model serving

### Generative AI & NLP

- Local LLM inference
- Ollama integration
- Structured contract analysis
- Clause-level NLP
- Market sentiment analysis

### Data Engineering

- External data ingestion
- Commodity data cleaning
- Time-series feature engineering
- Supplier persistence
- API orchestration

### Product Engineering

- Interactive dashboards
- Supplier monitoring
- Scenario simulation
- Executive intelligence
- Task-oriented procurement workflows
- Multi-service local architecture

---

# Future Improvements

Potential future directions include:

- Larger supplier and procurement datasets
- Automated model retraining
- Model drift monitoring
- Explainable ML and feature attribution
- Additional procurement and market data sources
- More advanced agent orchestration
- Human approval checkpoints
- Authentication and role-based access control
- Production deployment
- Automated ML evaluation pipelines
- Model observability and monitoring
- Advanced procurement optimization

---

# Responsible Use

VendorIQ is designed to **support procurement analysts, not replace them**.

The platform produces model-generated signals and scenario estimates that should be considered alongside:

- Organizational procurement policies
- Supplier information
- Financial data
- Contractual requirements
- Domain expertise
- Human review

The platform does not independently make procurement decisions.

---

# Conclusion

VendorIQ demonstrates how multiple forms of intelligence can be integrated into a single procurement application.

```text
Supplier Risk
      +
Commodity Forecasting
      +
Contract Intelligence
      +
Anomaly Detection
      +
Market Intelligence
      +
Scenario Simulation
      +
Procurement Workflows
      │
      ▼
Unified Procurement Decision Support
```

The project combines **classical machine learning, local generative AI, external data, backend APIs, persistent storage, and interactive frontend engineering** into one end-to-end application.

The result is a practical exploration of how heterogeneous supplier and market signals can be transformed into a unified procurement intelligence workflow.

---

<div align="center">

### VendorIQ

**From supplier signals to procurement decisions.**

Built with React, TypeScript, Python, FastAPI, Express, PostgreSQL, scikit-learn, XGBoost, and Ollama.

</div>
