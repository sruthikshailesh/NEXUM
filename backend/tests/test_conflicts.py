from helpers import add_two_sources, create_project


def _seed_conflict(client):
    project = create_project(client)
    first, second = add_two_sources(client, project["id"])
    response = client.post(
        f"/api/projects/{project['id']}/analyze",
        json={"source_ids": [first["id"], second["id"]]},
    )
    assert response.status_code == 200, response.text
    return project, response.json()["conflicts"][0]


def test_conflict_review_and_resolution(client, fake_groq):
    project, conflict = _seed_conflict(client)

    reviewed = client.patch(
        f"/api/conflicts/{conflict['id']}", json={"status": "Under Review"}
    )
    assert reviewed.status_code == 200
    assert reviewed.json()["status"] == "Under Review"

    too_short = client.patch(
        f"/api/conflicts/{conflict['id']}",
        json={"status": "Resolved", "resolution": "short"},
    )
    assert too_short.status_code == 422
    assert too_short.json()["error"]["code"] == "resolution_required"

    resolution = "Retries stay disabled until Samir attaches passing replay evidence."
    resolved = client.patch(
        f"/api/conflicts/{conflict['id']}",
        json={"status": "Resolved", "resolution": resolution},
    )
    assert resolved.status_code == 200
    assert resolved.json()["status"] == "Resolved"
    assert resolved.json()["resolution"] == resolution

    listing = client.get(f"/api/projects/{project['id']}/conflicts").json()
    assert listing[0]["status"] == "Resolved"
    assert listing[0]["evidence"]


def test_unknown_conflict(client):
    assert client.patch("/api/conflicts/nope", json={"status": "Reviewed"}).status_code == 422
    assert client.get("/api/conflicts/nope").status_code == 404
