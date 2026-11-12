from fastapi import APIRouter, Depends
from fastapi.responses import PlainTextResponse
from sqlalchemy.orm import Session

from ..database import get_db
from ..models.project import utcnow
from ..models.report import Report
from ..schemas.report import ReportCreate, ReportOut, ReportUpdate
from ..services.reports import build_report
from ..utils.errors import AppError
from ..utils.serializers import report_out
from .projects import get_project

router = APIRouter(tags=["reports"])


def get_report(db: Session, report_id: str) -> Report:
    report = db.get(Report, report_id)
    if not report:
        raise AppError("report_not_found", "This report no longer exists.", 404)
    return report


@router.get("/projects/{project_id}/reports", response_model=list[ReportOut])
def list_reports(project_id: str, db: Session = Depends(get_db)) -> list[ReportOut]:
    project = get_project(db, project_id)
    reports = (
        db.query(Report)
        .filter(Report.project_id == project.id)
        .order_by(Report.created_at.desc())
        .all()
    )
    return [report_out(report) for report in reports]


@router.post("/projects/{project_id}/reports", response_model=ReportOut, status_code=201)
def create_report(
    project_id: str, payload: ReportCreate, db: Session = Depends(get_db)
) -> ReportOut:
    project = get_project(db, project_id)
    return report_out(build_report(db, project, payload))


@router.get("/reports/{report_id}", response_model=ReportOut)
def read_report(report_id: str, db: Session = Depends(get_db)) -> ReportOut:
    return report_out(get_report(db, report_id))


@router.get("/reports/{report_id}/markdown", response_class=PlainTextResponse)
def export_report_markdown(report_id: str, db: Session = Depends(get_db)) -> PlainTextResponse:
    report = get_report(db, report_id)
    filename = f"nexum-{report.project_id}-handover.md"
    return PlainTextResponse(
        report.markdown,
        media_type="text/markdown; charset=utf-8",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )


@router.patch("/reports/{report_id}", response_model=ReportOut)
def review_report(
    report_id: str, payload: ReportUpdate, db: Session = Depends(get_db)
) -> ReportOut:
    report = get_report(db, report_id)
    report.status = payload.status
    report.updated_at = utcnow()
    db.commit()
    db.refresh(report)
    return report_out(report)
