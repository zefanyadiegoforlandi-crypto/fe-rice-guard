


// PENTING:
// next-pwa@5.x TIDAK KOMPATIBEL dengan Next.js 16.x!
// Untuk PWA berjalan normal, gunakan Next.js 14.x (misal: 14.2.3) atau gunakan solusi PWA manual.
// Dokumentasi penggunaan next-pwa (v5):
// const withPWA = require('next-pwa')({ dest: 'public' })
// module.exports = withPWA(nextConfig)
// next-pwa removed — PWA functionality disabled per user request

/**
 * Untuk variabel lingkungan, gunakan file .env.local di root project frontend:
 * NEXT_PUBLIC_API_URL=http://localhost:8000/api
 *
 * Jangan letakkan properti env di dalam next.config.js!
 */

// no PWA wrapper

const nextConfig = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'X-XSS-Protection', value: '1; mode=block' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(self), microphone=(self), geolocation=()' },
        ],
      },
      {
        source: '/api/:path*',
        headers: [
          { key: 'Cache-Control', value: 'no-cache, no-store, must-revalidate' },
        ],
      },
      {
        source: '/(.*)',
        headers: [
          { key: 'Cache-Control', value: 'public, s-maxage=3600, stale-while-revalidate=86400' },
        ],
        has: [{ type: 'query', key: 'page' }],
      },
    ];
  },
};

export default nextConfig;


