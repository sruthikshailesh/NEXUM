from helpers import add_two_sources, create_project

EXPECTED_SECTIONS = [
    "Project Overview",
    "Current Project State",
    "Technical Decisions",
    "Completed Work",
    "Incomplete Work",
    "Risks and Dependencies",
    "Unresolved Questions",
    "Recommended Next Actions",
    "Evidence and References",
]


def test_report_from_verified_claims(client, fake_groq):
    project = create_project(client)
    first, second = add_two_sources(client, project["id"])
    client.post(
        f"/api/projects/{project['id']}/analyze",
        json={"source_ids": [first["id"], second["id"]]},
    )

    response = client.post(f"/api/projects/{project['id']}/reports", json={})
    assert response.status_code == 201, response.text
    report = response.json()

    assert report["status"] == "Generated"
    assert [section["title"] for section in report["sections"]] == EXPECTED_SECTIONS
    assert len(report["sections"]) == 9

    decisions = report["sections"][2]["content"]
    assert first["name"] in decisions
    assert '"' in decisions  # quotes come from verified evidence

    # Both sides of the unresolved conflict are shown, with no winner chosen.
    incomplete = report["sections"][4]["content"]
    assert "Payment retry status" in incomplete
    assert "Sides:" in incomplete

    assert first["id"] in report["source_ids"] and second["id"] in report["source_ids"]

    markdown = client.get(f"/api/reports/{report['id']}/markdown")
    assert markdown.status_code == 200
    assert markdown.headers["content-type"].startswith("text/markdown")
    assert "## 1. Project Overview" in markdown.text
    assert "## 9. Evidence and References" in markdown.text

    reviewed = client.patch(f"/api/reports/{report['id']}", json={"status": "Reviewed"})
    assert reviewed.status_code == 200
    assert reviewed.json()["status"] == "Reviewed"


def test_report_filters_claims_to_selected_sources(client, fake_groq):
    project = create_project(client)
    first, second = add_two_sources(client, project["id"])
    client.post(
        f"/api/projects/{project['id']}/analyze",
        json={"source_ids": [first["id"], second["id"]]},
    )

    response = client.post(
        f"/api/projects/{project['id']}/reports", json={"source_ids": [first["id"]]}
    )
    assert response.status_code == 201, response.text
    report = response.json()

    assert report["source_ids"] == [first["id"]]
    decisions = report["sections"][2]["content"]
    assert first["name"] in decisions
    assert second["name"] not in decisions

    # The conflict needs both sources; with only one selected it is not reported.
    incomplete = report["sections"][4]["content"]
    assert "Payment retry status" not in incomplete
    evidence = report["sections"][8]["content"]
    assert second["name"] not in evidence


def test_report_without_analysis_is_honest(client):
    project = create_project(client)
    response = client.post(f"/api/projects/{project['id']}/reports", json={})
    assert response.status_code == 201
    sections = response.json()["sections"]
    assert [section["title"] for section in sections] == EXPECTED_SECTIONS
    assert "No technical decisions" in sections[2]["content"]
    assert "No sources or verified evidence" in sections[8]["content"]


def test_report_unknown_project(client):
    assert client.post("/api/projects/nope/reports", json={}).status_code == 404
