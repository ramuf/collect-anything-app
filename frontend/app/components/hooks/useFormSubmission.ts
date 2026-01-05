import { useState } from 'react'
import { useToast } from '@/components/ui/toast'

export function useFormSubmission(formId: string) {
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const { toast } = useToast()

  const submitForm = async (formData: Record<string, any>) => {
    setSubmitting(true)

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || ''
      const url = apiUrl ? `${apiUrl}/forms/${formId}/submissions` : `/api/forms/${formId}/submissions`
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          data: formData
        })
      })

      if (res.ok) {
        setSubmitted(true)
      } else {
        toast({ title: 'Failed to submit form', variant: 'destructive' })
      }
    } catch (error) {
      console.error('Submission error', error)
      toast({ title: 'An error occurred', variant: 'destructive' })
    } finally {
      setSubmitting(false)
    }
  }

  return { submitting, submitted, submitForm }
}