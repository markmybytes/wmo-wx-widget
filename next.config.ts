import type {NextConfig} from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
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
