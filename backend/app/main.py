import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core import config
from app.database.session import engine, Base, SessionLocal
from app.services.ingestion_service import seed_default_users, seed_default_ml_models, import_csv_dataset
from app.api import auth, projects, risk, alerts, analytics, scenario, data_management, ml_management, reports

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Initialize Database Tables
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    try:
        # Seed default administrative users and model metadata
        seed_default_users(db)
        seed_default_ml_models(db)

        # Check and auto-ingest CSV dataset if present in /data/
        possible_paths = [
            "./data/infrastructure_projects.csv",
            "../data/infrastructure_projects.csv",
            os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "..", "data", "infrastructure_projects.csv")
        ]
        for p_path in possible_paths:
            if os.path.exists(p_path):
                import_csv_dataset(p_path, db, uploaded_by="System Auto-Ingest")
                break
    finally:
        db.close()
    yield

app = FastAPI(
    title=config.PROJECT_NAME,
    version=config.VERSION,
    openapi_url=f"{config.API_V1_STR}/openapi.json",
    lifespan=lifespan
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(auth.router, prefix=config.API_V1_STR)
app.include_router(projects.router, prefix=config.API_V1_STR)
app.include_router(risk.router, prefix=config.API_V1_STR)
app.include_router(alerts.router, prefix=config.API_V1_STR)
app.include_router(analytics.router, prefix=config.API_V1_STR)
app.include_router(scenario.router, prefix=config.API_V1_STR)
app.include_router(data_management.router, prefix=config.API_V1_STR)
app.include_router(ml_management.router, prefix=config.API_V1_STR)
app.include_router(reports.router, prefix=config.API_V1_STR)

@app.get("/")
def root():
    return {
        "platform": config.PROJECT_NAME,
        "version": config.VERSION,
        "status": "Online",
        "docs": "/docs"
    }
