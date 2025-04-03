import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/libs/i18n.ts");

/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    appTitle: "wmo-wx-widget",
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "worldweather.wmo.int",
      },
      {
        protocol: "https",
        hostname: "github.githubassets.com",
      },
    ],
  },
  output: "standalone",
};

export default withNextIntl(nextConfig);
