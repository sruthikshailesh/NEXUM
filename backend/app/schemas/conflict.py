from datetime import datetime
from typing import Literal

from pydantic import BaseModel, Field

ConflictStatus = Literal["Unresolved", "Under Review", "Resolved"]


class ConflictEvidenceOut(BaseModel):
    source_id: str
    source_name: str
    page: int | None = None
    claim: str
    quote: str
    date: datetime
    author: str


class ConflictOut(BaseModel):
    id: str
    project_id: str
    title: str
    description: str
    date: datetime
    status: str
    evidence: list[ConflictEvidenceOut]
    resolution: str | None = None


class ConflictUpdate(BaseModel):
    status: ConflictStatus
    resolution: str | None = Field(default=None, max_length=2500)
