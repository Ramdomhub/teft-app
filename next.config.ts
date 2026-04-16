import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  // eslint wurde hier entfernt, da Next 15 es anders handhabt
};

export default nextConfig;
