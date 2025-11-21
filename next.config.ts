import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  /* config options here */
  
  // Aumentar timeout para uploads grandes
  experimental: {
    serverActions: {
      bodySizeLimit: '150mb',
    },
  },
  
  // Configuración para manejar archivos grandes en API routes
  // Next.js 16+ maneja esto automáticamente, pero podemos configurar headers
  async headers() {
    return [
      {
        source: '/api/upload/:path*',
        headers: [
          {
            key: 'Content-Type',
            value: 'multipart/form-data',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
