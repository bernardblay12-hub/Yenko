import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  /* config options here */
  serverExternalPackages: ["pdf-parse"],
  turbopack: {
    root: path.resolve("."),
  },
};

export default nextConfig;
