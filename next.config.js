/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    // For server-side bundles, ignore .map files from @sparticuz/chromium
    if (isServer) {
      config.module.rules.push({
        test: /\.map$/,
        include: /node_modules\/@sparticuz\/chromium/,
        use: 'null-loader',
      });
    }

    // Important: return the modified config
    return config;
  },
  // If you have other Next.js configurations, they would go here
  // For example:
  // reactStrictMode: true,
};

module.exports = nextConfig;
