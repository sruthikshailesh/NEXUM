from datetime import datetime
from typing import Literal

from pydantic import BaseModel, Field, field_validator

from .common import ORMModel

ProjectStatus = Literal["New project", "Needs review", "Up to date"]
ProjectColor = Literal["violet", "green", "blue", "amber"]


class ProjectCreate(BaseModel):
    name: str = Field(min_length=1, max_length=70)
    description: str = Field(min_length=1, max_length=350)
    stack: list[str] = Field(default_factory=list)
    color: ProjectColor = "violet"
    members: list[str] = Field(default_factory=list)

    @field_validator("name", "description")
    @classmethod
    def strip_text(cls, value: str) -> str:
        cleaned = value.strip()
        if not cleaned:
            raise ValueError("This field cannot be blank.")
        return cleaned

    @field_validator("stack", "members")
    @classmethod
    def clean_list(cls, values: list[str]) -> list[str]:
        # Strip blanks, drop duplicates, keep original order.
        return list(dict.fromkeys(item.strip() for item in values if item and item.strip()))


class ProjectUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=70)
    description: str | None = Field(default=None, min_length=1, max_length=350)
    stack: list[str] | None = None
    status: ProjectStatus | None = None
    members: list[str] | None = None


class ProjectOut(ORMModel):
    id: str
    name: str
    description: str
    stack: list[str]
    color: str
    status: str
    members: list[str]
    created_at: datetime
    updated_at: datetime
