from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.models.db_models import MLModelRegistry, AuditLog, SystemSetting
from app.schemas.schemas import MLModelOut, AuditLogOut
from app.ml.ml_pipeline import train_and_persist_models

router = APIRouter(prefix="/ml", tags=["ML Engine Management"])

@router.get("/models", response_model=List[MLModelOut])
def get_ml_models(db: Session = Depends(get_db)):
    return db.query(MLModelRegistry).all()

@router.post("/train")
def trigger_ml_training(
    db: Session = Depends(get_db)
):
    res = train_and_persist_models(db)
    if not res.get("success"):
        raise HTTPException(status_code=400, detail=res.get("message"))

    return res

@router.get("/audit-logs", response_model=List[AuditLogOut])
def get_audit_logs(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return db.query(AuditLog).order_by(AuditLog.timestamp.desc()).offset(skip).limit(limit).all()

@router.get("/settings")
def get_settings(db: Session = Depends(get_db)):
    setting = db.query(SystemSetting).first()
    if not setting:
        setting = SystemSetting()
        db.add(setting)
        db.commit()
        db.refresh(setting)
    return setting

@router.put("/settings")
def update_settings(
    high_risk_threshold: float,
    medium_risk_threshold: float,
    cost_risk_weight: float,
    schedule_risk_weight: float,
    progress_risk_weight: float,
    db: Session = Depends(get_db)
):
    setting = db.query(SystemSetting).first()
    if not setting:
        setting = SystemSetting()
        db.add(setting)

    setting.high_risk_threshold = high_risk_threshold
    setting.medium_risk_threshold = medium_risk_threshold
    setting.cost_risk_weight = cost_risk_weight
    setting.schedule_risk_weight = schedule_risk_weight
    setting.progress_risk_weight = progress_risk_weight

    db.commit()
    return setting
