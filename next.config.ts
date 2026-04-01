import type { NextConfig } from "next";
import { PHASE_DEVELOPMENT_SERVER } from "next/constants";

const baseConfig: NextConfig = {
  outputFileTracingRoot: __dirname,
};

export default function nextConfig(phase: string): NextConfig {
  return {
    ...baseConfig,
    experimental: {
      workerThreads: phase === PHASE_DEVELOPMENT_SERVER,
    },
  };
}
