import os
import re
import glob
import pandas as pd
from typing import Tuple, List, Optional

MAX_ENTITY_VALUES = 25

def slug(v: any) -> str:
    """Sanitize string or value into a clean alphanumeric slug."""
    return re.sub(r"[^A-Za-z0-9_]+", "_", str(v).strip()).strip("_") or "unknown"

def py(v: any) -> any:
    """Convert numpy or pandas scalar to native Python type."""
    return v.item() if hasattr(v, "item") else v

def is_entity_col(s: pd.Series, max_entity_values: int = MAX_ENTITY_VALUES) -> bool:
    """Determine if a column should be modeled as Entity nodes."""
    n = s.nunique(dropna=True)
    if pd.api.types.is_float_dtype(s):
        vals = s.dropna()
        if not (vals % 1 == 0).all():  # genuinely continuous -> property
            return False
    return 1 < n <= max_entity_values and n <= 0.6 * len(s)

def row_to_text(i: int, row: pd.Series) -> str:
    """Serialize a single record row into text for vector embedding."""
    return f"Record {i} - " + "; ".join(f"{c}: {v}" for c, v in row.items() if pd.notna(v))

def load_financial_data(csv_path: Optional[str] = None) -> pd.DataFrame:
    """
    Load the financial survey dataset. Searches local data/ path,
    or falls back to provided path.
    """
    candidates = []
    if csv_path and os.path.exists(csv_path):
        candidates.append(csv_path)

    # Common local search paths
    candidates.extend([
        "data/Finance_data.csv",
        "../data/Finance_data.csv",
        "/Users/ayushgupta/Downloads/lavaloon-terminal-main/data/Finance_data.csv"
    ])
    candidates.extend(glob.glob("**/Finance_data.csv", recursive=True))

    valid_path = None
    for p in candidates:
        if os.path.exists(p) and os.path.isfile(p):
            valid_path = p
            break

    if not valid_path:
        raise FileNotFoundError(f"Could not locate Finance_data.csv. Searched: {candidates}")

    df = pd.read_csv(valid_path)
    df.columns = [str(c).strip() for c in df.columns]
    df = df.dropna(how="all").reset_index(drop=True)
    return df

