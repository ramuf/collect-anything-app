"""Migrate existing submission.data when a field.key was renamed.

This is needed for *existing* submissions that still have the old key in their JSON.
In the current app, relation-like fields (reference + form_lookup) are stored under
`field.id`, so the safe migration is:

  data[old_key] -> data[field.id]

Run from repo root:
  uv run --project backend python backend/scripts/migrate_field_key_rename_to_id.py \
    --form-id <FORM_UUID> --old-key actors --new-key actor

Use --dry-run to preview.

Notes
- This script is idempotent.
- It normalizes legacy object-shaped values like {"id": "..."}.
"""

from __future__ import annotations

import argparse
import sys
from pathlib import Path
from typing import Any, Dict, List, Optional
from uuid import UUID

# Ensure we can import regardless of working directory
_this_file = Path(__file__).resolve()
_backend_dir = _this_file.parents[1]
_repo_root = _backend_dir.parent
sys.path.insert(0, str(_repo_root))
sys.path.insert(0, str(_backend_dir))

# Load env vars (DATABASE_URL, etc.)
try:  # pragma: no cover
    from dotenv import load_dotenv

    load_dotenv(_backend_dir / ".env")
    load_dotenv(_repo_root / ".env")
except Exception:
    pass

try:
    from sqlmodel import Session, select
except ModuleNotFoundError as exc:  # pragma: no cover
    raise SystemExit(
        "Missing dependency 'sqlmodel'. Run with the backend uv project:\n"
        "  uv run --project backend python backend/scripts/migrate_field_key_rename_to_id.py ..."
    ) from exc

try:
    from backend.database import engine
    from backend.models import Form, Submission
except ModuleNotFoundError:
    from database import engine
    from models import Form, Submission


def _normalize_relation_value(raw: Any):
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


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--form-id", required=True, help="Form UUID")
    parser.add_argument("--old-key", required=True, help="Old field.key in submission.data")
    parser.add_argument("--new-key", required=True, help="New field.key in the form schema")
    parser.add_argument("--dry-run", action="store_true", help="Print counts without writing")
    args = parser.parse_args()

    try:
        form_id = UUID(str(args.form_id))
    except ValueError:
        raise SystemExit("--form-id must be a valid UUID")

    old_key = str(args.old_key)
    new_key = str(args.new_key)

    with Session(engine) as session:
        form = session.get(Form, form_id)
        if not form:
            raise SystemExit("Form not found")

        field: Optional[dict] = None
        for f in form.schema_ or []:
            if f.get("key") == new_key:
                field = f
                break

        if not field:
            raise SystemExit(f"No field found in schema with key='{new_key}'")

        field_id = field.get("id")
        if not field_id:
            raise SystemExit("Target field has no 'id' in schema; cannot migrate safely")

        canonical_key = str(field_id)

        subs = session.exec(select(Submission).where(Submission.form_id == form_id)).all()
        scanned = 0
        updated = 0
        skipped = 0

        for sub in subs:
            scanned += 1
            data: Dict[str, Any] = dict(sub.data or {})

            if canonical_key in data and data.get(canonical_key) is not None:
                skipped += 1
                # Optional cleanup: if old key still exists, delete it
                if old_key in data:
                    del data[old_key]
                    if not args.dry_run:
                        sub.data = data
                        session.add(sub)
                        updated += 1
                continue

            if old_key not in data:
                skipped += 1
                continue

            normalized = _normalize_relation_value(data.get(old_key))
            del data[old_key]
            if normalized is not None:
                data[canonical_key] = normalized

            if not args.dry_run:
                sub.data = data
                session.add(sub)
            updated += 1

        if not args.dry_run:
            session.commit()

    print(f"Form: {form_id}")
    print(f"Moved: data['{old_key}'] -> data['{canonical_key}'] (field key now '{new_key}')")
    print(f"Scanned submissions: {scanned}")
    print(f"Updated submissions: {updated}{' (dry-run)' if args.dry_run else ''}")
    print(f"Skipped submissions: {skipped}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
