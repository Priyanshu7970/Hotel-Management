import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  env: {
    NEXT_PUBLIC_ANALYTICS_ID: process.env.ANALYTICS_ID,
  },
};

export default nextConfig;
