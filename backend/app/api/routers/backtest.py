import asyncio
import json
from fastapi import APIRouter, Request
from sse_starlette.sse import EventSourceResponse
from app.models.schemas import BacktestRequest, StreamEvent, OHLCVBar, SMAData, EquityPoint, LogEntry, PerformanceMetrics
from app.services.data_fetcher import DataFetcher
from app.services.engine import run_backtest_engine
import pandas as pd

router = APIRouter(prefix="/api/backtest", tags=["Backtest"])

@router.post("/run")
async def run_backtest(req: BacktestRequest, request: Request):
    """
    Kicks off a backtest and streams the results via SSE.
    """
    async def event_generator():
        try:
            print("[SSE] Starting generator")
            # Send initial event
            init_event = StreamEvent(progress=5, error=None)
            yield json.dumps(init_event.model_dump())
            await asyncio.sleep(0.1)
            # 1. Fetch Data
            print(f"[SSE] Fetching data for {req.ticker}...")
            fetch_task = asyncio.create_task(
                asyncio.to_thread(DataFetcher.get_historical_data, req.ticker, req.startDate, req.endDate)
            )
            
            ticks = 0
            while not fetch_task.done():
                ticks += 1
                ping_prog = 5 + (ticks % 10)
                ping_event = StreamEvent(progress=ping_prog, error=None)
                yield json.dumps(ping_event.model_dump())
                await asyncio.sleep(1.0)
                
            df = fetch_task.result()
            print(f"[SSE] Fetched {len(df)} rows.")
            
            # Send data fetched event
            fetch_event = StreamEvent(progress=20, error=None)
            yield json.dumps(fetch_event.model_dump())
            await asyncio.sleep(0.1)
            
            # 2. Run Engine (Fast vectorization)
            print("[SSE] Running engine...")
            res_df, all_logs, final_metrics = await asyncio.to_thread(run_backtest_engine, df, req.alphaCode, req.alphaType)
            print(f"[SSE] Engine finished. res_df: {len(res_df)} rows, all_logs: {len(all_logs)}")
            
            # 3. Stream in chunks to the frontend
            total_rows = len(res_df)
            chunk_count = 20 # Stream in 20 chunks for UI visualization
            chunk_size = max(1, total_rows // chunk_count)
            print(f"[SSE] Starting stream loop. Total: {total_rows}, Chunk size: {chunk_size}")
            
            for i in range(0, total_rows, chunk_size):
                if await request.is_disconnected():
                    print("[SSE] Request disconnected!")
                    break
                    
                end_idx = min(i + chunk_size, total_rows)
                chunk_df = res_df.iloc[i:end_idx]
                print(f"[SSE] Processing chunk {i} to {end_idx}")
                
                # Filter logs for this chunk's time period
                start_time = chunk_df['time'].iloc[0].strftime("%Y-%m-%d")
                end_time = chunk_df['time'].iloc[-1].strftime("%Y-%m-%d")
                
                chunk_logs = [log for log in all_logs if start_time <= log['time'] <= end_time]
                
                progress = int((end_idx / total_rows) * 100)
                
                # Convert chunk to schemas
                candles = [
                    OHLCVBar(
                        time=row.time.strftime("%Y-%m-%d"),
                        open=row.open, high=row.high, low=row.low, close=row.close, volume=row.volume
                    ) for row in chunk_df.itertuples()
                ]
                smaShort = [
                    SMAData(time=row.time.strftime("%Y-%m-%d"), value=row.smaShort)
                    for row in chunk_df.itertuples()
                ]
                smaLong = [
                    SMAData(time=row.time.strftime("%Y-%m-%d"), value=row.smaLong)
                    for row in chunk_df.itertuples()
                ]
                equity = [
                    EquityPoint(time=row.time.strftime("%Y-%m-%d"), value=row.equity)
                    for row in chunk_df.itertuples()
                ]
                logs_list = [LogEntry(**l) for l in chunk_logs]
                
                event_data = StreamEvent(
                    progress=progress,
                    candles=candles,
                    smaShort=smaShort,
                    smaLong=smaLong,
                    equity=equity,
                    logs=logs_list,
                    metrics=None
                )
                
                yield json.dumps(event_data.model_dump())
                
                # Small delay for UI animation effect
                await asyncio.sleep(0.1)
                
            # Send Final Metrics
            final_event = StreamEvent(
                progress=100,
                metrics=PerformanceMetrics(**final_metrics)
            )
            yield json.dumps(final_event.model_dump())

        except Exception as e:
            import traceback
            traceback.print_exc()
            print(f"[SSE] Exception caught: {e}")
            # Send error event
            err_event = StreamEvent(progress=100, error=str(e))
            yield json.dumps(err_event.model_dump())

    return EventSourceResponse(event_generator())
