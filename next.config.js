/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  output: 'export',
  images: {
    unoptimized: true,
  },
  distDir: 'apps/image-compressor',
  basePath: '/apps/image-compressor',
  assetPrefix: '/apps/image-compressor/',
  env: {
    NEXT_PUBLIC_API_URL: '/apps/image-compressor',
  },
}

module.exports = nextConfig 