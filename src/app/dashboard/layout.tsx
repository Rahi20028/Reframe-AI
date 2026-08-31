'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  MessageCircle,
  BarChart3,
  NotebookPen,
  Wind,
  Gamepad2,
  LogOut,
} from 'lucide-react'
import { createClient } from '@/utils/supabase/client'

const navItems = [
  { href: '/dashboard', label: 'Chat', icon: MessageCircle },
  { href: '/dashboard/mood', label: 'Mood', icon: BarChart3 },
  { href: '/dashboard/journal', label: 'Journal', icon: NotebookPen },
  { href: '/dashboard/exercises', label: 'Exercises', icon: Wind },
  { href: '/dashboard/games', label: 'Games', icon: Gamepad2 },
]

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <div className="flex h-screen bg-[#EEF4F2]">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-[#D9E2DE] p-5 flex flex-col">
        <span className="text-lg font-medium text-[#17241E] [font-family:var(--font-display)] mb-8 px-2">
          Reframe-AI
        </span>

        <nav className="flex flex-col gap-1">
          {navItems.map(({ href, label, icon: Icon }) => {
            const isActive =
              href === '/dashboard' ? pathname === href : pathname.startsWith(href)

            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                  isActive
                    ? 'bg-[#3F7268] text-white font-medium'
                    : 'text-[#3E4A44] hover:bg-[#EEF4F2]'
                }`}
              >
                <Icon size={17} strokeWidth={2} />
                {label}
              </Link>
            )
          })}
        </nav>

        <button
          onClick={handleSignOut}
          className="mt-auto flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-[#6B776F] hover:bg-[#EEF4F2] hover:text-[#17241E] transition-colors"
        >
          <LogOut size={17} strokeWidth={2} />
          Sign out
        </button>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  )
}