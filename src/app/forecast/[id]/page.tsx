import { Locale, TempUnit } from "@/lib/wmo/enums";
import * as wmo from "@/lib/wmo/wmo";
import { Metadata } from "next";
import Weather from "@/components/forecast/Weather";
import { getTranslations } from "next-intl/server";
import Forecast from "@/components/forecast/Forecast";
import { notFound } from "next/navigation";

function parseLocale(locale: string | null | undefined): Locale {
  if (!locale) {
    return Locale.EN;
  }
  // `kr` is the legacy code kept for backwards compatibility; `ko` takes precedence.
  const normalized = locale === "kr" ? "ko" : locale;
  return Locale[normalized.toUpperCase() as keyof typeof Locale] as Locale;
}

function str2bool(s: string): boolean {
  return ["true", "yes", "1"].includes(s);
}

type WidgetParams = {
  locale: Locale;
  unit: TempUnit;
  days: number;
  align: string;
  weather: boolean;
  forecast: boolean;
};

/**
 * Parses the widget's search params once, applying the same defaults as before.
 * The `forcast` (sic) spelling is kept for backwards compatibility; `forecast`
 * is also accepted.
 */
function parseWidgetParams(
  sp: { [key: string]: string } | undefined,
): WidgetParams {
  return {
    locale: parseLocale(sp?.lang),
    unit:
      TempUnit[sp?.unit?.toUpperCase() as keyof typeof TempUnit] ||
      TempUnit["C"],
    days: parseInt(sp?.days ?? "5"),
    align: sp?.align || "start",
    weather: str2bool(sp?.weather?.toLowerCase() || "true"),
    forecast: str2bool((sp?.forcast ?? sp?.forecast)?.toLowerCase() || "true"),
  };
}

export async function generateMetadata(props: {
  params: Promise<{ id: number }>;
  searchParams: Promise<{ lang?: string }>;
}): Promise<Metadata> {
  const searchParams = await props.searchParams;
  const params = await props.params;
  const t = await getTranslations("meta");

  return {
    title: [
      t("titleForecast", {
        location:
          (await wmo.city(params.id, parseLocale(searchParams.lang)))?.name ||
          "N/A",
      }),
      process.env.appTitle,
    ].join(" | "),
  };
}

export default async function Page(props: {
  params: Promise<{ id: number }>;
  searchParams?: Promise<{ [key: string]: string }>;
}) {
  const [params, searchParams] = await Promise.all([
    props.params,
    props.searchParams,
  ]);

  const { locale, unit, days, align, weather, forecast } =
    parseWidgetParams(searchParams);

  const city = await wmo.city(params.id, locale);
  if (city === undefined) {
    return notFound();
  }

  return (
    <main className={`flex min-h-screen dark:bg-[#191919] items-${align}`}>
      <div className="flex flex-col md:flex-row gap-x-1.5 gap-y-1 w-full h-fit p-1.5">
        {weather ? (
          <Weather
            city={city}
            weather={await wmo.present(params.id, locale, unit)}
          ></Weather>
        ) : null}

        {forecast ? (
          <Forecast
            locale={locale}
            weather={await wmo.forecasts(params.id, locale, unit, days)}
          ></Forecast>
        ) : null}
      </div>
    </main>
  );
}
