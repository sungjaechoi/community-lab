import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // OAuth callback codes must not appear in development request logs.
  logging: { incomingRequests: { ignore: [/^\/auth\//] }, browserToTerminal: false },
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
