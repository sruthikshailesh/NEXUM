"""Test environment. The AI call is always mocked; no Groq key is used in tests."""

import json
import os
import re
import tempfile
from pathlib import Path

# These must be set before importing the app config.
TEST_ROOT = Path(tempfile.mkdtemp(prefix="nexum-tests-"))
os.environ["DATABASE_URL"] = f"sqlite:///{TEST_ROOT / 'test.db'}"
os.environ["UPLOAD_DIR"] = str(TEST_ROOT / "uploads")
os.environ["GROQ_API_KEY"] = ""
os.environ["ALLOWED_ORIGINS"] = "http://localhost:5173"

import pytest  # noqa: E402
from fastapi.testclient import TestClient  # noqa: E402

from app.database import Base, engine  # noqa: E402
from app.main import app  # noqa: E402


@pytest.fixture(autouse=True)
def clean_database():
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    yield


@pytest.fixture
def client():
    with TestClient(app) as test_client:
        yield test_client


@pytest.fixture
def fake_groq(monkeypatch):
    """Deterministic stand-in for Groq that always cites real text.

    It also returns one fabricated citation so tests can prove bad evidence is dropped.
    """
    calls: list[dict] = []

    def fake_call(system: str, user: str) -> dict:
        payload = json.loads(user)
        calls.append(payload)

        if "claims" in payload:  # cross-source conflict pass
            retry_claims = [c for c in payload["claims"] if "retries are" in c["quote"].lower()]
            if len(retry_claims) >= 2:
                return {
                    "conflicts": [
                        {
                            "title": "Payment retry status",
                            "description": "One source says retries are enabled; another says disabled.",
                            "left": {
                                "source_id": retry_claims[0]["source_id"],
                                "quote": retry_claims[0]["quote"],
                                "claim": retry_claims[0]["claim"],
                            },
                            "right": {
                                "source_id": retry_claims[-1]["source_id"],
                                "quote": retry_claims[-1]["quote"],
                                "claim": retry_claims[-1]["claim"],
                            },
                        }
                    ]
                }
            return {"conflicts": []}

        decisions, completed, pending, risks = [], [], [], []
        documents = payload["documents"]
        for document in documents:
            text = document["text"]
            source_id = document["source_id"]
            sentences = [part.strip() for part in re.split(r"(?<=[.!?])\s+", text) if part.strip()]

            def find(fragment: str) -> str | None:
                return next((s for s in sentences if fragment in s.lower()), None)

            retry = find("retries are")
            if retry:
                decisions.append(
                    {
                        "title": f"Retry state in {document['filename']}",
                        "detail": retry,
                        "rationale": "Stated directly in the source.",
                        "type": "confirmed",
                        "evidence": [{"source_id": source_id, "quote": retry}],
                    }
                )
            done = find("is complete")
            if done:
                completed.append(
                    {
                        "title": "Reconciliation spike completed",
                        "detail": done,
                        "rationale": "",
                        "type": "confirmed",
                        "evidence": [{"source_id": source_id, "quote": done}],
                    }
                )
            todo = find("is pending")
            if todo:
                pending.append(
                    {
                        "title": "Load testing pending",
                        "detail": todo,
                        "rationale": "",
                        "type": "assumption",
                        "evidence": [{"source_id": source_id, "quote": todo}],
                    }
                )
            policy = find("policy")
            if policy:
                risks.append(
                    {
                        "title": "Retry policy uncertainty",
                        "detail": policy,
                        "rationale": "",
                        "type": "unknown",
                        "evidence": [{"source_id": source_id, "quote": policy}],
                    }
                )

        # Deliberately fabricated evidence: the service must discard this item.
        risks.append(
            {
                "title": "Invented production incident",
                "detail": "This was never in any document.",
                "rationale": "",
                "type": "confirmed",
                "evidence": [
                    {
                        "source_id": documents[0]["source_id"],
                        "quote": "THIS QUOTE WAS NEVER IN THE DOCUMENT",
                    }
                ],
            }
        )

        return {
            "summary": "Payment retries are disputed and load testing is still pending.",
            "decisions": decisions,
            "completed_work": completed,
            "pending_tasks": pending,
            "risks": risks,
            "dependencies": [],
            "next_actions": [],
            "questions": [],
        }

    monkeypatch.setattr("app.services.analysis.call_groq_json", fake_call)
    return calls
