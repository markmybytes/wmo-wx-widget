"use server";

import { Locale } from "@/lib/wmo/enums";
import * as wmo from "@/lib/wmo/wmo";
import { unstable_cache } from "next/cache";

export const getCity = unstable_cache(async (locale: Locale) => {
  return (await wmo.countries(locale)).flatMap((country) =>
    country.cities.map((city) => ({
      value: city.id.toString(),
      label: `${country.name} - ${city.name}`,
    })),
  );
});
