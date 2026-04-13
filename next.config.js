/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // Bundle all server-side code together to reduce serverless function count
    serverComponentsExternalPackages: [],
  },
  // Ensure output is optimized for deployment
  poweredByHeader: false,
  // Reduce number of generated serverless functions by disabling granular chunks
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.optimization = {
        ...config.optimization,
        splitChunks: false,
      };
    }
    return config;
  },
};

module.exports = nextConfig;
