import type { NextConfig } from "next";

const speicherAdresse = process.env.NEXT_PUBLIC_SUPABASE_URL
  ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL)
  : null;

const nextConfig: NextConfig = {
  reactStrictMode: true,
  outputFileTracingRoot: __dirname,
  poweredByHeader: false,
  images: {
    formats: ["image/avif", "image/webp"],
    // Hochgeladene Bilder liegen im Speicherordner des Supabase-Projekts.
    // Protokoll und Port kommen aus der Adresse selbst, damit sich das Ganze
    // auch gegen ein lokales Supabase ausprobieren lässt.
    remotePatterns: speicherAdresse
      ? [
          {
            protocol: speicherAdresse.protocol.replace(":", "") as "http" | "https",
            hostname: speicherAdresse.hostname,
            port: speicherAdresse.port || undefined,
            pathname: "/storage/v1/object/public/**",
          },
        ]
      : [],
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
        ],
      },
    ];
  },
};

export default nextConfig;
