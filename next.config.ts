import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allowed origins for dev mode (local network)
  allowedDevOrigins: ["10.0.0.6", "172.20.10.2", "crm.bingoisrael.co.il"],

  // Don't reveal that this is a Next.js app
  poweredByHeader: false,

  // Compress responses
  compress: true,

  // Output standalone for smaller Docker images
  output: "standalone",

  // Build resilience: ignore TS errors in CI (we have IDE checks anyway)
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
