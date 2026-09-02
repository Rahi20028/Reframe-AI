'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) return
    setLoading(true)
    setError('')

    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    router.push('/dashboard')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#EEF4F2] px-4">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-sm border border-[#D9E2DE] p-8">
        <h1 className="text-2xl font-medium text-[#17241E] [font-family:var(--font-display)] mb-1">
          Welcome back
        </h1>
        <p className="text-sm text-[#5C685F] mb-6">
          Log in to continue your journey with Reframe-AI.
        </p>

        {error && (
          <div className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
            {error}
          </div>
        )}

        <div className="space-y-3">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            className="w-full border border-[#D9E2DE] rounded-full px-4 py-2.5 text-sm text-[#17241E] placeholder:text-[#A7B0AB] focus:outline-none focus:border-[#3F7268]"
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
            placeholder="Password"
            className="w-full border border-[#D9E2DE] rounded-full px-4 py-2.5 text-sm text-[#17241E] placeholder:text-[#A7B0AB] focus:outline-none focus:border-[#3F7268]"
          />
        </div>

        <button
          onClick={handleLogin}
          disabled={loading || !email.trim() || !password.trim()}
          className="w-full mt-5 bg-[#3F7268] text-white py-2.5 rounded-full text-sm font-medium hover:bg-[#365f57] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? 'Logging in...' : 'Log In'}
        </button>

        <p className="text-sm text-[#5C685F] text-center mt-5">
          Don't have an account?{' '}
          <a href="/signup" className="text-[#3F7268] font-medium hover:underline">
            Sign up
          </a>
        </p>
      </div>
    </div>
  )
}