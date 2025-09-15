import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Webpack configuration to handle path resolution issues
  webpack: (config, { dev, isServer }) => {
    // Ensure proper path resolution
    config.resolve.symlinks = false;
    
    // Add fallbacks for path resolution
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      path: false,
    };
    
    return config;
  },
  
  // Experimental features that might help with Turbopack
  experimental: {
    // Disable some experimental features that might cause path issues
    turbo: {
      resolveAlias: {
        // Ensure proper aliasing
      },
    },
  },
};

export default nextConfig;
