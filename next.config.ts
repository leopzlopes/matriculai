import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ['unpdf', '@react-pdf/renderer', 'docx'],
  turbopack: {
    resolveAlias: {
      canvas: './empty-module.ts',
    },
  },
};

export default nextConfig;
