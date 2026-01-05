import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable standalone output for Docker deployments
  output: 'standalone',
  // Disable dev source maps to avoid invalid source-map parsing errors
  webpack(config, { dev }) {
    if (dev) {
      // Turn off devtool so Next won't try to load non-conformant source maps
      // from certain node modules during SSR.
      // eslint-disable-next-line no-param-reassign
      config.devtool = false as any;
    }
    return config;
  },
  productionBrowserSourceMaps: false,
  // Provide an explicit (empty) turbopack config so Next's dev server
  // doesn't error when a custom webpack config is present.
  turbopack: {},
};

export default nextConfig;
