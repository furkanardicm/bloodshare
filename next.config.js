/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@radix-ui/react-avatar', '@radix-ui/react-scroll-area'],
  images: {
    domains: ['lh3.googleusercontent.com', 'avatars.githubusercontent.com'],
  },
}

module.exports = nextConfig 