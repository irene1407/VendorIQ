from typing import Any

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from src.api.fraud import router as fraud_router
from src.api.forecast import router as forecast_router
from src.contract_nlp.service import analyze_contract
from src.inference.explainer import VendorRiskExplainer
from src.inference.predictor import get_predictor
from src.inference.predictor import predict_vendor


app = FastAPI(
    title="VendorIQ ML API",
    description="AI-powered vendor risk prediction and contract intelligence API",
    version="1.0.0",
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


explainer = VendorRiskExplainer()


class VendorInput(BaseModel):
    vendor_id: str = Field(
        ...,
        description="Unique vendor identifier",
    )

    revenue_growth: float
    debt_to_equity: float
    profit_margin: float
    cash_flow_ratio: float

    delivery_delay_rate: float
    defect_rate: float
    capacity_utilization: float
    lead_time_variability: float

    compliance_score: float
    certification_count: int
    regulatory_violations: int

    security_incidents: int
    data_breaches: int
    security_score: float

    customer_complaints: int
    negative_news_count: int
    sentiment_score: float

    country_risk_score: float
    geopolitical_exposure: float


class BatchVendorInput(BaseModel):
    vendors: list[VendorInput]


class ContractInput(BaseModel):
    content: str = Field(
        ...,
        min_length=1,
        description="Contract text to analyze",
    )


@app.get("/health")
def health() -> dict[str, str]:
    return {
        "status": "healthy",
        "service": "VendorIQ ML API",
    }


@app.get("/model-info")
def model_info() -> dict[str, Any]:
    predictor = get_predictor()

    return {
        "model": "Random Forest",
        "model_type": "optimized",
        "threshold": predictor.threshold,
        "status": "loaded",
    }


@app.post("/predict")
def predict(
    vendor: VendorInput,
) -> dict[str, Any]:

    try:
        result = predict_vendor(
            vendor.model_dump()
        )

        return result

    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=f"Prediction failed: {str(exc)}",
        ) from exc


@app.post("/explain")
def explain_vendor(
    vendor: VendorInput,
) -> dict[str, Any]:

    try:
        vendor_data = vendor.model_dump()

        predictor = get_predictor()

        features = predictor.prepare_features(
            vendor_data
        )

        explanation = explainer.explain(
            features,
            top_n=10,
        )

        prediction = predictor.predict(
            vendor_data
        )

        return {
            "vendor_id": vendor_data.get(
                "vendor_id"
            ),
            "prediction": prediction,
            "explanation": explanation,
        }

    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=f"Explanation failed: {str(exc)}",
        ) from exc


@app.post("/predict/batch")
def predict_batch(
    request: BatchVendorInput,
) -> dict[str, Any]:

    try:
        predictions = []

        for vendor in request.vendors:
            result = predict_vendor(
                vendor.model_dump()
            )

            predictions.append(result)

        return {
            "count": len(predictions),
            "predictions": predictions,
        }

    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=f"Batch prediction failed: {str(exc)}",
        ) from exc


@app.post("/analyze-contract")
def analyze_contract_endpoint(
    request: ContractInput,
) -> dict[str, Any]:

    try:
        return analyze_contract(
            request.content
        )

    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=f"Contract analysis failed: {str(exc)}",
        ) from exc


app.include_router(forecast_router)
app.include_router(fraud_router)