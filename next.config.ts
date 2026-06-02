import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "www.gutenberg.org",
        pathname: "/**"
      },
      {
        protocol: "http",
        hostname: "www.gutenberg.org",
        pathname: "/**"
      }
    ]
  }
};

export default nextConfig;
