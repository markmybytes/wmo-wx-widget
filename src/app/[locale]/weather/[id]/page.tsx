import { TempUnit, WindUnit } from "@/lib/wmo";
import type { AppLocale } from "@/i18n/routing";
import { getCachedCity, getCachedForecasts, getCachedPresent } from "@/lib/wmo-cached";
import { Metadata } from "next";
import WeatherClassic from "@/components/weather/WeatherClassic";
import WeatherMasthead from "@/components/weather/WeatherMasthead";
import WeatherRangeBars from "@/components/weather/WeatherRangeBars";
import WeatherPrecision from "@/components/weather/WeatherPrecision";
import WeatherCapsule from "@/components/weather/WeatherCapsule";
import WeatherBeacon from "@/components/weather/WeatherBeacon";
import { getLocale, getTranslations } from "next-intl/server";
import ForecastClassic from "@/components/weather/ForecastClassic";
import ForecastMasthead from "@/components/weather/ForecastMasthead";
import ForecastRangeBars from "@/components/weather/ForecastRangeBars";
import ForecastPrecision from "@/components/weather/ForecastPrecision";
import ForecastCapsule from "@/components/weather/ForecastCapsule";
import ForecastBeacon from "@/components/weather/ForecastBeacon";
import { notFound } from "next/navigation";

type WidgetStyle = "classic" | "masthead" | "range-bars" | "precision" | "capsule" | "beacon";

// Precision is the default style: clean 2-band hierarchy, balanced contrast,
// and optimal vertical footprint across narrow and wide viewport embeds.
const DEFAULT_STYLE: WidgetStyle = "precision";

// Allowlist of recognized styles. No backwards-compatibility aliases;
// missing or unrecognized style params opt into default "precision".
const VALID_STYLES: Record<string, WidgetStyle> = {
  classic: "classic",
  masthead: "masthead",
  "range-bars": "range-bars",
  precision: "precision",
  capsule: "capsule",
  beacon: "beacon",
};

function str2bool(s: string): boolean {
  return ["true", "yes", "1"].includes(s);
}

const alignClass: Record<string, string> = {
  center: "items-center",
  end: "items-end",
  start: "items-start",
};

function parseWidgetParams(sp: { [key: string]: string } | undefined): {
  unit: TempUnit;
  wind: WindUnit;
  days: number;
  align: "start" | "center" | "end";
  style: WidgetStyle;
  showWeekday: boolean;
  showDate: boolean;
  weather: boolean;
  forecast: boolean;
} {
  return {
    unit: TempUnit[sp?.unit?.toUpperCase() as keyof typeof TempUnit] || TempUnit["C"],
    // WindUnit enum keys are lowercase (ms/kmh/mph/kn); the URL tokens mirror them.
    wind: WindUnit[sp?.wind?.toLowerCase() as keyof typeof WindUnit] || WindUnit["ms"],
    days: parseInt(sp?.days ?? "5"),
    align: sp?.align === "center" || sp?.align === "end" ? sp.align : "start",
    style: (sp?.style && VALID_STYLES[sp.style]) || DEFAULT_STYLE,
    showWeekday: sp?.weekday !== undefined ? str2bool(sp.weekday.toLowerCase()) : true,
    showDate: sp?.date !== undefined ? str2bool(sp.date.toLowerCase()) : true,
    weather: str2bool(sp?.weather?.toLowerCase() || "true"),
    // The misspelled key "forcast" is the public URL contract.
    forecast: str2bool(sp?.forcast?.toLowerCase() || "true"),
  };
}

export async function generateMetadata(props: {
  params: Promise<{ id: number }>;
}): Promise<Metadata> {
  const params = await props.params;
  const locale = (await getLocale()) as AppLocale;
  const t = await getTranslations("meta");

  return {
    title: [
      t("titleForecast", {
        location: (await getCachedCity(params.id, locale))?.name || "N/A",
      }),
      process.env.appTitle,
    ].join(" | "),
  };
}

export default async function Page(props: {
  params: Promise<{ id: number }>;
  searchParams?: Promise<{ [key: string]: string }>;
}) {
  const [params, searchParams] = await Promise.all([props.params, props.searchParams]);

  const locale = (await getLocale()) as AppLocale;

  const { unit, wind, days, align, style, showWeekday, showDate, weather, forecast } =
    parseWidgetParams(searchParams);

  const city = await getCachedCity(params.id, locale);
  if (city === null) {
    return notFound();
  }

  return (
    <main
      className={`@container flex min-h-svh bg-background ${
        alignClass[align] ?? alignClass["start"]
      }`}
    >
      <div className="flex w-full flex-col items-stretch gap-2 p-2 md:flex-row md:gap-x-2">
        {weather ? (
          style === "classic" ? (
            <WeatherClassic
              city={city}
              weather={await getCachedPresent(params.id, locale, unit, wind)}
              style={style}
            />
          ) : style === "masthead" ? (
            <WeatherMasthead
              city={city}
              weather={await getCachedPresent(params.id, locale, unit, wind)}
              style={style}
            />
          ) : style === "range-bars" ? (
            <WeatherRangeBars
              city={city}
              weather={await getCachedPresent(params.id, locale, unit, wind)}
              style={style}
            />
          ) : style === "capsule" ? (
            <WeatherCapsule
              city={city}
              weather={await getCachedPresent(params.id, locale, unit, wind)}
              style={style}
            />
          ) : style === "beacon" ? (
            <WeatherBeacon
              city={city}
              weather={await getCachedPresent(params.id, locale, unit, wind)}
              style={style}
            />
          ) : (
            <WeatherPrecision
              city={city}
              weather={await getCachedPresent(params.id, locale, unit, wind)}
              style={style}
            />
          )
        ) : null}

        {forecast ? (
          style === "classic" ? (
            <ForecastClassic
              locale={locale}
              weather={await getCachedForecasts(params.id, locale, unit, days)}
              style={style}
              showWeekday={showWeekday}
              showDate={showDate}
            />
          ) : style === "masthead" ? (
            <ForecastMasthead
              locale={locale}
              weather={await getCachedForecasts(params.id, locale, unit, days)}
              style={style}
              showWeekday={showWeekday}
              showDate={showDate}
            />
          ) : style === "range-bars" ? (
            <ForecastRangeBars
              locale={locale}
              weather={await getCachedForecasts(params.id, locale, unit, days)}
              style={style}
              showWeekday={showWeekday}
              showDate={showDate}
            />
          ) : style === "capsule" ? (
            <ForecastCapsule
              locale={locale}
              weather={await getCachedForecasts(params.id, locale, unit, days)}
              style={style}
              showWeekday={showWeekday}
              showDate={showDate}
            />
          ) : style === "beacon" ? (
            <ForecastBeacon
              locale={locale}
              weather={await getCachedForecasts(params.id, locale, unit, days)}
              style={style}
              showWeekday={showWeekday}
              showDate={showDate}
            />
          ) : (
            <ForecastPrecision
              locale={locale}
              weather={await getCachedForecasts(params.id, locale, unit, days)}
              style={style}
              showWeekday={showWeekday}
              showDate={showDate}
            />
          )
        ) : null}
      </div>
    </main>
  );
}
