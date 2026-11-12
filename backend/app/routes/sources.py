from pathlib import Path

from fastapi import APIRouter, Depends, File, UploadFile
from sqlalchemy.orm import Session

from ..database import get_db
from ..models.project import utcnow
from ..models.source import Chunk, Source
from ..schemas.source import ChunkOut, SourceOut, UploadFailure, UploadResult
from ..services.chunking import build_chunks
from ..services.extraction import extract_document
from ..services.files import save_upload, validate_upload
from ..utils.errors import AppError
from ..utils.serializers import source_out
from .projects import get_project

router = APIRouter(tags=["sources"])

MAX_FILES_PER_REQUEST = 10


def get_source(db: Session, source_id: str) -> Source:
    source = db.get(Source, source_id)
    if not source:
        raise AppError("source_not_found", "This source no longer exists.", 404)
    return source


@router.get("/projects/{project_id}/sources", response_model=list[SourceOut])
def list_sources(project_id: str, db: Session = Depends(get_db)) -> list[SourceOut]:
    project = get_project(db, project_id)
    sources = (
        db.query(Source)
        .filter(Source.project_id == project.id)
        .order_by(Source.created_at.desc())
        .all()
    )
    return [source_out(source) for source in sources]


@router.post("/projects/{project_id}/sources", response_model=UploadResult, status_code=201)
def upload_sources(
    project_id: str,
    files: list[UploadFile] = File(...),
    db: Session = Depends(get_db),
) -> UploadResult:
    project = get_project(db, project_id)
    if not files:
        raise AppError("no_files", "Choose at least one file to upload.", 400)
    if len(files) > MAX_FILES_PER_REQUEST:
        raise AppError(
            "too_many_files", f"Upload at most {MAX_FILES_PER_REQUEST} files at a time.", 400
        )

    uploaded: list[Source] = []
    failed: list[UploadFailure] = []

    for upload in files:
        raw_name = upload.filename or "document"
        stored_path: Path | None = None
        try:
            data = upload.file.read()
            ext, file_type = validate_upload(raw_name, upload.content_type, data)
            stored_path, safe_name = save_upload(project.id, raw_name, data)
            extraction = extract_document(stored_path, ext)
            pieces = build_chunks(extraction)
            if not pieces:
                raise AppError(
                    "empty_document", "No readable text could be split into chunks.", 422
                )

            excerpt = extraction.text[:240].replace("\n", " ").strip()
            source = Source(
                project_id=project.id,
                name=safe_name,
                original_filename=raw_name[:255],
                file_type=file_type,
                mime_type=(upload.content_type or "")[:120],
                size_bytes=len(data),
                stored_path=str(stored_path),
                status="Indexed",
                summary=f"Extracted text from this file. Excerpt: {excerpt}",
                extracted_text=extraction.text,
                page_count=extraction.page_count,
            )
            db.add(source)
            db.flush()
            for piece in pieces:
                db.add(Chunk(source_id=source.id, **piece))
            db.flush()
            uploaded.append(source)
        except AppError as exc:
            if stored_path and stored_path.exists():
                stored_path.unlink(missing_ok=True)
            failed.append(
                UploadFailure(filename=raw_name, code=exc.code, message=exc.message)
            )
        except Exception:  # noqa: BLE001 - never leak internals to the client
            if stored_path and stored_path.exists():
                stored_path.unlink(missing_ok=True)
            failed.append(
                UploadFailure(
                    filename=raw_name,
                    code="processing_failed",
                    message="This file could not be processed. Try another copy or format.",
                )
            )

    if uploaded:
        project.status = "Needs review"
        project.updated_at = utcnow()
    db.commit()

    for source in uploaded:
        db.refresh(source)
    return UploadResult(
        uploaded=[source_out(source) for source in uploaded], failed=failed
    )


@router.get("/sources/{source_id}", response_model=SourceOut)
def get_source_detail(source_id: str, db: Session = Depends(get_db)) -> SourceOut:
    return source_out(get_source(db, source_id))


@router.get("/sources/{source_id}/chunks", response_model=list[ChunkOut])
def get_source_chunks(source_id: str, db: Session = Depends(get_db)) -> list[ChunkOut]:
    source = get_source(db, source_id)
    return [
        ChunkOut(
            id=chunk.id,
            source_id=chunk.source_id,
            chunk_index=chunk.chunk_index,
            page=chunk.page,
            text=chunk.text,
            token_estimate=chunk.token_estimate,
        )
        for chunk in source.chunks
    ]


@router.delete("/sources/{source_id}", status_code=204)
def delete_source(source_id: str, db: Session = Depends(get_db)) -> None:
    source = get_source(db, source_id)
    path = Path(source.stored_path)
    project = source.project
    db.delete(source)
    if project:
        project.status = "Needs review"
        project.updated_at = utcnow()
    db.commit()
    path.unlink(missing_ok=True)
