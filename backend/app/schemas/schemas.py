from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List, Dict, Any
from datetime import datetime
from app.models.db_models import UserRole

# Auth Schemas
class Token(BaseModel):
    access_token: str
    token_type: str
    role: str
    username: str

class TokenData(BaseModel):
    username: Optional[str] = None

class UserLogin(BaseModel):
    username: str
    password: str

class UserCreate(BaseModel):
    username: str
    email: EmailStr
    password: str
    role: UserRole = UserRole.VIEWER
    department: Optional[str] = None

class UserOut(BaseModel):
    id: int
    username: str
    email: str
    role: str
    department: Optional[str] = None
    is_active: bool

    class Config:
        from_attributes = True

# Project Schemas
class ProjectBase(BaseModel):
    project_id: str
    project_name: str
    sector: str
    ministry: str
    department: Optional[str] = None
    location: Optional[str] = None
    planned_cost: float
    current_cost: float
    expenditure: float
    planned_duration: Optional[int] = 36
    actual_duration: Optional[int] = 36
    start_year: Optional[int] = 2020
    expected_completion_year: Optional[int] = 2026
    planned_progress: Optional[float] = 100.0
    actual_progress: Optional[float] = 0.0
    status: Optional[str] = "Active"

class ProjectCreate(ProjectBase):
    pass

class ProjectUpdate(BaseModel):
    project_name: Optional[str] = None
    sector: Optional[str] = None
    ministry: Optional[str] = None
    planned_cost: Optional[float] = None
    current_cost: Optional[float] = None
    expenditure: Optional[float] = None
    actual_progress: Optional[float] = None
    status: Optional[str] = None

class RiskFactorOut(BaseModel):
    id: int
    factor_name: str
    impact_level: str
    score_contribution: float
    description: Optional[str]

    class Config:
        from_attributes = True

class RiskPredictionOut(BaseModel):
    id: int
    model_version: str
    cost_risk_score: float
    cost_risk_category: str
    schedule_risk_score: float
    schedule_risk_category: str
    overall_risk_score: float
    overall_risk_category: str
    predicted_at: datetime
    factors: List[RiskFactorOut] = []

    class Config:
        from_attributes = True

class ProjectOut(ProjectBase):
    id: int
    sr_no: Optional[int] = None
    cost_variance: float
    created_at: datetime
    updated_at: datetime
    latest_prediction: Optional[RiskPredictionOut] = None

    class Config:
        from_attributes = True

# Risk Summary & KPIs
class DashboardKPIs(BaseModel):
    total_projects: int
    high_risk_projects: int
    medium_risk_projects: int
    low_risk_projects: int
    cost_overrun_risk_projects: int
    schedule_delay_risk_projects: int
    avg_risk_score: float
    immediate_intervention_required: int

# Alert Schemas
class RiskAlertOut(BaseModel):
    id: int
    project_id: int
    project_name: str
    sector: str
    risk_type: str
    severity: str
    trigger_reason: str
    risk_score: float
    status: str
    created_at: datetime

# Scenario Analysis Schema
class ScenarioInput(BaseModel):
    project_id: int
    hypothetical_current_cost: float
    hypothetical_actual_progress: float
    hypothetical_remaining_months: int

class ScenarioResult(BaseModel):
    project_id: int
    current_risk_score: float
    current_cost_risk: float
    current_schedule_risk: float
    scenario_risk_score: float
    scenario_cost_risk: float
    scenario_schedule_risk: float
    risk_improvement: float
    recommendation: str

# Data Management
class DatasetValidationResult(BaseModel):
    filename: str
    total_rows: int
    total_columns: int
    valid_rows: int
    invalid_rows: int
    duplicate_rows: int
    missing_values: int
    column_names: List[str]
    preview_data: List[Dict[str, Any]]

# ML Model Schemas
class MLModelOut(BaseModel):
    id: int
    model_name: str
    model_type: str
    algorithm: str
    version: str
    accuracy: Optional[float] = None
    precision: Optional[float] = None
    recall: Optional[float] = None
    f1_score: Optional[float] = None
    roc_auc: Optional[float] = None
    mae: Optional[float] = None
    rmse: Optional[float] = None
    r2_score: Optional[float] = None
    status: str
    trained_at: datetime

    class Config:
        from_attributes = True

# Audit Log Schema
class AuditLogOut(BaseModel):
    id: int
    user_username: str
    action: str
    entity_type: str
    entity_id: Optional[str]
    details: Optional[str]
    timestamp: datetime

    class Config:
        from_attributes = True
