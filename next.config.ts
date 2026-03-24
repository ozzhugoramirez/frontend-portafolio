import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'storage.googleapis.com',
        port: '',
        // Reemplazamos esto con la ruta exacta de tu bucket
        pathname: '/media-portfolio-seba/**', 
      },
    ],
  },
};

export default nextConfig;