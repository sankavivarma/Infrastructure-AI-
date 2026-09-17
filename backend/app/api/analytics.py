from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.database.session import get_db
from app.models.db_models import Project, ProjectRiskPrediction

router = APIRouter(prefix="/analytics", tags=["Analytics"])

@router.get("/sector")
def get_sector_analytics(db: Session = Depends(get_db)):
    results = db.query(
        Project.sector,
        func.count(Project.id).label("total_projects"),
        func.sum(Project.planned_cost).label("total_planned_cost"),
        func.sum(Project.current_cost).label("total_current_cost"),
        func.sum(Project.expenditure).label("total_expenditure"),
        func.avg(ProjectRiskPrediction.overall_risk_score).label("avg_risk_score"),
        func.avg(ProjectRiskPrediction.cost_risk_score).label("avg_cost_risk"),
        func.avg(ProjectRiskPrediction.schedule_risk_score).label("avg_schedule_risk")
    ).outerjoin(ProjectRiskPrediction, Project.id == ProjectRiskPrediction.project_id)\
     .group_by(Project.sector).all()

    data = []
    for r in results:
        data.append({
            "sector": r.sector,
            "total_projects": r.total_projects,
            "total_planned_cost": round(r.total_planned_cost or 0, 2),
            "total_current_cost": round(r.total_current_cost or 0, 2),
            "cost_variance": round((r.total_current_cost or 0) - (r.total_planned_cost or 0), 2),
            "total_expenditure": round(r.total_expenditure or 0, 2),
            "avg_risk_score": round(r.avg_risk_score or 0, 1),
            "avg_cost_risk": round(r.avg_cost_risk or 0, 1),
            "avg_schedule_risk": round(r.avg_schedule_risk or 0, 1)
        })
    return sorted(data, key=lambda x: x["total_projects"], reverse=True)

@router.get("/ministry")
def get_ministry_analytics(db: Session = Depends(get_db)):
    results = db.query(
        Project.ministry,
        func.count(Project.id).label("total_projects"),
        func.sum(Project.planned_cost).label("total_planned_cost"),
        func.sum(Project.current_cost).label("total_current_cost"),
        func.avg(ProjectRiskPrediction.overall_risk_score).label("avg_risk_score")
    ).outerjoin(ProjectRiskPrediction, Project.id == ProjectRiskPrediction.project_id)\
     .group_by(Project.ministry).all()

    data = []
    for r in results:
        data.append({
            "ministry": r.ministry,
            "total_projects": r.total_projects,
            "total_planned_cost": round(r.total_planned_cost or 0, 2),
            "total_current_cost": round(r.total_current_cost or 0, 2),
            "cost_variance": round((r.total_current_cost or 0) - (r.total_planned_cost or 0), 2),
            "avg_risk_score": round(r.avg_risk_score or 0, 1)
        })
    return sorted(data, key=lambda x: x["total_projects"], reverse=True)

@router.get("/risk-distribution")
def get_risk_distribution(db: Session = Depends(get_db)):
    results = db.query(
        ProjectRiskPrediction.overall_risk_category,
        func.count(ProjectRiskPrediction.id)
    ).group_by(ProjectRiskPrediction.overall_risk_category).all()

    dist = {"HIGH": 0, "MEDIUM": 0, "LOW": 0}
    for cat, count in results:
        if cat in dist:
            dist[cat] = count
    return dist

@router.get("/cost-delay-trends")
def get_cost_delay_trends(db: Session = Depends(get_db)):
    projects = db.query(Project).all()
    predictions = db.query(ProjectRiskPrediction).all()
    pred_map = {p.project_id: p for p in predictions}

    total_planned = sum(p.planned_cost for p in projects)
    total_current = sum(p.current_cost for p in projects)
    total_expenditure = sum(p.expenditure for p in projects)
    total_overrun = total_current - total_planned

    cost_overrun_count = sum(1 for p in projects if p.current_cost > p.planned_cost)
    high_delay_count = sum(1 for p in predictions if p.schedule_risk_category == 'HIGH')

    # Escalation buckets
    buckets = {
        "Budget Savings (< 0%)": 0,
        "On Budget (0%)": 0,
        "Minor Overrun (0-15%)": 0,
        "Moderate Overrun (15-30%)": 0,
        "Severe Overrun (> 30%)": 0
    }

    overrun_list = []
    for p in projects:
        variance = p.current_cost - p.planned_cost
        pct = (variance / p.planned_cost * 100) if p.planned_cost > 0 else 0
        if variance < -0.01:
            buckets["Budget Savings (< 0%)"] += 1
        elif abs(variance) <= 0.01:
            buckets["On Budget (0%)"] += 1
        elif pct <= 15:
            buckets["Minor Overrun (0-15%)"] += 1
        elif pct <= 30:
            buckets["Moderate Overrun (15-30%)"] += 1
        else:
            buckets["Severe Overrun (> 30%)"] += 1

        if variance > 0:
            pred = pred_map.get(p.id)
            overrun_list.append({
                "id": p.id,
                "project_id": p.project_id,
                "project_name": p.project_name,
                "sector": p.sector,
                "ministry": p.ministry,
                "planned_cost": round(p.planned_cost, 2),
                "current_cost": round(p.current_cost, 2),
                "overrun": round(variance, 2),
                "pct_increase": round(pct, 1),
                "risk_score": round(pred.overall_risk_score, 1) if pred else 50.0,
                "risk_level": pred.overall_risk_category if pred else "MEDIUM"
            })

    top_overruns = sorted(overrun_list, key=lambda x: x["overrun"], reverse=True)[:10]

    # Sector summary for cost trends
    sector_results = db.query(
        Project.sector,
        func.count(Project.id).label("count"),
        func.sum(Project.planned_cost).label("planned"),
        func.sum(Project.current_cost).label("current"),
        func.sum(Project.expenditure).label("expenditure")
    ).group_by(Project.sector).all()

    sector_trends = []
    for r in sector_results:
        pl = r.planned or 0
        cur = r.current or 0
        exp = r.expenditure or 0
        sector_trends.append({
            "sector": r.sector,
            "count": r.count,
            "planned_cost": round(pl, 2),
            "current_cost": round(cur, 2),
            "overrun": round(cur - pl, 2),
            "expenditure": round(exp, 2),
            "utilization_pct": round((exp / cur * 100) if cur > 0 else 0, 1)
        })

    sector_trends = sorted(sector_trends, key=lambda x: x["overrun"], reverse=True)

    return {
        "summary": {
            "total_projects": len(projects),
            "total_planned_cost": round(total_planned, 2),
            "total_current_cost": round(total_current, 2),
            "total_cost_overrun": round(total_overrun, 2),
            "total_expenditure": round(total_expenditure, 2),
            "overall_utilization_pct": round((total_expenditure / total_current * 100) if total_current > 0 else 0, 1),
            "projects_with_cost_overrun": cost_overrun_count,
            "projects_with_high_delay": high_delay_count
        },
        "escalation_distribution": buckets,
        "sector_trends": sector_trends,
        "top_cost_overruns": top_overruns
    }

@router.get("/benchmarks")
def get_benchmarks_data(db: Session = Depends(get_db)):
    results = db.query(
        Project.sector,
        func.count(Project.id).label("total_projects"),
        func.sum(Project.planned_cost).label("planned"),
        func.sum(Project.current_cost).label("current"),
        func.sum(Project.expenditure).label("expenditure"),
        func.avg(ProjectRiskPrediction.overall_risk_score).label("avg_risk"),
        func.avg(ProjectRiskPrediction.cost_risk_score).label("avg_cost_risk"),
        func.avg(ProjectRiskPrediction.schedule_risk_score).label("avg_schedule_risk")
    ).outerjoin(ProjectRiskPrediction, Project.id == ProjectRiskPrediction.project_id)\
     .group_by(Project.sector).all()

    benchmarks = []
    total_all_projects = 0
    total_risk_sum = 0

    for r in results:
        pl = r.planned or 0
        cur = r.current or 0
        exp = r.expenditure or 0
        var_pct = ((cur - pl) / pl * 100) if pl > 0 else 0
        util_pct = (exp / cur * 100) if cur > 0 else 0
        avg_risk = round(r.avg_risk or 0, 1)

        total_all_projects += r.total_projects
        total_risk_sum += avg_risk * r.total_projects

        status = "High Benchmark Efficiency" if avg_risk < 35 else ("Standard Performance" if avg_risk < 55 else "Needs Risk Control")

        benchmarks.append({
            "sector": r.sector,
            "total_projects": r.total_projects,
            "cost_variance_pct": round(var_pct, 1),
            "utilization_pct": round(util_pct, 1),
            "avg_risk_score": avg_risk,
            "avg_cost_risk": round(r.avg_cost_risk or 0, 1),
            "avg_schedule_risk": round(r.avg_schedule_risk or 0, 1),
            "status": status
        })

    # Sort sector benchmarks by efficiency (lowest avg risk first)
    benchmarks = sorted(benchmarks, key=lambda x: x["avg_risk_score"])
    for idx, b in enumerate(benchmarks, 1):
        b["rank"] = f"#{idx}"

    national_avg_risk = round(total_risk_sum / total_all_projects, 1) if total_all_projects > 0 else 42.5

    sla_benchmarks = [
        {"metric": "Environmental Clearance Approval", "sla_target_days": 90, "national_avg_days": 142, "compliance_pct": 63.4, "status": "Delayed"},
        {"metric": "Land Acquisition & Handover", "sla_target_days": 180, "national_avg_days": 245, "compliance_pct": 73.5, "status": "Critical Lag"},
        {"metric": "Right of Way (RoW) Clearance", "sla_target_days": 60, "national_avg_days": 88, "compliance_pct": 68.2, "status": "Delayed"},
        {"metric": "Financial Fund Disbursement", "sla_target_days": 30, "national_avg_days": 34, "compliance_pct": 88.2, "status": "On Track"},
        {"metric": "EPC Contractor Mobilization", "sla_target_days": 45, "national_avg_days": 48, "compliance_pct": 93.8, "status": "On Track"},
    ]

    return {
        "national_summary": {
            "national_risk_index": national_avg_risk,
            "national_cost_variance_pct": 14.8,
            "national_expenditure_efficiency": 68.2,
            "top_performing_sector": benchmarks[0]["sector"] if benchmarks else "Telecommunications",
            "sla_compliance_rate": "77.3%"
        },
        "sector_benchmarks": benchmarks,
        "sla_benchmarks": sla_benchmarks
    }

