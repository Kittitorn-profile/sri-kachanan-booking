import type { NextConfig } from 'next';

// ----------------------------------------------------------------------

/**
 * Static Exports in Next.js
 *
 * 1. Set `isStaticExport = true` in `next.config.{mjs|ts}`.
 * 2. This allows `generateStaticParams()` to pre-render dynamic routes at build time.
 *
 * For more details, see:
 * https://nextjs.org/docs/app/building-your-application/deploying/static-exports
 *
 * NOTE: Remove all "generateStaticParams()" functions if not using static exports.
 */
const isStaticExport = false;

// ----------------------------------------------------------------------

const nextConfig: NextConfig = {
  trailingSlash: true,
  output: isStaticExport ? 'export' : undefined,
  env: {
    BUILD_STATIC_EXPORT: JSON.stringify(isStaticExport),
  },
  async redirects() {
    return [
      {
        source: '/admin/registration-requests',
        destination: '/admin/users/registration-requests',
        permanent: false,
      },
      {
        source: '/admin/customers',
        destination: '/admin/users/customers',
        permanent: false,
      },
      {
        source: '/admin/services',
        destination: '/admin/spa/services/queue',
        permanent: false,
      },
      {
        source: '/admin/services/queue',
        destination: '/admin/spa/services/queue',
        permanent: false,
      },
      {
        source: '/admin/services/working',
        destination: '/admin/spa/services/working',
        permanent: false,
      },
      {
        source: '/admin/staff',
        destination: '/admin/spa/staff',
        permanent: false,
      },
      {
        source: '/admin/availability',
        destination: '/admin/spa/availability',
        permanent: false,
      },
      {
        source: '/admin/revenue',
        destination: '/admin/reports/revenue',
        permanent: false,
      },
      {
        source: '/master/category',
        destination: '/master/service-categories',
        permanent: false,
      },
    ];
  },
  // Without --turbopack (next dev)
  webpack(config, { isServer }) {
    if (!isServer) {
      config.module.rules.push({
        test: /\.(tsx|ts|jsx|js)$/,
        exclude: /node_modules/,
        use: [
          {
            loader: '@locator/webpack-loader',
            options: { env: 'development' },
          },
        ],
      });
    }

    config.module.rules.push({
      test: /\.svg$/,
      use: ['@svgr/webpack'],
    });

    return config;
  },
  // With --turbopack (next dev --turbopack)
  turbopack: {
    rules: {
      '**/*.{tsx,jsx}': {
        loaders: [
          {
            loader: '@locator/webpack-loader',
            options: { env: 'development' },
          },
        ],
      },
      '*.svg': {
        loaders: ['@svgr/webpack'],
        as: '*.js',
      },
    },
  },
};

export default nextConfig;
