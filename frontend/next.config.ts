import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  output: 'standalone',
  serverExternalPackages: ['@alpacahq/alpaca-trade-api'],
  async headers() {
    return [
      {
        source: '/api/:path*', // Applies to all API routes
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' }, // Allow all origins, or specify a domain like 'https://your-domain.com'
          { key: 'Access-Control-Allow-Methods', value: 'GET,POST,PUT,DELETE,OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'Content-Type, Authorization' },
          { key: 'Access-Control-Allow-Credentials', value: 'true' }, // If you need to send cookies/auth headers
        ],
      },
    ];
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: '/api/:path*',
      },
    ];
  },
};

export default nextConfig;
