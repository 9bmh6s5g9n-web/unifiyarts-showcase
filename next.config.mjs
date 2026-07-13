/** @type {import('next').NextConfig} */
const nextConfig = {
  // Static export -> produces an `out/` folder that Cloudflare Pages serves directly.
  output: "export",
  // Cloudflare Pages serves each route as a folder with an index.html.
  trailingSlash: true,
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    // Required: the Next.js image optimizer isn't available in a static export.
    unoptimized: true,
  },
}

export default nextConfig
