import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["@prisma/client"],
  // Static export for Capacitor builds
  ...(process.env.CAPACITOR_BUILD === "true" && {
    output: "export",
    images: {
      unoptimized: true,
    },
    trailingSlash: true,
  }),
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
