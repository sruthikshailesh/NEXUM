from datetime import datetime

from pydantic import BaseModel, Field


class ReportSection(BaseModel):
    title: str
    content: str


class ReportOut(BaseModel):
    id: str
    title: str
    project_id: str
    date: datetime
    updated_at: datetime
    status: str
    sections: list[ReportSection]
    source_ids: list[str]
    markdown: str


class ReportCreate(BaseModel):
    title: str | None = Field(default=None, max_length=240)
    source_ids: list[str] | None = None
    decision_ids: list[str] | None = None
    conflict_ids: list[str] | None = None


class ReportUpdate(BaseModel):
    status: str = Field(pattern="^(Reviewed|Generated)$")
