// Update next.config.ts to support standalone output for Docker
const nextConfig = {
  output: 'standalone',
  reactStrictMode: true,
  swcMinify: true,
};

export default nextConfig;
