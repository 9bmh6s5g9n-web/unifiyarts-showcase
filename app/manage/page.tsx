import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { getWorks, getResearchEntries, getArtPieces, getAuthorLinks } from "@/lib/queries"
import { ManageDashboard } from "@/components/manage-dashboard"

export default async function ManagePage() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) redirect("/sign-in")

  const [items, research, art, links] = await Promise.all([
    getWorks().catch(() => []),
    getResearchEntries(session.user.id).catch(() => []),
    getArtPieces().catch(() => []),
    getAuthorLinks().catch(() => []),
  ])

  return (
    <ManageDashboard
      items={items}
      research={research}
      art={art}
      links={links}
      userName={session.user.name ?? "there"}
    />
  )
}
