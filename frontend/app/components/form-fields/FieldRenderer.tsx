import React from 'react'
import { Field, OptionItem } from './types'
import TextField from './TextField'
import TextareaField from './TextareaField'
import NumberField from './NumberField'
import DateField from './DateField'
import TimeField from './TimeField'
import SelectField from './SelectField'
import MultiselectField from './MultiselectField'
import ReferenceField from './ReferenceField'
import RadioField from './RadioField'
import CheckboxField from './CheckboxField'
import ToggleField from './ToggleField'
import FileField from './FileField'
import CalculatedField from './CalculatedField'
import CurrencyField from './CurrencyField'
import RatingField from './RatingField'
import SliderField from './SliderField'

interface FieldRendererProps {
  field: Field
  value: unknown
  onChange: (value: unknown) => void
  dynamicOptions?: Array<string | OptionItem>
  referenceOptions?: {id: string, label: string}[]
  calculatedValue?: unknown
}

export default function FieldRenderer({ field, value, onChange, dynamicOptions, referenceOptions, calculatedValue }: FieldRendererProps) {
  switch (field.type) {
    case 'text':
    case 'conditional':
      return <TextField field={field} value={value} onChange={(v) => onChange(v)} />
    case 'textarea':
      return <TextareaField field={field} value={value} onChange={(v) => onChange(v)} />
    case 'number':
      return <NumberField field={field} value={value} onChange={(v) => onChange(v)} />
    case 'date':
      return <DateField field={field} value={value} onChange={(v) => onChange(v)} />
    case 'time':
      return <TimeField field={field} value={value} onChange={(v) => onChange(v)} />
    case 'select':
      return <SelectField field={field} value={value} onChange={(v) => onChange(v)} dynamicOptions={dynamicOptions} />
    case 'multiselect':
      return <MultiselectField field={field} value={value} onChange={(v) => onChange(v)} dynamicOptions={dynamicOptions} />
    case 'reference':
      return <ReferenceField field={field} value={value} onChange={(v) => onChange(v)} referenceOptions={referenceOptions} />
    case 'radio':
      return <RadioField field={field} value={value} onChange={(v) => onChange(v)} dynamicOptions={dynamicOptions} />
    case 'checkbox':
      return <CheckboxField field={field} value={value} onChange={(v) => onChange(v)} dynamicOptions={dynamicOptions} />
    case 'toggle':
      return <ToggleField field={field} value={value} onChange={(v) => onChange(v)} />
    case 'file':
      return <FileField field={field} />
    case 'currency':
      return <CurrencyField field={field} value={value} onChange={(v) => onChange(v)} />
    case 'rating':
      return <RatingField field={field} value={value} onChange={(v) => onChange(v)} />
    case 'slider':
      return <SliderField field={field} value={value} onChange={(v) => onChange(v)} />
    case 'calculated':
      return <CalculatedField field={field} value={calculatedValue} />
    default:
      return null
  }
}