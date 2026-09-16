/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    minimumCacheTTL: 2678400,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'ci.encar.com',
      },
      {
        protocol: 'https',
        hostname: 'alkorea.kr',
        pathname: '/upload/data/**',
        search: '',
      },
    ],
  },
  serverExternalPackages: ['mongoose'],
  outputFileTracingIncludes: {
    '/damaged-cars': ['./src/data/alkorea-snapshot.json'],
    '/damaged-cars/*': ['./src/data/alkorea-snapshot.json'],
    '/api/damaged-cars': ['./src/data/alkorea-snapshot.json'],
    '/api/damaged-cars/*': ['./src/data/alkorea-snapshot.json'],
  },
};

export default nextConfig;
