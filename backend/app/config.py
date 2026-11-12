"""Central configuration. Values come from backend/.env (never from the frontend)."""

import os
from pathlib import Path

from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent.parent
load_dotenv(BASE_DIR / ".env")

# SQLite lives next to the backend package by default.
DATABASE_URL = os.getenv("DATABASE_URL", f"sqlite:///{BASE_DIR / 'nexum.db'}")
UPLOAD_DIR = Path(os.getenv("UPLOAD_DIR", str(BASE_DIR / "uploads"))).resolve()

GROQ_API_KEY = os.getenv("GROQ_API_KEY", "").strip()
GROQ_MODEL = os.getenv("GROQ_MODEL", "openai/gpt-oss-120b").strip()
GROQ_TIMEOUT_SECONDS = float(os.getenv("GROQ_TIMEOUT_SECONDS", "45"))

MAX_UPLOAD_BYTES = int(os.getenv("MAX_UPLOAD_BYTES", str(10 * 1024 * 1024)))
ALLOWED_ORIGINS = [
    origin.strip().rstrip("/")
    for origin in os.getenv("ALLOWED_ORIGINS", "http://localhost:5173").split(",")
    if origin.strip()
]

# ~900 tokens per chunk with a small overlap. We estimate tokens from words
# (1 word ~= 1.3 tokens) so no tokenizer dependency is needed.
CHUNK_TARGET_TOKENS = 900
CHUNK_OVERLAP_TOKENS = 100
# Groq free tier: keep each request small. Chunks are analyzed in batches.
ANALYSIS_BATCH_MAX_CHUNKS = 6
ANALYSIS_BATCH_MAX_CHARS = 12000
