import React from 'react'
import { CheckCircle } from 'lucide-react'

export default function FormSuccessScreen() {
  return (
    <div className="text-center py-16 animate-in fade-in zoom-in duration-300">
      <div className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-6">
        <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
      </div>
      <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">Thank You!</h2>
      <p className="text-slate-500 dark:text-slate-400">Your submission has been received.</p>
      <button
        onClick={() => window.location.reload()}
        className="mt-8 text-blue-600 hover:underline"
      >
        Submit another response
      </button>
    </div>
  )
}