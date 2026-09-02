'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import Link from 'next/link'
import { AlertCircle } from 'lucide-react'

export default function SignUp() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const supabase = createClient()
  const router = useRouter()

  const handleSignUp = async () => {
    setError('')

    const { data, error } = await supabase.auth.signUp({ email, password })

    if (error) {
      setError(error.message)
      return
    }

    // Supabase returns no error for an already-registered email when email
    // confirmations are on — it just comes back with an empty identities array
    if (data.user && data.user.identities && data.user.identities.length === 0) {
      setError('An account with this email already exists. Try signing in instead.')
      return
    }


    router.push('/dashboard')
  }

  return (
    <main className="min-h-screen bg-[#EEF4F2] flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-sm bg-white rounded-2xl border border-[#D9E2DE] shadow-sm p-8">
        <span className="text-xs font-semibold tracking-[0.18em] uppercase text-[#3F7268]">
          Reframe-AI
        </span>
        <h1 className="mt-2 text-2xl font-medium text-[#17241E] [font-family:var(--font-display)]">
          Create your account
        </h1>
        <p className="mt-1 mb-6 text-sm text-[#6B776F]">
          A quiet space to start reframing.
        </p>

        {error && (
          <div className="mb-4 flex items-start gap-2 bg-[#FBEAEA] border border-[#EFC6C6] rounded-lg px-3 py-2.5">
            <AlertCircle size={15} className="text-[#B23B3B] mt-0.5 shrink-0" />
            <p className="text-xs text-[#8F2E2E] leading-relaxed">{error}</p>
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-[#3E4A44] mb-1.5">
              Email
            </label>
            <input
              placeholder="you@example.com"
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-[#D9E2DE] rounded-lg px-3 py-2.5 text-sm text-[#17241E] placeholder:text-[#A7B0AB] focus:outline-none focus:ring-2 focus:ring-[#3F7268] focus:border-transparent transition-shadow"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#3E4A44] mb-1.5">
              Password
            </label>
            <input
              placeholder="At least 8 characters"
              type="password"
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-[#D9E2DE] rounded-lg px-3 py-2.5 text-sm text-[#17241E] placeholder:text-[#A7B0AB] focus:outline-none focus:ring-2 focus:ring-[#3F7268] focus:border-transparent transition-shadow"
            />
          </div>

          <button
            onClick={handleSignUp}
            className="w-full bg-[#E2A83D] hover:bg-[#D69A2C] text-[#17241E] font-semibold rounded-lg py-2.5 text-sm transition-colors mt-2"
          >
            Sign up
          </button>
        </div>

        <p className="mt-6 text-center text-sm text-[#6B776F]">
          Already have an account?{" "}
          <Link href="/login" className="text-[#3F7268] font-medium hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </main>
  )
}