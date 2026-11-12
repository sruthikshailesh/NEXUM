from datetime import datetime

from pydantic import BaseModel


class SourceOut(BaseModel):
    id: str
    project_id: str
    name: str
    type: str
    date: datetime
    status: str
    summary: str
    content: str
    size: str
    size_bytes: int
    page_count: int
    chunk_count: int


class UploadFailure(BaseModel):
    filename: str
    code: str
    message: str


class UploadResult(BaseModel):
    uploaded: list[SourceOut]
    failed: list[UploadFailure]


class ChunkOut(BaseModel):
    id: str
    source_id: str
    chunk_index: int
    page: int | None
    text: str
    token_estimate: int
