import { Field } from '../form-fields/types'

export function groupFieldsBySections(schema: Field[]) {
  const groups: { section: Field | null; fields: Field[] }[] = []
  let currentGroup: { section: Field | null; fields: Field[] } = { section: null, fields: [] }

  schema.forEach(field => {
    if (field.type === 'section') {
      if (currentGroup.fields.length > 0 || currentGroup.section) {
        groups.push(currentGroup)
      }
      currentGroup = { section: field, fields: [] }
    } else {
      currentGroup.fields.push(field)
    }
  })

  if (currentGroup.fields.length > 0 || currentGroup.section) {
    groups.push(currentGroup)
  }

  return groups
}