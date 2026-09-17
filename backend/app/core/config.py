PROJECT_NAME = "InfraPredict AI"
VERSION = "1.0.0"
API_V1_STR = "/api"

# Security
SECRET_KEY = "infrapredict-secret-key-super-secure-enterprise-platform"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24  # 1 day

# Database
SQLALCHEMY_DATABASE_URL = "sqlite:///./database/infrastructure_monitoring.db"

# Risk Thresholds
DEFAULT_HIGH_RISK_THRESHOLD = 67
DEFAULT_MEDIUM_RISK_THRESHOLD = 34

# Configurable Risk Weights
DEFAULT_COST_RISK_WEIGHT = 0.40
DEFAULT_SCHEDULE_RISK_WEIGHT = 0.40
DEFAULT_PROGRESS_RISK_WEIGHT = 0.20
