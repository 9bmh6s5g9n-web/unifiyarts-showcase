import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { researchEntries, works } from "@/lib/db/schema"
import { eq } from "drizzle-orm"
import { CoherenceChat } from "@/components/coherence-chat"

export default async function CoherencePage() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) redirect("/sign-in")

  const userId = session.user.id
  const [entryCount, workCount] = await Promise.all([
    db.select({ id: researchEntries.id }).from(researchEntries).where(eq(researchEntries.userId, userId)),
    db.select({ id: works.id }).from(works).where(eq(works.userId, userId)),
  ])

  return (
    <CoherenceChat
      userName={session.user.name ?? "Researcher"}
      entryCount={entryCount.length}
      workCount={workCount.length}
    />
  )
}
