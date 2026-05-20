'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Background } from '@/components/silver/background'
import { Card } from '@/components/silver/card'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    startTransition(async () => {
      const supabase = createClient()
      const { error: authError } = await supabase.auth.signInWithPassword({ email, password })

      if (authError) {
        setError('Email o contraseña incorrectos.')
      } else {
        router.push('/')
        router.refresh()
      }
    })
  }

  return (
    <div className="relative flex min-h-dvh items-center justify-center p-6">
      <Background />

      <div className="relative z-[2] w-full max-w-sm">
        {/* Logo */}
        <div className="mb-8 flex justify-center">
          <div
            className="flex size-12 items-center justify-center rounded-[14px] font-space text-xl font-bold text-[#0a0a0c]"
            style={{
              background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.4) 100%)',
              boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.8), 0 4px 12px rgba(255,255,255,0.15)',
            }}
          >
            $
          </div>
        </div>

        <Card>
          <div className="px-8 py-8">
            <h1 className="mb-1 font-space text-lg font-semibold text-[var(--text)]">Silver</h1>
            <p className="mb-6 text-sm text-[var(--text-mute)]">Panel financiero privado</p>

            {error && (
              <div
                className="mb-4 rounded-xl px-4 py-3 text-sm text-[var(--text-soft)]"
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px dashed rgba(255,255,255,0.2)',
                }}
              >
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
              {/* Email */}
              <div
                className="rounded-2xl px-4 py-3 transition-all"
                style={{
                  background: 'rgba(0,0,0,0.2)',
                  border: '1px solid rgba(255,255,255,0.06)',
                }}
              >
                <label className="mb-1 block font-space text-[10px] font-medium uppercase tracking-[0.08em] text-[var(--text-mute)]">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  placeholder="tu@email.com"
                  className="w-full bg-transparent font-space text-base font-semibold text-[var(--text)] outline-none placeholder:text-[var(--text-faint)]"
                />
              </div>

              {/* Password */}
              <div
                className="rounded-2xl px-4 py-3 transition-all"
                style={{
                  background: 'rgba(0,0,0,0.2)',
                  border: '1px solid rgba(255,255,255,0.06)',
                }}
              >
                <label className="mb-1 block font-space text-[10px] font-medium uppercase tracking-[0.08em] text-[var(--text-mute)]">
                  Contraseña
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  placeholder="••••••••"
                  className="w-full bg-transparent font-space text-base font-semibold text-[var(--text)] outline-none placeholder:text-[var(--text-faint)]"
                />
              </div>

              <button
                type="submit"
                disabled={isPending || !email || !password}
                className="mt-1 flex h-11 w-full items-center justify-center rounded-xl text-sm font-medium text-[var(--text)] transition-all disabled:opacity-40"
                style={{
                  background: 'linear-gradient(135deg, rgba(255,255,255,0.18), rgba(255,255,255,0.08))',
                  border: '1px solid rgba(255,255,255,0.2)',
                }}
              >
                {isPending ? 'Entrando...' : 'Entrar'}
              </button>
            </form>
          </div>
        </Card>
      </div>
    </div>
  )
}
