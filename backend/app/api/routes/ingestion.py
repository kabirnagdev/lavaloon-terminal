import os
import io
import json
import shutil
from typing import Dict, Any, List, Optional
from fastapi import APIRouter, UploadFile, File, Form, HTTPException, Depends
from pydantic import BaseModel
import pandas as pd
import numpy as np

from backend.app.api.dependencies.database import AppGraphState, get_graph_state
from backend.app.core.config import settings

router = APIRouter(prefix="/ingestion", tags=["ingestion"])

UPLOAD_DIR = "data/uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

class DatasetSummary(BaseModel):
    filename: str
    filepath: str
    rows: int
    columns: List[str]
    column_count: int
    null_cells: int
    null_percentage: float
    duplicate_rows: int
    memory_usage_kb: float
    detected_entities: List[str]
    sample_records: List[Dict[str, Any]]
    chart_preview: Optional[Dict[str, Any]] = None
    status: str


def compute_chart_preview(df: pd.DataFrame) -> Optional[Dict[str, Any]]:
    """Generate a clean visual chart summary from any uploaded dataset."""
    if df.empty:
        return None

    # Priority 1: Entity + Numeric Metric (Ranking Bar Chart)
    num_cols = [
        c for c in df.columns
        if pd.api.types.is_numeric_dtype(df[c])
        and not any(x in c.lower() for x in ["rank", "year", "date", "id", "index", "code", "zip", "lat", "long"])
    ]
    entity_candidates = ["company", "company_name", "youtuber", "name", "title", "product_name", "store_name", "ticker", "entity", "country"]
    e_col = next((c for c in df.columns if c.lower() in entity_candidates or "name" in c.lower()), None)

    if e_col and num_cols:
        n_col = num_cols[0]
        try:
            valid_df = df[[e_col, n_col]].dropna()
            top = valid_df.sort_values(by=n_col, ascending=False).head(8)
            return {
                "title": f"Top {e_col} by {n_col}",
                "column": e_col,
                "metric": n_col,
                "type": "ranking",
                "items": [{"label": str(row[e_col]), "value": float(row[n_col])} for _, row in top.iterrows()]
            }
        except Exception:
            pass

    # Priority 2: Categorical Distribution (Frequency Count Bar Chart)
    cat_cols = [c for c in df.columns if 2 <= df[c].nunique() <= 30]
    if cat_cols:
        target_col = cat_cols[0]
        for c in cat_cols:
            if any(k in c.lower() for k in ["category", "sector", "industry", "type", "avenue", "segment", "country"]):
                target_col = c
                break
        counts = df[target_col].value_counts().head(8).to_dict()
        return {
            "title": f"Distribution by {target_col}",
            "column": target_col,
            "metric": "Records Count",
            "type": "distribution",
            "items": [{"label": str(k), "value": int(v)} for k, v in counts.items()]
        }
    return None

@router.get("/available-datasets")
def list_available_datasets() -> List[Dict[str, Any]]:
    """List datasets available in data/ and Datas/ directory for instant testing."""
    datasets = []
    
    search_dirs = ["data", "Datas", "Datas/archive", UPLOAD_DIR]
    for d in search_dirs:
        if not os.path.exists(d):
            continue
        for f in os.listdir(d):
            if f.endswith((".csv", ".xlsx", ".json")):
                p = os.path.join(d, f)
                if os.path.isfile(p):
                    size = os.path.getsize(p)
                    datasets.append({
                        "name": f,
                        "path": p,
                        "folder": d,
                        "size_kb": round(size / 1024, 1),
                        "extension": os.path.splitext(f)[1].lower()
                    })
    return datasets

@router.post("/upload", response_model=DatasetSummary)
async def upload_csv_dataset(
    file: UploadFile = File(...),
    graph_state: AppGraphState = Depends(get_graph_state)
) -> DatasetSummary:
    """
    Accept an uploaded CSV or Excel dataset, validate integrity,
    and return structured analytical preview.
    """
    filename = file.filename or "uploaded_data.csv"
    ext = os.path.splitext(filename)[1].lower()
    
    if ext not in [".csv", ".xlsx", ".xls"]:
        raise HTTPException(status_code=400, detail="Only .csv and .xlsx files are supported.")
    
    save_path = os.path.join(UPLOAD_DIR, filename)
    contents = await file.read()
    
    with open(save_path, "wb") as f:
        f.write(contents)
        
    try:
        if ext == ".csv":
            try:
                df = pd.read_csv(save_path, encoding="utf-8")
            except UnicodeDecodeError:
                df = pd.read_csv(save_path, encoding="latin1")
        else:
            df = pd.read_excel(save_path)
            
        rows = len(df)
        cols = list(df.columns)
        nulls = int(df.isnull().sum().sum())
        null_pct = round((nulls / (rows * len(cols)) * 100), 2) if rows * len(cols) > 0 else 0.0
        dups = int(df.duplicated().sum())
        mem_kb = round(df.memory_usage(deep=True).sum() / 1024, 2)
        
        # Detect possible entity or company columns
        detected_entities = []
        entity_col_candidates = ["company", "company_name", "ticker", "youtuber", "product_name", "state", "store_name", "avenue"]
        for c in df.columns:
            if c.lower() in entity_col_candidates or "name" in c.lower() or "ticker" in c.lower():
                unique_vals = [str(x) for x in df[c].dropna().unique()[:8]]
                detected_entities.extend(unique_vals)
                
        sample = df.head(10).replace({np.nan: None}).to_dict(orient="records")
        preview = compute_chart_preview(df)

        # Auto-activate into live knowledge graph and copilot
        try:
            graph_state.load_dataset(save_path)
        except Exception:
            pass
        
        return DatasetSummary(
            filename=filename,
            filepath=save_path,
            rows=rows,
            columns=cols,
            column_count=len(cols),
            null_cells=nulls,
            null_percentage=null_pct,
            duplicate_rows=dups,
            memory_usage_kb=mem_kb,
            detected_entities=list(dict.fromkeys(detected_entities))[:15],
            sample_records=sample,
            chart_preview=preview,
            status="Successfully Validated & Loaded"
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to parse and validate dataset: {str(e)}")

@router.post("/inspect-local", response_model=DatasetSummary)
def inspect_local_dataset(path: str = Form(...)) -> DatasetSummary:
    """Inspect and test an existing local dataset from Datas/ or data/."""
    if not os.path.exists(path) or not os.path.isfile(path):
        raise HTTPException(status_code=404, detail=f"File not found: {path}")
        
    ext = os.path.splitext(path)[1].lower()
    try:
        if ext == ".csv":
            try:
                df = pd.read_csv(path, encoding="utf-8")
            except UnicodeDecodeError:
                df = pd.read_csv(path, encoding="latin1")
        elif ext in [".xlsx", ".xls"]:
            df = pd.read_excel(path)
        else:
            raise HTTPException(status_code=400, detail="Unsupported format")
            
        rows = len(df)
        cols = list(df.columns)
        nulls = int(df.isnull().sum().sum())
        null_pct = round((nulls / (rows * len(cols)) * 100), 2) if rows * len(cols) > 0 else 0.0
        dups = int(df.duplicated().sum())
        mem_kb = round(df.memory_usage(deep=True).sum() / 1024, 2)
        
        detected_entities = []
        entity_col_candidates = ["company", "company_name", "ticker", "youtuber", "product_name", "state", "store_name", "avenue"]
        for c in df.columns:
            if c.lower() in entity_col_candidates or "name" in c.lower() or "ticker" in c.lower():
                unique_vals = [str(x) for x in df[c].dropna().unique()[:8]]
                detected_entities.extend(unique_vals)
                
        sample = df.head(10).replace({np.nan: None}).to_dict(orient="records")
        preview = compute_chart_preview(df)
        
        return DatasetSummary(
            filename=os.path.basename(path),
            filepath=path,
            rows=rows,
            columns=cols,
            column_count=len(cols),
            null_cells=nulls,
            null_percentage=null_pct,
            duplicate_rows=dups,
            memory_usage_kb=mem_kb,
            detected_entities=list(dict.fromkeys(detected_entities))[:15],
            sample_records=sample,
            chart_preview=preview,
            status="Successfully Validated & Loaded"
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to inspect dataset: {str(e)}")

class RawContextPayload(BaseModel):
    title: Optional[str] = "pasted_context_data.csv"
    content: str

@router.post("/raw-context", response_model=DatasetSummary)
def ingest_raw_context(
    payload: RawContextPayload,
    graph_state: AppGraphState = Depends(get_graph_state)
) -> DatasetSummary:
    """Accept pasted tabular CSV text or raw context statements."""
    content = payload.content.strip()
    if not content:
        raise HTTPException(status_code=400, detail="Content cannot be empty.")
        
    title = payload.title or "custom_context.csv"
    if not title.endswith((".csv", ".txt")):
        title = f"{title}.csv"
        
    save_path = os.path.join(UPLOAD_DIR, title)
    with open(save_path, "w", encoding="utf-8") as f:
        f.write(content)
        
    try:
        try:
            df = pd.read_csv(io.StringIO(content))
        except Exception:
            lines = [line.strip() for line in content.splitlines() if line.strip()]
            df = pd.DataFrame({"Context_Segment": lines})
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to parse context: {str(e)}")
        
    rows = len(df)
    cols = list(df.columns)
    nulls = int(df.isnull().sum().sum())
    null_pct = round((nulls / (rows * len(cols)) * 100), 2) if rows * len(cols) > 0 else 0.0
    dups = int(df.duplicated().sum())
    mem_kb = round(df.memory_usage(deep=True).sum() / 1024, 2)
    
    detected_entities = []
    entity_col_candidates = ["company", "company_name", "ticker", "youtuber", "product_name", "state", "store_name", "avenue"]
    for c in df.columns:
        if any(cand in c.lower() for cand in entity_col_candidates):
            unique_vals = [str(x) for x in df[c].dropna().unique()[:8]]
            detected_entities.extend(unique_vals)
            
    sample = df.head(10).replace({np.nan: None}).to_dict(orient="records")
    preview = compute_chart_preview(df)

    # Auto-activate into live knowledge graph and copilot
    try:
        graph_state.load_dataset(save_path)
    except Exception:
        pass

    return DatasetSummary(
        filename=title,
        filepath=save_path,
        rows=rows,
        columns=cols,
        column_count=len(cols),
        null_cells=nulls,
        null_percentage=null_pct,
        duplicate_rows=dups,
        memory_usage_kb=mem_kb,
        detected_entities=list(dict.fromkeys(detected_entities))[:15],
        sample_records=sample,
        chart_preview=preview,
        status="Custom Context Ingested"
    )


@router.post("/activate-graph")
def activate_dataset_graph(
    filepath: str = Form(...),
    graph_state: AppGraphState = Depends(get_graph_state)
) -> Dict[str, Any]:
    """Activate an uploaded or local dataset into the live Cytoscape Knowledge Graph."""
    if not os.path.exists(filepath):
        raise HTTPException(status_code=404, detail=f"Dataset file not found at: {filepath}")
    try:
        res = graph_state.load_dataset(filepath)
        return {
            "status": "success",
            "message": f"Successfully activated {res['active_dataset']} into live Knowledge Graph.",
            **res
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to activate dataset in graph: {str(e)}")


@router.get("/active-dataset")
def get_active_dataset(
    graph_state: AppGraphState = Depends(get_graph_state)
) -> Dict[str, Any]:
    """Retrieve details on the currently active Knowledge Graph dataset."""
    default_name = os.path.basename(settings.DATA_CSV_PATH)
    return {
        "active_dataset": graph_state.active_dataset_name,
        "is_default": graph_state.active_dataset_name == default_name,
        "total_nodes": graph_state.G.number_of_nodes() if graph_state.G else 0,
        "total_edges": graph_state.G.number_of_edges() if graph_state.G else 0,
        "entity_columns": graph_state.ent_cols
    }


@router.post("/reset-graph")
def reset_to_default_graph(
    graph_state: AppGraphState = Depends(get_graph_state)
) -> Dict[str, Any]:
    """Reset Knowledge Graph back to canonical financial dataset."""
    try:
        res = graph_state.reset_to_default()
        return {
            "status": "success",
            "message": "Reset to canonical financial dataset.",
            **res
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to reset graph: {str(e)}")



