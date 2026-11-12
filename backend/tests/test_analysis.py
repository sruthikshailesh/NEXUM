import pytest

from helpers import add_two_sources, create_project, upload_text


def _analyze(client, project_id, source_ids):
    return client.post(
        f"/api/projects/{project_id}/analyze", json={"source_ids": source_ids}
    )


def test_analysis_keeps_only_verified_evidence(client, fake_groq):
    project = create_project(client)
    first, second = add_two_sources(client, project["id"])

    response = _analyze(client, project["id"], [first["id"], second["id"]])
    assert response.status_code == 200, response.text
    data = response.json()

    assert len(data["decisions"]) == 2
    assert all(decision["evidence"] for decision in data["decisions"])
    assert all(
        evidence["verified"]
        for decision in data["decisions"]
        for evidence in decision["evidence"]
    )
    assert all(decision["epistemic_type"] == "confirmed" for decision in data["decisions"])
    assert data["summary"]

    # The fabricated citation must be reported as discarded, never stored as a risk.
    assert not any("Invented production incident" in risk["title"] for risk in data["risks"])
    discarded = {entry["item"] for entry in data["discarded"]}
    assert "Invented production incident" in discarded
    assert all(entry["reason"] for entry in data["discarded"])

    # Conflict detection spans sources and keeps both sides.
    assert len(data["conflicts"]) == 1
    conflict = data["conflicts"][0]
    assert conflict["status"] == "Unresolved"
    assert conflict["resolution"] is None
    assert len(conflict["evidence"]) == 2
    assert {side["source_id"] for side in conflict["evidence"]} == {first["id"], second["id"]}

    # Quotes stored as evidence really exist in the source chunks.
    chunks = client.get(f"/api/sources/{first['id']}/chunks").json()
    stored_text = " ".join(chunk["text"] for chunk in chunks)
    for decision in data["decisions"]:
        for evidence in decision["evidence"]:
            if evidence["source_id"] == first["id"]:
                assert evidence["quote"] in stored_text

    # Analysis marks the project as needing review.
    assert client.get(f"/api/projects/{project['id']}").json()["project"]["status"] == "Needs review"


def test_get_analysis_and_explicit_source_selection(client, fake_groq):
    project = create_project(client)
    first, second = add_two_sources(client, project["id"])
    assert _analyze(client, project["id"], [first["id"]]).status_code == 200

    stored = client.get(f"/api/projects/{project['id']}/analysis")
    assert stored.status_code == 200
    assert stored.json()["source_ids"] == [first["id"]]
    assert len(stored.json()["decisions"]) == 1

    # A second project's source must not be analyzable from this project.
    other = create_project(client, "CareBridge", "Another project.")
    other_source = upload_text(client, other["id"], "other.txt").json()["uploaded"][0]
    rejected = _analyze(client, project["id"], [other_source["id"]])
    assert rejected.status_code == 400
    assert rejected.json()["error"]["code"] == "source_not_in_project"

    empty = client.post(f"/api/projects/{project['id']}/analyze", json={"source_ids": []})
    assert empty.status_code == 422


def test_analysis_without_run_returns_404(client):
    project = create_project(client)
    response = client.get(f"/api/projects/{project['id']}/analysis")
    assert response.status_code == 404
    assert response.json()["error"]["code"] == "analysis_not_found"


def test_rate_limit_error_is_friendly(client, monkeypatch):
    from app.utils.errors import AppError

    project = create_project(client)
    source = upload_text(client, project["id"]).json()["uploaded"][0]

    def limited(system, user):
        raise AppError(
            "groq_rate_limited",
            "The AI service is temporarily rate limited. Wait a minute and try again.",
            429,
        )

    monkeypatch.setattr("app.services.analysis.call_groq_json", limited)
    response = _analyze(client, project["id"], [source["id"]])
    assert response.status_code == 429
    body = response.json()
    assert body["error"]["code"] == "groq_rate_limited"
    assert "rate limited" in body["error"]["message"]
