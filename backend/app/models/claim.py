from datetime import datetime
from uuid import uuid4

from sqlalchemy import JSON, Boolean, DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from ..database import Base
from .project import utcnow


class Claim(Base):
    """A single extracted statement: decision, risk, task, next action, question..."""

    __tablename__ = "claims"

    id: Mapped[str] = mapped_column(String(32), primary_key=True, default=lambda: uuid4().hex)
    project_id: Mapped[str] = mapped_column(
        String(32), ForeignKey("projects.id", ondelete="CASCADE"), nullable=False, index=True
    )
    kind: Mapped[str] = mapped_column(String(30), nullable=False, index=True)
    epistemic_type: Mapped[str] = mapped_column(String(20), nullable=False, default="unknown")
    title: Mapped[str] = mapped_column(String(240), nullable=False)
    detail: Mapped[str] = mapped_column(Text, nullable=False, default="")
    rationale: Mapped[str] = mapped_column(Text, nullable=False, default="")
    status: Mapped[str] = mapped_column(String(20), nullable=False, default="Under Review")
    people: Mapped[list] = mapped_column(JSON, nullable=False, default=list)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)

    project = relationship("Project", back_populates="claims")
    evidence = relationship(
        "ClaimEvidence",
        back_populates="claim",
        cascade="all, delete-orphan",
        passive_deletes=True,
    )


class ClaimEvidence(Base):
    """Verified pointer from a claim back to the exact chunk text."""

    __tablename__ = "claim_evidence"

    id: Mapped[str] = mapped_column(String(32), primary_key=True, default=lambda: uuid4().hex)
    claim_id: Mapped[str] = mapped_column(
        String(32), ForeignKey("claims.id", ondelete="CASCADE"), nullable=False, index=True
    )
    source_id: Mapped[str] = mapped_column(
        String(32), ForeignKey("sources.id", ondelete="CASCADE"), nullable=False, index=True
    )
    chunk_id: Mapped[str] = mapped_column(
        String(32), ForeignKey("chunks.id", ondelete="SET NULL"), nullable=True
    )
    page: Mapped[int | None] = mapped_column(Integer, nullable=True)
    quote: Mapped[str] = mapped_column(Text, nullable=False)
    verified: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)

    claim = relationship("Claim", back_populates="evidence")
