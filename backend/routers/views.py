from typing import List, Dict, Any, Optional, Set, Iterable, Tuple
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select, col
from database import get_session
from models import View, Project, Form, Submission, User
from auth_utils import get_current_user

router = APIRouter(prefix="/views", tags=["views"])

@router.post("/", response_model=View)
def create_view(
    view: View,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    # Verify project ownership
    # Ensure project_id is a UUID object (handle potential string from Pydantic)
    if isinstance(view.project_id, str):
        view.project_id = UUID(view.project_id)

    project = session.get(Project, view.project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    if project.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    session.add(view)
    session.commit()
    session.refresh(view)
    return view

@router.get("/{view_id}", response_model=View)
def get_view(
    view_id: UUID,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    view = session.get(View, view_id)
    if not view:
        raise HTTPException(status_code=404, detail="View not found")
    
    project = session.get(Project, view.project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    if project.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    return view

@router.put("/{view_id}", response_model=View)
def update_view(
    view_id: UUID,
    view_update: View,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    view = session.get(View, view_id)
    if not view:
        raise HTTPException(status_code=404, detail="View not found")
    
    project = session.get(Project, view.project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    if project.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    view.title = view_update.title
    view.description = view_update.description
    view.config = view_update.config
    
    session.add(view)
    session.commit()
    session.refresh(view)
    return view

@router.delete("/{view_id}")
def delete_view(
    view_id: UUID,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    view = session.get(View, view_id)
    if not view:
        raise HTTPException(status_code=404, detail="View not found")
    
    project = session.get(Project, view.project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    if project.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    session.delete(view)
    session.commit()
    return {"ok": True}

@router.get("/{view_id}/data")
def get_view_data(
    view_id: UUID,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    view = session.get(View, view_id)
    if not view:
        raise HTTPException(status_code=404, detail="View not found")
    
    project = session.get(Project, view.project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    if project.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")

    def _is_relation_field(field: dict) -> bool:
        if field.get("type") == "reference":
            return True
        data_source = field.get("dataSource") or {}
        return isinstance(data_source, dict) and data_source.get("type") == "form_lookup"

    def _relation_target_form_id(field: dict) -> Optional[str]:
        if field.get("type") == "reference":
            return field.get("targetFormId")
        data_source = field.get("dataSource") or {}
        if isinstance(data_source, dict):
            return data_source.get("formId")
        return None

    def _extract_reference_ids(raw: Any) -> List[str]:
        """Return a list of submission id strings from a reference-like value."""
        if raw is None:
            return []

        out: List[str] = []

        if isinstance(raw, list):
            for v in raw:
                out.extend(_extract_reference_ids(v))
            # de-dupe while preserving order
            seen: Set[str] = set()
            deduped: List[str] = []
            for s in out:
                if s not in seen:
                    seen.add(s)
                    deduped.append(s)
            return deduped

        if isinstance(raw, dict):
            v = raw.get("id")
            if v is None:
                return []
            s = str(v).strip()
            return [s] if s else []

        s = str(raw).strip()
        return [s] if s else []

    def _get_field_value_for_column(sub: Submission, form: Optional[Form], field_key: Optional[str]) -> Any:
        """Resolve a column value from a submission, handling canonical storage for relation fields."""
        if not sub or not field_key:
            return None
        if not sub.data:
            return None

        val = sub.data.get(field_key)

        if not form or not form.schema_:
            return val

        for f in form.schema_ or []:
            if f.get("key") != field_key:
                continue
            if _is_relation_field(f) and f.get("id"):
                canonical_key = str(f.get("id"))
                return sub.data.get(canonical_key, val)
            return val

        return val

    config = view.config or {}
    columns = config.get("columns", [])
    
    # Extract form IDs from columns
    form_ids_str = set(column.get("formId") for column in columns if column.get("formId"))
    form_ids = []
    for fid in form_ids_str:
        try:
            form_ids.append(UUID(fid))
        except ValueError:
            continue
            
    if not form_ids:
        return []

    base_form_id_str = config.get("baseFormId")
    if not base_form_id_str:
        # Default to the first column's form as the anchor.
        base_form_id_str = columns[0].get("formId") if columns else None

    try:
        base_form_id = UUID(str(base_form_id_str)) if base_form_id_str else None
    except ValueError:
        base_form_id = None

    # Fetch forms to get schemas
    # Use col() to help type checkers understand this is a SQL expression
    forms = session.exec(select(Form).where(col(Form.id).in_(form_ids))).all()
    form_map = {str(f.id): f for f in forms}

    # Fetch submissions
    submissions = session.exec(select(Submission).where(col(Submission.form_id).in_(form_ids))).all()
    submission_map = {str(s.id): s for s in submissions}

    # If we can't determine a base form, fall back to previous behavior (flat-ish merge).
    if base_form_id is None:
        rows: List[Dict[str, Any]] = []
        for sub in submissions:
            row: Dict[str, Any] = {
                "id": str(sub.id),
                "created_at": sub.created_at.isoformat(),
                "form_id": str(sub.form_id),
            }
            for column in columns:
                col_id = column.get("id")
                target_form_id = column.get("formId")
                field_key = column.get("fieldKey")
                if str(sub.form_id) == target_form_id:
                    row[col_id] = _get_field_value_for_column(sub, form_map.get(str(sub.form_id)), field_key)
                else:
                    row[col_id] = None
            rows.append(row)
        return rows

    base_form_id_str_effective = str(base_form_id)

    # Map: parent_submission_id -> child_form_id -> list[child_submission]
    parent_to_children_map: Dict[str, Dict[str, List[Submission]]] = {}
    # Track de-dupe: (parent_id, child_id)
    seen_edges: Set[Tuple[str, str]] = set()

    involved_form_ids: Set[str] = set(str(fid) for fid in form_ids)

    # Build relationships from any included form that references the base form.
    for child_sub in submissions:
        child_form = form_map.get(str(child_sub.form_id))
        if not child_form or not child_form.schema_:
            continue

        if str(child_sub.form_id) == base_form_id_str_effective:
            continue

        for field in child_form.schema_ or []:
            if not _is_relation_field(field):
                continue

            target_form_id = _relation_target_form_id(field)
            if not target_form_id:
                continue

            # Only join to the base form for now.
            if str(target_form_id) != base_form_id_str_effective:
                continue

            # Canonical storage key for relation fields is field.id when present.
            field_storage_key = str(field.get("id")) if field.get("id") else str(field.get("key"))
            raw_value = None
            if child_sub.data:
                raw_value = child_sub.data.get(field_storage_key)
                if raw_value is None and field.get("key"):
                    raw_value = child_sub.data.get(str(field.get("key")))

            for parent_id in _extract_reference_ids(raw_value):
                if parent_id not in submission_map:
                    continue
                parent_sub = submission_map[parent_id]
                if str(parent_sub.form_id) != base_form_id_str_effective:
                    continue

                edge_key = (parent_id, str(child_sub.id))
                if edge_key in seen_edges:
                    continue
                seen_edges.add(edge_key)

                if parent_id not in parent_to_children_map:
                    parent_to_children_map[parent_id] = {}
                if str(child_sub.form_id) not in parent_to_children_map[parent_id]:
                    parent_to_children_map[parent_id][str(child_sub.form_id)] = []
                parent_to_children_map[parent_id][str(child_sub.form_id)].append(child_sub)

    # Determine which child forms are relevant based on columns.
    child_form_ids_in_columns: List[str] = []
    for column in columns:
        fid = column.get("formId")
        if not fid:
            continue
        if fid == base_form_id_str_effective:
            continue
        if fid not in child_form_ids_in_columns:
            child_form_ids_in_columns.append(fid)

    def _row_id(base_id: str, picked_children: Dict[str, Optional[Submission]]) -> str:
        parts = [base_id]
        for fid in sorted(picked_children.keys()):
            sub = picked_children[fid]
            parts.append(str(sub.id) if sub else "-")
        return ":".join(parts)

    # Generate rows anchored on base form submissions.
    base_submissions: List[Submission] = [s for s in submissions if str(s.form_id) == base_form_id_str_effective]
    rows: List[Dict[str, Any]] = []

    # Guardrail to prevent runaway cartesian explosions.
    max_rows = int(config.get("maxRows") or 2000)

    for base_sub in base_submissions:
        base_id = str(base_sub.id)

        # For each child form, list matching children.
        child_lists: List[Tuple[str, List[Submission]]] = []
        for child_form_id in child_form_ids_in_columns:
            candidates = parent_to_children_map.get(base_id, {}).get(child_form_id, [])
            child_lists.append((child_form_id, candidates))

        # Build combinations (cartesian product) across child forms.
        combinations: List[Dict[str, Optional[Submission]]] = [
            {fid: None for fid, _ in child_lists}
        ]
        for fid, children in child_lists:
            if not children:
                continue
            next_combos: List[Dict[str, Optional[Submission]]] = []
            for combo in combinations:
                for child_sub in children:
                    c = dict(combo)
                    c[fid] = child_sub
                    next_combos.append(c)
                    if len(next_combos) + len(rows) >= max_rows:
                        break
                if len(next_combos) + len(rows) >= max_rows:
                    break
            combinations = next_combos or combinations
            if len(rows) + len(combinations) >= max_rows:
                break

        if not combinations:
            combinations = [{fid: None for fid, _ in child_lists}]

        for picked_children in combinations:
            if len(rows) >= max_rows:
                break

            row: Dict[str, Any] = {
                "id": _row_id(base_id, picked_children),
                "created_at": base_sub.created_at.isoformat(),
                "form_id": base_form_id_str_effective,
            }

            for column in columns:
                col_id = column.get("id")
                target_form_id = column.get("formId")
                field_key = column.get("fieldKey")

                if not col_id:
                    continue

                if target_form_id == base_form_id_str_effective:
                    row[col_id] = _get_field_value_for_column(base_sub, form_map.get(str(base_sub.form_id)), field_key)
                    continue

                child_sub = picked_children.get(str(target_form_id))
                if child_sub is None:
                    row[col_id] = None
                    continue

                row[col_id] = _get_field_value_for_column(child_sub, form_map.get(str(child_sub.form_id)), field_key)

            rows.append(row)

    return rows

# Add endpoint to list views for a project
@router.get("/project/{project_id}", response_model=List[View])
def list_project_views(
    project_id: UUID,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    project = session.get(Project, project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    if project.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
        
    views = session.exec(select(View).where(View.project_id == project_id)).all()
    return views
