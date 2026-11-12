from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from ..database import get_db
from ..models.claim import Claim
from ..models.conflict import Conflict
from ..models.source import Source
from ..schemas.analysis import AnalysisOut, AnalyzeRequest, DiscardedCitation
from ..services.analysis import analyze_project, latest_analysis
from ..utils.errors import AppError
from ..utils.serializers import claim_out, conflict_out
from .projects import get_project

router = APIRouter(prefix="/projects", tags=["analysis"])

KIND_FIELDS = {
    "decision": "decisions",
    "completed": "completed_work",
    "pending": "pending_tasks",
    "risk": "risks",
    "dependency": "dependencies",
    "next_action": "next_actions",
    "question": "questions",
}


def analysis_response(db: Session, project_id: str) -> AnalysisOut:
    run = latest_analysis(db, project_id)
    if not run:
        raise AppError(
            "analysis_not_found",
            "No analysis has been run for this project yet.",
            404,
        )
    names = {
        source.id: source.name
        for source in db.query(Source).filter(Source.project_id == project_id).all()
    }
    claims = (
        db.query(Claim)
        .filter(Claim.project_id == project_id)
        .order_by(Claim.created_at.asc(), Claim.id.asc())
        .all()
    )
    grouped: dict[str, list] = {field: [] for field in KIND_FIELDS.values()}
    for claim in claims:
        field = KIND_FIELDS.get(claim.kind)
        if field:
            grouped[field].append(claim_out(claim, names))

    conflicts = (
        db.query(Conflict)
        .filter(Conflict.project_id == project_id)
        .order_by(Conflict.created_at.asc())
        .all()
    )
    return AnalysisOut(
        project_id=project_id,
        summary=run.summary,
        model=run.model,
        source_ids=list(run.source_ids or []),
        analyzed_at=run.created_at,
        conflicts=[conflict_out(conflict, names) for conflict in conflicts],
        discarded=[DiscardedCitation(**entry) for entry in (run.discarded or [])],
        **grouped,
    )


@router.post("/{project_id}/analyze", response_model=AnalysisOut)
def analyze(
    project_id: str, payload: AnalyzeRequest, db: Session = Depends(get_db)
) -> AnalysisOut:
    project = get_project(db, project_id)
    analyze_project(db, project, payload.source_ids)
    return analysis_response(db, project.id)


@router.get("/{project_id}/analysis", response_model=AnalysisOut)
def get_analysis(project_id: str, db: Session = Depends(get_db)) -> AnalysisOut:
    get_project(db, project_id)
    return analysis_response(db, project_id)
