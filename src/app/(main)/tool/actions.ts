"use server";

import {Locale} from "@/libs/wmo/enums";
import * as wmo from "@/libs/wmo/wmo";
import {unstable_cache} from "next/cache";

const getCity = unstable_cache(async (locale: Locale) => {
  return (await wmo.countries(locale)).flatMap((country) => {
    return country.cities?.map((city) => ({
      id: city.id,
      name: `${country.name} - ${city.name}`,
    }));
  });
});

export {getCity};
