from fastapi import APIRouter, HTTPException
from app.models.schemas import SavedStrategy
from app.core.config import DATA_CACHE_DIR
import json
import os

router = APIRouter(prefix="/api/strategies", tags=["Strategies"])

STRATEGIES_FILE = DATA_CACHE_DIR / "strategies.json"

def load_strategies():
    if not STRATEGIES_FILE.exists():
        return []
    try:
        with open(STRATEGIES_FILE, "r") as f:
            return json.load(f)
    except Exception:
        return []

def save_strategies(strategies):
    with open(STRATEGIES_FILE, "w") as f:
        json.dump(strategies, f, indent=4)

@router.get("/")
def get_strategies():
    return load_strategies()

@router.post("/")
def save_strategy(strategy: SavedStrategy):
    strategies = load_strategies()
    
    # Check if exists, update if it does
    updated = False
    for i, s in enumerate(strategies):
        if s["name"] == strategy.name:
            strategies[i] = strategy.model_dump()
            updated = True
            break
            
    if not updated:
        strategies.append(strategy.model_dump())
        
    save_strategies(strategies)
    return {"message": "Strategy saved successfully", "strategy": strategy.model_dump()}

@router.delete("/{name}")
def delete_strategy(name: str):
    strategies = load_strategies()
    initial_len = len(strategies)
    strategies = [s for s in strategies if s["name"] != name]
    
    if len(strategies) == initial_len:
        raise HTTPException(status_code=404, detail="Strategy not found")
        
    save_strategies(strategies)
    return {"message": "Strategy deleted successfully"}
