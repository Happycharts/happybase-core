/** @type {import('next').NextConfig} */
const nextConfig = {
    experimental: {
        outputFileTracingIncludes: {
          "/api/destinations": ["./node_modules/mupdf/lib/*.wasm"],
        },
      },
      webpack(config) {
        config.module.rules.push({
          test: /\.svg$/,
          use: ['@svgr/webpack'],
        });
        return config;
    },
};

export default nextConfig;
