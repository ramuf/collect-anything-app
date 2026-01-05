"""Backfill reference fields to use field.id keys.

This repo uses `uv`, and the Python dependencies (including `sqlmodel`) live in
the backend project at `backend/pyproject.toml`.

Run from repo root (recommended):
    uv run --project backend python backend/scripts/backfill_reference_field_ids.py

Or run from the backend directory:
    cd backend
    uv run python scripts/backfill_reference_field_ids.py

This script:
- iterates all forms
- for each submission, moves reference field values from data[field.key] to data[field.id]
- normalizes legacy object shapes {id: ...} into string ids

It is idempotent.
"""

from __future__ import annotations

import sys
from pathlib import Path
from typing import Any, Dict, List

try:
    from sqlmodel import Session, select
except ModuleNotFoundError as exc:  # pragma: no cover
    raise SystemExit(
        "Missing dependency 'sqlmodel'. Run with the backend uv project:\n"
        "  uv run --project backend python backend/scripts/backfill_reference_field_ids.py\n"
        "or:\n"
        "  cd backend && uv run python scripts/backfill_reference_field_ids.py"
    ) from exc

_this_file = Path(__file__).resolve()
_backend_dir = _this_file.parents[1]
_repo_root = _backend_dir.parent

# Load env vars (DATABASE_URL, etc.) if present.
try:  # pragma: no cover
    from dotenv import load_dotenv

    load_dotenv(_backend_dir / ".env")
    load_dotenv(_repo_root / ".env")
except Exception:
    pass

# Allow imports whether invoked from repo root, backend/, or backend/scripts.
sys.path.insert(0, str(_repo_root))
sys.path.insert(0, str(_backend_dir))

try:
    # Prefer package-style imports when possible.
    from backend.database import engine
    from backend.models import Form, Submission
except ModuleNotFoundError:
    from database import engine
    from models import Form, Submission


def normalize_reference_value(raw: Any):
    if raw is None:
        return None
    if isinstance(raw, list):
        ids: List[str] = []
        for v in raw:
            if isinstance(v, dict) and v.get("id") is not None:
                s = str(v.get("id")).strip()
            else:
                s = str(v).strip() if v is not None else ""
            if s:
                ids.append(s)
        return ids or None
    if isinstance(raw, dict):
        if raw.get("id") is None:
            return None
        s = str(raw.get("id")).strip()
        return s or None
    s = str(raw).strip()
    return s or None


def main() -> None:
    updated = 0
    scanned = 0

    with Session(engine) as session:
        forms = session.exec(select(Form)).all()
        for form in forms:
            schema = form.schema_ or []
            if not schema:
                continue

            submissions = session.exec(select(Submission).where(Submission.form_id == form.id)).all()
            for sub in submissions:
                scanned += 1
                data: Dict[str, Any] = dict(sub.data or {})
                changed = False

                for field in schema:
                    if field.get("type") != "reference":
                        continue
                    field_id = field.get("id")
                    field_key = field.get("key")
                    if not field_id or not field_key:
                        continue

                    canonical_key = str(field_id)
                    legacy_key = str(field_key)

                    if canonical_key in data and data.get(canonical_key) is not None:
                        continue

                    if legacy_key not in data:
                        continue

                    normalized = normalize_reference_value(data.get(legacy_key))
                    if normalized is None:
                        # Remove empty legacy
                        del data[legacy_key]
                        changed = True
                        continue

                    data[canonical_key] = normalized
                    del data[legacy_key]
                    changed = True

                if changed:
                    sub.data = data
                    session.add(sub)
                    updated += 1

        session.commit()

    print(f"Scanned submissions: {scanned}")
    print(f"Updated submissions: {updated}")


if __name__ == "__main__":
    main()
