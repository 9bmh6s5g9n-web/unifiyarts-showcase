"use client"

import { useState } from "react"
import Link from "next/link"
import { useChat } from "@ai-sdk/react"
import { DefaultChatTransport } from "ai"
import { ArrowLeft, Sparkles, Send, Loader2, BookOpen, FlaskConical } from "lucide-react"

const SUGGESTIONS = [
  "What themes recur across all my work?",
  "Where do my science notes and my fiction connect?",
  "Find the through-line about water in my research.",
  "What idea am I circling but haven't named yet?",
]

export function CoherenceChat({
  userName,
  entryCount,
  workCount,
}: {
  userName: string
  entryCount: number
  workCount: number
}) {
  const [input, setInput] = useState("")
  const { messages, sendMessage, status, error } = useChat({
    transport: new DefaultChatTransport({ api: "/api/coherence" }),
  })

  const busy = status === "submitted" || status === "streaming"
  const isEmpty = entryCount === 0 && workCount === 0

  function submit(text: string) {
    const value = text.trim()
    if (!value || busy) return
    sendMessage({ text: value })
    setInput("")
  }

  return (
    <div className="flex min-h-dvh flex-col bg-background text-foreground">
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-3xl items-center justify-between gap-4 px-4 sm:px-6">
          <div className="flex items-center gap-2">
            <Sparkles className="size-5 text-primary" />
            <span className="font-serif text-lg font-semibold tracking-tight">Coherence Engine</span>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/manage"
              className="flex min-h-9 items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              <ArrowLeft className="size-4" />
              <span className="hidden sm:inline">Manage</span>
            </Link>
          </div>
        </div>
      </header>

      <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col px-4 py-6 sm:px-6">
        {/* Corpus status */}
        <div className="mb-4 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <FlaskConical className="size-3.5 text-primary" />
            {entryCount} research {entryCount === 1 ? "entry" : "entries"}
          </span>
          <span className="flex items-center gap-1.5">
            <BookOpen className="size-3.5 text-primary" />
            {workCount} {workCount === 1 ? "work" : "works"}
          </span>
          <span>read directly from your private database</span>
        </div>

        {messages.length === 0 && (
          <div className="flex flex-1 flex-col items-center justify-center py-10 text-center">
            <div className="mb-4 flex size-14 items-center justify-center rounded-2xl bg-primary/10">
              <Sparkles className="size-7 text-primary" />
            </div>
            <h1 className="font-serif text-2xl font-light text-balance">
              Ask across your whole body of work, {userName}
            </h1>
            <p className="mx-auto mt-2 max-w-md text-pretty leading-relaxed text-muted-foreground">
              {isEmpty
                ? "Add research entries and works in Manage first — then I can read across them to find the coherence."
                : "I read your research notes and works and find the connections, patterns, and through-lines between them."}
            </p>
            {!isEmpty && (
              <div className="mt-6 grid w-full max-w-lg gap-2 sm:grid-cols-2">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => submit(s)}
                    className="rounded-xl border border-border/70 bg-card/50 p-3 text-left text-sm text-muted-foreground transition-colors hover:border-primary/50 hover:text-foreground"
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}
            {isEmpty && (
              <Link
                href="/manage"
                className="mt-6 inline-flex min-h-11 items-center gap-2 rounded-full bg-primary px-6 text-sm font-medium text-primary-foreground"
              >
                Go to Manage
              </Link>
            )}
          </div>
        )}

        {messages.length > 0 && (
          <div className="flex-1 space-y-6">
            {messages.map((m) => (
              <div key={m.id} className={m.role === "user" ? "flex justify-end" : "flex justify-start"}>
                <div
                  className={
                    m.role === "user"
                      ? "max-w-[85%] rounded-2xl rounded-br-sm bg-primary px-4 py-3 text-sm leading-relaxed text-primary-foreground"
                      : "max-w-[90%] rounded-2xl rounded-bl-sm border border-border/70 bg-card px-4 py-3 text-sm leading-relaxed"
                  }
                >
                  {m.parts.map((part, i) =>
                    part.type === "text" ? (
                      <p key={i} className="whitespace-pre-wrap">
                        {part.text}
                      </p>
                    ) : null,
                  )}
                </div>
              </div>
            ))}
            {status === "submitted" && (
              <div className="flex justify-start">
                <div className="flex items-center gap-2 rounded-2xl rounded-bl-sm border border-border/70 bg-card px-4 py-3 text-sm text-muted-foreground">
                  <Loader2 className="size-4 animate-spin" />
                  Reading across your work...
                </div>
              </div>
            )}
            {error && (
              <p className="text-center text-sm text-destructive" role="alert">
                Something went wrong. Please try again.
              </p>
            )}
          </div>
        )}

        <form
          onSubmit={(e) => {
            e.preventDefault()
            submit(input)
          }}
          className="sticky bottom-4 mt-6"
        >
          <div className="flex items-end gap-2 rounded-2xl border border-border bg-card p-2 shadow-lg">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (
                  e.key === "Enter" &&
                  !e.shiftKey &&
                  !e.nativeEvent.isComposing &&
                  e.keyCode !== 229
                ) {
                  e.preventDefault()
                  submit(input)
                }
              }}
              rows={1}
              placeholder="Ask the Coherence Engine..."
              disabled={isEmpty}
              className="max-h-40 min-h-11 flex-1 resize-none bg-transparent px-3 py-2.5 text-base outline-none placeholder:text-muted-foreground disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={busy || !input.trim() || isEmpty}
              className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground transition-opacity disabled:opacity-40"
              aria-label="Send"
            >
              {busy ? <Loader2 className="size-5 animate-spin" /> : <Send className="size-5" />}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
