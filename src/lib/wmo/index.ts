import type { AppLocale } from "@/i18n/routing";
import { TempUnit, WindUnit, windByUnit } from "./units";
import {
  getJson,
  parseIssueAt,
  parseIssueTime,
  parseSunTime,
  parseTemp,
  toDisplayTemp,
  wmoCode,
  wmoUrl,
  wxIconUrl,
  type WmoCountryResponse,
  type WmoForecastResponse,
  type WmoPresentWxResponse,
} from "./wire";

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
 * Builds a WMO client.
 *
 * @param opts.cache - Optional raw-payload cache. TTLs and cache keys are the
 * lib's business; the adapter only stores.
 */
export function createWmoClient({
  cache,
}: {
  cache?: {
    get(key: string): Promise<unknown | undefined>;
    set(key: string, value: unknown, ttlMs: number): Promise<void>;
  };
} = {}) {
  /** In-flight loads per key, so concurrent misses for one key fetch once. */
  const inflight = new Map<string, Promise<unknown>>();

  async function withCache<T>(key: string, ttlMs: number, fn: () => Promise<T>): Promise<T> {
    if (!cache) {
      return fn();
    }

    const hit = await cache.get(key);
    if (hit !== undefined) {
      return hit as T;
    }

    const pending = inflight.get(key) as Promise<T> | undefined;
    if (pending) {
      return pending;
    }

    const promise = (async () => {
      const value = await fn();
      await cache.set(key, value, ttlMs);
      return value;
    })();
    inflight.set(key, promise);
    try {
      return await promise;
    } finally {
      inflight.delete(key);
    }
  }

  function countries(locale: AppLocale): Promise<Array<Country>> {
    return withCache(`feed:${locale}`, 86_400_000, async () => {
      const apiLocale = wmoCode[locale];
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
    });
  }

  return {
    /**
     * Present weather for a city.
     *
     * Drawn from the locale-wide current-conditions feed (15-minute TTL).
     *
     * @param cityId - The WMO city ID.
     * @param locale - App locale; selects the WMO language feed.
     * @param unit - Temperature display unit.
     * @param windUnit - Wind speed display unit.
     * @returns Current conditions at the city.
     * @throws {RangeError} When the feed carries no entry for the city.
     */
    present: async (cityId: number, locale: AppLocale, unit: TempUnit, windUnit: WindUnit) => {
      const raw = await withCache(`present:${locale}`, 900_000, () =>
        getJson<WmoPresentWxResponse>(`${wmoUrl}/${wmoCode[locale]}/json/present.xml`),
      );

      const wx = Object.values(raw.present).find((v) => v.cityId == cityId);

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
    },

    /**
     * Multi-day weather forecast for a city.
     *
     * Drawn from the city's forecast feed (1-hour TTL). Truncated to `days`
     * entries, at least one.
     *
     * The city ID is not validated here. The upstream feed answers unknown
     * IDs with HTTP 200 and placeholder data.
     *
     * @param cityId - The WMO city ID.
     * @param locale - App locale; selects the WMO language feed.
     * @param unit - Temperature display unit.
     * @param days - Forecast days to return; negative-safe, minimum 1.
     * @returns Issue time plus the truncated forecast list.
     */
    forecasts: async (cityId: number, locale: AppLocale, unit: TempUnit, days: number) => {
      const apiLocale = wmoCode[locale];
      const raw = await withCache(`forecast:${cityId}:${locale}`, 3_600_000, () =>
        getJson<WmoForecastResponse>(`${wmoUrl}/${apiLocale}/json/${cityId}_${apiLocale}.xml`),
      );

      const { forecast } = raw.city;
      return {
        issueAt: parseIssueAt(forecast.issueDate, raw.city.timeZone),
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
    },

    /**
     * WMO member directory for a locale.
     *
     * Drawn from the country feed (24-hour TTL). Each entry carries its
     * member cities and organisation info.
     *
     * @param locale - App locale; selects the WMO language feed.
     * @returns Directory of member countries.
     */
    countries,

    /**
     * Looks up a city by ID via the locale-wide directory.
     *
     * @param cityId - The WMO city ID.
     * @param locale - App locale; selects the WMO language feed.
     * @returns The matching city, or null. Null is a result here, not an
     * error. `present` throws a RangeError for an unknown city instead.
     */
    city: async (cityId: number, locale: AppLocale) => {
      const feed = await countries(locale);
      return feed.flatMap((c) => c.cities).find((el) => el.id == cityId) ?? null;
    },
  };
}
