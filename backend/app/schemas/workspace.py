from pydantic import BaseModel

from .analysis import ClaimOut
from .conflict import ConflictOut
from .project import ProjectOut
from .report import ReportOut
from .source import SourceOut


class WorkspaceOut(BaseModel):
    projects: list[ProjectOut]
    sources: list[SourceOut]
    claims: list[ClaimOut]
    conflicts: list[ConflictOut]
    reports: list[ReportOut]


class ProjectDetailOut(BaseModel):
    project: ProjectOut
    counts: dict[str, int]
