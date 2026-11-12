from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from ..database import get_db
from ..models.conflict import Conflict
from ..models.source import Source
from ..schemas.conflict import ConflictOut, ConflictUpdate
from ..services.conflicts import get_conflict, update_conflict
from ..utils.serializers import conflict_out
from .projects import get_project

router = APIRouter(tags=["conflicts"])


def _names(db: Session, project_id: str) -> dict[str, str]:
    return {
        source.id: source.name
        for source in db.query(Source).filter(Source.project_id == project_id).all()
    }


@router.get("/projects/{project_id}/conflicts", response_model=list[ConflictOut])
def list_conflicts(project_id: str, db: Session = Depends(get_db)) -> list[ConflictOut]:
    project = get_project(db, project_id)
    names = _names(db, project.id)
    conflicts = (
        db.query(Conflict)
        .filter(Conflict.project_id == project.id)
        .order_by(Conflict.created_at.desc())
        .all()
    )
    return [conflict_out(conflict, names) for conflict in conflicts]


@router.patch("/conflicts/{conflict_id}", response_model=ConflictOut)
def review_conflict(
    conflict_id: str, payload: ConflictUpdate, db: Session = Depends(get_db)
) -> ConflictOut:
    conflict = update_conflict(db, conflict_id, payload)
    return conflict_out(conflict, _names(db, conflict.project_id))


@router.get("/conflicts/{conflict_id}", response_model=ConflictOut)
def read_conflict(conflict_id: str, db: Session = Depends(get_db)) -> ConflictOut:
    conflict = get_conflict(db, conflict_id)
    return conflict_out(conflict, _names(db, conflict.project_id))
