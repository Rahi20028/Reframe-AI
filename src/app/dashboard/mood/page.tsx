'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

const MOOD_OPTIONS = [
  { score: 1, emoji: '😢', label: 'Very low' },
  { score: 2, emoji: '😕', label: 'Low' },
  { score: 3, emoji: '😐', label: 'Okay' },
  { score: 4, emoji: '🙂', label: 'Good' },
  { score: 5, emoji: '😄', label: 'Great' },
]

type MoodEntry = { logged_date: string; mood_score: number }

export default function MoodPage() {
  const [todayLogged, setTodayLogged] = useState(false)
  const [loading, setLoading] = useState(true)
  const [history, setHistory] = useState<MoodEntry[]>([])
  const supabase = createClient()

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const today = new Date().toISOString().split('T')[0]

    const { data: todayData } = await supabase
      .from('mood_logs')
      .select('id')
      .eq('user_id', user.id)
      .eq('logged_date', today)
      .maybeSingle()

    setTodayLogged(!!todayData)

    const { data: historyData, error } = await supabase
      .from('mood_logs')
      .select('logged_date, mood_score')
      .eq('user_id', user.id)
      .order('logged_date', { ascending: true })
      .limit(30)

    if (error) console.error('Failed to load mood history:', error)
    else setHistory(historyData || [])

    setLoading(false)
  }

  const handleLogMood = async (score: number) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { error } = await supabase.from('mood_logs').insert({
      user_id: user.id,
      mood_score: score,
    })

    if (error) {
      console.error('Failed to log mood:', error)
      return
    }

    await loadData() // refresh both the "logged today" state and the chart
  }

  if (loading) {
    return (
      <div className="p-6 h-full flex items-center justify-center">
        <span className="text-sm text-[#A7B0AB]">Loading your mood history…</span>
      </div>
    )
  }

  return (
    <div className="p-6 md:p-10 max-w-3xl">
      <span className="text-xs font-semibold tracking-[0.18em] uppercase text-[#3F7268]">
        Check-in
      </span>
      <h2 className="mt-1 text-2xl font-medium text-[#17241E] [font-family:var(--font-display)]">
        How are you feeling today?
      </h2>

      {todayLogged ? (
        <div className="mt-6 mb-10 bg-white border border-[#D9E2DE] rounded-xl px-5 py-4">
          <p className="text-sm text-[#3E4A44]">
            You've already logged your mood today — nice. Come back tomorrow for your next check-in.
          </p>
        </div>
      ) : (
        <div className="flex flex-wrap gap-3 mt-6 mb-10">
          {MOOD_OPTIONS.map((mood) => (
            <button
              key={mood.score}
              onClick={() => handleLogMood(mood.score)}
              className="group flex flex-col items-center gap-1.5 px-5 py-4 bg-white border border-[#D9E2DE] rounded-xl hover:border-[#3F7268] hover:-translate-y-0.5 transition-all duration-150"
            >
              <span className="text-3xl group-hover:scale-110 transition-transform duration-150">
                {mood.emoji}
              </span>
              <span className="text-xs font-medium text-[#3E4A44]">{mood.label}</span>
            </button>
          ))}
        </div>
      )}

      <h3 className="text-sm font-semibold text-[#17241E] mb-3">Your mood over time</h3>

      {history.length === 0 ? (
        <div className="border border-dashed border-[#D9E2DE] rounded-xl px-6 py-10 text-center">
          <p className="text-sm text-[#6B776F]">
            Nothing here yet. Log a mood above and this will start filling in.
          </p>
        </div>
      ) : (
        <div className="bg-white border border-[#D9E2DE] rounded-xl p-4">
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={history} margin={{ top: 8, right: 12, left: -12, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E4EAE7" />
              <XAxis
                dataKey="logged_date"
                tick={{ fontSize: 11, fill: '#8A958F' }}
                axisLine={{ stroke: '#D9E2DE' }}
                tickLine={false}
              />
              <YAxis
                domain={[1, 5]}
                ticks={[1, 2, 3, 4, 5]}
                tick={{ fontSize: 11, fill: '#8A958F' }}
                axisLine={{ stroke: '#D9E2DE' }}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  background: '#17241E',
                  border: 'none',
                  borderRadius: 8,
                  fontSize: 12,
                  color: '#fff',
                }}
                labelStyle={{ color: '#CFE3DD' }}
              />
              <Line
                type="monotone"
                dataKey="mood_score"
                stroke="#3F7268"
                strokeWidth={2.5}
                dot={{ fill: '#3F7268', r: 3 }}
                activeDot={{ fill: '#E2A83D', r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  )
}