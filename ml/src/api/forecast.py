from fastapi import APIRouter, HTTPException

from src.forecast.data import load_commodity_data
from src.forecast.service import COMMODITIES, generate_forecast


router = APIRouter(prefix="/forecast", tags=["Forecast"])


@router.get("/commodities")
def list_commodities():
    return [
        {
            "id": commodity_id,
            "name": details["name"],
            "unit": details["unit"],
        }
        for commodity_id, details in COMMODITIES.items()
    ]


@router.get("/{commodity}")
def get_forecast(commodity: str, periods: int = 3):
    if commodity not in COMMODITIES:
        raise HTTPException(
            status_code=404,
            detail=f"Unknown commodity: {commodity}",
        )

    if periods < 1 or periods > 12:
        raise HTTPException(
            status_code=400,
            detail="periods must be between 1 and 12",
        )

    try:
        df = load_commodity_data()

        return generate_forecast(
            df=df,
            commodity=commodity,
            periods=periods,
        )

    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=str(exc),
        ) from exc