const path = require('path');

/** @type {import('next').NextConfig} */
const nextConfig = {
  distDir: process.env.NEXT_DIST_DIR || '.next',
  output: process.env.NEXT_OUTPUT_MODE,
  experimental: {
    outputFileTracingRoot: path.join(__dirname, '../'),
    serverComponentsExternalPackages: [
      '@tensorflow/tfjs',
      '@tensorflow/tfjs-node',
      'canvas',
      'sharp',
      'fabric',
      'plotly.js',
      'mapbox-gl',
      'ethers',
      'web3',
      'nft.storage',
      'jimp',
      '@sentry/nextjs',
    ],
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: { unoptimized: true },
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals = config.externals || [];
      config.externals.push({
        '@tensorflow/tfjs-node': 'commonjs @tensorflow/tfjs-node',
        'canvas': 'commonjs canvas',
        'sharp': 'commonjs sharp',
      });
    }
    return config;
  },
};

module.exports = nextConfig;
