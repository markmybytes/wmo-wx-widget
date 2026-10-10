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
function wxIconUrl(id: string, daynightCode: string) {
  return `${wmoUrl}/images/i${parseInt(
    id.slice(0, id.length - 2),
  )}${daynightCode}.png`;
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
 * Parses a compact WMO timestamp (`YYYYMMDDHHmm`) as the city's local wall-clock
 * time. Returns null for empty or malformed input.
 */
function parseIssueTime(issue: string): Date | null {
  const m = /^(\d{4})(\d{2})(\d{2})(\d{2})(\d{2})$/.exec(issue);
  if (!m) {
    return null;
  }
  return new Date(+m[1], +m[2] - 1, +m[3], +m[4], +m[5]);
}

/**
 * Parses a forecast issue (`YYYY-MM-DD HH:mm:ss`) plus a `+HHmm`/`+HH:MM` zone
 * offset into the absolute instant it represents. Returns null for `N/A`/empty.
 */
function parseIssueAt(issueDate: string, timeZone: string): Date | null {
  if (!issueDate || issueDate === "N/A") {
    return null;
  }
  const offset = /^([+-])(\d{2}):?(\d{2})$/.exec(timeZone);
  const iso = `${issueDate.replace(" ", "T")}${
    offset ? `${offset[1]}${offset[2]}:${offset[3]}` : ""
  }`;
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? null : date;
}

/**
 * Parses a sun date (`YYYYMMDD`) and time (`HH:mm`) as the city's local
 * wall-clock time. Returns null for empty or malformed input.
 */
function parseSunTime(sundate: string, time: string): Date | null {
  const d = /^(\d{4})(\d{2})(\d{2})$/.exec(sundate);
  const t = /^(\d{1,2}):(\d{2})$/.exec(time);
  if (!d || !t) {
    return null;
  }
  return new Date(+d[1], +d[2] - 1, +d[3], +t[1], +t[2]);
}

/** Picks the requested unit's raw reading and parses it, or null when absent. */
function parseTemp(
  celsius: string,
  fahrenheit: string,
  unit: TempUnit,
): number | null {
  const raw = unit === TempUnit.F ? fahrenheit : celsius;
  return raw === "" ? null : parseInt(raw);
}

/** Converts a present-weather Celsius reading to the requested unit. */
function toDisplayTemp(celsius: number | "", unit: TempUnit): number | null {
  if (celsius === "") {
    return null;
  }
  if (unit === TempUnit.C) {
    return celsius;
  }
  return Math.round(((celsius * 9) / 5 + 32 + Number.EPSILON) * 100) / 100;
}

/**
 * Maps a parsed `{cityId}_{locale}.xml` response to the forecast domain object.
 * Pure — no network — so the mapping itself is independently testable.
 *
 * @param json - The parsed WMO forecast response.
 * @param unit - The temperature unit (Celsius or Fahrenheit).
 * @param days - The number of days for the forecast.
 * @returns The forecast data.
 */
function mapForecasts(
  json: WmoForecastResponse,
  unit: TempUnit,
  days: number,
): FutureWeather {
  const { forecast } = json.city;

  return {
    issueAt: parseIssueAt(forecast.issueDate, json.city.timeZone),
    forecasts: forecast.forecastDay
      .map((day) => ({
        date: day.forecastDate,
        description: day.wxdesc,
        weather: day.weather,
        temp: {
          min: { unit, val: parseTemp(day.minTemp, day.minTempF, unit) },
          max: { unit, val: parseTemp(day.maxTemp, day.maxTempF, unit) },
        },
        icon:
          day.weatherIcon != 0
            ? wxIconUrl(day.weatherIcon.toString(), "")
            : null,
      }))
      .slice(0, Math.max(Math.abs(days), 1)),
  };
}

/**
 * Maps a parsed `present.xml` response to the present-weather domain object for
 * one city. Pure — no network — so the mapping itself is independently testable.
 *
 * @param json - The parsed WMO present-weather response.
 * @param cityId - The ID of the city.
 * @param unit - The temperature unit (Celsius or Fahrenheit).
 * @returns The present weather data.
 */
function mapPresent(
  json: WmoPresentWxResponse,
  cityId: number,
  unit: TempUnit,
): PresentWeather {
  const wx = Object.values(json.present).find((v) => v.cityId == cityId);

  if (!wx) {
    throw new RangeError(`No data for the city (id: ${cityId})`);
  }

  return {
    issueAt: parseIssueTime(wx.issue),
    temp: {
      unit,
      val: toDisplayTemp(wx.temp, unit),
    },
    rh: wx.rh || null,
    weather: wx.wxdesc,
    icon: wx.iconNum !== "" ? wxIconUrl(wx.iconNum, wx.daynightcode) : null,
    wind:
      wx.wd !== "" && wx.ws !== ""
        ? {
            direction: wx.wd,
            speed: Math.round(parseFloat(wx.ws) * 10) / 10,
          }
        : null,
    sun: {
      rise: parseSunTime(wx.sundate, wx.sunrise),
      set: parseSunTime(wx.sundate, wx.sunset),
    },
  };
}

/**
 * Maps a parsed `Country_{locale}.xml` response to the country domain objects.
 * Pure — no network — so the mapping itself is independently testable.
 *
 * @param json - The parsed WMO country response.
 * @returns An array of countries.
 */
function mapCountries(json: WmoCountryResponse): Array<Country> {
  const countries: Array<Country> = [];
  for (const [k, country] of Object.entries(json.member)) {
    if (k == "lang") {
      continue;
    }

    countries.push({
      id: country.memId,
      name: country.memName,
      cities: (country.city ?? []).map((c) => ({
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

  return mapForecasts(json, unit, days);
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

  return mapPresent(json, cityId, unit);
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

  return mapCountries(json);
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
