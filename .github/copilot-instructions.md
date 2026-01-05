# AI Coding Agent Instructions — collect-anything-app

Purpose: quickly orient an AI coding assistant to be productive in this repository.

1. Read the product/technical overview
- Primary source: `PRD.md` (top-level). It contains the goals, stack (Next.js frontend, FastAPI backend, SQLModel), data models, and example API routes — use it as the canonical reference.

2. High-level architecture to assume until code proves otherwise
- Frontend: Next.js (app router) + TypeScript + Tailwind/shadcn/ui. Look for an `app/` folder and `next.config.js` to confirm.
- Backend: FastAPI + SQLModel. Look for `pyproject.toml`, `requirements.txt`, `main.py` or `app/` package in the repository root or a `backend/` directory.
- Storage: attachments are stored on disk (S3-compatible later). Look for an `uploads/` or `storage/` path and any `UPLOADS_DIR` env var.
- API: REST endpoints matching the examples in `PRD.md` (e.g. `/api/auth/*`, `/api/projects/*`, `/api/forms/*`). Prefer following those endpoint shapes.

3. Where to look first (explicit file and folder checks)
- Top-level: `PRD.md`, `README.md` (if present), `package.json`, `pyproject.toml`, `requirements.txt`.
- Frontend heuristics: `app/`, `pages/` (older Next), `next.config.js`, `package.json` scripts (`dev`, `build`, `start`).
- Backend heuristics: `main.py`, `app/`, `backend/`, `api/`, `models.py`, `schemas.py`, `alembic/`.
- Tests & CI: `pytest.ini`, `tests/`, `.github/workflows/`.

4. Developer flows and commands (discover or confirm these before running changes)
- Find and prefer project scripts over guessing. Example checks:

```powershell
# PowerShell (run in repo root)
Get-Content package.json -ErrorAction SilentlyContinue | ConvertFrom-Json | Select-Object -ExpandProperty scripts
Get-Content pyproject.toml -ErrorAction SilentlyContinue
dir -Name backend,frontend  -ErrorAction SilentlyContinue
```

- If no scripts exist, ask the maintainer for preferred commands. Do not assume `npm` vs `pnpm` vs `yarn`.

Note: this repository uses the `uv` wrapper for running Python scripts and managing the Python environment. Always run Python scripts through `uv` to ensure the correct virtual environment and installed packages are used. Example:

```powershell
# run a script with uv from the repo root
uv run python backend\scripts\repro_signup.py
```

5. Patterns & conventions observed (use these when modifying code)
- Field schema is JSON-embedded in `Form.schema` (see `PRD.md` data model). Server and client must keep schema shape consistent — validate on both sides.
- Attachments are referenced from submission JSON; avoid in-place edits of submission JSON structure without migration versioning.
- RBAC is enforced at project level — always check `project_id` + `user` role before returning or mutating project-scoped resources.

5.a Prefer small, reusable components — avoid long files
- Frontend: split UI into focused components (one exported component per file). Prefer `app/components/` or `components/` for shared pieces.
- Keep files small: aim for <~300 lines when practical. If a file grows, split by responsibility (e.g., `FormBuilder` → `FieldList`, `FieldEditor`, `FieldPreview`).
- Reuse field renderers: create small components for each form field type from `PRD.md` (Text, Textarea, Number, Date, Select, Radio, Checkbox, Toggle, File). Compose larger forms from these primitives.
- Hooks & utils: place reusable hooks in `hooks/` and pure helpers in `lib/` or `utils/`. Unit-test hooks and helpers directly.
- Barrel exports: use `index.ts` only for convenient imports; avoid large aggregated files that hide responsibilities.
- Backend: keep routers/controllers per resource (e.g., `api/routers/forms.py`, `api/routers/submissions.py`). Keep models and pydantic schemas in small files grouped by domain.
- Tests: write focused tests for small components and utilities rather than sprawling integration tests; prefer many small tests to one large test.

6. When changing APIs or data models
- Add a migration plan (or migration file) and update tests. If you change the `Form.schema` structure, include a version bump and migration path.
- Update `PRD.md` only for high-level decisions — prefer code and tests for authoritative behavior.

7. Tests & CI expectations
- Repo intends pytest for backend and Playwright for E2E (per `PRD.md`). Run unit tests for any backend change and update/add integration tests for API behavior.

8. Examples to follow when implementing features
- Implement endpoints matching PRD examples: `POST /api/forms/{id}/submissions` should accept JSON `data` and `attachments` metadata; return 201 with `submission.id` and `created_at`.
- Frontend form rendering should read `Form.schema` and render components: `text, textarea, number, date, select, radio, checkbox, toggle, file`.

9. If anything is missing or ambiguous
- Stop and ask: missing run scripts, unknown package manager, unclear storage path, or absent tests. Prefer asking rather than guessing commands that affect CI or production data.

10. Editing this file
- If you find authoritative scripts or CI files, update this doc to include exact `dev`/`test` commands and key file locations.

---
Please review these pointers and tell me any areas you'd like me to expand (dev commands, directory map, or example API signatures to auto-generate).
