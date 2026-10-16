import type { AppLocale } from "@/i18n/routing";

export enum TempUnit {
  C = "°C",
  F = "°F",
}

export enum WindUnit {
  ms = "m/s",
  kmh = "km/h",
  mph = "mph",
  kn = "kn",
}

/** Converts a m/s wind reading to the requested display unit, rounded to 1 dp. Null passes through. */
export function windByUnit(ms: number | null | undefined, unit: WindUnit): number | null {
  if (ms === null || ms === undefined) {
    return null;
  }

  switch (unit) {
    case WindUnit.kmh:
      return Math.round(ms * 3.6 * 10) / 10;
    case WindUnit.mph:
      return Math.round(ms * 2.23694 * 10) / 10;
    case WindUnit.kn:
      return Math.round(ms * 1.94384 * 10) / 10;
    case WindUnit.ms:
      return Math.round(ms * 10) / 10;
  }
}

export interface City {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  forecast: boolean;
  climate: boolean;
  isCapital: boolean;
}

export interface Country {
  id: number;
  name: string;
  cities: Array<City>;
  organisation: {
    name: string;
    logo: string | null;
    url: string | null;
  };
}

export interface FutureWeather {
  issueAt: Date | null;
  forecasts: Array<{
    date: string;
    description: string;
    weather: string;
    temp: {
      min: {
        unit: TempUnit;
        val: number | null;
      };
      max: {
        unit: TempUnit;
        val: number | null;
      };
    };
    icon: string | null;
  }>;
}

export interface PresentWeather {
  issueAt: Date | null;
  temp: {
    unit: TempUnit;
    val: number | null;
  };
  rh: number | null;
  weather: string | null;
  icon: string | null;
  wind: {
    direction: string;
    speed: number;
    unit: WindUnit;
  } | null;
  sun: {
    rise: Date | null;
    set: Date | null;
  };
}

/**
 * Represents the response structure for a weather forecast from `/{local}/json/{city_id}_{local}.xml`.
 */
export type WmoForecastResponse = {
  city: {
    cityId: number;
    cityLatitude: string;
    cityLongitude: string;
    cityName: string;
    climate: string;
    forecast: {
      forecastDay: Array<{
        forecastDate: string;
        maxTemp: string;
        maxTempF: string;
        minTemp: string;
        minTempF: string;
        weather: string;
        weatherIcon: number;
        wxdesc: string;
      }>;
      issueDate: string;
      timeZone: string;
    };
    isCapital: boolean;
    isDST: "Y" | "N";
    isDep: boolean;
    lang: string;
    member: {
      logo: string;
      memId: number;
      memName: string;
      orgName: string;
      ra: number;
      shortMemName: string;
      url: string;
    };
    stationName: string;
    timeZone: string;
    tourismBoardName: string;
    tourismURL: string;
  };
};

/**
 * Represents the response structure for a country information from `/{local}/json/Country_{local}.xml`.
 */
export type WmoCountryResponse = {
  member: Record<
    string,
    {
      city?: Array<{
        cityId: number;
        cityLatitude: string;
        cityLongitude: string;
        cityName: string;
        climate: "Y" | "N";
        enName: string;
        forecast: "Y" | "N";
        isCapital: boolean;
        isDep: boolean;
        stationName: string;
        timeZone: string;
        tourismURL: string;
        tourismBoardName: string;
      }>;
      countryLatitude: string;
      countryLongitude: string;
      logo: string;
      memId: number;
      memName: string;
      orgName: string;
      ra: number;
      shortMemName: string;
      szmlv: number;
      url: string;
      zoomlv: 6;
    }
  >;
};

/**
 * Represents the response structure for a present weather from `/{local}/json/present.xml`.
 */
export type WmoPresentWxResponse = {
  present: Array<{
    cityId: number;
    daynightcode: "" | "a" | "b";
    iconNum: string;
    issue: string;
    moonrise: string;
    moonset: string;
    rh: "" | number;
    stnId: string;
    stnName: string;
    sundate: string;
    sunrise: string;
    sunset: string;
    temp: "" | number;
    wd: string;
    ws: string;
    wxImageCode: string;
    wxdesc: string;
  }>;
};

const wmoUrl = "https://worldweather.wmo.int";

// WMO serves Chinese under `tc`/`zh` and Korean under `kr`.
// Every other code equals the app locale.
const wmoCode: Record<AppLocale, string> = {
  ar: "ar",
  de: "de",
  en: "en",
  es: "es",
  fr: "fr",
  it: "it",
  ko: "kr",
  pl: "pl",
  pt: "pt",
  ru: "ru",
  "zh-Hant": "tc",
  "zh-Hans": "zh",
};

/**
 * Generates the URL for a WMO weather icon based on the icon ID.
 *
 * @param id - The four-digit icon ID.
 * @param daynightCode - Code that indicate day or night version (if available).
 * @returns The URL of the weather icon.
 */
function wxIconUrl(id: string, daynightCode: string) {
  return `${wmoUrl}/images/i${parseInt(id.slice(0, id.length - 2))}${daynightCode}.png`;
}

/** Fetches a URL and parses its JSON body, mapping parse failures to a descriptive error. */
async function getJson<T>(url: string): Promise<T> {
  const res = await fetch(url);
  try {
    return await res.json();
  } catch {
    throw new Error(`WMO returned invalid JSON: ${url}`);
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
function parseTemp(celsius: string, fahrenheit: string, unit: TempUnit): number | null {
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
function mapForecasts(json: WmoForecastResponse, unit: TempUnit, days: number): FutureWeather {
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
        icon: day.weatherIcon != 0 ? wxIconUrl(day.weatherIcon.toString(), "") : null,
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
 * @param windUnit - The wind speed unit (m/s, km/h, mph or kn).
 * @returns The present weather data.
 */
function mapPresent(
  json: WmoPresentWxResponse,
  cityId: number,
  unit: TempUnit,
  windUnit: WindUnit,
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
            speed: windByUnit(parseFloat(wx.ws), windUnit) as number,
            unit: windUnit,
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
  locale: AppLocale,
  unit: TempUnit,
  days: number,
): Promise<FutureWeather> {
  const apiLocale = wmoCode[locale];
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
 * @param windUnit - The wind speed unit (m/s, km/h, mph or kn).
 * @returns A promise that resolves to the present weather data.
 */
export async function present(
  cityId: number,
  locale: AppLocale,
  unit: TempUnit,
  windUnit: WindUnit,
): Promise<PresentWeather> {
  const json = await getJson<WmoPresentWxResponse>(`${wmoUrl}/${wmoCode[locale]}/json/present.xml`);

  return mapPresent(json, cityId, unit, windUnit);
}

/**
 * Fetches the data of list of countries.
 *
 * @param locale - The locale code.
 * @returns A promise that resolves to an array of countries.
 */
export async function countries(locale: AppLocale): Promise<Array<Country>> {
  const apiLocale = wmoCode[locale];
  const json = await getJson<WmoCountryResponse>(
    `${wmoUrl}/${apiLocale}/json/Country_${apiLocale}.xml`,
  );

  return mapCountries(json);
}

/**
 * Fetches the data of a specific city.
 *
 * @param cityId - The ID of the city.
 * @param locale - The locale code.
 * @returns A promise that resolves to the city data.
 */
export async function city(cityId: number, locale: AppLocale) {
  return (await countries(locale)).flatMap((c) => c.cities).find((el) => el.id == cityId);
}
