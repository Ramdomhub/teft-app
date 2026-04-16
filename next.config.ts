import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    // IGNORIERT TypeScript-Fehler beim Build
    ignoreBuildErrors: true,
  },
  eslint: {
    // IGNORIERT ESLint-Fehler beim Build
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
