/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    minimumCacheTTL: 2678400,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'ci.encar.com',
      },
    ],
  },
  serverExternalPackages: ['mongoose'],
};

export default nextConfig;
