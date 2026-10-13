import { defineRouting } from "next-intl/routing";

// localeDetection off: the URL path is the only locale source, so an embed
// renders the same language for every viewer.
export const routing = defineRouting({
  locales: ["ar", "de", "en", "es", "fr", "it", "ko", "pl", "pt", "ru", "zh-Hant", "zh-Hans"],
  defaultLocale: "en",
  localePrefix: "as-needed",
  localeDetection: false,
});

export type AppLocale = (typeof routing.locales)[number];
