'use client'
import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { createClient } from '@/utils/supabase/client'
import { Bot, User, Send } from 'lucide-react'

type Message = {
  id: string
  role: 'user' | 'assistant'
  content: string
  suggestExercise?: boolean
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const supabase = createClient()
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    const loadMessages = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true })
        .limit(20)

      if (error) {
        console.error('Failed to load messages:', error)
        return
      }

      if (data.length === 0) {
        setMessages([{ id: 'welcome', role: 'assistant', content: "Hi, I'm here to listen. What's on your mind today?" }])
      } else {
        setMessages(data.map((m) => ({ id: m.id, role: m.role, content: m.content })))
      }
    }

    loadMessages()
  }, [])

  const handleSend = async () => {
    if (!input.trim()) return

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const userText = input
    setInput('')

    const { data: savedUserMsg, error: userError } = await supabase
      .from('messages')
      .insert({ user_id: user.id, role: 'user', content: userText })
      .select()
      .single()

    if (userError) {
      console.error('Failed to save user message:', userError)
      return
    }

    setMessages((prev) => [...prev, { id: savedUserMsg.id, role: 'user', content: userText }])

    // Add an empty placeholder assistant message that we'll fill in as chunks arrive
    const tempId = `streaming-${Date.now()}`
    setMessages((prev) => [...prev, { id: tempId, role: 'assistant', content: '' }])

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userText }),
      })

      if (!res.ok || !res.body) throw new Error(`Server responded with ${res.status}`)

      const flagged = res.headers.get('X-Flagged') === 'true'
      const suggestExercise = res.headers.get('X-Suggest-Exercise') === 'true'

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let fullText = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunkText = decoder.decode(value, { stream: true })
        fullText += chunkText

        // Update the placeholder message live, chunk by chunk
        setMessages((prev) =>
          prev.map((m) => (m.id === tempId ? { ...m, content: fullText } : m))
        )
      }

      // Streaming finished — now save the complete message to Supabase
      const { data: savedAssistantMsg, error: assistantError } = await supabase
        .from('messages')
        .insert({ user_id: user.id, role: 'assistant', content: fullText })
        .select()
        .single()

      if (assistantError) {
        console.error('Failed to save assistant message:', assistantError)
        return
      }

      // Replace the temporary streaming message with the real saved one (correct id + suggestExercise flag)
      setMessages((prev) =>
        prev.map((m) =>
          m.id === tempId
            ? { id: savedAssistantMsg.id, role: 'assistant', content: fullText, suggestExercise }
            : m
        )
      )
    } catch (err) {
      console.error('Chat error:', err)
      setMessages((prev) =>
        prev.map((m) =>
          m.id === tempId
            ? { ...m, content: "Sorry, something went wrong. Please try again in a moment." }
            : m
        )
      )
    }
  }

  return (
    <div className="flex flex-col h-full bg-[#EEF4F2]">
      <div className="px-6 py-4 border-b border-[#D9E2DE] bg-white">
        <h2 className="text-lg font-medium text-[#17241E] [font-family:var(--font-display)]">
          Chat
        </h2>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-5">
        {messages.map((msg) => (
          <div key={msg.id} className="space-y-1.5">
            <div
              className={`flex items-end gap-2.5 ${msg.role === 'user' ? 'flex-row-reverse' : ''
                }`}
            >
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${msg.role === 'user' ? 'bg-[#E2A83D]' : 'bg-[#3F7268]'
                  }`}
              >
                {msg.role === 'user' ? (
                  <User size={14} className="text-[#17241E]" />
                ) : (
                  <Bot size={14} className="text-white" />
                )}
              </div>

              <div
                className={`max-w-[75%] md:max-w-[65%] px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${msg.role === 'user'
                  ? 'bg-[#3F7268] text-white rounded-br-sm'
                  : 'bg-white border border-[#D9E2DE] text-[#17241E] rounded-bl-sm shadow-sm'
                  }`}
              >
                {msg.content}
              </div>
            </div>

            {msg.suggestExercise && (
              <div className="flex justify-start pl-9">
                <Link
                  href="/dashboard/exercises?autostart=true"
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-[#3F7268] bg-white border border-[#D9E2DE] px-3 py-1.5 rounded-full hover:bg-[#EEF4F2] transition-colors shadow-sm"
                >
                  Try a guided exercise →
                </Link>
              </div>
            )}
          </div>
        ))}

        <div ref={scrollRef} />
      </div>

      <div className="p-4 border-t border-[#D9E2DE] bg-white">
        <div className="flex gap-2 items-center bg-[#EEF4F2] rounded-full pl-4 pr-1.5 py-1.5">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Type how you're feeling..."
            className="flex-1 bg-transparent text-sm text-[#17241E] placeholder:text-[#A7B0AB] focus:outline-none"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim()}
            className="w-9 h-9 flex items-center justify-center rounded-full bg-[#E2A83D] hover:bg-[#D69A2C] disabled:opacity-40 disabled:cursor-not-allowed transition-colors shrink-0"
          >
            <Send size={15} className="text-[#17241E]" />
          </button>
        </div>
      </div>
    </div>
  )
}