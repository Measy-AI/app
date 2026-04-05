import { PHASE_DEVELOPMENT_SERVER } from "next/constants.js";

const sharedConfig = {
  output: "standalone",
  experimental: {
    serverActions: {
      bodySizeLimit: "2mb",
    },
  },
};

export default function nextConfig(phase) {
  return {
    ...sharedConfig,
    // Keep dev output separate from production builds to avoid stale chunk collisions.
    distDir: phase === PHASE_DEVELOPMENT_SERVER ? ".next-dev" : ".next",
  };
}
