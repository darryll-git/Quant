import yfinance as yf
import pandas as pd
import pyarrow as pa
import pyarrow.parquet as pq
from pathlib import Path
from app.core.config import DATA_CACHE_DIR, settings
import datetime

class DataFetcher:
    @staticmethod
    def get_historical_data(ticker: str, start_date: str, end_date: str) -> pd.DataFrame:
        """
        Fetches historical daily data. Checks local parquet cache first.
        If missing or outside the date range, it fetches, updates cache, and returns.
        """
        cache_file = DATA_CACHE_DIR / f"{ticker}.parquet"
        
        # Determine actual date boundaries needed
        dt_start = pd.to_datetime(start_date)
        dt_end = pd.to_datetime(end_date)
        
        df = None
        if cache_file.exists():
            df = pq.read_table(cache_file).to_pandas()
            df['time'] = pd.to_datetime(df['time'])
            
            # Check if cache covers the requested range with a 5-day grace period for holidays
            cache_min = df['time'].min()
            cache_max = df['time'].max()
            
            if cache_min <= (dt_start + pd.Timedelta(days=5)) and cache_max >= (dt_end - pd.Timedelta(days=5)):
                mask = (df['time'] >= dt_start) & (df['time'] <= dt_end)
                return df.loc[mask].copy()
                
        # If we reach here, we need to fetch data.
        # In a real dual-tier system, we'd check POLYGON_API_KEY here first.
        # For now, default to yfinance as requested (dual-tier ready)
        
        if settings.POLYGON_API_KEY:
            # Placeholder for Polygon implementation
            pass
        elif settings.ALPACA_API_KEY:
            # Placeholder for Alpaca implementation
            pass
            
        # Fallback to yfinance
        print(f"Fetching {ticker} from yfinance...")
        # Fetch an extra year back for indicators (e.g. 50 SMA needs 50 days prior)
        fetch_start = dt_start - pd.Timedelta(days=100)
        
        yf_ticker = yf.Ticker(ticker)
        new_df = yf_ticker.history(start=fetch_start.strftime('%Y-%m-%d'), end=(dt_end + pd.Timedelta(days=1)).strftime('%Y-%m-%d'))
        
        if new_df.empty:
            raise ValueError(f"No data found for ticker {ticker}")
            
        new_df.reset_index(inplace=True)
        # Handle Date or Datetime from yfinance
        if 'Date' in new_df.columns:
            new_df.rename(columns={'Date': 'time'}, inplace=True)
        elif 'Datetime' in new_df.columns:
            new_df.rename(columns={'Datetime': 'time'}, inplace=True)
            
        # Remove timezone info for simplicity in caching and matching
        new_df['time'] = pd.to_datetime(new_df['time']).dt.tz_localize(None)
        
        new_df.rename(columns={
            'Open': 'open',
            'High': 'high',
            'Low': 'low',
            'Close': 'close',
            'Volume': 'volume'
        }, inplace=True)
        
        new_df = new_df[['time', 'open', 'high', 'low', 'close', 'volume']]
        
        # Forward fill any missing values, then backward fill
        new_df.ffill(inplace=True)
        new_df.bfill(inplace=True)
        
        # Merge with existing cache if it exists, to build a larger cache over time
        if df is not None:
            combined = pd.concat([df, new_df]).drop_duplicates(subset=['time']).sort_values('time')
            combined.reset_index(drop=True, inplace=True)
            final_cache = combined
        else:
            final_cache = new_df
            
        # Save to Parquet
        table = pa.Table.from_pandas(final_cache)
        pq.write_table(table, cache_file)
        
        mask = (final_cache['time'] >= dt_start) & (final_cache['time'] <= dt_end)
        return final_cache.loc[mask].copy()
