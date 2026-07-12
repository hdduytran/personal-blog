import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  // Content submodule lives at /content — it is read at build time by lib/*,
  // not served as routes, so no special config is required.
};

export default nextConfig;
