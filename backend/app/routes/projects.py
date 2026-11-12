from fastapi import APIRouter, Depends, Response
from sqlalchemy import func
from sqlalchemy.orm import Session

from ..database import get_db
from ..models.claim import Claim
from ..models.conflict import Conflict
from ..models.project import Project, utcnow
from ..models.source import Source
from ..schemas.project import ProjectCreate, ProjectOut, ProjectUpdate
from ..schemas.workspace import ProjectDetailOut
from ..utils.errors import AppError
from ..utils.serializers import project_out

router = APIRouter(prefix="/projects", tags=["projects"])


def get_project(db: Session, project_id: str) -> Project:
    project = db.get(Project, project_id)
    if not project:
        raise AppError("project_not_found", "Project not found.", 404)
    return project


@router.get("", response_model=list[ProjectOut])
def list_projects(db: Session = Depends(get_db)) -> list[ProjectOut]:
    projects = db.query(Project).order_by(Project.updated_at.desc()).all()
    return [project_out(project) for project in projects]


@router.post("", response_model=ProjectOut, status_code=201)
def create_project(payload: ProjectCreate, db: Session = Depends(get_db)) -> ProjectOut:
    existing = (
        db.query(Project).filter(func.lower(Project.name) == payload.name.lower()).first()
    )
    if existing:
        raise AppError("duplicate_project", "A project with this name already exists.", 409)

    project = Project(
        name=payload.name,
        description=payload.description,
        stack=payload.stack,
        color=payload.color,
        members=payload.members,
        status="New project",
    )
    db.add(project)
    db.commit()
    db.refresh(project)
    return project_out(project)


@router.get("/{project_id}", response_model=ProjectDetailOut)
def get_project_detail(project_id: str, db: Session = Depends(get_db)) -> ProjectDetailOut:
    project = get_project(db, project_id)
    return ProjectDetailOut(
        project=project_out(project),
        counts={
            "sources": db.query(Source).filter(Source.project_id == project.id).count(),
            "claims": db.query(Claim).filter(Claim.project_id == project.id).count(),
            "conflicts": db.query(Conflict).filter(Conflict.project_id == project.id).count(),
        },
    )


@router.patch("/{project_id}", response_model=ProjectOut)
def update_project(
    project_id: str, payload: ProjectUpdate, db: Session = Depends(get_db)
) -> ProjectOut:
    project = get_project(db, project_id)
    data = payload.model_dump(exclude_unset=True)
    if "name" in data and data["name"]:
        clash = (
            db.query(Project)
            .filter(func.lower(Project.name) == data["name"].lower(), Project.id != project.id)
            .first()
        )
        if clash:
            raise AppError("duplicate_project", "A project with this name already exists.", 409)
    for field, value in data.items():
        setattr(project, field, value)
    project.updated_at = utcnow()
    db.commit()
    db.refresh(project)
    return project_out(project)


@router.delete("/{project_id}", status_code=204)
def delete_project(project_id: str, db: Session = Depends(get_db)) -> Response:
    project = get_project(db, project_id)
    db.delete(project)
    db.commit()
    return Response(status_code=204)
