import { TempUnit } from "@/lib/wmo";
import type { AppLocale } from "@/i18n/routing";
import { getCachedCity, getCachedForecasts, getCachedPresent } from "@/lib/wmo-cached";
import { Metadata } from "next";
import Weather from "@/components/weather/Weather";
import WeatherCards from "@/components/weather/WeatherCards";
import WeatherNew1 from "@/components/weather/WeatherNew1";
import WeatherNew2 from "@/components/weather/WeatherNew2";
import WeatherNew3 from "@/components/weather/WeatherNew3";
import { getLocale, getTranslations } from "next-intl/server";
import Forecast from "@/components/weather/Forecast";
import ForecastCards from "@/components/weather/ForecastCards";
import ForecastNew1 from "@/components/weather/ForecastNew1";
import ForecastNew2 from "@/components/weather/ForecastNew2";
import ForecastNew3 from "@/components/weather/ForecastNew3";
import { notFound } from "next/navigation";

type WidgetStyle = "cards" | "list" | "new-1" | "new-2" | "new-3";

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
    style:
      sp?.style === "list"
        ? "list"
        : sp?.style === "new-1"
          ? "new-1"
          : sp?.style === "new-2"
            ? "new-2"
            : sp?.style === "new-3"
              ? "new-3"
              : "cards",
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
          style === "list" ? (
            <Weather
              city={city}
              weather={await getCachedPresent(params.id, locale, unit)}
              style={style}
            ></Weather>
          ) : style === "new-1" ? (
            <WeatherNew1
              city={city}
              weather={await getCachedPresent(params.id, locale, unit)}
              style={style}
            ></WeatherNew1>
          ) : style === "new-2" ? (
            <WeatherNew2
              city={city}
              weather={await getCachedPresent(params.id, locale, unit)}
              style={style}
            ></WeatherNew2>
          ) : style === "new-3" ? (
            <WeatherNew3
              city={city}
              weather={await getCachedPresent(params.id, locale, unit)}
              style={style}
            ></WeatherNew3>
          ) : (
            <WeatherCards
              city={city}
              weather={await getCachedPresent(params.id, locale, unit)}
            ></WeatherCards>
          )
        ) : null}

        {forecast ? (
          style === "list" ? (
            <Forecast
              locale={locale}
              weather={await getCachedForecasts(params.id, locale, unit, days)}
              style={style}
              showWeekday={showWeekday}
              showDate={showDate}
            ></Forecast>
          ) : style === "new-1" ? (
            <ForecastNew1
              locale={locale}
              weather={await getCachedForecasts(params.id, locale, unit, days)}
              style={style}
              showWeekday={showWeekday}
              showDate={showDate}
            ></ForecastNew1>
          ) : style === "new-2" ? (
            <ForecastNew2
              locale={locale}
              weather={await getCachedForecasts(params.id, locale, unit, days)}
              style={style}
              showWeekday={showWeekday}
              showDate={showDate}
            ></ForecastNew2>
          ) : style === "new-3" ? (
            <ForecastNew3
              locale={locale}
              weather={await getCachedForecasts(params.id, locale, unit, days)}
              style={style}
              showWeekday={showWeekday}
              showDate={showDate}
            ></ForecastNew3>
          ) : (
            <ForecastCards
              locale={locale}
              weather={await getCachedForecasts(params.id, locale, unit, days)}
              showWeekday={showWeekday}
              showDate={showDate}
            ></ForecastCards>
          )
        ) : null}
      </div>
    </main>
  );
}
