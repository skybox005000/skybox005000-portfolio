import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  distDir: process.env.NEXT_DIST_DIR || ".next",
  output: process.env.STANDALONE_BUILD === "true" ? "standalone" : undefined,
  outputFileTracingRoot: path.join(__dirname, "../.."),
  transpilePackages: ["@portfolio/config", "@portfolio/contracts", "@portfolio/database"],
  poweredByHeader: false,
  async headers() {
    return [{ source: "/(.*)", headers: [
      { key: "X-Content-Type-Options", value: "nosniff" },
      { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
      { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
      { key: "X-Frame-Options", value: "SAMEORIGIN" }
    ] }];
  }
};
export default nextConfig;
