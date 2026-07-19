from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.routers import backtest, data, strategies

app = FastAPI(title="Quant Platform API", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # For development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(backtest.router)
app.include_router(data.router)
app.include_router(strategies.router)

@app.get("/")
def read_root():
    return {"status": "Quant API Running"}
