import type { Metadata } from "next"
import { getArtPieces } from "@/lib/queries"
import { ArtGallery } from "@/components/art-gallery"

export const metadata: Metadata = {
  title: "The Gallery — Art & Book Covers | UnifyArts Academy",
  description:
    "A collection of original art pieces and book covers. Custom cover commissions available.",
}

export default async function GalleryPage() {
  const pieces = await getArtPieces().catch(() => [])
  return <ArtGallery pieces={pieces} />
}
