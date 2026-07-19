from fastapi import APIRouter, HTTPException
from app.services.data_fetcher import DataFetcher
from app.core.config import DATA_CACHE_DIR
import os

router = APIRouter(prefix="/api/data", tags=["Data"])

@router.get("/cache/status")
def get_cache_status():
    """Returns the list of tickers currently cached in parquet files."""
    files = []
    if DATA_CACHE_DIR.exists():
        files = [f.stem for f in DATA_CACHE_DIR.glob("*.parquet")]
    return {"cached_tickers": files}

@router.post("/prefetch/{ticker}")
def prefetch_data(ticker: str, start: str, end: str):
    """Manually triggers data fetching to prime the cache."""
    try:
        df = DataFetcher.get_historical_data(ticker, start, end)
        return {"status": "success", "rows": len(df)}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
