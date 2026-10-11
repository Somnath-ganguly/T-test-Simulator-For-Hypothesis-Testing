import io
import pandas as pd
from fastapi import APIRouter, HTTPException, UploadFile, File, Form, status
from typing import List, Optional, Dict, Any

from app.schemas.ttest import (
    HealthResponse,
    GenerateDataRequest,
    GenerateDataResponse,
    TTestRequest,
    TTestResponse
)
from app.services.data_generator import generate_dataset
from app.services.statistics import run_ttest_analysis

router = APIRouter(prefix="/api", tags=["T-Test Simulator API"])

@router.get("/health", response_model=HealthResponse)
def health_check():
    return HealthResponse(status="ok", version="1.0.0")

@router.post("/generate-data", response_model=GenerateDataResponse)
def generate_data_endpoint(req: GenerateDataRequest):
    try:
        sample_a, sample_b, summary_a, summary_b, seed = generate_dataset(
            test_type=req.test_type,
            n_a=req.n_a,
            mean_a=req.mean_a,
            std_a=req.std_a,
            n_b=req.n_b,
            mean_b=req.mean_b,
            std_b=req.std_b,
            distribution=req.distribution,
            correlation=req.correlation if req.correlation is not None else 0.5,
            seed=req.seed
        )
        return GenerateDataResponse(
            sample_a=sample_a.round(4).tolist(),
            sample_b=sample_b.round(4).tolist() if sample_b is not None else None,
            seed=seed,
            summary_a=summary_a,
            summary_b=summary_b
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to generate dataset: {str(e)}"
        )

@router.post("/ttest", response_model=TTestResponse)
def perform_ttest_endpoint(req: TTestRequest):
    try:
        result = run_ttest_analysis(req)
        return result
    except ValueError as ve:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(ve)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Internal statistical error: {str(e)}"
        )

@router.post("/upload-csv")
async def upload_csv_endpoint(file: UploadFile = File(...)):
    if not file.filename.endswith(('.csv', '.txt')):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid file format. Only CSV files (.csv) are supported."
        )
        
    try:
        content = await file.read()
        df = pd.read_csv(io.BytesIO(content))
        
        if df.empty:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Uploaded CSV file is empty."
            )
            
        columns_data: Dict[str, List[float]] = {}
        numeric_columns: List[str] = []
        
        for col in df.columns:
            # Clean column data: convert to numeric, drop NaN
            series = pd.to_numeric(df[col], errors='coerce').dropna()
            if len(series) >= 2:
                numeric_columns.append(str(col))
                columns_data[str(col)] = series.tolist()
                
        if not numeric_columns:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No valid numeric columns with at least 2 observations found in CSV."
            )
            
        return {
            "filename": file.filename,
            "total_rows": len(df),
            "columns": numeric_columns,
            "data": columns_data
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Error parsing CSV file: {str(e)}"
        )
