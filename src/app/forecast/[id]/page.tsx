import "bootstrap-icons/font/bootstrap-icons.css";

import {Locale, TempUnit} from "@/libs/wmo/enums";
import * as wmo from "@/libs/wmo/wmo";
import {Metadata} from "next";
import Weather from "@/components/forecast/Weather";
import {getTranslations} from "next-intl/server";
import Forecast from "@/components/forecast/Forecast";

function parseLocale(locale: string | null | undefined): Locale {
  if (!locale) {
    return Locale["En"];
  }
  return (
    Locale[
      (locale[0].toUpperCase() +
        locale.slice(1).toLowerCase()) as keyof typeof Locale
    ] || Locale["En"]
  );
}

export async function generateMetadata(props: {
  params: Promise<{id: number}>;
  searchParams: Promise<{locale?: keyof typeof Locale}>;
}): Promise<Metadata> {
  const searchParams = await props.searchParams;
  const params = await props.params;
  const t = await getTranslations("meta");
  return {
    title: t("titleForecast", {
      location:
        (await wmo.city(params.id, parseLocale(searchParams.locale)))?.name ||
        "N/A",
    }),
  };
}

export default async function Page(props: {
  params: Promise<{id: number}>;
  searchParams?: Promise<{[key: string]: any}>;
}) {
  const t = await getTranslations("weather");

  const searchParams = await props.searchParams;
  const params = await props.params;
  const locale = parseLocale(searchParams?.locale);

  const unit =
    TempUnit[searchParams?.unit?.toUpperCase() as keyof typeof TempUnit] ||
    TempUnit["C"];

  const showWeather = (searchParams?.present || "y").toLowerCase() == "y";

  const showForecast = (searchParams?.future || "y").toLowerCase() == "y";

  const [pwx, wx] = await Promise.all([
    wmo.present(params.id, locale, unit),
    wmo.forecasts(
      params.id,
      locale,
      unit,
      isNaN(parseInt(searchParams?.days)) ? 5 : parseInt(searchParams!.days),
    ),
  ]);

  return (
    <main
      className={`flex items-${
        searchParams?.align || "start"
      } h-screen dark:bg-[#191919]`}
    >
      <div className="flex flex-col md:flex-row gap-x-1.5 gap-y-1 w-full h-fit p-1.5">
        {showWeather ? <Weather weather={pwx}></Weather> : null}
        {showForecast ? (
          <Forecast locale={locale} forecast={wx}></Forecast>
        ) : null}
      </div>
    </main>
  );
}
