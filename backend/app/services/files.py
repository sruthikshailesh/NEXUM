"""Upload validation: extension, declared MIME, magic bytes and size."""

import os
import re
import unicodedata
from pathlib import Path
from uuid import uuid4

from ..config import MAX_UPLOAD_BYTES, UPLOAD_DIR
from ..utils.errors import AppError

# extension -> (frontend type label, accepted MIME types)
ALLOWED_TYPES: dict[str, tuple[str, set[str]]] = {
    "pdf": (
        "PDF",
        {"application/pdf", "application/x-pdf", "application/octet-stream"},
    ),
    "docx": (
        "DOCX",
        {
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            "application/zip",
            "application/octet-stream",
        },
    ),
    "txt": ("TXT", {"text/plain", "text/markdown", "application/octet-stream"}),
    "md": ("Markdown", {"text/markdown", "text/plain", "application/octet-stream"}),
}

MAX_NAME_LENGTH = 120


def sanitize_filename(name: str) -> str:
    """Keep a readable but safe file name (no paths, no control characters)."""
    base = os.path.basename((name or "").replace("\\", "/"))
    base = unicodedata.normalize("NFKC", base)
    stem, ext = os.path.splitext(base)
    stem = re.sub(r"[^A-Za-z0-9 ._-]+", "_", stem).strip(" ._")
    stem = re.sub(r"\s+", " ", stem)[:MAX_NAME_LENGTH] or "document"
    ext = ext.lower()[:10]
    return f"{stem}{ext}"


def validate_upload(filename: str, content_type: str | None, data: bytes) -> tuple[str, str]:
    """Return (extension, frontend type label) or raise a friendly AppError."""
    ext = Path(filename or "").suffix.lower().lstrip(".")
    if ext not in ALLOWED_TYPES:
        raise AppError(
            "unsupported_file_type",
            "Unsupported file type. Upload PDF, DOCX, TXT or Markdown files.",
            415,
        )

    mime = (content_type or "").split(";")[0].strip().lower()
    allowed_mimes = ALLOWED_TYPES[ext][1]
    if mime and mime not in allowed_mimes:
        raise AppError(
            "mime_type_mismatch",
            f"The file type '{mime}' does not match .{ext}. Choose a valid {ext.upper()} file.",
            415,
        )

    if not data:
        raise AppError("empty_file", "This file is empty. Add a file with readable text.", 400)
    if len(data) > MAX_UPLOAD_BYTES:
        limit_mb = MAX_UPLOAD_BYTES // (1024 * 1024)
        raise AppError("file_too_large", f"Files must be {limit_mb} MB or smaller.", 413)

    # Magic byte checks catch renamed/corrupt files early.
    if ext == "pdf" and not data.lstrip().startswith(b"%PDF-"):
        raise AppError("corrupt_file", "This PDF is corrupt or not a real PDF.", 422)
    if ext == "docx" and not data.startswith(b"PK"):
        raise AppError("corrupt_file", "This DOCX file is corrupt or not a real DOCX file.", 422)
    if ext in {"txt", "md"} and b"\x00" in data[:4096]:
        raise AppError("corrupt_file", "This text file contains binary data, not readable text.", 422)

    return ext, ALLOWED_TYPES[ext][0]


def save_upload(project_id: str, filename: str, data: bytes) -> tuple[Path, str]:
    """Write the file under uploads/<project_id>/ and return (path, safe name)."""
    safe_name = sanitize_filename(filename)
    folder = UPLOAD_DIR / project_id
    folder.mkdir(parents=True, exist_ok=True)
    stored = folder / f"{uuid4().hex}_{safe_name}"
    stored.write_bytes(data)
    return stored, safe_name
