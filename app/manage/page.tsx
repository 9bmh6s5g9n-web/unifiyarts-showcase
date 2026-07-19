import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { getWorks } from "@/lib/queries"
import { ManageDashboard } from "@/components/manage-dashboard"

export default async function ManagePage() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) redirect("/sign-in")

  const items = await getWorks().catch(() => [])

  return <ManageDashboard items={items} userName={session.user.name ?? "there"} />
}
