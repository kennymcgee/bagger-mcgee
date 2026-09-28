import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  distDir: process.env.BAGGER_DECISIONS_BUILD === "1" ? ".next-decisions" : process.env.BAGGER_REVIEW_BUILD === "1" ? ".next-review" : ".next",
  poweredByHeader: false,
  async headers() {
    return [{ source: "/:path*", headers: [
      { key: "X-Content-Type-Options", value: "nosniff" },
      { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
      { key: "X-Frame-Options", value: "DENY" },
    ] }];
  },
};
export default nextConfig;

