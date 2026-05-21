import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Optimize build output
  output: 'standalone',
  
  // Optimize images
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  
  // Enable compression
  compress: true,
  
  // Disable x-powered-by header for security
  poweredByHeader: false,
  
  // Webpack optimizations
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
      };
    }
    return config;
  },
  
  // Turbopack optimizations
  turbopack: {},
  
  // Experimental features
  experimental: {
    // Optimize package imports
    optimizePackageImports: ['@anthropic-ai/sdk', '@supabase/supabase-js'],
  },
};

export default nextConfig;
