"use server";

import {Locale} from "@/libs/wmo/enums";
import * as wmo from "@/libs/wmo/wmo";
import {unstable_cache} from "next/cache";

const getCity = unstable_cache(async (locale: Locale) => {
  return (await wmo.cities(locale)).map((city) => {
    return {
      id: city.id,
      name: city.name,
    };
  });
});
export {getCity};
