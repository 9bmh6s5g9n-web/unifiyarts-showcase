import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { researchEntries, works } from "@/lib/db/schema"
import { eq } from "drizzle-orm"
import { headers } from "next/headers"
import { convertToModelMessages, streamText, type UIMessage } from "ai"

export const maxDuration = 30

const SYSTEM = `You are the Coherence Engine for UnifyArts.academy — a research assistant that reads across the author's own body of work to find coherence: hidden connections, recurring themes, and through-lines between their research notes and creative works.

Rules:
- Only reason about the material provided below. It is the author's own private research and works.
- When you find a connection, be specific: name the entries/works it spans and quote the relevant phrase.
- If the material does not contain enough to answer, say so plainly and suggest what note the author could add. Never invent facts, citations, or DOIs.
- Be direct, rigorous, and encouraging. This author combines many sciences looking for a unified, coherent picture — help them see the threads.`

export async function POST(req: Request) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) {
    return new Response("Unauthorized", { status: 401 })
  }
  const userId = session.user.id

  const { messages }: { messages: UIMessage[] } = await req.json()

  // Gather ONLY this user's material as grounding context.
  const [entries, workRows] = await Promise.all([
    db.select().from(researchEntries).where(eq(researchEntries.userId, userId)),
    db.select().from(works).where(eq(works.userId, userId)),
  ])

  const researchText = entries
    .map(
      (e) =>
        `--- RESEARCH: ${e.title}${e.doi ? ` (DOI: ${e.doi})` : ""}${e.tags ? ` [tags: ${e.tags}]` : ""}\n${e.content}`,
    )
    .join("\n\n")

  const worksText = workRows
    .map((w) => `--- WORK: ${w.title} (${w.type}, ${w.side})\n${w.excerpt}`)
    .join("\n\n")

  const corpus =
    [researchText, worksText].filter(Boolean).join("\n\n") ||
    "(The author has not added any research entries or works yet.)"

  const result = streamText({
    model: "anthropic/claude-sonnet-4.5",
    instructions: `${SYSTEM}\n\n=== THE AUTHOR'S MATERIAL ===\n${corpus}`,
    messages: await convertToModelMessages(messages),
  })

  return result.toUIMessageStreamResponse()
}
