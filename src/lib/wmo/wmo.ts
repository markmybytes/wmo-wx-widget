import { Locale, TempUnit } from "./enums";
import {
  Country,
  FutureWeather,
  PresentWeather,
  WmoCountryResponse,
  WmoForecastResponse,
  WmoPresentWxResponse,
} from "./types";

const wmoUrl = "https://worldweather.wmo.int";

/**
 * Maps an internal locale to the locale used in WMO API URLs.
 * The API uses the country code `kr` for Korean while the internal locale is `ko`.
 */
function toWmoLocale(locale: Locale): string {
  return locale === Locale.KO ? "kr" : locale;
}

/** Fetches a URL and parses its JSON body, mapping parse failures to a locale error. */
async function getJson<T>(url: string): Promise<T> {
  const res = await fetch(url);
  try {
    return await res.json();
  } catch {
    throw new Error("Invalid Locale");
  }
}

/**
 * Converts WMO locale codes to ISO639 codes.
 *
 * @param locale - The WMO locale code to be converted.
 * @returns The corresponding ISO639 code.
 */
export function wmoToIso639(locale: Locale) {
  const mapping = {
    ar: "ar",
    en: "en",
    tc: "zh-Hant",
    zh: "zh-Hans",
    fr: "fr",
    de: "de",
    it: "it",
    ko: "ko",
    pl: "pl",
    pt: "pt",
    ru: "ru",
    es: "es",
  };

  return mapping[locale] || locale;
}

/**
 * Generates the URL for a WMO weather icon based on the icon ID.
 *
 * @param id - The four-digit icon ID.
 * @param daynightCode - Code that indicate day or night version (if available).
 * @returns The URL of the weather icon.
 */
export function wxIconUrl(id: string, daynightCode: string) {
  return `${wmoUrl}/images/i${parseInt(
    id.slice(0, id.length - 2),
  )}${daynightCode}.png`;
}

/**
 * Fetches the forecast data for a specified city.
 *
 * @param cityId - The ID of the city.
 * @param locale - The locale code.
 * @param unit - The temperature unit (Celsius or Fahrenheit).
 * @param days - The number of days for the forecast.
 * @returns A promise that resolves to the forecast data.
 */
export async function forecasts(
  cityId: number,
  locale: Locale,
  unit: TempUnit,
  days: number,
): Promise<FutureWeather> {
  const apiLocale = toWmoLocale(locale);
  const json = await getJson<WmoForecastResponse>(
    `${wmoUrl}/${apiLocale}/json/${cityId}_${apiLocale}.xml`,
  );

  return {
    issueAt:
      json.city.forecast.issueDate != "N/A"
        ? new Date(json.city.forecast.issueDate + json.city.timeZone)
        : null,
    forecasts: json.city.forecast.forecastDay
      .map((forecast) => ({
        date: forecast.forecastDate,
        description: forecast.wxdesc,
        weather: forecast.weather,
        temp: {
          min: {
            unit: unit,
            val:
              (unit == TempUnit.C && forecast.minTemp !== "") ||
              (unit == TempUnit.F && forecast.minTempF !== "")
                ? parseInt(
                    unit == TempUnit.C ? forecast.minTemp : forecast.minTempF,
                  )
                : null,
          },
          max: {
            unit: unit,
            val:
              (unit == TempUnit.C && forecast.maxTemp !== "") ||
              (unit == TempUnit.F && forecast.maxTempF !== "")
                ? parseInt(
                    unit == TempUnit.C ? forecast.maxTemp : forecast.maxTempF,
                  )
                : null,
          },
        },
        icon:
          forecast.weatherIcon != 0
            ? wxIconUrl(forecast.weatherIcon.toString(), "")
            : "/images/question_mark.png",
      }))
      .slice(0, Math.max(Math.abs(days), 1)),
  };
}

/**
 * Fetches the present weather data for a specified city.
 *
 * @param cityId - The ID of the city.
 * @param locale - The locale code.
 * @param unit - The temperature unit (Celsius or Fahrenheit).
 * @returns A promise that resolves to the present weather data.
 */
export async function present(
  cityId: number,
  locale: Locale,
  unit: TempUnit,
): Promise<PresentWeather> {
  const json = await getJson<WmoPresentWxResponse>(
    `${wmoUrl}/${toWmoLocale(locale)}/json/present.xml`,
  );

  let wx;
  try {
    wx = Object.entries(json.present).filter(
      ([_, v]) => v.cityId == cityId,
    )[0][1];
  } catch {
    throw new Error("Invalid City ID");
  }

  if (!wx) {
    throw new RangeError(`No data for the city (id: ${cityId})`);
  }

  return {
    issueAt: wx.issue
      ? new Date(
          Number(wx.issue.slice(0, 4)),
          Number(wx.issue.slice(5, 6)),
          Number(wx.issue.slice(7, 8)),
          Number(wx.issue.slice(9, 10)),
          Number(wx.issue.slice(11, 12)),
        )
      : null,
    temp: {
      unit: unit,
      val:
        wx.temp !== ""
          ? unit == TempUnit.C
            ? wx.temp
            : Math.round(((wx.temp * 9) / 5 + 32 + Number.EPSILON) * 100) / 100
          : null,
    },
    rh: wx.rh || null,
    weather: wx.wxdesc,
    icon:
      wx.iconNum !== ""
        ? wxIconUrl(wx.iconNum, wx.daynightcode)
        : "/images/question_mark.png",
    wind:
      wx.wd !== "" && wx.ws !== ""
        ? {
            direction: wx.wd,
            speed:
              wx.ws !== "" ? Math.round(parseFloat(wx.ws) * 10) / 10 : null,
          }
        : null,
    sun: {
      rise: new Date(
        Number(wx.sundate.slice(0, 4)),
        Number(wx.sundate.slice(5, 6)),
        Number(wx.sundate.slice(7, 8)),
        Number(wx.sunrise.slice(0, 2)),
        Number(wx.sunrise.slice(3, 4)),
      ),
      set: new Date(
        Number(wx.sundate.slice(0, 4)),
        Number(wx.sundate.slice(5, 6)),
        Number(wx.sundate.slice(7, 8)),
        Number(wx.sunset.slice(0, 2)),
        Number(wx.sunset.slice(3, 4)),
      ),
    },
  };
}

/**
 * Fetches the data of list of countries.
 *
 * @param locale - The locale code.
 * @returns A promise that resolves to an array of countries.
 */
export async function countries(locale: Locale): Promise<Array<Country>> {
  const apiLocale = toWmoLocale(locale);
  const json = await getJson<WmoCountryResponse>(
    `${wmoUrl}/${apiLocale}/json/Country_${apiLocale}.xml`,
  );

  const countries: Array<Country> = [];
  for (const [k, country] of Object.entries(json.member)) {
    if (k == "lang") {
      continue;
    }

    countries.push({
      id: country.memId,
      name: country.memName,
      cities: country.city?.map((c) => ({
        id: c.cityId,
        name: c.cityName,
        latitude: parseFloat(c.cityLatitude),
        longitude: parseFloat(c.cityLongitude),
        forecast: c.forecast === "Y",
        climate: c.climate === "Y",
        isCapital: c.isCapital,
      })),
      organisation: {
        name: country.orgName,
        logo: country.logo ? wmoUrl + `/images/logo/${country.logo}` : null,
        url: country.url || null,
      },
    });
  }
  return countries;
}

/**
 * Fetches the weather data for a specific city.
 *
 * @param cityId - The ID of the city.
 * @param locale - The locale code.
 * @returns A promise that resolves to the city data.
 */
export async function city(cityId: number, locale: Locale) {
  return (await countries(locale))
    .flatMap((c) => c.cities)
    .find((el) => el.id == cityId);
}
