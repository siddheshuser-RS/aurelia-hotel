import type { NextConfig } from "next";

function resolveApiProxyTarget() {
  const target = process.env.NEXT_SERVER_API_PROXY_TARGET?.trim();
  return (target && target.length > 0 ? target : "http://backend:5001").replace(/\/+$/, "");
}

const nextConfig: NextConfig = {
  output: "standalone",
  reactStrictMode: true,
  async rewrites() {
    const target = resolveApiProxyTarget();
    return [
      {
        source: "/api/:path*",
        destination: `${target}/api/:path*`
      }
    ];
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "res.cloudinary.com" },
      { protocol: "http", hostname: "localhost" },
      { protocol: "http", hostname: "127.0.0.1" }
    ],
    unoptimized: process.env.NODE_ENV === "development"
  }
};

export default nextConfig;
