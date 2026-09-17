from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.database.session import get_db
from app.models.db_models import Project, ProjectRiskPrediction
from app.schemas.schemas import DashboardKPIs
from app.services.ingestion_service import calculate_project_risk

router = APIRouter(prefix="/risk", tags=["Risk Engine"])

@router.get("/summary", response_model=DashboardKPIs)
def get_risk_summary(db: Session = Depends(get_db)):
    total = db.query(Project).count()
    
    high_count = db.query(ProjectRiskPrediction).filter(ProjectRiskPrediction.overall_risk_category == "HIGH").count()
    med_count = db.query(ProjectRiskPrediction).filter(ProjectRiskPrediction.overall_risk_category == "MEDIUM").count()
    low_count = db.query(ProjectRiskPrediction).filter(ProjectRiskPrediction.overall_risk_category == "LOW").count()

    cost_overrun_risk = db.query(ProjectRiskPrediction).filter(ProjectRiskPrediction.cost_risk_category == "HIGH").count()
    schedule_delay_risk = db.query(ProjectRiskPrediction).filter(ProjectRiskPrediction.schedule_risk_category == "HIGH").count()

    avg_score = db.query(func.avg(ProjectRiskPrediction.overall_risk_score)).scalar() or 0.0
    immediate_action = db.query(ProjectRiskPrediction).filter(ProjectRiskPrediction.overall_risk_score >= 75.0).count()

    return DashboardKPIs(
        total_projects=total,
        high_risk_projects=high_count,
        medium_risk_projects=med_count,
        low_risk_projects=low_count,
        cost_overrun_risk_projects=cost_overrun_risk,
        schedule_delay_risk_projects=schedule_delay_risk,
        avg_risk_score=round(avg_score, 1),
        immediate_intervention_required=immediate_action
    )

@router.post("/predict/{project_id}", response_model=dict)
def trigger_prediction(project_id: int, db: Session = Depends(get_db)):
    p = db.query(Project).filter(Project.id == project_id).first()
    if not p:
        raise HTTPException(status_code=404, detail="Project not found")

    risk_info = calculate_project_risk(p.planned_cost, p.current_cost, p.expenditure, p.actual_progress)
    
    pred = ProjectRiskPrediction(
        project_id=p.id,
        model_version="v1.1",
        cost_risk_score=risk_info["cost_risk_score"],
        cost_risk_category=risk_info["cost_risk_category"],
        schedule_risk_score=risk_info["schedule_risk_score"],
        schedule_risk_category=risk_info["schedule_risk_category"],
        overall_risk_score=risk_info["overall_risk_score"],
        overall_risk_category=risk_info["overall_risk_category"]
    )
    db.add(pred)
    db.commit()
    db.refresh(pred)

    return {"success": True, "prediction": pred}
