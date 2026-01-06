"use client"
import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, Mail, Lock } from 'lucide-react'
import { getApiUrl } from '@/lib/config'

  const inputBase = 'w-full rounded-md border pl-10 pr-3 py-3 bg-[rgba(255,255,255,0.03)] text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-blue-500 border-[rgba(255,255,255,0.06)]'

export default function LoginForm() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)

  function validate() {
    if (!email.trim() || !password) return 'Please fill all required fields.'
    // simple email check
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return 'Please enter a valid email address.'
    return null
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setMessage(null)
    setError(null)

    const clientErr = validate()
    if (clientErr) {
      setError(clientErr)
      return
    }

    setLoading(true)
    try {
      const apiUrl = getApiUrl()
      const res = await fetch(`${apiUrl}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: email.trim(), password }),
        credentials: 'include',
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        let errorMsg = 'Login failed'
        if (data && data.detail) {
          if (typeof data.detail === 'string') {
            errorMsg = data.detail
          } else if (Array.isArray(data.detail) && data.detail.length > 0) {
            errorMsg = data.detail.map((err: any) => err.msg || err.message || 'Validation error').join(', ')
          } else if (data.error) {
            errorMsg = data.error
          }
        }
        setError(errorMsg)
      } else {
        setMessage('Login successful.')
        setEmail('')
        setPassword('')
        if (data && (data as any).access_token) {
          try {
            localStorage.setItem('dev_access_token', (data as any).access_token)
          } catch (e) {
            // ignore storage errors
          }
        }
        // server sets HttpOnly cookie; confirm session before redirect to avoid race
        async function confirmAndRedirect() {
          const maxAttempts = 3
          const delay = (ms: number) => new Promise((r) => setTimeout(r, ms))
          for (let i = 0; i < maxAttempts; i++) {
            try {
              const meRes = await fetch(`${apiUrl}/auth/me`, { credentials: 'include', cache: 'no-store' })
              if (meRes.ok) {
                router.push('/dashboard')
                return
              }
            } catch (e) {
              // ignore network errors and retry
            }
            // small backoff
            await delay(200 * (i + 1))
          }
          // final attempt: navigate anyway (dashboard will redirect back if unauthenticated)
          try {
            router.push('/dashboard')
          } catch (e) {
            // ignore push errors in client
          }
        }

        try {
          await confirmAndRedirect()
        } catch (e) {
          // ignore
        }
      }
    } catch (err) {
      setError('Network error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full max-w-lg">
      <div className="relative rounded-2xl bg-[rgba(12,12,14,0.6)] p-6 shadow-2xl border border-[rgba(255,255,255,0.03)] backdrop-blur-sm">
        <div className="absolute -inset-0.5 rounded-2xl bg-gradient-to-br from-[#0b1220]/40 via-transparent to-[#07123a]/30 blur-lg opacity-30" />

        <div className="relative z-10 mb-5">
          <div className="flex items-center gap-3 mb-4">
            <button aria-hidden className="text-[var(--muted-foreground)] hover:text-[var(--foreground)]">◂</button>
            <h2 className="text-2xl font-extrabold tracking-tight text-white">Log in</h2>
          </div>
          <p className="text-sm text-[var(--muted-foreground)]">Log in to your account.</p>
        </div>

        <form onSubmit={handleSubmit} className="relative z-10 grid gap-4">
          <label className="flex flex-col gap-2 relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--muted-foreground)]" />
            <input
              className={inputBase}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              placeholder="Email address"
              aria-label="Email"
            />
          </label>

          <label className="flex flex-col gap-2 relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--muted-foreground)]" />
            <input
              className={inputBase}
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              aria-label="Password"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)] p-1"
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </label>

          <div className="flex flex-col gap-3">
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-md bg-gradient-to-b from-[#2d6ef7] to-[#1a56f0] px-5 py-3 text-sm font-semibold text-white shadow-lg hover:opacity-95 disabled:opacity-60"
            >
              {loading ? 'Logging in...' : 'Log in'}
            </button>

            <div className="text-center text-sm text-[var(--muted-foreground)]">
              Don't have an account? <a href="/signup" className="text-blue-400 hover:underline">Sign up</a>
            </div>
          </div>

          {error && (
            <div className="rounded-md bg-[rgba(220,38,38,0.1)] p-3 text-sm text-red-400">{error}</div>
          )}

          {message && (
            <div className="rounded-md bg-[rgba(34,197,94,0.08)] p-3 text-sm text-green-300">{message}</div>
          )}
        </form>
      </div>
    </div>
  )
}