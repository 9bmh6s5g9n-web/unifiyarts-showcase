import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { getWorks, getResearchEntries } from "@/lib/queries"
import { ManageDashboard } from "@/components/manage-dashboard"

export default async function ManagePage() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) redirect("/sign-in")

  const [items, research] = await Promise.all([
    getWorks().catch(() => []),
    getResearchEntries(session.user.id).catch(() => []),
  ])

  return (
    <ManageDashboard
      items={items}
      research={research}
      userName={session.user.name ?? "there"}
    />
  )
}
