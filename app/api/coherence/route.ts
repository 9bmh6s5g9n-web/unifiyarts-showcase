import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { researchEntries, works } from "@/lib/db/schema"
import { eq } from "drizzle-orm"
import { headers } from "next/headers"
import { convertToModelMessages, streamText, type UIMessage } from "ai"
import { createOpenAICompatible } from "@ai-sdk/openai-compatible"

export const maxDuration = 30

// Cloudflare Workers AI, called through its OpenAI-compatible endpoint.
// The account ID is not a secret (it appears in the dashboard URL), so it's
// baked in here. Only CLOUDFLARE_API_TOKEN (with Workers AI permission) is
// needed as a secret env var. An env override still wins if provided.
const KNOWN_ACCOUNT_ID = "adf6066eb05c2436e2a4c86ad6c214f0"
// A real account ID is 32 hex characters. Only trust the env value if it looks
// valid; otherwise use the known-good one so a mis-pasted value can't break it.
const envAccountId = process.env.CLOUDFLARE_ACCOUNT_ID ?? ""
const CF_ACCOUNT_ID = /^[0-9a-f]{32}$/i.test(envAccountId) ? envAccountId : KNOWN_ACCOUNT_ID
const CF_API_TOKEN = process.env.CLOUDFLARE_API_TOKEN
const CF_MODEL = "@cf/meta/llama-3.3-70b-instruct-fp8-fast"

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

  if (!CF_ACCOUNT_ID || !CF_API_TOKEN) {
    return new Response(
      "The Coherence Engine isn't connected yet. Add your Cloudflare account ID and API token to switch it on.",
      { status: 503 },
    )
  }

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

  const cloudflare = createOpenAICompatible({
    name: "cloudflare-workers-ai",
    baseURL: `https://api.cloudflare.com/client/v4/accounts/${CF_ACCOUNT_ID}/ai/v1`,
    apiKey: CF_API_TOKEN,
  })

  const result = streamText({
    model: cloudflare(CF_MODEL),
    instructions: `${SYSTEM}\n\n=== THE AUTHOR'S MATERIAL ===\n${corpus}`,
    messages: await convertToModelMessages(messages),
  })

  return result.toUIMessageStreamResponse()
}
