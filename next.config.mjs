/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  trailingSlash: true,
  images: {
    formats: ['image/avif', 'image/webp'],
  },
  async redirects() {
    return [
      // 301 redirects for legacy routes if needed
      {
        source: '/home',
        destination: '/',
        permanent: true,
      },
      {
        source: '/services',
        destination: '/how-surrogacy-works/',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
