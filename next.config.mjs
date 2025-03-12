/*
Configures Next.js for the app.
*/

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Image optimization configuration
  images: {
    domains: ['localhost'],
    remotePatterns: [
      {
        // Supabase storage for receipt and payment proof images
        protocol: 'https',
        hostname: '*.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
      {
        // Clerk user avatars
        protocol: 'https',
        hostname: 'img.clerk.com',
      },
    ],
  },
  
  // Add security headers
  headers: async () => {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
    ]
  },
  
  // Set up redirects if needed
  redirects: async () => {
    return []
  },
  
  // Webpack configuration for optimizations if needed
  webpack: (config, { isServer }) => {
    // Your custom webpack configurations
    return config
  },
}

export default nextConfig
