"use server";

import type { AppLocale } from "@/i18n/routing";
import * as wmo from "@/lib/wmo/wmo";
import { unstable_cache } from "next/cache";

export const getCity = unstable_cache(async (locale: AppLocale) => {
  return (await wmo.countries(locale)).flatMap((country) =>
    country.cities.map((city) => ({
      value: city.id.toString(),
      label: `${country.name} - ${city.name}`,
    })),
  );
});
