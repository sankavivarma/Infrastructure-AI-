import os
import shutil
from fastapi import APIRouter, Depends, File, UploadFile, HTTPException
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.models.db_models import DatasetVersion
from app.schemas.schemas import DatasetValidationResult
from app.services.ingestion_service import import_csv_dataset
import csv

router = APIRouter(prefix="/data", tags=["Data Management"])

DATA_DIR = "./data"
os.makedirs(DATA_DIR, exist_ok=True)

@router.get("/status")
def get_dataset_status(db: Session = Depends(get_db)):
    versions = db.query(DatasetVersion).order_by(DatasetVersion.created_at.desc()).all()
    target_path = os.path.join(DATA_DIR, "infrastructure_projects.csv")
    exists = os.path.exists(target_path)
    
    return {
        "file_exists": exists,
        "file_path": target_path if exists else None,
        "dataset_versions": versions
    }

@router.post("/upload-validate", response_model=DatasetValidationResult)
def upload_and_validate(
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    if not (file.filename.endswith(".csv") or file.filename.endswith(".xlsx")):
        raise HTTPException(status_code=400, detail="Only .csv files are currently supported under system policy.")

    temp_path = os.path.join(DATA_DIR, f"temp_{file.filename}")
    with open(temp_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    try:
        with open(temp_path, mode='r', encoding='utf-8-sig') as f:
            reader = csv.reader(f)
            rows = [r for r in reader if any(r)]
        header = rows[1] if len(rows) > 1 else rows[0]
        preview = [dict(zip(header, r)) for r in rows[2:7]]
        total_rows = len(rows) - 2 if len(rows) > 2 else len(rows)
        total_cols = len(header)
    except Exception as e:
        if os.path.exists(temp_path):
            os.remove(temp_path)
        raise HTTPException(status_code=400, detail=f"Failed to parse CSV file: {str(e)}")

    if os.path.exists(temp_path):
        os.remove(temp_path)

    return DatasetValidationResult(
        filename=file.filename,
        total_rows=total_rows,
        total_columns=total_cols,
        valid_rows=total_rows,
        invalid_rows=0,
        duplicate_rows=0,
        missing_values=0,
        column_names=header,
        preview_data=preview
    )

@router.post("/import")
def import_dataset(
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    target_path = os.path.join(DATA_DIR, "infrastructure_projects.csv")
    with open(target_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    res = import_csv_dataset(target_path, db, uploaded_by="Direct Open Platform User")
    if not res.get("success"):
        raise HTTPException(status_code=400, detail=res.get("message"))

    return res
