import { NextRequest, NextResponse } from 'next/server'
import { ChatGroq } from '@langchain/groq'
import { PromptTemplate } from '@langchain/core/prompts'
import { createClient } from '@/utils/supabase/server'
import { embedText } from '@/utils/embeddings'

const CRISIS_KEYWORDS = [
  'kill myself', 'suicide', 'end my life', 'want to die',
  'hurt myself', 'self harm', 'no reason to live'
]

function detectCrisis(message: string): boolean {
  const lower = message.toLowerCase()
  return CRISIS_KEYWORDS.some((keyword) => lower.includes(keyword))
}

const STRESS_KEYWORDS = [
  'stressed', 'anxious', 'overwhelmed', 'panicking', 'can\'t focus', 'racing thoughts'
]

function detectStress(message: string): boolean {
  const lower = message.toLowerCase()
  return STRESS_KEYWORDS.some((keyword) => lower.includes(keyword))
}

const cbtPromptTemplate = PromptTemplate.fromTemplate(`
You are a supportive CBT-based mental wellness companion for students aged 15-24.
Use cognitive behavioral therapy techniques: help the user identify thought patterns,
gently challenge distorted thinking, and suggest small, actionable coping steps.
Keep responses warm, concise, and non-clinical in tone. Respond in plain conversational
sentences — do not use markdown formatting, bullet points, or headers.

If the user asks something unrelated to their wellbeing or mental health (general
knowledge questions, trivia, tech topics, etc.), gently acknowledge it and redirect
back to checking in on how they're doing, rather than fully answering as a general-purpose
assistant.

Here are examples of similar past conversations, to guide your tone and style:
{examples}

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

  // Crisis path — stream the fixed message as a single chunk, so the frontend logic stays uniform
  if (detectCrisis(message)) {
    if (user) {
      const { error } = await supabase.from('crisis_events').insert({
        user_id: user.id,
        triggered_keyword: CRISIS_KEYWORDS.find((k) => message.toLowerCase().includes(k)),
      })
      if (error) console.error('Crisis event insert failed:', error)
    }

    const crisisReply = "It sounds like you're going through something really difficult right now. You're not alone, and support is available. Please consider reaching out to a crisis helpline or a trusted person in your life."

    const stream = new ReadableStream({
      start(controller) {
        controller.enqueue(new TextEncoder().encode(crisisReply))
        controller.close()
      },
    })

    return new NextResponse(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'X-Flagged': 'true',
        'X-Suggest-Exercise': 'false',
      },
    })
  }

  // Fetch recent message history for this user
  let historyText = 'No prior messages.'
  if (user) {
    const { data: recentMessages } = await supabase
      .from('messages')
      .select('role, content')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(10)

    if (recentMessages && recentMessages.length > 0) {
      historyText = recentMessages
        .reverse()
        .map((m) => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`)
        .join('\n')
    }
  }

  // Retrieve similar past examples via RAG
  let examplesText = 'No similar examples found.'
  try {
    const queryEmbedding = await embedText(message)
    const { data: similarExamples, error: matchError } = await supabase.rpc('match_examples', {
      query_embedding: queryEmbedding,
      match_count: 3,
    })

    if (matchError) {
      console.error('Failed to retrieve similar examples:', matchError)
    } else if (similarExamples && similarExamples.length > 0) {
      examplesText = similarExamples
        .map((ex: { student_message: string; ideal_response: string }) =>
          `Student: "${ex.student_message}"\nYou: "${ex.ideal_response}"`
        )
        .join('\n\n')
    }
  } catch (err) {
    console.error('Embedding/retrieval error:', err)
  }
  console.log(examplesText)

  const model = new ChatGroq({
    apiKey: process.env.GROQ_API_KEY,
    model: 'openai/gpt-oss-120b',
    maxTokens: 500,
  })

  const prompt = await cbtPromptTemplate.format({ examples: examplesText, history: historyText, userMessage: message })
  const groqStream = await model.stream(prompt)

  const encoder = new TextEncoder()
  const stream = new ReadableStream({
    async start(controller) {
      for await (const chunk of groqStream) {
        const text = typeof chunk.content === 'string' ? chunk.content : ''
        if (text) controller.enqueue(encoder.encode(text))
      }
      controller.close()
    },
  })

  return new NextResponse(stream, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'X-Flagged': 'false',
      'X-Suggest-Exercise': String(detectStress(message)),
    },
  })
}