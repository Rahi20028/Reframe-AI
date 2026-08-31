import { NextRequest, NextResponse } from 'next/server'
import { ChatGroq } from '@langchain/groq'
import { PromptTemplate } from '@langchain/core/prompts'
import { createClient } from '@/utils/supabase/server'

const CRISIS_KEYWORDS = [
  'kill myself', 'suicide', 'end my life', 'want to die',
  'hurt myself', 'self harm', 'no reason to live'
]

function detectCrisis(message: string): boolean {
  const lower = message.toLowerCase()
  return CRISIS_KEYWORDS.some((keyword) => lower.includes(keyword))
}

const cbtPromptTemplate = PromptTemplate.fromTemplate(`
You are a supportive CBT-based mental wellness companion for students aged 15-24.
Use cognitive behavioral therapy techniques: help the user identify thought patterns,
gently challenge distorted thinking, and suggest small, actionable coping steps.
Keep responses warm, concise, and non-clinical in tone.

Recent conversation history:
{history}

User's latest message: {userMessage}
`)

export async function POST(req: NextRequest) {
  const { message } = await req.json()

  if (!message || typeof message !== 'string') {
    return NextResponse.json({ error: 'Invalid message' }, { status: 400 })
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (detectCrisis(message)) {
    if (user) {
      const { error } = await supabase.from('crisis_events').insert({
        user_id: user.id,
        triggered_keyword: CRISIS_KEYWORDS.find((k) => message.toLowerCase().includes(k)),
      })
      if (error) console.error('Crisis event insert failed:', error)
    }

    return NextResponse.json({
      flagged: true,
      reply: "It sounds like you're going through something really difficult right now. You're not alone, and support is available. Please consider reaching out to a crisis helpline or a trusted person in your life.",
    })
  }

  // Fetch recent message history for this user (capped window)
  let historyText = 'No prior messages.'
  if (user) {
    const { data: recentMessages } = await supabase
      .from('messages')
      .select('role, content')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(10) // smaller window just for what we feed into the prompt

    if (recentMessages && recentMessages.length > 0) {
      historyText = recentMessages
        .reverse()
        .map((m) => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`)
        .join('\n')
    }
  }

  const model = new ChatGroq({
    apiKey: process.env.GROQ_API_KEY,
    model: 'openai/gpt-oss-120b',
    maxTokens: 500,
  })

  const prompt = await cbtPromptTemplate.format({ history: historyText, userMessage: message })
  const response = await model.invoke(prompt)

  return NextResponse.json({
    flagged: false,
    reply: response.content,
  })
}