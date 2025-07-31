/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'instagram.fbni1-2.fna.fbcdn.net'
      },
      {
        protocol: 'https',
        hostname: 'scontent.cdninstagram.com'
      },
      {
        protocol: 'https',
        hostname: 'scontent-iad3-1.cdninstagram.com'
      },
      {
        protocol: 'https',
        hostname: 'scontent-lhr8-1.cdninstagram.com'
      },
      {
        protocol: 'https',
        hostname: 'scontent-ams4-1.cdninstagram.com'
      },
      {
        protocol: 'https',
        hostname: 'scontent-fra5-1.cdninstagram.com'
      },
      {
        protocol: 'https',
        hostname: 'scontent-sjc2-1.cdninstagram.com'
      },
      {
        protocol: 'https',
        hostname: 'scontent-syd2-1.cdninstagram.com'
      }
    ],
  },
}

export default nextConfig
