from datetime import datetime
from uuid import uuid4

from sqlalchemy import JSON, DateTime, ForeignKey, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from ..database import Base
from .project import utcnow


class AnalysisRun(Base):
    """One analysis pass over an explicit set of project sources."""

    __tablename__ = "analysis_runs"

    id: Mapped[str] = mapped_column(String(32), primary_key=True, default=lambda: uuid4().hex)
    project_id: Mapped[str] = mapped_column(
        String(32), ForeignKey("projects.id", ondelete="CASCADE"), nullable=False, index=True
    )
    summary: Mapped[str] = mapped_column(Text, nullable=False, default="")
    model: Mapped[str] = mapped_column(String(80), nullable=False, default="")
    source_ids: Mapped[list] = mapped_column(JSON, nullable=False, default=list)
    discarded: Mapped[list] = mapped_column(JSON, nullable=False, default=list)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)
