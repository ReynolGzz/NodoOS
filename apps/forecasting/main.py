from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import Optional
import statistics
from datetime import datetime, timedelta

app = FastAPI(title="NODO Forecasting Service", version="1.0.0")


class ForecastRequest(BaseModel):
    branchId: str
    historical: dict  # key: "dow_hour" e.g. "1_14", value: {orders, revenue, count}
    targetDate: str   # YYYY-MM-DD


class HourPrediction(BaseModel):
    hour: int
    orders: int
    revenue: float
    confidence: float


class ForecastResponse(BaseModel):
    branchId: str
    targetDate: str
    predictions: list[HourPrediction]


@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/forecast", response_model=ForecastResponse)
def generate_forecast(req: ForecastRequest):
    try:
        target = datetime.strptime(req.targetDate, "%Y-%m-%d")
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid targetDate format")

    dow = target.weekday()  # Python: 0=Mon ... 6=Sun; JS: 0=Sun
    # Convert to JS convention (0=Sun)
    dow_js = (dow + 1) % 7

    predictions = []
    for hour in range(24):
        key = f"{dow_js}_{hour}"
        exact = req.historical.get(key)

        # Gather all hours across all days of week for baseline
        all_for_hour = [
            v for k, v in req.historical.items()
            if k.endswith(f"_{hour}")
        ]

        if all_for_hour:
            avg_orders = statistics.mean(b["orders"] for b in all_for_hour)
            avg_revenue = statistics.mean(b["revenue"] for b in all_for_hour)
        else:
            avg_orders = 0.0
            avg_revenue = 0.0

        if exact:
            # Weight 70% same-DOW, 30% global average
            pred_orders = exact["orders"] * 0.7 + avg_orders * 0.3
            pred_revenue = exact["revenue"] * 0.7 + avg_revenue * 0.3
            confidence = min(0.9, 0.45 + exact["count"] * 0.04)
        else:
            pred_orders = avg_orders
            pred_revenue = avg_revenue
            confidence = 0.35

        predictions.append(HourPrediction(
            hour=hour,
            orders=round(pred_orders),
            revenue=round(pred_revenue, 2),
            confidence=round(confidence, 2),
        ))

    return ForecastResponse(
        branchId=req.branchId,
        targetDate=req.targetDate,
        predictions=predictions,
    )
