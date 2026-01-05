import type { Field } from '../form-fields/types'

function hasId(value: unknown): value is { id: unknown } {
  return typeof value === 'object' && value !== null && 'id' in value
}

function isRelationField(field: Field): boolean {
  if (field.type === 'reference') return true
  return field.dataSource?.type === 'form_lookup'
}

function normalizeReferenceValue(raw: unknown): string | string[] | null {
  if (raw === undefined || raw === null) return null

  if (Array.isArray(raw)) {
    const ids = raw
      .map((v) => {
        if (hasId(v)) return String(v.id)
        if (typeof v === 'string') return v
        return String(v)
      })
      .map((s) => s.trim())
      .filter(Boolean)

    return ids.length ? ids : null
  }

  if (hasId(raw)) {
    const id = String(raw.id).trim()
    return id || null
  }

  if (typeof raw === 'string') {
    const id = raw.trim()
    return id || null
  }

  const id = String(raw).trim()
  return id || null
}

export function hydrateSubmissionDataForEditing(fields: Field[], storedData: Record<string, unknown>) {
  const out: Record<string, unknown> = { ...(storedData || {}) }

  for (const field of fields) {
    if (!isRelationField(field)) continue

    const raw = (storedData || {})[field.key] ?? (storedData || {})[field.id]
    const normalized = normalizeReferenceValue(raw)

    // UI state remains keyed by field.key.
    out[field.key] = normalized

    // Avoid leaking the canonical key into the UI state; it causes confusing dupes.
    if (field.id in out) delete out[field.id]
  }

  return out
}

export function serializeSubmissionDataForSave(fields: Field[], uiData: Record<string, unknown>) {
  const out: Record<string, unknown> = { ...(uiData || {}) }

  for (const field of fields) {
    if (!isRelationField(field)) continue

    const raw = (uiData || {})[field.key] ?? (uiData || {})[field.id]
    const normalized = normalizeReferenceValue(raw)

    // Canonical storage: data[field.id] = referencedSubmissionId
    if (normalized === null) {
      delete out[field.id]
    } else {
      out[field.id] = normalized
    }

    // Remove legacy key to keep one canonical source of truth.
    delete out[field.key]
  }

  return out
}
