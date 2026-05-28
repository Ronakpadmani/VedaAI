import path from "path";
import type { NextConfig } from "next";

const backendProxy =
  process.env.API_PROXY_URL || process.env.BACKEND_URL || "";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  outputFileTracingRoot: path.join(__dirname),
  async rewrites() {
    if (!backendProxy) {
      return [];
    }
    const base = backendProxy.replace(/\/$/, "");
    return [
      {
        source: "/api/:path*",
        destination: `${base}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
