"use client"
import React, { useEffect, useRef, useState } from 'react'
import { Eye, EyeOff, User, Mail, Lock } from 'lucide-react'

  const inputBase = 'w-full rounded-md border pl-10 pr-3 py-3 bg-[rgba(255,255,255,0.03)] text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-blue-500 border-[rgba(255,255,255,0.06)]'

export default function SignupForm() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const formRef = useRef<HTMLFormElement | null>(null)

  useEffect(() => {
    const sanitize = () => {
      const root = formRef.current
      if (!root) return
      const inputs = Array.from(root.querySelectorAll('input')) as HTMLInputElement[]
      inputs.forEach((el) => {
        try {
          el.style.background = ''
          el.style.backgroundColor = ''
          el.style.boxShadow = ''
          // @ts-ignore
          el.style.webkitTextFillColor = ''
          el.style.color = ''
          void el.offsetHeight
        } catch (e) {
          // ignore
        }
      })
    }

    sanitize()
    const timers = [100, 500, 1200].map((ms) => window.setTimeout(sanitize, ms))
    window.addEventListener('focus', sanitize, true)
    return () => {
      timers.forEach(clearTimeout)
      window.removeEventListener('focus', sanitize, true)
    }
  }, [])

  function validate() {
    if (!name.trim() || !email.trim() || !password) return 'Please fill all required fields.'
    // simple email check
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return 'Please enter a valid email address.'
    if (password.length < 8) return 'Password must be at least 8 characters.'
    if (password !== confirm) return 'Passwords do not match.'
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
      const base = (process.env.NEXT_PUBLIC_API_URL as string) || 'http://127.0.0.1:8000'
      const res = await fetch(`${base}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), email: email.trim(), password }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        let errorMsg = 'Signup failed'
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
        setMessage('Signup successful — please check your email to confirm.')
        setName('')
        setEmail('')
        setPassword('')
        setConfirm('')
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
            <h2 className="text-2xl font-extrabold tracking-tight text-white">Create account</h2>
          </div>
          <p className="text-sm text-[var(--muted-foreground)]">Sign up to start organizing your collections.</p>
        </div>

        <form ref={formRef} onSubmit={handleSubmit} className="relative z-10 grid gap-4">
          <label className="flex flex-col gap-2 relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--muted-foreground)]" />
            <input
              className={inputBase}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Full name"
              aria-label="Name"
            />
          </label>

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

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="relative">
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
            </div>

            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--muted-foreground)]" />
              <input
                className={inputBase}
                type={showPassword ? 'text' : 'password'}
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="Confirm password"
                aria-label="Confirm password"
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
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-md bg-gradient-to-b from-[#2d6ef7] to-[#1a56f0] px-5 py-3 text-sm font-semibold text-white shadow-lg hover:opacity-95 disabled:opacity-60"
            >
              {loading ? 'Creating account...' : 'Create account'}
            </button>

            <div className="text-center text-sm text-[var(--muted-foreground)]">
              Already registered? <a href="/auth/login" className="text-blue-400 hover:underline">Log in</a>
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
