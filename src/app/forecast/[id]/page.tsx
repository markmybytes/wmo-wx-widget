import "bootstrap-icons/font/bootstrap-icons.css";

import {Locale, TempUnit} from "@/libs/wmo/enums";
import * as wmo from "@/libs/wmo/wmo";
import {Metadata} from "next";
import {default as HForecasts} from "./components/horizontal/forecasts";
import {default as HPresent} from "./components/horizontal/present";
import {default as VForecasts} from "./components/vertical/forecasts";
import {default as VPresent} from "./components/vertical/present";
import {getTranslations} from "next-intl/server";

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

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: {id: number};
  searchParams: {locale?: keyof typeof Locale};
}): Promise<Metadata> {
  const t = await getTranslations("meta");
  return {
    title: t("titleForecast", {
      location:
        (await wmo.city(params.id, parseLocale(searchParams.locale)))?.name ||
        "N/A",
    }),
  };
}

export default async function Page({
  params,
  searchParams,
}: {
  params: {id: number};
  searchParams?: {[key: string]: any};
}) {
  const locale = parseLocale(searchParams?.locale);

  const unit =
    TempUnit[searchParams?.unit?.toUpperCase() as keyof typeof TempUnit] ||
    TempUnit["C"];

  const visPresent = (searchParams?.present || "y").toLowerCase() == "y";

  const visFuture = (searchParams?.future || "y").toLowerCase() == "y";

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
    <div
      className={`flex items-${searchParams?.align || "start"} min-h-screen`}
    >
      <div className="hidden md:block w-full">
        <div
          className="flex flex-row justify-around items-center m-1 p-2"
          style={{border: "1px lightgray solid", borderRadius: "5px"}}
        >
          {visPresent ? (
            <div className={`mx-1 lg:mx-0 w-60 ${visFuture ? "border-r" : ""}`}>
              <HPresent weather={pwx}></HPresent>
            </div>
          ) : null}

          {visFuture ? (
            <div className="flex flex-1 justify-center">
              <HForecasts locale={locale} forecast={wx}></HForecasts>
            </div>
          ) : null}
        </div>
      </div>

      <div className="block md:hidden w-full">
        <div className="flex flex-col flex-nowrap">
          {visPresent ? <VPresent weather={pwx}></VPresent> : null}
          {visFuture ? (
            <VForecasts locale={locale} forecast={wx}></VForecasts>
          ) : null}
        </div>
      </div>
    </div>
  );
}
