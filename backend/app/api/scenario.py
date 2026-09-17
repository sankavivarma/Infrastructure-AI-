from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.models.db_models import Project, ScenarioSimulation
from app.schemas.schemas import ScenarioInput, ScenarioResult
from app.services.ingestion_service import calculate_project_risk

router = APIRouter(prefix="/scenario", tags=["What-If Scenario Sandbox"])

@router.post("/analyze", response_model=ScenarioResult)
def run_scenario_simulation(
    scenario_in: ScenarioInput,
    db: Session = Depends(get_db)
):
    p = db.query(Project).filter(Project.id == scenario_in.project_id).first()
    if not p:
        raise HTTPException(status_code=404, detail="Project not found")

    current_calc = calculate_project_risk(p.planned_cost, p.current_cost, p.expenditure, p.actual_progress)

    scenario_calc = calculate_project_risk(
        planned_cost=p.planned_cost,
        current_cost=scenario_in.hypothetical_current_cost,
        expenditure=p.expenditure,
        actual_progress=scenario_in.hypothetical_actual_progress
    )

    risk_diff = round(current_calc["overall_risk_score"] - scenario_calc["overall_risk_score"], 1)

    rec = "No significant risk reduction achieved under this scenario."
    if risk_diff > 15.0:
        rec = f"Scenario simulation yields a substantial risk reduction of {risk_diff} points. Recommended to adopt proposed cost control & timeline acceleration measures."
    elif risk_diff > 0.0:
        rec = f"Scenario simulation shows modest risk improvement of {risk_diff} points."
    else:
        rec = f"Scenario parameters increase overall project risk by {abs(risk_diff)} points. Caution advised!"

    sim = ScenarioSimulation(
        project_id=p.id,
        user_id=None,
        input_params_json=scenario_in.model_dump(),
        result_metrics_json={
            "current_risk": current_calc["overall_risk_score"],
            "scenario_risk": scenario_calc["overall_risk_score"],
            "improvement": risk_diff
        }
    )
    db.add(sim)
    db.commit()

    return ScenarioResult(
        project_id=p.id,
        current_risk_score=current_calc["overall_risk_score"],
        current_cost_risk=current_calc["cost_risk_score"],
        current_schedule_risk=current_calc["schedule_risk_score"],
        scenario_risk_score=scenario_calc["overall_risk_score"],
        scenario_cost_risk=scenario_calc["cost_risk_score"],
        scenario_schedule_risk=scenario_calc["schedule_risk_score"],
        risk_improvement=risk_diff,
        recommendation=rec
    )
