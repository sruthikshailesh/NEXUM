def test_health(client):
    response = client.get("/api/health")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"


def test_docs_and_openapi(client):
    assert client.get("/docs").status_code == 200
    schema = client.get("/openapi.json").json()
    for path in [
        "/api/health",
        "/api/projects",
        "/api/projects/{project_id}/sources",
        "/api/projects/{project_id}/analyze",
        "/api/projects/{project_id}/reports",
        "/api/workspace",
    ]:
        assert path in schema["paths"]


def test_cors_allows_local_frontend(client):
    response = client.options(
        "/api/health",
        headers={
            "Origin": "http://localhost:5173",
            "Access-Control-Request-Method": "GET",
        },
    )
    assert response.status_code == 200
    assert response.headers["access-control-allow-origin"] == "http://localhost:5173"
