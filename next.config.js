const nextConfig = {
  

  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**.unsplash.com" },
      { protocol: "https", hostname: "**.githubusercontent.com" },
    ],
  },

  compress: true,

  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-XSS-Protection", value: "1; mode=block" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
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

  async redirects() {
    return [
      { source: "/admin/:path*", destination: "/404", permanent: false },
    ];
  },
};

module.exports = nextConfig;
