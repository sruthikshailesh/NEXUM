# NEXUM

NEXUM turns scattered project documents into traceable knowledge and an evidence-backed
handover. Upload sources → extract text → verify AI claims against exact quotes → review
conflicts → generate a nine-section handover report.

- **Frontend:** React 19 + Vite + TypeScript (dark UI, unchanged design)
- **Backend:** Python 3.11+ / FastAPI / SQLAlchemy / SQLite
- **AI:** Groq `openai/gpt-oss-120b`, JSON-mode, validated and quote-checked

All AI claims must cite a short verbatim quote that exists in a stored chunk. If a quote
cannot be found, the claim is discarded and reported. Conflicts are shown side by side and
never resolved automatically.

## Repository layout

```
backend/
  app/
    main.py            FastAPI app, CORS, error handlers
    config.py          env-driven settings
    database.py        engine/session, SQLite FK pragma
    models/            Project, Source, Chunk, Claim, Conflict, Report, AnalysisRun
    schemas/           Pydantic request/response models
    routes/            projects, sources, analysis, conflicts, reports, workspace, health
    services/          files, extraction, chunking, Groq client, evidence, analysis, reports
    utils/             errors, text normalization, serializers
  tests/               pytest suite (Groq mocked)
  uploads/             extracted files (gitignored, created at runtime)
  requirements.txt
  .env.example
frontend/
  src/services/api.ts  real typed backend client + snake_case → UI mappers
  src/context/AppContext.tsx  live data layer, offline state, explicit demo mode
  src/data/mockData.ts ShopSphere demo fixtures (only loaded by "Load demo data")
  .env.example
```

## macOS setup

### 1. Backend

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt

cp .env.example .env
# edit .env and set GROQ_API_KEY=gsk_...
# set ALLOWED_ORIGINS=http://localhost:5173,https://your-app.vercel.app

uvicorn app.main:app --reload --port 8000
```

- API: http://localhost:8000
- Health: http://localhost:8000/api/health
- Interactive docs: http://localhost:8000/docs
- SQLite file `backend/nexum.db` and `backend/uploads/` are created automatically.

### 2. Frontend

```bash
cd frontend
npm ci
cp .env.example .env.local      # VITE_API_URL=http://localhost:8000
npm run dev
```

Open http://localhost:5173. The workspace starts empty and loads from the backend. If the
backend is unreachable, a **Backend offline** banner offers **Retry** and **Load demo data**.

## Features

**Projects** — create/list/view with name, description, stack, status, members and dates.

**Uploads** — TXT, MD, PDF, DOCX. Extension, declared MIME, magic bytes and 10 MB size are
validated. Filenames are sanitized. PDF text is extracted page by page; DOCX via
`python-docx`. Empty, corrupt, scanned/image-only and password-protected PDFs return
specific errors. Up to 10 files per request.

**Chunking** — ~900 tokens per chunk with a ~100-token overlap. Each chunk stores
`source_id`, `chunk_index`, `page` (for PDFs) and a token estimate, so every claim is
traceable to a file and page.

**AI analysis** — Groq is called **per source, in small batches**, then results are merged
and de-duplicated (free-tier friendly). Malformed JSON is retried once. Every returned
citation is checked against the stored chunk text; unverifiable items never reach the UI
and are listed under `discarded`. Document text is explicitly treated as untrusted data to
resist prompt injection. Extracted kinds: decisions, completed work, pending tasks, risks,
dependencies, next actions, questions, and a project summary.

**Conflicts** — a second pass compares extracted claims across sources. Both sides are stored
with their source, page and quote. Users can mark a conflict `Under Review` or `Resolved`
(resolution ≥ 15 characters). NEXUM does not choose a winner.

**Handover report** — assembled deterministically from stored verified claims, never from new
model output. Passing `source_ids` scopes the report to those sources: claims without evidence
from the selection are excluded, and a conflict is only shown when all of its sides are in the
selection. Nine sections: Project Overview, Current Project State, Technical Decisions,
Completed Work, Incomplete Work, Risks and Dependencies, Unresolved Questions, Recommended
Next Actions, Evidence and References. Available as JSON and Markdown.

**Demo data** — `mockData.ts` is retained only as the fictional ShopSphere demo, loaded
through an explicit **Load demo data** action (header, offline banner, or Settings). Demo
records are labelled and are never presented as AI output. Demo mode is remembered per
browser tab via `sessionStorage`; **Exit demo mode** (header or Settings) clears it and
reloads the live backend workspace.

## API

All endpoints are under `/api`.

| Method | Path | Purpose |
| --- | --- | --- |
| GET | `/health` | Liveness + version |
| GET | `/workspace` | One-shot aggregate for the SPA |
| GET / POST | `/projects` | List / create projects |
| GET / PATCH / DELETE | `/projects/{project_id}` | Read (with counts) / update / delete |
| GET / POST | `/projects/{project_id}/sources` | List / upload (multipart `files`) |
| GET / DELETE | `/sources/{source_id}` | Source detail / delete |
| GET | `/sources/{source_id}/chunks` | Stored chunks with pages |
| POST | `/projects/{project_id}/analyze` | Analyze explicit `source_ids` |
| GET | `/projects/{project_id}/analysis` | Latest grouped claims + conflicts + discarded |
| GET | `/projects/{project_id}/conflicts` | Conflicts for a project |
| GET / PATCH | `/conflicts/{conflict_id}` | Read / set `Under Review` or `Resolved` |
| GET / POST | `/projects/{project_id}/reports` | List / generate handover |
| GET / PATCH | `/reports/{report_id}` | Read / mark `Reviewed` |
| GET | `/reports/{report_id}/markdown` | Markdown download |

Errors use `{"error": {"code": "...", "message": "..."}}`.

## Database schema

- `projects` — id, name (unique), description, stack JSON, color, status, members JSON, timestamps
- `sources` — id, project_id, sanitized name, original filename, file_type, mime_type,
  size_bytes, stored_path, status, summary, extracted_text, page_count, created_at
- `chunks` — id, source_id, chunk_index, page, text, token_estimate
- `claims` — id, project_id, kind (`decision|completed|pending|risk|dependency|next_action|question`),
  epistemic_type (`confirmed|assumption|unknown`), title, detail, rationale, status, people JSON
- `claim_evidence` — claim_id, source_id, chunk_id, page, quote, verified
- `conflicts` — id, project_id, title, description, status, resolution, match_key
- `conflict_evidence` — conflict_id, side, source_id, chunk_id, page, quote, verified
- `analysis_runs` — id, project_id, summary, model, source_ids JSON, discarded JSON, created_at
- `reports` — id, project_id, title, status (`Generated|Reviewed`), sections JSON,
  source_ids JSON, markdown, timestamps

SQLite foreign keys are enabled so deleting a project/source cascades.

## Tests

```bash
cd backend && source .venv/bin/activate && pytest
# 25 passed

cd frontend && npx playwright install chromium && npm test
# 13 passed
```

- Backend tests mock Groq and cover projects, validation, TXT/MD/DOCX/PDF handling, corrupt/
  scanned/password-protected PDFs, chunk pages/overlap, verified-vs-fabricated citations,
  cross-source conflicts, human resolution rules, reports, Markdown export, CORS and docs.
- Playwright keeps the original UI suites (navigation, creation, uploads, filters, conflicts,
  reports, responsive layouts) with an added explicit **Load demo data** step. Live mode was
  additionally checked in Chromium against a running backend.

## Deployment notes

### Backend (Render or Railway)

- Root directory: `backend`
- Build: `pip install -r requirements.txt`
- Start: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
- Environment: `GROQ_API_KEY`, `ALLOWED_ORIGINS=https://your-app.vercel.app`
  (optionally `GROQ_MODEL`, `MAX_UPLOAD_BYTES`)
- Add a persistent disk for `backend/nexum.db` and `backend/uploads/`; without one, free
  instances lose SQLite data and files on redeploy/restart. No secret is exposed to Vercel.

### Frontend (Vercel)

- Project root: `frontend`
- Environment: `VITE_API_URL=https://your-backend.onrender.com`
- Redeploy after changing the variable (Vite inlines it at build time).
- Add the Vercel domain to backend `ALLOWED_ORIGINS` (exact origin, no trailing slash).

## Known limitations

- **Single-user MVP:** no authentication, accounts, or per-user isolation.
- **SQLite + local uploads** are not durable on ephemeral hosts (see disk note above).
- **No OCR:** scanned/image-only PDFs are rejected with a clear message.
- **No page numbers for DOCX/TXT/MD** (PDF only).
- **Citation strictness:** a quote must appear inside one stored chunk. Paraphrases or quotes
  spanning chunk boundaries are discarded rather than trusted.
- **Synchronous analysis:** large libraries take several Groq calls in one request; there is
  no background job or progress polling. Free-tier rate limits return a friendly 429/503 and
  can be retried safely.
- **Reports are assembled, not AI-written prose.** Missing information stays explicit.
- **Re-analysis replaces extracted claims.** Conflicts are re-matched by source+quote; a
  human resolution is preserved only when the same conflict pair is detected again.
- **Demo mode** is per-tab (`sessionStorage`). Use **Exit demo mode** to return to live data;
  the live workspace is reloaded from the backend at that point.
- `localhost:5173` is the default allowed origin. Add `http://127.0.0.1:5173` to
  `ALLOWED_ORIGINS` if you use that address.
- AI behaviour was tested with a mocked Groq client; the real path requires your own
  `GROQ_API_KEY`.
