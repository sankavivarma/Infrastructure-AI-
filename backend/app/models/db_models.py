import enum
from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Boolean, Text, Enum, JSON
from sqlalchemy.orm import relationship
from app.database.session import Base

class UserRole(str, enum.Enum):
    SUPER_ADMIN = "SUPER_ADMIN"
    DEPT_ADMIN = "DEPT_ADMIN"
    PROJECT_MANAGER = "PROJECT_MANAGER"
    ANALYST = "ANALYST"
    VIEWER = "VIEWER"

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    role = Column(String, default=UserRole.VIEWER.value)
    department = Column(String, nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

class Project(Base):
    __tablename__ = "projects"

    id = Column(Integer, primary_key=True, index=True)
    sr_no = Column(Integer, nullable=True)
    project_id = Column(String, unique=True, index=True, nullable=False)
    project_name = Column(String, index=True, nullable=False)
    sector = Column(String, index=True, nullable=False)
    ministry = Column(String, index=True, nullable=False)
    department = Column(String, nullable=True)
    location = Column(String, nullable=True)
    planned_cost = Column(Float, nullable=False, default=0.0)      # Original Cost (in Cr)
    current_cost = Column(Float, nullable=False, default=0.0)      # Latest Revised Cost (in Cr)
    expenditure = Column(Float, nullable=False, default=0.0)       # Cumulative Expenditure (in Cr)
    cost_variance = Column(Float, default=0.0)
    planned_duration = Column(Integer, nullable=True) # In months
    actual_duration = Column(Integer, nullable=True)  # In months
    start_year = Column(Integer, nullable=True, default=2020)
    expected_completion_year = Column(Integer, nullable=True, default=2026)
    planned_progress = Column(Float, default=100.0)
    actual_progress = Column(Float, default=0.0)
    status = Column(String, default="Active")                      # Active, Delayed, Completed, Critical
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    predictions = relationship("ProjectRiskPrediction", back_populates="project", cascade="all, delete-orphan")
    alerts = relationship("RiskAlert", back_populates="project", cascade="all, delete-orphan")
    recommendations = relationship("Recommendation", back_populates="project", cascade="all, delete-orphan")

class ProjectRiskPrediction(Base):
    __tablename__ = "project_risk_predictions"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False)
    model_version = Column(String, default="v1.0")
    cost_risk_score = Column(Float, nullable=False)           # 0 - 100
    cost_risk_category = Column(String, nullable=False)        # LOW, MEDIUM, HIGH
    schedule_risk_score = Column(Float, nullable=False)       # 0 - 100
    schedule_risk_category = Column(String, nullable=False)    # LOW, MEDIUM, HIGH
    overall_risk_score = Column(Float, nullable=False)        # 0 - 100
    overall_risk_category = Column(String, nullable=False)     # LOW, MEDIUM, HIGH
    predicted_at = Column(DateTime, default=datetime.utcnow)

    project = relationship("Project", back_populates="predictions")
    factors = relationship("RiskFactor", back_populates="prediction", cascade="all, delete-orphan")

class RiskFactor(Base):
    __tablename__ = "risk_factors"

    id = Column(Integer, primary_key=True, index=True)
    prediction_id = Column(Integer, ForeignKey("project_risk_predictions.id"), nullable=False)
    factor_name = Column(String, nullable=False)
    impact_level = Column(String, nullable=False)              # HIGH, MEDIUM, LOW
    score_contribution = Column(Float, default=0.0)
    description = Column(Text, nullable=True)

    prediction = relationship("ProjectRiskPrediction", back_populates="factors")

class RiskAlert(Base):
    __tablename__ = "risk_alerts"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False)
    risk_type = Column(String, nullable=False)                 # Cost Overrun, Schedule Delay, Progress Lag
    severity = Column(String, nullable=False)                  # Critical, High, Medium, Info
    trigger_reason = Column(Text, nullable=False)
    risk_score = Column(Float, nullable=False)
    status = Column(String, default="New")                     # New, Acknowledged, In Progress, Resolved
    acknowledged_by = Column(String, nullable=True)
    resolved_by = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    project = relationship("Project", back_populates="alerts")

class Recommendation(Base):
    __tablename__ = "recommendations"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False)
    recommendation_type = Column(String, nullable=False)       # Cost Control, Schedule Acceleration, Resource Reallocation
    action_text = Column(Text, nullable=False)
    priority = Column(String, default="Medium")                # High, Medium, Low
    created_at = Column(DateTime, default=datetime.utcnow)

    project = relationship("Project", back_populates="recommendations")

class DatasetVersion(Base):
    __tablename__ = "dataset_versions"

    id = Column(Integer, primary_key=True, index=True)
    version_str = Column(String, unique=True, nullable=False)
    filename = Column(String, nullable=False)
    row_count = Column(Integer, nullable=False)
    column_count = Column(Integer, nullable=False)
    valid_rows = Column(Integer, default=0)
    invalid_rows = Column(Integer, default=0)
    uploaded_by = Column(String, default="System")
    status = Column(String, default="Active")                  # Active, Archived
    created_at = Column(DateTime, default=datetime.utcnow)

class MLModelRegistry(Base):
    __tablename__ = "ml_models"

    id = Column(Integer, primary_key=True, index=True)
    model_name = Column(String, nullable=False)
    model_type = Column(String, nullable=False)                # Cost Overrun, Schedule Delay
    algorithm = Column(String, nullable=False)                 # GradientBoostingClassifier, RandomForestClassifier
    version = Column(String, nullable=False)
    accuracy = Column(Float, nullable=True)
    precision = Column(Float, nullable=True)
    recall = Column(Float, nullable=True)
    f1_score = Column(Float, nullable=True)
    roc_auc = Column(Float, nullable=True)
    mae = Column(Float, nullable=True)
    rmse = Column(Float, nullable=True)
    r2_score = Column(Float, nullable=True)
    status = Column(String, default="Active")                  # Active, Inactive, Staging
    trained_at = Column(DateTime, default=datetime.utcnow)

class ScenarioSimulation(Base):
    __tablename__ = "scenario_simulations"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    input_params_json = Column(JSON, nullable=False)
    result_metrics_json = Column(JSON, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_username = Column(String, nullable=False)
    action = Column(String, nullable=False)
    entity_type = Column(String, nullable=False)
    entity_id = Column(String, nullable=True)
    details = Column(Text, nullable=True)
    timestamp = Column(DateTime, default=datetime.utcnow)

class SystemSetting(Base):
    __tablename__ = "system_settings"

    id = Column(Integer, primary_key=True, index=True)
    high_risk_threshold = Column(Float, default=67.0)
    medium_risk_threshold = Column(Float, default=34.0)
    cost_risk_weight = Column(Float, default=0.40)
    schedule_risk_weight = Column(Float, default=0.40)
    progress_risk_weight = Column(Float, default=0.20)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
