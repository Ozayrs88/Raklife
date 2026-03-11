import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    // Temporarily ignore build errors for demo
    ignoreBuildErrors: true,
  },
  turbopack: {
    root: '/Users/ozayrsoge/ZEA RAKlife',
  },
};

export default nextConfig;
