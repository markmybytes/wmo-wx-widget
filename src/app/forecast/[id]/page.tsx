import "bootstrap-icons/font/bootstrap-icons.css";

import {Locale, TempUnit} from "@/libs/wmo/enums";
import * as wmo from "@/libs/wmo/wmo";
import {Metadata} from "next";
import Weather from "@/components/forecast/Weather";
import {getTranslations} from "next-intl/server";
import Forecast from "@/components/forecast/Forecast";
import {notFound} from "next/navigation";

function parseLocale(locale: string | null | undefined): Locale {
  if (!locale) {
    return Locale.EN;
  }
  return Locale[locale.toUpperCase() as keyof typeof Locale] as Locale;
}

function str2bool(s: string): boolean {
  return ["true", "yes", "1"].includes(s);
}

export async function generateMetadata(props: {
  params: Promise<{id: number}>;
  searchParams: Promise<{lang?: string}>;
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
  params: Promise<{id: number}>;
  searchParams?: Promise<{[key: string]: string}>;
}) {
  const [params, searchParams] = await Promise.all([
    props.params,
    props.searchParams,
  ]);

  const locale = parseLocale(searchParams?.lang);

  const city = await wmo.city(params.id, locale);
  if (city === undefined) {
    return notFound();
  }

  const unit =
    TempUnit[searchParams?.unit?.toUpperCase() as keyof typeof TempUnit] ||
    TempUnit["C"];

  return (
    <main
      className={`flex min-h-screen dark:bg-[#191919] items-${
        searchParams?.align || "start"
      }`}
    >
      <div className="flex flex-col md:flex-row gap-x-1.5 gap-y-1 w-full h-fit p-1.5">
        {str2bool(searchParams?.weather?.toLowerCase() || "true") ? (
          <Weather
            city={city}
            weather={await wmo.present(params.id, locale, unit)}
          ></Weather>
        ) : null}

        {str2bool(searchParams?.forcast?.toLowerCase() || "true") ? (
          <Forecast
            locale={locale}
            weather={await wmo.forecasts(
              params.id,
              locale,
              unit,
              parseInt(searchParams?.days ?? "5") ?? 5,
            )}
          ></Forecast>
        ) : null}
      </div>
    </main>
  );
}
