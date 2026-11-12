from datetime import datetime, timezone
from uuid import uuid4

from sqlalchemy import JSON, DateTime, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from ..database import Base


def utcnow() -> datetime:
    return datetime.now(timezone.utc)


class Project(Base):
    __tablename__ = "projects"

    id: Mapped[str] = mapped_column(String(32), primary_key=True, default=lambda: uuid4().hex)
    name: Mapped[str] = mapped_column(String(70), nullable=False, unique=True)
    description: Mapped[str] = mapped_column(Text, nullable=False, default="")
    stack: Mapped[list] = mapped_column(JSON, nullable=False, default=list)
    color: Mapped[str] = mapped_column(String(20), nullable=False, default="violet")
    status: Mapped[str] = mapped_column(String(30), nullable=False, default="New project")
    members: Mapped[list] = mapped_column(JSON, nullable=False, default=list)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=utcnow, onupdate=utcnow
    )

    sources = relationship(
        "Source", back_populates="project", cascade="all, delete-orphan", passive_deletes=True
    )
    claims = relationship(
        "Claim", back_populates="project", cascade="all, delete-orphan", passive_deletes=True
    )
    conflicts = relationship(
        "Conflict", back_populates="project", cascade="all, delete-orphan", passive_deletes=True
    )
    reports = relationship(
        "Report", back_populates="project", cascade="all, delete-orphan", passive_deletes=True
    )
