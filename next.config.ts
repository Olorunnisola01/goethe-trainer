import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Allow Firebase Auth profile photos from googleapis
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
      { protocol: 'https', hostname: 'avatars.githubusercontent.com' },
    ],
  },
  reactStrictMode: true,

  // Silence the workspace-root lockfile warning when building locally
  outputFileTracingRoot: process.cwd(),
};

export default nextConfig;
