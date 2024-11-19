import path from "path"
import type { NextConfig } from "next"

const workspaceRoot = path.join(__dirname, "../../")

const nextConfig: NextConfig = {
  /* config options here */
  images: { unoptimized: true },
  output: "standalone",
  outputFileTracingRoot: workspaceRoot,
  experimental: {
    after: true,
  },
}

export default nextConfig
