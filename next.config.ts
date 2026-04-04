import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Next.js 14.2+ uses serverExternalPackages (not experimental)
  serverExternalPackages: ["mongoose", "bcryptjs"],

  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**.unsplash.com" },
      { protocol: "https", hostname: "**.githubusercontent.com" },
    ],
  },

  // Compress responses
  compress: true,

  // Security headers
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options",   value: "nosniff" },
          { key: "X-Frame-Options",          value: "DENY" },
          { key: "X-XSS-Protection",         value: "1; mode=block" },
          { key: "Referrer-Policy",          value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy",       value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
      // Cache static assets aggressively
      {
        source: "/locales/:path*",
        headers: [{ key: "Cache-Control", value: "public, max-age=3600, stale-while-revalidate=86400" }],
      },
      {
        source: "/_next/static/:path*",
        headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }],
      },
    ];
  },

  // Redirects for old routes
  async redirects() {
    return [
      // Legacy admin route → 404 (handled in middleware too)
      { source: "/admin/:path*", destination: "/404", permanent: false },
    ];
  },
};

export default nextConfig;
