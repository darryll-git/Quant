from pydantic_settings import BaseSettings
from pathlib import Path
import os
from dotenv import load_dotenv

load_dotenv()

BASE_DIR = Path(__file__).resolve().parent.parent.parent
DATA_CACHE_DIR = BASE_DIR / "data_cache"
DATA_CACHE_DIR.mkdir(parents=True, exist_ok=True)

class Settings(BaseSettings):
    # Broker Mechanics Defaults (10 bps commission, 5 bps slippage)
    COMMISSION_RATE: float = 0.0010
    SLIPPAGE_RATE: float = 0.0005
    
    # Dual-tier Data Architecture
    POLYGON_API_KEY: str | None = os.getenv("POLYGON_API_KEY")
    ALPACA_API_KEY: str | None = os.getenv("ALPACA_API_KEY")
    
    # Optional Risk-Free Rate config (Default 0.0, option for 3.70% or 0.037)
    RISK_FREE_RATE: float = float(os.getenv("RISK_FREE_RATE", "0.0"))
    
settings = Settings()
