/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'jwuovbfagngqznzytacx.supabase.co',
        pathname: '/storage/v1/object/public/car-images/**',
      },
    ],
  },
  experimental: {
    serverActions: true,
  },
};
export default nextConfig;
``