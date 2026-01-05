import { useState, useEffect } from 'react'
import { Field } from '../form-fields/types'

export function useCollapsedSections(schema: Field[]) {
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({})

  // Initialize collapsed sections from field defaults
  useEffect(() => {
    const initialCollapsed: Record<string, boolean> = {}
    schema.forEach(field => {
      if (field.type === 'section' && field.collapsed) {
        initialCollapsed[field.id] = true
      }
    })
    setCollapsedSections(initialCollapsed)
  }, [schema])

  const toggleSection = (sectionId: string) => {
    setCollapsedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }))
  }

  return { collapsedSections, toggleSection }
}