"use server";

import { Locale } from "@/lib/wmo/enums";
import * as wmo from "@/lib/wmo/wmo";
import { unstable_cache } from "next/cache";

// ponytail: `unstable_cache` is still current in Next 16; the `"use cache"`
// directive needs `cacheComponents: true` (not enabled), so keep the simpler API.
const getCity = unstable_cache(async (locale: Locale) => {
  return (await wmo.countries(locale)).flatMap((country) => {
    return country.cities.map((city) => ({
      value: city.id.toString(),
      label: `${country.name} - ${city.name}`,
    }));
  });
});

export { getCity };
