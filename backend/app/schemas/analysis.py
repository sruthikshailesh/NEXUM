from datetime import datetime
from typing import Literal

from pydantic import BaseModel, Field

from .conflict import ConflictOut


class EvidenceOut(BaseModel):
    source_id: str
    source_name: str
    page: int | None = None
    quote: str
    verified: bool = True


class ClaimOut(BaseModel):
    id: str
    project_id: str
    kind: str
    epistemic_type: str
    title: str
    detail: str
    rationale: str
    status: str
    people: list[str]
    created_at: datetime
    evidence: list[EvidenceOut] = Field(default_factory=list)


class DiscardedCitation(BaseModel):
    reason: str
    item: str
    source_id: str | None = None
    quote: str | None = None


class AnalyzeRequest(BaseModel):
    # Explicit selection. Empty means "no sources", never "all sources".
    source_ids: list[str] = Field(min_length=1)


class AnalysisOut(BaseModel):
    project_id: str
    summary: str
    model: str
    source_ids: list[str]
    analyzed_at: datetime
    decisions: list[ClaimOut] = Field(default_factory=list)
    completed_work: list[ClaimOut] = Field(default_factory=list)
    pending_tasks: list[ClaimOut] = Field(default_factory=list)
    risks: list[ClaimOut] = Field(default_factory=list)
    dependencies: list[ClaimOut] = Field(default_factory=list)
    next_actions: list[ClaimOut] = Field(default_factory=list)
    questions: list[ClaimOut] = Field(default_factory=list)
    conflicts: list[ConflictOut] = Field(default_factory=list)
    discarded: list[DiscardedCitation] = Field(default_factory=list)
