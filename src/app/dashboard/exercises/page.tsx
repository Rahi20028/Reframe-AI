'use client'
import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'

type Exercise = {
  id: string
  title: string
  description: string
  category: string
}

function ExercisesContent() {
  const [exercises, setExercises] = useState<Exercise[]>([])
  const [flowActive, setFlowActive] = useState(false)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [attemptedIds, setAttemptedIds] = useState<string[]>([])
  const [step, setStep] = useState<'instructions' | 'checkin' | 'done' | 'exhausted'>('instructions')
  const [loading, setLoading] = useState(true)
  const supabase = createClient()
  const searchParams = useSearchParams()

  useEffect(() => {
    loadExercises()
  }, [])

  useEffect(() => {
    // Auto-start if launched from the chatbot (e.g. /dashboard/exercises?autostart=true)
    if (searchParams.get('autostart') === 'true' && exercises.length > 0 && !flowActive) {
      startFlow()
    }
  }, [exercises])

  const loadExercises = async () => {
    const { data, error } = await supabase.from('exercises').select('*')
    if (error) {
      console.error('Failed to load exercises:', error)
    } else {
      setExercises(data || [])
    }
    setLoading(false)
  }

  const startFlow = () => {
    setCurrentIndex(0)
    setAttemptedIds([])
    setStep('instructions')
    setFlowActive(true)
  }

  const handleCheckIn = async (helpful: boolean) => {
    const { data: { user } } = await supabase.auth.getUser()
    const currentExercise = exercises[currentIndex]

    if (user && currentExercise) {
      const { error } = await supabase.from('exercise_logs').insert({
        user_id: user.id,
        exercise_id: currentExercise.id,
        helpful,
      })
      if (error) console.error('Failed to log exercise attempt:', error)
    }

    const newAttempted = [...attemptedIds, currentExercise.id]
    setAttemptedIds(newAttempted)

    if (helpful) {
      setStep('done')
      return
    }

    // Not helpful — try the next exercise
    const remaining = exercises.filter((ex) => !newAttempted.includes(ex.id))
    if (remaining.length === 0) {
      setStep('exhausted')
    } else {
      const nextExercise = remaining[0]
      const nextIndex = exercises.findIndex((ex) => ex.id === nextExercise.id)
      setCurrentIndex(nextIndex)
      setStep('instructions')
    }
  }

  if (loading) return <div className="p-6">Loading...</div>

  if (!flowActive) {
    return (
      <div className="p-6">
        <h2 className="text-lg font-semibold mb-4">CBT Exercises</h2>
        <p className="text-gray-600 mb-6">
          These short, guided exercises use CBT techniques to help you work through difficult thoughts and feelings.
        </p>
        <button
          onClick={startFlow}
          className="bg-blue-500 text-white px-6 py-3 rounded-lg"
        >
          Start a guided exercise
        </button>
      </div>
    )
  }

  const currentExercise = exercises[currentIndex]

  return (
    <div className="p-6 max-w-lg">
      {step === 'instructions' && currentExercise && (
        <>
          <h2 className="text-lg font-semibold mb-2">{currentExercise.title}</h2>
          <p className="text-gray-700 mb-6">{currentExercise.description}</p>
          <button
            onClick={() => setStep('checkin')}
            className="bg-blue-500 text-white px-6 py-3 rounded-lg"
          >
            I tried it
          </button>
        </>
      )}

      {step === 'checkin' && (
        <>
          <h2 className="text-lg font-semibold mb-4">Did that help?</h2>
          <div className="flex gap-3">
            <button
              onClick={() => handleCheckIn(true)}
              className="bg-green-500 text-white px-6 py-3 rounded-lg"
            >
              Yes, it helped
            </button>
            <button
              onClick={() => handleCheckIn(false)}
              className="bg-gray-300 px-6 py-3 rounded-lg"
            >
              Not really
            </button>
          </div>
        </>
      )}

      {step === 'done' && (
        <>
          <h2 className="text-lg font-semibold mb-2">Glad that helped 🙂</h2>
          <p className="text-gray-600 mb-6">You can try another exercise anytime, or head back to chat.</p>
          <button onClick={startFlow} className="bg-blue-500 text-white px-6 py-3 rounded-lg">
            Try another exercise
          </button>
        </>
      )}

      {step === 'exhausted' && (
        <>
          <h2 className="text-lg font-semibold mb-2">That's okay — not every exercise fits every moment</h2>
          <p className="text-gray-600 mb-6">
            Sometimes talking it through helps more than a structured exercise. Want to head back to chat?
          </p>
          <a href="/dashboard" className="inline-block bg-blue-500 text-white px-6 py-3 rounded-lg">
            Back to chat
          </a>
        </>
      )}
    </div>
  )
}

export default function ExercisesPage() {
  return (
    <Suspense fallback={<div className="p-6">Loading...</div>}>
      <ExercisesContent />
    </Suspense>
  )
}