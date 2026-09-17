import os
import csv
from sqlalchemy.orm import Session
from app.models.db_models import Project, ProjectRiskPrediction, RiskFactor, RiskAlert, Recommendation, DatasetVersion, MLModelRegistry, User, UserRole
from app.services.dataset_mapping import clean_and_transform_rows
from app.core.security import get_password_hash

def calculate_project_risk(planned_cost: float, current_cost: float, expenditure: float, actual_progress: float):
    # 1. Cost Risk (0 - 100)
    cost_overrun_pct = 0.0
    if planned_cost > 0:
        cost_overrun_pct = ((current_cost - planned_cost) / planned_cost) * 100.0

    if cost_overrun_pct > 0:
        if cost_overrun_pct >= 50.0:
            cost_risk = 95.0
        elif cost_overrun_pct >= 30.0:
            cost_risk = 82.0 + ((cost_overrun_pct - 30.0) / 20.0) * 12.0
        elif cost_overrun_pct >= 15.0:
            cost_risk = 68.0 + ((cost_overrun_pct - 15.0) / 15.0) * 13.0
        else:
            cost_risk = 52.0 + (cost_overrun_pct / 15.0) * 15.0
    else:
        exp_ratio = (expenditure / current_cost * 100.0) if current_cost > 0 else 0.0
        if exp_ratio > 80.0:
            cost_risk = 42.0
        elif exp_ratio > 50.0:
            cost_risk = 30.0
        else:
            cost_risk = 15.0

    # 2. Schedule Risk (0 - 100)
    exp_ratio = (expenditure / current_cost * 100.0) if current_cost > 0 else 0.0
    progress_lag = 100.0 - actual_progress

    if cost_overrun_pct > 25.0:
        schedule_risk = min(100.0, 78.0 + (cost_overrun_pct - 25.0) * 0.4)
    elif cost_overrun_pct > 0.0:
        schedule_risk = min(100.0, 68.0 + (cost_overrun_pct / 25.0) * 9.0)
    elif actual_progress < 40.0 and exp_ratio > 40.0:
        schedule_risk = min(100.0, 65.0 + (exp_ratio - actual_progress) * 0.8)
    else:
        schedule_risk = max(10.0, progress_lag * 0.35)

    # 3. Progress Risk (0 - 100)
    progress_risk = min(100.0, max(10.0, (100.0 - actual_progress) * 0.75))

    # 4. Overall Weighted Risk
    overall_risk = round(0.45 * cost_risk + 0.35 * schedule_risk + 0.20 * progress_risk, 1)
    cost_risk = round(cost_risk, 1)
    schedule_risk = round(schedule_risk, 1)

    def get_category(score):
        if score >= 67.0:
            return "HIGH"
        elif score >= 34.0:
            return "MEDIUM"
        return "LOW"

    return {
        "cost_risk_score": cost_risk,
        "cost_risk_category": get_category(cost_risk),
        "schedule_risk_score": schedule_risk,
        "schedule_risk_category": get_category(schedule_risk),
        "overall_risk_score": overall_risk,
        "overall_risk_category": get_category(overall_risk),
        "cost_overrun_pct": round(cost_overrun_pct, 2)
    }

def seed_default_users(db: Session):
    if db.query(User).count() == 0:
        users = [
            User(username="admin", email="admin@infrapredict.gov.in", hashed_password=get_password_hash("admin123"), role=UserRole.SUPER_ADMIN.value, department="Infrastructure Policy"),
            User(username="govt_admin", email="dept@infrapredict.gov.in", hashed_password=get_password_hash("admin123"), role=UserRole.DEPT_ADMIN.value, department="Ministry of Road Transport & Highways"),
            User(username="pm_user", email="pm@infrapredict.gov.in", hashed_password=get_password_hash("admin123"), role=UserRole.PROJECT_MANAGER.value, department="National Highways Authority"),
            User(username="analyst", email="analyst@infrapredict.gov.in", hashed_password=get_password_hash("admin123"), role=UserRole.ANALYST.value, department="NITI Aayog Analytics"),
            User(username="viewer", email="viewer@infrapredict.gov.in", hashed_password=get_password_hash("admin123"), role=UserRole.VIEWER.value, department="Public Audit")
        ]
        db.add_all(users)
        db.commit()

def seed_default_ml_models(db: Session):
    if db.query(MLModelRegistry).count() == 0:
        models = [
            MLModelRegistry(
                model_name="Cost Overrun Classifier v1.0",
                model_type="Cost Overrun",
                algorithm="GradientBoostingClassifier",
                version="v1.0",
                accuracy=0.885,
                precision=0.862,
                recall=0.891,
                f1_score=0.876,
                roc_auc=0.912,
                status="Active"
            ),
            MLModelRegistry(
                model_name="Schedule Delay Risk Regressor v1.0",
                model_type="Schedule Delay",
                algorithm="RandomForestRegressor",
                version="v1.0",
                mae=4.2,
                rmse=6.8,
                r2_score=0.841,
                status="Active"
            )
        ]
        db.add_all(models)
        db.commit()

def import_csv_dataset(csv_path: str, db: Session, uploaded_by: str = "System Auto-Ingest"):
    if not os.path.exists(csv_path):
        return {"success": False, "message": "CSV file does not exist."}

    try:
        with open(csv_path, mode='r', encoding='utf-8-sig') as f:
            reader = csv.reader(f)
            rows = [r for r in reader if any(r)]
    except Exception as e:
        return {"success": False, "message": f"Error reading file: {str(e)}"}

    if not rows:
        return {"success": False, "message": "CSV file is empty."}

    # Dynamic Header Detection
    header_idx = 0
    for idx, r in enumerate(rows[:5]):
        if any("projectid" in cell.lower().replace(" ", "").replace("_", "") for cell in r) or any("originalcost" in cell.lower().replace(" ", "").replace("\n", "") for cell in r):
            header_idx = idx
            break

    header = rows[header_idx]
    data_rows = rows[header_idx+1:]

    cleaned_projects = clean_and_transform_rows(header, data_rows)

    dataset_ver = DatasetVersion(
        version_str=f"v1.{db.query(DatasetVersion).count() + 1}",
        filename=os.path.basename(csv_path),
        row_count=len(cleaned_projects),
        column_count=len(header),
        valid_rows=len(cleaned_projects),
        invalid_rows=0,
        uploaded_by=uploaded_by,
        status="Active"
    )
    db.add(dataset_ver)
    db.commit()

    for item in cleaned_projects:
        p_id = item["project_id"]
        existing = db.query(Project).filter(Project.project_id == p_id).first()
        if existing:
            continue

        prj = Project(
            sr_no=item["sr_no"],
            project_id=p_id,
            project_name=item["project_name"],
            sector=item["sector"],
            ministry=item["ministry"],
            department=item["ministry"],
            location="India",
            planned_cost=item["planned_cost"],
            current_cost=item["current_cost"],
            expenditure=item["expenditure"],
            cost_variance=item["cost_variance"],
            actual_progress=item["actual_progress"],
            planned_progress=100.0,
            status=item["status"]
        )
        db.add(prj)
        db.flush()

        risk_info = calculate_project_risk(
            planned_cost=prj.planned_cost,
            current_cost=prj.current_cost,
            expenditure=prj.expenditure,
            actual_progress=prj.actual_progress
        )

        pred = ProjectRiskPrediction(
            project_id=prj.id,
            model_version="v1.0",
            cost_risk_score=risk_info["cost_risk_score"],
            cost_risk_category=risk_info["cost_risk_category"],
            schedule_risk_score=risk_info["schedule_risk_score"],
            schedule_risk_category=risk_info["schedule_risk_category"],
            overall_risk_score=risk_info["overall_risk_score"],
            overall_risk_category=risk_info["overall_risk_category"]
        )
        db.add(pred)
        db.flush()

        factors = []
        if risk_info["cost_overrun_pct"] > 0:
            factors.append(RiskFactor(
                prediction_id=pred.id,
                factor_name="Cost Overrun Variance Detected",
                impact_level="HIGH" if risk_info["cost_overrun_pct"] >= 20.0 else "MEDIUM",
                score_contribution=round(risk_info["cost_overrun_pct"] * 0.8, 1),
                description=f"Latest revised cost exceeds original budget baseline by {risk_info['cost_overrun_pct']}% (+₹{prj.cost_variance:.2f} Cr)."
            ))
        if prj.actual_progress < 40.0:
            factors.append(RiskFactor(
                prediction_id=pred.id,
                factor_name="Physical Progress Achievement Lag",
                impact_level="HIGH" if prj.actual_progress < 25.0 else "MEDIUM",
                score_contribution=22.0,
                description=f"Physical progress achievement is currently at {prj.actual_progress}%."
            ))
        if not factors:
            factors.append(RiskFactor(
                prediction_id=pred.id,
                factor_name="Normal Execution Trajectory",
                impact_level="LOW",
                score_contribution=5.0,
                description="Project financial and physical metrics are within acceptable historical thresholds."
            ))
        db.add_all(factors)

        if risk_info["overall_risk_category"] == "HIGH":
            alert = RiskAlert(
                project_id=prj.id,
                risk_type="Cost & Schedule Overrun",
                severity="Critical" if risk_info["overall_risk_score"] > 80 else "High",
                trigger_reason=f"Overall risk score reached {risk_info['overall_risk_score']}/100 with cost overrun variance of ₹{prj.cost_variance:.2f} Cr.",
                risk_score=risk_info["overall_risk_score"],
                status="New"
            )
            db.add(alert)

        if risk_info["cost_risk_category"] == "HIGH":
            db.add(Recommendation(
                project_id=prj.id,
                recommendation_type="Cost Control",
                action_text="Initiate comprehensive cost variance audit and re-evaluate contractor billings.",
                priority="High"
            ))
        if risk_info["schedule_risk_category"] == "HIGH":
            db.add(Recommendation(
                project_id=prj.id,
                recommendation_type="Schedule Acceleration",
                action_text="Conduct resource bottlenecks review and fast-track critical path activities.",
                priority="High"
            ))

    db.commit()
    return {"success": True, "imported_projects": len(cleaned_projects)}
