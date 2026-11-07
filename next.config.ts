import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Build static HTML/CSS/JS for Cloudflare Pages; no runtime server required.
  output: "export",
  trailingSlash: true,
  reactStrictMode: true,
  poweredByHeader: false,
  images: { unoptimized: true },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
