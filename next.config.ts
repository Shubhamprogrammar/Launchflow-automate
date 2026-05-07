import type { NextConfig } from "next";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = dirname(fileURLToPath(import.meta.url));

const normalizeBackendURL = (url?: string) => {
  if (!url) {
    return undefined;
  }

  try {
    const parsedURL = new URL(url);
    return parsedURL.origin;
  } catch {
    return undefined;
  }
};

const backendURL = normalizeBackendURL(
  process.env.BACKEND_URL || process.env.NEXT_PUBLIC_API_URL
);

const nextConfig: NextConfig = {
  turbopack: {
    root: projectRoot,
  },

  async rewrites() {
    if (!backendURL) {
      return [];
    }

    return [
      {
        source: "/api/:path*",
        destination: `${backendURL}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
