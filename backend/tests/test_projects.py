from helpers import create_project


def test_create_list_and_read_project(client):
    created = create_project(client)
    assert created["status"] == "New project"
    assert created["stack"] == ["React", "FastAPI"]

    listing = client.get("/api/projects").json()
    assert len(listing) == 1
    assert listing[0]["name"] == "ShopSphere"

    detail = client.get(f"/api/projects/{created['id']}")
    assert detail.status_code == 200
    assert detail.json()["counts"] == {"sources": 0, "claims": 0, "conflicts": 0}


def test_duplicate_and_invalid_project(client):
    create_project(client)
    duplicate = client.post(
        "/api/projects", json={"name": "shopsphere", "description": "Another one"}
    )
    assert duplicate.status_code == 409
    assert duplicate.json()["error"]["code"] == "duplicate_project"

    invalid = client.post("/api/projects", json={"name": "", "description": ""})
    assert invalid.status_code == 422
    assert invalid.json()["error"]["code"] == "validation_error"


def test_update_and_delete_project(client):
    project = create_project(client)
    updated = client.patch(
        f"/api/projects/{project['id']}", json={"description": "Updated description."}
    )
    assert updated.status_code == 200
    assert updated.json()["description"] == "Updated description."

    assert client.delete(f"/api/projects/{project['id']}").status_code == 204
    assert client.get(f"/api/projects/{project['id']}").status_code == 404
