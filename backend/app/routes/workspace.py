from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from ..database import get_db
from ..models.claim import Claim
from ..models.conflict import Conflict
from ..models.project import Project
from ..models.report import Report
from ..models.source import Source
from ..schemas.workspace import WorkspaceOut
from ..utils.serializers import (
    claim_out,
    conflict_out,
    project_out,
    report_out,
    source_out,
    source_name_map,
)

router = APIRouter(tags=["workspace"])


@router.get("/workspace", response_model=WorkspaceOut)
def read_workspace(db: Session = Depends(get_db)) -> WorkspaceOut:
    """One request gives the SPA everything it needs on load."""
    projects = db.query(Project).order_by(Project.updated_at.desc()).all()
    sources = db.query(Source).order_by(Source.created_at.desc()).all()
    names = source_name_map(sources)
    claims = db.query(Claim).order_by(Claim.created_at.desc()).all()
    conflicts = db.query(Conflict).order_by(Conflict.created_at.desc()).all()
    reports = db.query(Report).order_by(Report.created_at.desc()).all()

    return WorkspaceOut(
        projects=[project_out(project) for project in projects],
        sources=[source_out(source) for source in sources],
        claims=[claim_out(claim, names) for claim in claims],
        conflicts=[conflict_out(conflict, names) for conflict in conflicts],
        reports=[report_out(report) for report in reports],
    )
