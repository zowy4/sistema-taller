import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone', // Para Docker multi-stage builds
  /* config options here */
};

export default nextConfig;
