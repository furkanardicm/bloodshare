import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: false,
  },
  webpack: (config, { isServer }) => {
    // TypeScript dosyalarını işle
    config.resolve.extensions = ['.ts', '.tsx', '.js', '.jsx'];
    return config;
  }
};

export default nextConfig;
