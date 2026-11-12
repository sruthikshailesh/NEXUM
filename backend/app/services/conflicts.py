"""Conflict review. NEXUM never resolves a conflict automatically."""

from sqlalchemy.orm import Session

from ..models.conflict import Conflict
from ..models.project import utcnow
from ..schemas.conflict import ConflictUpdate
from ..utils.errors import AppError


def get_conflict(db: Session, conflict_id: str) -> Conflict:
    conflict = db.get(Conflict, conflict_id)
    if not conflict:
        raise AppError("conflict_not_found", "This conflict no longer exists.", 404)
    return conflict


def update_conflict(db: Session, conflict_id: str, payload: ConflictUpdate) -> Conflict:
    conflict = get_conflict(db, conflict_id)

    if payload.status == "Resolved":
        resolution = (payload.resolution or "").strip()
        if len(resolution) < 15:
            raise AppError(
                "resolution_required",
                "A resolution needs at least 15 characters explaining the human decision.",
                422,
            )
        conflict.resolution = resolution
    elif payload.resolution is not None:
        conflict.resolution = payload.resolution.strip() or None

    conflict.status = payload.status
    if conflict.project:
        conflict.project.status = "Needs review"
        conflict.project.updated_at = utcnow()
    db.commit()
    db.refresh(conflict)
    return conflict
