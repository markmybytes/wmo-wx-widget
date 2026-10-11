"use server";

import type { AppLocale } from "@/i18n/routing";
import { getCachedCountries } from "@/lib/wmo-cached";

export async function getCity(locale: AppLocale) {
  return (await getCachedCountries(locale)).flatMap((country) =>
    country.cities.map((city) => ({
      value: city.id.toString(),
      label: `${country.name} - ${city.name}`,
    })),
  );
}
