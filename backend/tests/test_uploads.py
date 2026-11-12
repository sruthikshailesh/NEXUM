import io

from docx import Document
from pypdf import PdfWriter

from helpers import SOURCE_A, create_project, docx_bytes, upload_bytes, upload_text


def test_txt_upload_is_indexed_and_chunked(client):
    project = create_project(client)
    response = upload_text(client, project["id"])
    assert response.status_code == 201, response.text
    body = response.json()
    assert body["failed"] == []
    source = body["uploaded"][0]
    assert source["type"] == "TXT"
    assert source["status"] == "Indexed"
    assert source["chunk_count"] >= 1
    assert "Automatic payment retries" in source["content"]

    chunks = client.get(f"/api/sources/{source['id']}/chunks").json()
    assert chunks and chunks[0]["page"] is None
    assert chunks[0]["source_id"] == source["id"]


def test_markdown_and_docx_upload(client):
    project = create_project(client)
    markdown = upload_text(client, project["id"], "meeting.md", SOURCE_A)
    assert markdown.status_code == 201
    assert markdown.json()["uploaded"][0]["type"] == "Markdown"

    docx = upload_bytes(
        client,
        project["id"],
        "architecture.docx",
        docx_bytes("The service uses PostgreSQL for storage."),
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    )
    assert docx.status_code == 201, docx.text
    assert docx.json()["uploaded"][0]["type"] == "DOCX"


def test_filename_is_sanitized(client):
    project = create_project(client)
    response = upload_text(client, project["id"], "../../evil name?.txt")
    assert response.status_code == 201
    name = response.json()["uploaded"][0]["name"]
    assert "/" not in name and "?" not in name and "\\" not in name


def test_unsupported_type_mime_and_empty_file(client):
    project = create_project(client)
    exe = upload_bytes(client, project["id"], "bad.exe", b"nope", "application/octet-stream")
    assert exe.status_code == 201
    assert exe.json()["uploaded"] == []
    assert exe.json()["failed"][0]["code"] == "unsupported_file_type"

    mismatch = upload_bytes(client, project["id"], "notes.txt", b"hello", "image/png")
    assert mismatch.json()["failed"][0]["code"] == "mime_type_mismatch"

    empty = upload_text(client, project["id"], "empty.txt", "")
    assert empty.json()["failed"][0]["code"] == "empty_file"


def test_size_limit_is_enforced(client, monkeypatch):
    monkeypatch.setattr("app.services.files.MAX_UPLOAD_BYTES", 20)
    project = create_project(client)
    response = upload_text(client, project["id"], "big.txt", "x" * 100)
    assert response.json()["failed"][0]["code"] == "file_too_large"


def test_corrupt_scanned_and_password_protected_pdfs(client):
    project = create_project(client)

    corrupt = upload_bytes(client, project["id"], "corrupt.pdf", b"not a pdf", "application/pdf")
    assert corrupt.json()["failed"][0]["code"] == "corrupt_file"

    blank = io.BytesIO()
    writer = PdfWriter()
    writer.add_blank_page(width=200, height=200)
    writer.write(blank)
    scanned = upload_bytes(client, project["id"], "scan.pdf", blank.getvalue(), "application/pdf")
    assert scanned.json()["failed"][0]["code"] == "scanned_pdf"

    locked = io.BytesIO()
    writer = PdfWriter()
    writer.add_blank_page(width=200, height=200)
    writer.encrypt("secret")
    writer.write(locked)
    protected = upload_bytes(
        client, project["id"], "locked.pdf", locked.getvalue(), "application/pdf"
    )
    assert protected.json()["failed"][0]["code"] == "password_protected"


def test_upload_to_missing_project(client):
    assert upload_text(client, "does-not-exist").status_code == 404
