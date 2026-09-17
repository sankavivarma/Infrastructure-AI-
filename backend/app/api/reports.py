import io
from fastapi import APIRouter, Depends, HTTPException, Response
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.models.db_models import Project, ProjectRiskPrediction
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors

router = APIRouter(prefix="/reports", tags=["Reports Exporter"])

@router.get("/risk-summary/pdf")
def generate_risk_summary_pdf(db: Session = Depends(get_db)):
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=letter, rightMargin=36, leftMargin=36, topMargin=36, bottomMargin=36)
    story = []
    
    styles = getSampleStyleSheet()
    title_style = ParagraphStyle('Title', parent=styles['Heading1'], fontSize=18, leading=22, textColor=colors.HexColor('#0f172a'))
    subtitle_style = ParagraphStyle('SubTitle', parent=styles['Normal'], fontSize=10, textColor=colors.HexColor('#475569'), spaceAfter=12)

    story.append(Paragraph("InfraPredict AI - Executive Infrastructure Risk Assessment Report", title_style))
    story.append(Paragraph("Infrastructure Intelligence & Predictive Risk Monitoring Platform", subtitle_style))
    story.append(Spacer(1, 12))

    high_projects = db.query(Project, ProjectRiskPrediction)\
                      .join(ProjectRiskPrediction, Project.id == ProjectRiskPrediction.project_id)\
                      .filter(ProjectRiskPrediction.overall_risk_category == "HIGH")\
                      .order_by(ProjectRiskPrediction.overall_risk_score.desc()).limit(20).all()

    table_data = [["ID", "Project Name", "Sector", "Planned (Cr)", "Revised (Cr)", "Risk Score", "Category"]]
    for p, pred in high_projects:
        table_data.append([
            p.project_id[:10],
            p.project_name[:32],
            p.sector[:18],
            f"₹{p.planned_cost:.1f}",
            f"₹{p.current_cost:.1f}",
            f"{pred.overall_risk_score}/100",
            pred.overall_risk_category
        ])

    t = Table(table_data, colWidths=[60, 180, 110, 65, 65, 60, 50])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#1e293b')),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, 0), 8),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 6),
        ('BACKGROUND', (0, 1), (-1, -1), colors.HexColor('#f8fafc')),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#cbd5e1')),
        ('FONTSIZE', (0, 1), (-1, -1), 7),
    ]))
    story.append(t)

    doc.build(story)
    buffer.seek(0)
    
    return Response(
        content=buffer.getvalue(),
        media_type="application/pdf",
        headers={"Content-Disposition": "attachment; filename=InfraPredict_Executive_Risk_Report.pdf"}
    )
