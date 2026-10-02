# VendorIQ
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

## Dashboard & Executive Intelligence

### Main Dashboard
![VendorIQ Dashboard](docs/screenshots/dashboard1.png)
![VendorIQ Dashboard](docs/screenshots/dashboard2.png)

---

## Supplier Intelligence

### Supplier Risk Intelligence
![Supplier Risk Intelligence](docs/screenshots/risk.png)

### Supplier Registry
![Supplier Registry](docs/screenshots/registry.png)

### Experiment Tracker
![Experiment Tracker](docs/screenshots/tracker.png)

---

## Predictive Intelligence

### Commodity Price Forecasting
![Commodity Forecasting](docs/screenshots/forecast.png)

### Executive Command Center
![Executive Command Center](docs/screenshots/command.png)
![Command Center Centre](docs/screenshots/command2.png)

---

## Contract & Market Intelligence

### Contract Intelligence
![Contract Intelligence](docs/screenshots/contracts.png)

### Market Intelligence
![Market Intelligence](docs/screenshots/market.png)

### Market Intelligence Analytics
![Market Intelligence Analytics](docs/screenshots/market2.png)

---

## AI agent Hub

### AI Agent Hub
![AI Agent hub](docs/screenshots/Alagent.png)

### What-If Supplier Simulator
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

