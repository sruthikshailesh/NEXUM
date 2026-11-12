"""Text extraction with page tracking for PDFs."""

from dataclasses import dataclass, field
from pathlib import Path

from ..utils.errors import AppError


@dataclass
class ExtractionResult:
    text: str
    pages: list[tuple[int | None, str]] = field(default_factory=list)
    page_count: int = 0


def _clean(text: str) -> str:
    return text.replace("\r\n", "\n").replace("\r", "\n").strip()


def extract_document(path: Path, ext: str) -> ExtractionResult:
    if ext == "pdf":
        return _extract_pdf(path)
    if ext == "docx":
        return _extract_docx(path)
    return _extract_plain(path)


def _extract_pdf(path: Path) -> ExtractionResult:
    from pypdf import PdfReader

    try:
        reader = PdfReader(str(path))
    except Exception as exc:  # noqa: BLE001 - pypdf raises many internal types
        raise AppError("corrupt_file", "This PDF could not be read. It may be corrupt.", 422) from exc

    if reader.is_encrypted:
        # Empty-password PDFs are readable; anything else needs a password.
        try:
            if reader.decrypt("") == 0:
                raise AppError(
                    "password_protected",
                    "This PDF is password-protected. Upload an unlocked copy.",
                    422,
                )
        except AppError:
            raise
        except Exception as exc:  # noqa: BLE001
            raise AppError(
                "password_protected",
                "This PDF is password-protected. Upload an unlocked copy.",
                422,
            ) from exc

    pages: list[tuple[int | None, str]] = []
    try:
        for index, page in enumerate(reader.pages, start=1):
            pages.append((index, _clean(page.extract_text() or "")))
    except Exception as exc:  # noqa: BLE001
        raise AppError("corrupt_file", "This PDF could not be read. It may be corrupt.", 422) from exc

    text = "\n\n".join(page_text for _, page_text in pages if page_text)
    if len(text.strip()) < 20:
        raise AppError(
            "scanned_pdf",
            "No selectable text was found. This PDF looks scanned or image-only; OCR is not supported.",
            422,
        )
    return ExtractionResult(text=text, pages=pages, page_count=len(pages))


def _extract_docx(path: Path) -> ExtractionResult:
    from docx import Document

    try:
        document = Document(str(path))
    except Exception as exc:  # noqa: BLE001
        raise AppError("corrupt_file", "This DOCX file could not be read. It may be corrupt.", 422) from exc

    parts: list[str] = [paragraph.text for paragraph in document.paragraphs if paragraph.text.strip()]
    for table in document.tables:
        for row in table.rows:
            cells = [cell.text.strip() for cell in row.cells if cell.text.strip()]
            if cells:
                parts.append(" | ".join(cells))

    text = _clean("\n".join(parts))
    if not text:
        raise AppError("empty_document", "This DOCX file contains no readable text.", 422)
    return ExtractionResult(text=text, pages=[(None, text)], page_count=0)


def _extract_plain(path: Path) -> ExtractionResult:
    raw = path.read_bytes()
    try:
        text = raw.decode("utf-8-sig")
    except UnicodeDecodeError:
        # Older notes are often Windows-encoded; latin-1 never fails.
        text = raw.decode("latin-1")

    text = _clean(text)
    if not text:
        raise AppError("empty_document", "This file contains no readable text.", 422)
    return ExtractionResult(text=text, pages=[(None, text)], page_count=0)
