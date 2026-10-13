import { unstable_cache } from "next/cache";
import type { AppLocale } from "@/i18n/routing";
import { city, countries, forecasts, present } from "@/lib/wmo";

/** Next-runtime caching boundary for the pure `@/lib/wmo` module. */

export const getCachedCountries = unstable_cache(countries, ["wmo-countries"], {
  revalidate: 86400,
});

export const getCachedCity = unstable_cache(
  async (cityId: number, locale: AppLocale) => (await city(cityId, locale)) ?? null,
  ["wmo-city"],
  { revalidate: 86400 },
);

export const getCachedPresent = unstable_cache(present, ["wmo-present"], { revalidate: 900 });

export const getCachedForecasts = unstable_cache(forecasts, ["wmo-forecasts"], {
  revalidate: 3600,
});
