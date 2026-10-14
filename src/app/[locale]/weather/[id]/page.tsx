import { TempUnit } from "@/lib/wmo";
import type { AppLocale } from "@/i18n/routing";
import { getCachedCity, getCachedForecasts, getCachedPresent } from "@/lib/wmo-cached";
import { Metadata } from "next";
import WeatherCards from "@/components/weather/WeatherCards";
import WeatherEditorial from "@/components/weather/WeatherEditorial";
import WeatherBars from "@/components/weather/WeatherBars";
import WeatherSwiss from "@/components/weather/WeatherSwiss";
import WeatherPills from "@/components/weather/WeatherPills";
import WeatherTelemetry from "@/components/weather/WeatherTelemetry";
import { getLocale, getTranslations } from "next-intl/server";
import ForecastCards from "@/components/weather/ForecastCards";
import ForecastEditorial from "@/components/weather/ForecastEditorial";
import ForecastBars from "@/components/weather/ForecastBars";
import ForecastSwiss from "@/components/weather/ForecastSwiss";
import ForecastPills from "@/components/weather/ForecastPills";
import ForecastTelemetry from "@/components/weather/ForecastTelemetry";
import { notFound } from "next/navigation";

type WidgetStyle = "cards" | "editorial" | "bars" | "swiss" | "pills" | "telemetry";

// Swiss precision is the default style: clean 2-band hierarchy, balanced contrast,
// and optimal vertical footprint across narrow and wide viewport embeds.
const DEFAULT_STYLE: WidgetStyle = "swiss";

// Allowlist of recognized styles. No backwards-compatibility aliases;
// missing or unrecognized style params opt into default "swiss".
const VALID_STYLES: Record<string, WidgetStyle> = {
  cards: "cards",
  editorial: "editorial",
  bars: "bars",
  swiss: "swiss",
  pills: "pills",
  telemetry: "telemetry",
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

  const { unit, days, align, style, showWeekday, showDate, weather, forecast } =
    parseWidgetParams(searchParams);

  const city = await getCachedCity(params.id, locale);
  if (city === null) {
    return notFound();
  }

  return (
    <main
      className={`flex min-h-svh bg-background motion-safe:animate-fade-up ${
        alignClass[align] ?? alignClass["start"]
      }`}
    >
      <div className="flex w-full flex-col items-stretch gap-2 p-2 md:flex-row md:gap-x-2">
        {weather ? (
          style === "cards" ? (
            <WeatherCards
              city={city}
              weather={await getCachedPresent(params.id, locale, unit)}
              style={style}
            />
          ) : style === "editorial" ? (
            <WeatherEditorial
              city={city}
              weather={await getCachedPresent(params.id, locale, unit)}
              style={style}
            />
          ) : style === "bars" ? (
            <WeatherBars
              city={city}
              weather={await getCachedPresent(params.id, locale, unit)}
              style={style}
            />
          ) : style === "pills" ? (
            <WeatherPills
              city={city}
              weather={await getCachedPresent(params.id, locale, unit)}
              style={style}
            />
          ) : style === "telemetry" ? (
            <WeatherTelemetry
              city={city}
              weather={await getCachedPresent(params.id, locale, unit)}
              style={style}
            />
          ) : (
            <WeatherSwiss
              city={city}
              weather={await getCachedPresent(params.id, locale, unit)}
              style={style}
            />
          )
        ) : null}

        {forecast ? (
          style === "cards" ? (
            <ForecastCards
              locale={locale}
              weather={await getCachedForecasts(params.id, locale, unit, days)}
              style={style}
              showWeekday={showWeekday}
              showDate={showDate}
            />
          ) : style === "editorial" ? (
            <ForecastEditorial
              locale={locale}
              weather={await getCachedForecasts(params.id, locale, unit, days)}
              style={style}
              showWeekday={showWeekday}
              showDate={showDate}
            />
          ) : style === "bars" ? (
            <ForecastBars
              locale={locale}
              weather={await getCachedForecasts(params.id, locale, unit, days)}
              style={style}
              showWeekday={showWeekday}
              showDate={showDate}
            />
          ) : style === "pills" ? (
            <ForecastPills
              locale={locale}
              weather={await getCachedForecasts(params.id, locale, unit, days)}
              style={style}
              showWeekday={showWeekday}
              showDate={showDate}
            />
          ) : style === "telemetry" ? (
            <ForecastTelemetry
              locale={locale}
              weather={await getCachedForecasts(params.id, locale, unit, days)}
              style={style}
              showWeekday={showWeekday}
              showDate={showDate}
            />
          ) : (
            <ForecastSwiss
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
