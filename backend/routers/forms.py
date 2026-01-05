from typing import List, Optional
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlmodel import Session, select
from database import get_session
from models import Project, Form, Submission, User
from auth_utils import get_current_user


def _normalize_reference_value(raw):
    """Normalize reference field values.

    Accepts legacy object shapes like {id: "..."} and returns either:
    - a single ID string
    - a list of ID strings
    - None
    """
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


def _field_key_to_canonical_key(field: dict) -> Optional[str]:
    """Return the canonical storage key for a field.

    For relation fields (reference + form_lookup) we store under field.id.
    Everything else remains under field.key.
    """
    if _is_relation_field(field) and field.get("id"):
        return str(field.get("id"))
    if field.get("key"):
        return str(field.get("key"))
    return None


def _normalize_relation_fields_in_data(data: dict, schema: list, session: Session) -> dict:
    """Move relation field values to `data[field.id]` and validate targets exist.

    Relation fields include:
    - type == "reference" (submission -> submission)
    - dataSource.type == "form_lookup" (submission id(s) pointing to another form)
    """
    out = dict(data or {})

    errors = {}

    for field in schema or []:
        if not _is_relation_field(field):
            continue

        field_id = field.get("id")
        field_key = field.get("key")
        target_form_id = _relation_target_form_id(field)

        if not field_id:
            # No stable id to store under; keep legacy behavior.
            continue

        canonical_key = str(field_id)
        raw = out.get(canonical_key)
        if raw is None and field_key:
            raw = out.get(str(field_key))

        normalized = _normalize_reference_value(raw)

        # Remove legacy key (we will store canonically).
        if field_key and str(field_key) in out:
            del out[str(field_key)]

        if normalized is None:
            if canonical_key in out:
                del out[canonical_key]
            continue

        # Validate referenced submission(s)
        ids_to_check = normalized if isinstance(normalized, list) else [normalized]
        parsed_target_form: Optional[UUID] = None
        if target_form_id:
            try:
                parsed_target_form = UUID(str(target_form_id))
            except ValueError:
                parsed_target_form = None

        for s in ids_to_check:
            try:
                ref_uuid = UUID(str(s))
            except ValueError:
                errors[canonical_key] = "Invalid reference ID"
                break

            ref_sub = session.get(Submission, ref_uuid)
            if ref_sub is None:
                errors[canonical_key] = "Referenced submission not found"
                break
            if parsed_target_form and str(ref_sub.form_id) != str(parsed_target_form):
                errors[canonical_key] = "Referenced submission belongs to a different form"
                break

        if canonical_key not in errors:
            out[canonical_key] = normalized

    if errors:
        raise HTTPException(status_code=400, detail={"validation_errors": errors})

    return out

router = APIRouter(
    prefix="/projects",
    tags=["forms"],
)


def _resolve_condition_field_value(data: dict, schema: list, field_key: str):
    """Resolve a condition lookup for `fieldKey`.

    Conditions currently store keys using `field.key`. If the referenced field is a
    reference field that is stored under `field.id`, fall back to that canonical key.
    """
    if field_key in data:
        return data.get(field_key)

    for f in schema or []:
        if f.get("key") == field_key and _is_relation_field(f) and f.get("id"):
            return data.get(str(f.get("id")))

    return data.get(field_key)


def is_field_visible(data: dict, field: dict, schema: Optional[list] = None) -> bool:
    def is_empty_value(val) -> bool:
        if val is None:
            return True
        if isinstance(val, str):
            return val.strip() == ''
        if isinstance(val, list):
            return len(val) == 0
        if isinstance(val, dict):
            # Common object-shaped field values
            if 'amount' in val:
                return is_empty_value(val.get('amount'))
            if 'id' in val:
                return is_empty_value(val.get('id'))
            return len(val) == 0
        return False

    def coerce_numeric(val) -> float:
        # Support currency-like objects: { amount, currency }
        raw = val
        if isinstance(raw, dict) and 'amount' in raw:
            raw = raw.get('amount')
        # If it's still a dict (unexpected), treat as empty/0 for comparisons
        if isinstance(raw, dict):
            raw = None
        return float(raw or 0)

    conditions = field.get('conditions', [])
    if not conditions:
        return True
    
    for cond in conditions:
        field_key = cond['fieldKey']
        operator = cond['operator']
        value = cond.get('value')
        action = cond['action']
        
        field_value = _resolve_condition_field_value(data, schema or [], field_key)
        condition_met = False
        
        if operator == 'equals':
            condition_met = str(field_value) == str(value)
        elif operator == 'not_equals':
            condition_met = str(field_value) != str(value)
        elif operator == 'contains':
            condition_met = str(field_value or '').lower().find(str(value or '').lower()) != -1
        elif operator == 'greater_than':
            try:
                condition_met = coerce_numeric(field_value) > coerce_numeric(value)
            except ValueError:
                condition_met = False
        elif operator == 'less_than':
            try:
                condition_met = coerce_numeric(field_value) < coerce_numeric(value)
            except ValueError:
                condition_met = False
        elif operator == 'is_empty':
            condition_met = is_empty_value(field_value)
        elif operator == 'is_not_empty':
            condition_met = not is_empty_value(field_value)
        
        if action == 'show':
            if not condition_met:
                return False
        elif action == 'hide':
            if condition_met:
                return False
    
    return True


@router.get("/{project_id}/forms", response_model=List[Form])
def list_forms(project_id: UUID, session: Session = Depends(get_session), current_user: User = Depends(get_current_user)):
    # Check project ownership
    project = session.get(Project, project_id)
    if project is None:
        raise HTTPException(status_code=404, detail="Project not found")
    if project.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    stmt = select(Form).where(Form.project_id == project_id)
    forms = session.exec(stmt).all()
    return forms


@router.post("/{project_id}/forms", response_model=Form)
def create_form(project_id: UUID, form: Form, session: Session = Depends(get_session), current_user: User = Depends(get_current_user)):
    # ensure project exists
    proj = session.get(Project, project_id)
    if proj is None:
        raise HTTPException(status_code=404, detail="Project not found")
    if proj.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")

    form.project_id = project_id
    session.add(form)
    session.commit()
    session.refresh(form)
    return form


# standalone form routes
from fastapi import APIRouter as _APIRouter

forms_router = _APIRouter(
    prefix="/forms",
    tags=["forms"],
)


@forms_router.get("/{form_id}", response_model=Form)
def get_form(form_id: UUID, session: Session = Depends(get_session)):
    form = session.get(Form, form_id)
    if form is None:
        raise HTTPException(status_code=404, detail="Form not found")
    return form


@forms_router.put("/{form_id}", response_model=Form)
def update_form(form_id: UUID, data: Form, session: Session = Depends(get_session), current_user: User = Depends(get_current_user)):
    form = session.get(Form, form_id)
    if form is None:
        raise HTTPException(status_code=404, detail="Form not found")
    
    # Check project ownership
    project = session.get(Project, form.project_id)
    if project is None:
        raise HTTPException(status_code=404, detail="Project not found")
    if project.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    form.title = data.title
    form.slug = data.slug
    form.schema_ = data.schema_
    form.settings = data.settings
    
    session.add(form)
    session.commit()
    session.refresh(form)
    return form


@forms_router.post("/{form_id}/submissions", response_model=Submission)
def create_submission(form_id: UUID, submission: Submission, session: Session = Depends(get_session)):
    form = session.get(Form, form_id)
    if form is None:
        raise HTTPException(status_code=404, detail="Form not found")

    def is_empty_value(val) -> bool:
        if val is None:
            return True
        if isinstance(val, str):
            return val.strip() == ''
        if isinstance(val, list):
            return len(val) == 0
        if isinstance(val, dict):
            # currency: { amount, currency }
            if 'amount' in val:
                return is_empty_value(val.get('amount'))
            # reference/lookup: { id, ... }
            if 'id' in val:
                return is_empty_value(val.get('id'))
            return len(val) == 0
        return False

    errors = {}

    data = _normalize_relation_fields_in_data(submission.data or {}, form.schema_ or [], session)
    for field in form.schema_:
        storage_key = _field_key_to_canonical_key(field)
        required = field.get('required')
        if not storage_key:
            continue

        if not is_field_visible(data, field, schema=form.schema_):
            continue

        val = data.get(storage_key)
        # Back-compat: if relation field and caller still sent under field.key
        if val is None and _is_relation_field(field) and field.get('key'):
            val = data.get(str(field.get('key')))

        if required and is_empty_value(val):
            errors[storage_key] = 'This field is required'
            continue

    if errors:
        raise HTTPException(status_code=400, detail={"validation_errors": errors})

    submission.form_id = form_id
    submission.data = data
    session.add(submission)
    session.commit()
    session.refresh(submission)
    return submission


@forms_router.get("/{form_id}/submissions", response_model=List[Submission])
def list_submissions(
    form_id: UUID, 
    filter_key: Optional[str] = Query(None, description="Key in the JSON data to filter by"),
    filter_value: Optional[str] = Query(None, description="Value to match for the filter key"),
    session: Session = Depends(get_session)
):
    stmt = select(Submission).where(Submission.form_id == form_id)
    subs = session.exec(stmt).all()

    # If filtering by a field.key that is now stored under field.id (relation fields), map it.
    if filter_key:
        form = session.get(Form, form_id)
        if form and form.schema_:
            for f in form.schema_:
                if f.get("key") == filter_key and _is_relation_field(f) and f.get("id"):
                    filter_key = str(f.get("id"))
                    break
    
    if filter_key and filter_value:
        # Filter in memory for MVP (SQLite JSON support varies)
        # In production Postgres, use JSON operators in the query
        filtered = []
        for sub in subs:
            val = sub.data.get(filter_key)
            # Handle simple equality (string/number match)
            if str(val) == filter_value:
                filtered.append(sub)
        return filtered
        
    return subs


@forms_router.get("/{form_id}/fields/{field_key}/values", response_model=List[str])
def get_field_values(form_id: UUID, field_key: str, session: Session = Depends(get_session)):
    # Check form exists
    form = session.get(Form, form_id)
    if form is None:
        raise HTTPException(status_code=404, detail="Form not found")
    
    # Fetch all submissions for this form
    stmt = select(Submission).where(Submission.form_id == form_id)
    submissions = session.exec(stmt).all()
    
    # If the requested field_key is a relation field stored under field.id, map it.
    effective_key = field_key
    if form.schema_:
        for f in form.schema_:
            if f.get("key") == field_key and _is_relation_field(f) and f.get("id"):
                effective_key = str(f.get("id"))
                break

    # Extract unique values for the given field key
    values = set()
    for sub in submissions:
        val = sub.data.get(effective_key)
        if val is not None:
            # Handle lists (e.g. checkbox) by adding individual items
            if isinstance(val, list):
                for item in val:
                    values.add(str(item))
            elif isinstance(val, dict):
                # Common object formats
                if 'amount' in val:
                    amt = val.get('amount')
                    cur = val.get('currency')
                    if cur is not None and amt is not None:
                        values.add(f"{cur} {amt}")
                    elif amt is not None:
                        values.add(str(amt))
                elif 'id' in val:
                    values.add(str(val.get('id')))
                else:
                    values.add(str(val))
            else:
                values.add(str(val))
            
    return sorted(list(values))


@forms_router.get("/{form_id}/fields/{field_key}/submission-options")
def get_field_submission_options(form_id: UUID, field_key: str, session: Session = Depends(get_session)):
    """Return options for picking a submission by ID, with a human label from `data[field_key]`.

    This powers form_lookup fields that store submission IDs so that label changes
    in the source form reflect everywhere.
    """

    form = session.get(Form, form_id)
    if form is None:
        raise HTTPException(status_code=404, detail="Form not found")

    stmt = select(Submission).where(Submission.form_id == form_id)
    submissions = session.exec(stmt).all()

    options: List[dict] = []
    for sub in submissions:
        if not sub.data:
            continue
        if field_key not in sub.data:
            continue

        raw = sub.data.get(field_key)
        if raw is None:
            continue
        if isinstance(raw, list):
            label = ", ".join([str(x) for x in raw if x is not None])
        else:
            label = str(raw)

        label = label.strip()
        if not label:
            continue

        options.append({"id": str(sub.id), "label": label})

    # Stable sort by label, case-insensitive
    options.sort(key=lambda o: o["label"].lower())
    return options



@forms_router.put("/{form_id}/submissions/{submission_id}", response_model=Submission)
def update_submission(form_id: UUID, submission_id: UUID, submission: Submission, session: Session = Depends(get_session), current_user: User = Depends(get_current_user)):
    existing = session.get(Submission, submission_id)
    if existing is None:
        raise HTTPException(status_code=404, detail="Submission not found")

    if str(existing.form_id) != str(form_id):
        raise HTTPException(status_code=400, detail="Submission does not belong to the specified form")

    # Check ownership via form -> project
    form = session.get(Form, form_id)
    if form is None:
        raise HTTPException(status_code=404, detail="Form not found")
    project = session.get(Project, form.project_id)
    if project is None:
        raise HTTPException(status_code=404, detail="Project not found")
    if project.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")

    # Validate against form schema similar to create
    def is_empty_value(val) -> bool:
        if val is None:
            return True
        if isinstance(val, str):
            return val.strip() == ''
        if isinstance(val, list):
            return len(val) == 0
        if isinstance(val, dict):
            if 'amount' in val:
                return is_empty_value(val.get('amount'))
            if 'id' in val:
                return is_empty_value(val.get('id'))
            return len(val) == 0
        return False

    errors = {}
    data = _normalize_relation_fields_in_data(submission.data or {}, form.schema_ or [], session)
    for field in form.schema_:
        storage_key = _field_key_to_canonical_key(field)
        required = field.get('required')
        if not storage_key:
            continue

        if not is_field_visible(data, field, schema=form.schema_):
            continue

        val = data.get(storage_key)
        if val is None and _is_relation_field(field) and field.get('key'):
            val = data.get(str(field.get('key')))

        if required and is_empty_value(val):
            errors[storage_key] = 'This field is required'

    if errors:
        raise HTTPException(status_code=400, detail={"validation_errors": errors})

    existing.data = data
    session.add(existing)
    session.commit()
    session.refresh(existing)
    return existing


@forms_router.delete("/{form_id}/submissions/{submission_id}", status_code=204)
def delete_submission(form_id: UUID, submission_id: UUID, session: Session = Depends(get_session), current_user: User = Depends(get_current_user)):
    existing = session.get(Submission, submission_id)
    if existing is None:
        raise HTTPException(status_code=404, detail="Submission not found")

    if str(existing.form_id) != str(form_id):
        raise HTTPException(status_code=400, detail="Submission does not belong to the specified form")

    # Check ownership via form -> project
    form = session.get(Form, form_id)
    if form is None:
        raise HTTPException(status_code=404, detail="Form not found")
    project = session.get(Project, form.project_id)
    if project is None:
        raise HTTPException(status_code=404, detail="Project not found")
    if project.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")

    session.delete(existing)
    session.commit()
    return None


@forms_router.delete("/{form_id}", status_code=204)
def delete_form(form_id: UUID, session: Session = Depends(get_session), current_user: User = Depends(get_current_user)):
    form = session.get(Form, form_id)
    if form is None:
        raise HTTPException(status_code=404, detail="Form not found")
    
    # Check project ownership
    project = session.get(Project, form.project_id)
    if project is None:
        raise HTTPException(status_code=404, detail="Project not found")
    if project.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    session.delete(form)
    session.commit()
    return None
