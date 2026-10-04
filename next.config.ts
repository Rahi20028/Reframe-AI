import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
       root: __dirname,
     },

  serverExternalPackages: ['@xenova/transformers'],
  /* config options here */
  reactCompiler: true,
};

export default nextConfig;
