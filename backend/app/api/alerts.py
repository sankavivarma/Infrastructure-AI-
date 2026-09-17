from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.models.db_models import RiskAlert, Project

router = APIRouter(prefix="/alerts", tags=["Early Warning Alerts"])

@router.get("", response_model=List[dict])
def get_alerts(status_filter: Optional[str] = None, db: Session = Depends(get_db)):
    query = db.query(RiskAlert, Project.project_name, Project.sector).join(Project, RiskAlert.project_id == Project.id)
    if status_filter and status_filter != "All":
        query = query.filter(RiskAlert.status == status_filter)
    
    alerts = query.order_by(RiskAlert.created_at.desc()).limit(100).all()
    
    result = []
    for a, p_name, p_sec in alerts:
        result.append({
            "id": a.id,
            "project_id": a.project_id,
            "project_name": p_name,
            "sector": p_sec,
            "risk_type": a.risk_type,
            "severity": a.severity,
            "trigger_reason": a.trigger_reason,
            "risk_score": a.risk_score,
            "status": a.status,
            "created_at": a.created_at
        })
    return result

@router.put("/{alert_id}/acknowledge")
def acknowledge_alert(alert_id: int, db: Session = Depends(get_db)):
    alert = db.query(RiskAlert).filter(RiskAlert.id == alert_id).first()
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")
    
    alert.status = "Acknowledged"
    db.commit()

    return {"success": True, "message": "Alert status updated to Acknowledged"}

@router.put("/{alert_id}/resolve")
def resolve_alert(alert_id: int, db: Session = Depends(get_db)):
    alert = db.query(RiskAlert).filter(RiskAlert.id == alert_id).first()
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")
    
    alert.status = "Resolved"
    db.commit()

    return {"success": True, "message": "Alert status updated to Resolved"}
