import React from 'react'
import PublicFormRenderer from '../../components/PublicFormRenderer'
import { notFound } from 'next/navigation'

async function getForm(formId: string) {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
    const res = await fetch(`${apiUrl}/forms/${formId}`, { cache: 'no-store' })
    if (!res.ok) return null
    return res.json()
  } catch (error) {
    console.error('Failed to fetch form', error)
    return null
  }
}

export default async function PublicFormPage({ params }: { params: any }) {
  const { formId } = await params;
  const form = await getForm(formId)

  if (!form) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white dark:bg-slate-900 shadow-sm rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
          <div className="px-8 py-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">{form.title}</h1>
            {form.description && (
              <p className="mt-2 text-slate-500 dark:text-slate-400">{form.description}</p>
            )}
          </div>
          
          <div className="p-8">
            <PublicFormRenderer form={form} />
          </div>
        </div>
        
        <div className="mt-8 text-center">
          <p className="text-xs text-slate-400">
            Powered by <span className="font-semibold text-slate-600 dark:text-slate-300">Collect Anything</span>
          </p>
        </div>
      </div>
    </div>
  )
}
