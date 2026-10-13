import { FutureWeather } from "@/lib/wmo";
import type { AppLocale } from "@/i18n/routing";
import { WxIcon } from "./WxIcon";
import { translateWxdesc } from "@/lib/wxdesc";
import { getTranslations } from "next-intl/server";

/** One row per day at every width. A fixed grid template locks weekday, pictogram
 *  and temps into true columns across rows. */
export default async function Forecast({
  locale,
  weather,
  showWeekday,
  showDate,
}: {
  locale: AppLocale;
  weather: FutureWeather;
  style?: "cards" | "list";
  showWeekday: boolean;
  showDate: boolean;
}) {
  const t = await getTranslations("weather");

  if (weather.forecasts.length === 0) {
    const tc = await getTranslations("common");

    return (
      <div className="flex grow items-center justify-center rounded-lg border border-outline bg-surface p-6 shadow-sm">
        <span className="font-mono text-xs text-muted">{tc("noForecastAvailable")}</span>
      </div>
    );
  }

  return (
    <div className="flex grow flex-col divide-y divide-outline rounded-lg border border-outline bg-surface shadow-sm">
      {weather.forecasts.map((fc) => {
        const d = new Date(fc.date);

        return (
          <div
            className="grid h-11 grid-cols-[2.75rem_3.125rem_1fr] items-center gap-x-2 px-3 sm:h-14 sm:grid-cols-[4rem_3.125rem_1fr_auto] sm:gap-x-3"
            key={fc.date}
          >
            <div className="flex flex-col items-center font-mono text-[11px] text-muted sm:text-xs">
              {showWeekday && (
                <span className="truncate">
                  {d.toLocaleString(locale, {
                    weekday: "short",
                  })}
                </span>
              )}
              {showDate && <span className="text-foreground">{d.getDate()}</span>}
            </div>

            <WxIcon icon={fc.icon} className="h-9.5 w-12.5" alt={fc.weather ?? ""} />

            <p className="hidden min-w-0 truncate text-xs text-muted sm:block">
              {fc.weather ? translateWxdesc(t, fc.weather) : ""}
            </p>

            <div className="flex items-baseline gap-x-1 justify-self-end font-mono text-xs sm:text-sm">
              <span className="text-muted">{`${fc.temp.min.val ?? "--"}°`}</span>
              <span className="text-muted">/</span>
              <span className="font-medium text-foreground">
                {`${fc.temp.max.val ?? "--"}${fc.temp.max.unit}`}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
