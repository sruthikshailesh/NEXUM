from datetime import datetime
from uuid import uuid4

from sqlalchemy import Boolean, DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from ..database import Base
from .project import utcnow


class Conflict(Base):
    __tablename__ = "conflicts"

    id: Mapped[str] = mapped_column(String(32), primary_key=True, default=lambda: uuid4().hex)
    project_id: Mapped[str] = mapped_column(
        String(32), ForeignKey("projects.id", ondelete="CASCADE"), nullable=False, index=True
    )
    title: Mapped[str] = mapped_column(String(240), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False, default="")
    status: Mapped[str] = mapped_column(String(20), nullable=False, default="Unresolved")
    resolution: Mapped[str | None] = mapped_column(Text, nullable=True)
    match_key: Mapped[str] = mapped_column(String(120), nullable=False, default="", index=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)

    project = relationship("Project", back_populates="conflicts")
    evidence = relationship(
        "ConflictEvidence",
        back_populates="conflict",
        cascade="all, delete-orphan",
        passive_deletes=True,
        order_by="ConflictEvidence.side",
    )


class ConflictEvidence(Base):
    __tablename__ = "conflict_evidence"

    id: Mapped[str] = mapped_column(String(32), primary_key=True, default=lambda: uuid4().hex)
    conflict_id: Mapped[str] = mapped_column(
        String(32), ForeignKey("conflicts.id", ondelete="CASCADE"), nullable=False, index=True
    )
    side: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    source_id: Mapped[str] = mapped_column(
        String(32), ForeignKey("sources.id", ondelete="CASCADE"), nullable=False, index=True
    )
    chunk_id: Mapped[str] = mapped_column(
        String(32), ForeignKey("chunks.id", ondelete="SET NULL"), nullable=True
    )
    page: Mapped[int | None] = mapped_column(Integer, nullable=True)
    quote: Mapped[str] = mapped_column(Text, nullable=False)
    verified: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)

    conflict = relationship("Conflict", back_populates="evidence")
