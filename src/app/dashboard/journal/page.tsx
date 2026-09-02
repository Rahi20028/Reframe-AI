'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { NotebookPen } from 'lucide-react'

type JournalEntry = {
  id: string
  content: string
  created_at: string
}

export default function JournalPage() {
  const [entries, setEntries] = useState<JournalEntry[]>([])
  const [draft, setDraft] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    loadEntries()
  }, [])

  const loadEntries = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data, error } = await supabase
      .from('journal_entries')
      .select('id, content, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Failed to load journal entries:', error)
    } else {
      setEntries(data || [])
    }
    setLoading(false)
  }

  const handleSave = async () => {
    if (!draft.trim()) return
    setSaving(true)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      setSaving(false)
      return
    }

    const { data, error } = await supabase
      .from('journal_entries')
      .insert({ user_id: user.id, content: draft.trim() })
      .select()
      .single()

    if (error) {
      console.error('Failed to save journal entry:', error)
      setSaving(false)
      return
    }

    setEntries((prev) => [data, ...prev])
    setDraft('')
    setSaving(false)
  }

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })

  if (loading) {
    return (
      <div className="p-6 h-full flex items-center justify-center">
        <span className="text-sm text-[#A7B0AB]">Loading your journal…</span>
      </div>
    )
  }

  return (
    <div className="p-6 md:p-10 max-w-2xl">
      <span className="text-xs font-semibold tracking-[0.18em] uppercase text-[#3F7268]">
        Journal
      </span>
      <h2 className="mt-1 text-2xl font-medium text-[#17241E] [font-family:var(--font-display)]">
        What's on your mind?
      </h2>
      <p className="mt-1 mb-6 text-sm text-[#6B776F]">
        Write freely — this is just for you.
      </p>

      {/* New entry */}
      <div className="bg-white border border-[#D9E2DE] rounded-xl p-4 mb-10">
        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Start writing…"
          rows={5}
          className="w-full resize-none text-sm text-[#17241E] placeholder:text-[#A7B0AB] focus:outline-none leading-relaxed"
        />
        <div className="flex justify-end mt-2">
          <button
            onClick={handleSave}
            disabled={!draft.trim() || saving}
            className="px-5 py-2 rounded-lg bg-[#E2A83D] hover:bg-[#D69A2C] disabled:opacity-40 disabled:cursor-not-allowed text-[#17241E] text-sm font-semibold transition-colors"
          >
            {saving ? 'Saving…' : 'Save entry'}
          </button>
        </div>
      </div>

      {/* Past entries */}
      <h3 className="text-sm font-semibold text-[#17241E] mb-3">Past entries</h3>

      {entries.length === 0 ? (
        <div className="border border-dashed border-[#D9E2DE] rounded-xl px-6 py-10 text-center flex flex-col items-center gap-2">
          <NotebookPen size={20} className="text-[#A7B0AB]" />
          <p className="text-sm text-[#6B776F]">
            No entries yet — your first one will show up here.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {entries.map((entry) => (
            <div
              key={entry.id}
              className="bg-white border border-[#D9E2DE] rounded-xl p-4"
            >
              <span className="text-xs text-[#A7B0AB]">
                {formatDate(entry.created_at)}
              </span>
              <p className="mt-1.5 text-sm text-[#3E4A44] leading-relaxed whitespace-pre-wrap">
                {entry.content}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}