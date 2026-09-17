# ⚡ InfraPredict AI - Infrastructure Risk Assessment Platform

## Smart India Hackathon 2026 • Problem Statement ID: 26103 • Team Essor Prime

**InfraPredict AI** is a production-ready, full-stack enterprise web application designed to transform infrastructure project monitoring from reactive status checking into **predictive risk assessment and early warning guidance**. Built specifically for SIH 2026, the platform ingests complex multi-sector project data, validates raw inputs, engineers predictive features, and deploys interpretable machine learning models to forecast **cost overruns**, **schedule delays**, and **overall project risks**.

---

## 🌟 Key Product Innovations & Capabilities

1. **Predictive Command Center**: Dynamic monitoring across **1,775+ national infrastructure projects** auto-ingested into SQLite on first startup.
2. **Dual ML Architecture**:
   - **Cost Overrun Classifier**: Supervised Gradient Boosting algorithm predicting probability of cost overrun.
   - **Schedule Delay Regressor**: Random Forest algorithm estimating delay impact.
3. **Explainable AI (XAI)**: Breakdown of exact contributing risk factors for every single project.
4. **Interactive What-If Scenario Sandbox**: Real-time simulation of hypothetical budget & progress adjustments.
5. **Early Warning System**: Automatic trigger alerts when risk thresholds are breached.
6. **Data Management Studio**: Drag-and-drop CSV upload, validation, and auto-seeding.
7. **Executive PDF Exporter**: PDF report generation via ReportLab.
8. **Role-Based Access Control (RBAC)**: Super Admin, Department Admin, Project Manager, Analyst, Viewer.

---

## 🚀 Quick Start & How to Run Locally

### Prerequisites
- Python 3.10+
- Node.js 18+

### 1. Launch Backend (FastAPI + SQLite)
```bash
cd backend
python -m venv venv
.\venv\Scripts\activate    # On Windows
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```
Backend Swagger API Documentation will be available at: `http://localhost:8000/docs`

### 2. Launch Frontend (React + Vite)
```bash
cd frontend
npm install --legacy-peer-deps
npm run dev
```
Frontend web application will open at: `http://localhost:3000`

---

## 🔑 Demo User Credentials

| Username | Password | Role | Description |
| :--- | :--- | :--- | :--- |
| `admin` | `admin123` | **SUPER_ADMIN** | Full platform access & ML retraining |
| `govt_admin` | `admin123` | **DEPT_ADMIN** | Ministry risk monitoring & reports |
| `pm_user` | `admin123` | **PROJECT_MANAGER** | Project updates & scenario analysis |
| `analyst` | `admin123` | **ANALYST** | Trend & sector analytics |
| `viewer` | `admin123` | **VIEWER** | Read-only executive views |

---

## 🐳 Docker Deployment
```bash
docker-compose up --build
```
- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:8000`
