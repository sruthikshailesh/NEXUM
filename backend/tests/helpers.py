import io

SOURCE_A = (
    "Current state: Automatic payment retries are enabled in staging. "
    "The team approved the retry policy. "
    "The checkout reconciliation spike is complete. "
    "Production load testing is pending."
)
SOURCE_B = (
    "Current state: Automatic payment retries are disabled in staging. "
    "The retry policy was not approved for release. "
    "The security review is pending."
)


def create_project(client, name="ShopSphere", description="A test storefront."):
    response = client.post(
        "/api/projects",
        json={"name": name, "description": description, "stack": ["React", "FastAPI"]},
    )
    assert response.status_code == 201, response.text
    return response.json()


def upload_text(client, project_id, filename="notes.txt", content=SOURCE_A):
    response = client.post(
        f"/api/projects/{project_id}/sources",
        files=[("files", (filename, content.encode("utf-8"), "text/plain"))],
    )
    return response


def upload_bytes(client, project_id, filename, content: bytes, mime: str):
    return client.post(
        f"/api/projects/{project_id}/sources",
        files=[("files", (filename, content, mime))],
    )


def docx_bytes(text: str) -> bytes:
    from docx import Document

    document = Document()
    document.add_paragraph(text)
    buffer = io.BytesIO()
    document.save(buffer)
    return buffer.getvalue()


def add_two_sources(client, project_id):
    first = upload_text(client, project_id, "checkout-notes.txt", SOURCE_A)
    second = upload_text(client, project_id, "release-notes.md", SOURCE_B)
    assert first.status_code == 201, first.text
    assert second.status_code == 201, second.text
    return first.json()["uploaded"][0], second.json()["uploaded"][0]
