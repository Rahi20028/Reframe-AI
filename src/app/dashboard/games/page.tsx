import Link from 'next/link'
import { Grid3x3, Puzzle, Crown } from 'lucide-react'

const games = [
  {
    href: '/dashboard/games/sudoku',
    title: 'Sudoku',
    description: 'A calm, logic-based puzzle to quiet a racing mind.',
    icon: Grid3x3,
  },
  {
    href: '/dashboard/games/puzzle',
    title: 'Sliding Puzzle',
    description: 'Rearrange the tiles back into order — simple, focused, distracting.',
    icon: Puzzle,
  },
  {
    href: '/dashboard/games/chess',
    title: 'Chess',
    description: 'Play a full game against yourself or a friend, one move at a time.',
    icon: Crown,
  },
]

export default function GamesPage() {
  return (
    <div className="p-6 md:p-10 max-w-3xl">
      <span className="text-xs font-semibold tracking-[0.18em] uppercase text-[#3F7268]">
        Games
      </span>
      <h2 className="mt-1 text-2xl font-medium text-[#17241E] [font-family:var(--font-display)]">
        Mindful distractions
      </h2>
      <p className="mt-1 mb-8 text-sm text-[#6B776F]">
        Sometimes the best way through a tough moment is a short, focused break.
      </p>

      <div className="grid sm:grid-cols-3 gap-4">
        {games.map(({ href, title, description, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className="bg-white border border-[#D9E2DE] rounded-xl p-5 hover:border-[#3F7268] hover:shadow-sm transition-all"
          >
            <div className="w-10 h-10 rounded-full bg-[#EEF4F2] flex items-center justify-center mb-3">
              <Icon size={18} className="text-[#3F7268]" />
            </div>
            <h3 className="text-sm font-semibold text-[#17241E] mb-1">{title}</h3>
            <p className="text-xs text-[#6B776F] leading-relaxed">{description}</p>
          </Link>
        ))}
      </div>
    </div>
  )
}