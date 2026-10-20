/**
 * WMO wire formats + pure field parsers. Private to this folder: consumed by
 * `index.ts` only, never re-exported.
 *
 * No cacheable, no next imports (the `AppLocale` type is erased), so this
 * module stays import-safe from a client bundle in principle. Exports here are
 * `export`-keyword-only for cross-file access, not public API.
 */
import type { AppLocale } from "@/i18n/routing";
import { TempUnit } from "./units";

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

export const wmoUrl = "https://worldweather.wmo.int";

// WMO serves Chinese under `tc`/`zh` and Korean under `kr`.
// Every other code equals the app locale.
export const wmoCode: Record<AppLocale, string> = {
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
export function wxIconUrl(id: string, daynightCode: string) {
  return `${wmoUrl}/images/i${parseInt(id.slice(0, id.length - 2))}${daynightCode}.png`;
}

/** Fetches a WMO feed and parses its JSON body; throws on HTTP errors and malformed payloads. */
export async function getJson<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`WMO request failed: ${res.status} ${res.statusText} — ${url}`);
  }
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
export function parseIssueTime(issue: string): Date | null {
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
export function parseIssueAt(issueDate: string, timeZone: string): Date | null {
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
export function parseSunTime(sundate: string, time: string): Date | null {
  const d = /^(\d{4})(\d{2})(\d{2})$/.exec(sundate);
  const t = /^(\d{1,2}):(\d{2})$/.exec(time);
  if (!d || !t) {
    return null;
  }
  return new Date(+d[1], +d[2] - 1, +d[3], +t[1], +t[2]);
}

/** Picks the requested unit's raw reading and parses it, or null when absent. */
export function parseTemp(celsius: string, fahrenheit: string, unit: TempUnit): number | null {
  const raw = unit === TempUnit.F ? fahrenheit : celsius;
  return raw === "" ? null : parseInt(raw);
}

/** Converts a present-weather Celsius reading to the requested unit. */
export function toDisplayTemp(celsius: number | "", unit: TempUnit): number | null {
  if (celsius === "") {
    return null;
  }
  if (unit === TempUnit.C) {
    return celsius;
  }
  return Math.round(((celsius * 9) / 5 + 32 + Number.EPSILON) * 100) / 100;
}
