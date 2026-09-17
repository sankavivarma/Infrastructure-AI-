from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import or_
from app.database.session import get_db
from app.models.db_models import Project, ProjectRiskPrediction, RiskFactor
from app.schemas.schemas import ProjectOut, ProjectCreate, ProjectUpdate, RiskPredictionOut
from app.services.ingestion_service import calculate_project_risk

router = APIRouter(prefix="/projects", tags=["Projects"])

@router.get("", response_model=dict)
def get_projects(
    skip: int = 0,
    limit: int = 50,
    search: Optional[str] = None,
    sector: Optional[str] = None,
    ministry: Optional[str] = None,
    risk_category: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Project)

    if search:
        s_term = f"%{search}%"
        query = query.filter(
            or_(
                Project.project_name.ilike(s_term),
                Project.project_id.ilike(s_term),
                Project.sector.ilike(s_term),
                Project.ministry.ilike(s_term)
            )
        )

    if sector and sector != "All":
        query = query.filter(Project.sector == sector)

    if ministry and ministry != "All":
        query = query.filter(Project.ministry == ministry)

    if risk_category and risk_category != "All":
        query = query.join(ProjectRiskPrediction).filter(ProjectRiskPrediction.overall_risk_category == risk_category)

    total_count = query.count()
    projects = query.offset(skip).limit(limit).all()

    items = []
    for p in projects:
        latest_pred = db.query(ProjectRiskPrediction).filter(ProjectRiskPrediction.project_id == p.id).order_by(ProjectRiskPrediction.predicted_at.desc()).first()
        p_dict = ProjectOut.model_validate(p).model_dump()
        if latest_pred:
            p_dict["latest_prediction"] = RiskPredictionOut.model_validate(latest_pred).model_dump()
        items.append(p_dict)

    return {
        "total": total_count,
        "skip": skip,
        "limit": limit,
        "items": items
    }

@router.get("/{project_id_str}", response_model=dict)
def get_project_detail(project_id_str: str, db: Session = Depends(get_db)):
    p = db.query(Project).filter((Project.project_id == project_id_str) | (Project.id == int(project_id_str) if project_id_str.isdigit() else False)).first()
    if not p:
        raise HTTPException(status_code=404, detail="Project not found")

    predictions = db.query(ProjectRiskPrediction).filter(ProjectRiskPrediction.project_id == p.id).order_by(ProjectRiskPrediction.predicted_at.desc()).all()
    latest_pred = predictions[0] if predictions else None
    
    factors = []
    if latest_pred:
        factors = db.query(RiskFactor).filter(RiskFactor.prediction_id == latest_pred.id).all()

    p_dict = ProjectOut.model_validate(p).model_dump()
    p_dict["predictions"] = [RiskPredictionOut.model_validate(pr).model_dump() for pr in predictions]
    p_dict["latest_prediction"] = RiskPredictionOut.model_validate(latest_pred).model_dump() if latest_pred else None
    p_dict["risk_factors"] = [f.__dict__ for f in factors]

    return {"success": True, "project": p_dict}

@router.post("", response_model=ProjectOut)
def create_project(
    project_in: ProjectCreate,
    db: Session = Depends(get_db)
):
    existing = db.query(Project).filter(Project.project_id == project_in.project_id).first()
    if existing:
        raise HTTPException(status_code=400, detail="Project ID already exists.")

    new_p = Project(
        **project_in.model_dump(),
        cost_variance=project_in.current_cost - project_in.planned_cost
    )
    db.add(new_p)
    db.commit()
    db.refresh(new_p)

    risk_info = calculate_project_risk(new_p.planned_cost, new_p.current_cost, new_p.expenditure, new_p.actual_progress)
    pred = ProjectRiskPrediction(
        project_id=new_p.id,
        model_version="v1.0",
        cost_risk_score=risk_info["cost_risk_score"],
        cost_risk_category=risk_info["cost_risk_category"],
        schedule_risk_score=risk_info["schedule_risk_score"],
        schedule_risk_category=risk_info["schedule_risk_category"],
        overall_risk_score=risk_info["overall_risk_score"],
        overall_risk_category=risk_info["overall_risk_category"]
    )
    db.add(pred)
    db.commit()

    return new_p

@router.put("/{id}", response_model=ProjectOut)
def update_project(
    id: int,
    project_update: ProjectUpdate,
    db: Session = Depends(get_db)
):
    p = db.query(Project).filter(Project.id == id).first()
    if not p:
        raise HTTPException(status_code=404, detail="Project not found")

    update_data = project_update.model_dump(exclude_unset=True)
    for field, val in update_data.items():
        setattr(p, field, val)

    p.cost_variance = p.current_cost - p.planned_cost
    db.commit()
    db.refresh(p)

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

    return p
