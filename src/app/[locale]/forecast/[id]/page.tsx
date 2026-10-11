import { TempUnit } from "@/lib/wmo/enums";
import type { AppLocale } from "@/i18n/routing";
import * as wmo from "@/lib/wmo/wmo";
import { Metadata } from "next";
import Weather from "@/components/forecast/Weather";
import WeatherCards from "@/components/forecast/WeatherCards";
import { getLocale, getTranslations } from "next-intl/server";
import Forecast from "@/components/forecast/Forecast";
import ForecastCards from "@/components/forecast/ForecastCards";
import { notFound } from "next/navigation";

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
  style: "cards" | "list";
  showWeekday: boolean;
  showDate: boolean;
  weather: boolean;
  forecast: boolean;
} {
  return {
    unit: TempUnit[sp?.unit?.toUpperCase() as keyof typeof TempUnit] || TempUnit["C"],
    days: parseInt(sp?.days ?? "5"),
    align: sp?.align === "center" || sp?.align === "end" ? sp.align : "start",
    style: sp?.style === "list" ? "list" : "cards",
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
        location: (await wmo.city(params.id, locale))?.name || "N/A",
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

  const city = await wmo.city(params.id, locale);
  if (city === undefined) {
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
              weather={await wmo.present(params.id, locale, unit)}
              style={style}
            ></Weather>
          ) : (
            <WeatherCards
              city={city}
              weather={await wmo.present(params.id, locale, unit)}
            ></WeatherCards>
          )
        ) : null}

        {forecast ? (
          style === "list" ? (
            <Forecast
              locale={locale}
              weather={await wmo.forecasts(params.id, locale, unit, days)}
              style={style}
              showWeekday={showWeekday}
              showDate={showDate}
            ></Forecast>
          ) : (
            <ForecastCards
              locale={locale}
              weather={await wmo.forecasts(params.id, locale, unit, days)}
              showWeekday={showWeekday}
              showDate={showDate}
            ></ForecastCards>
          )
        ) : null}
      </div>
    </main>
  );
}
