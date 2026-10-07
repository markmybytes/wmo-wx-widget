import type {NextConfig} from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/lib/i18n.ts");

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
