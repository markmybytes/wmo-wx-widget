import { Icon } from "@iconify/react";
import { FutureWeather } from "@/lib/wmo";
import type { AppLocale } from "@/i18n/routing";
import { WxIcon } from "./WxIcon";
import { getTranslations } from "next-intl/server";

/** `precision` variant: Editorial Swiss Precision.
 *  Architectural rows at narrow viewports (<sm) transitioning to a continuous,
 *  divided calendar strip at sm+. Hairline borders, precise tabular metrics. */
export default async function ForecastPrecision({
  locale,
  weather,
  showWeekday,
  showDate,
}: {
  locale: AppLocale;
  weather: FutureWeather;
  style?: string; // ignored; kept so all variants share one call site
  showWeekday: boolean;
  showDate: boolean;
}) {
  const flength = weather.forecasts.length;

  if (flength === 0) {
    const t = await getTranslations("common");
    return (
      <div className="flex min-h-20 flex-2 items-center justify-center rounded-xl border border-outline bg-surface p-4 shadow-xs">
        <span className="font-mono text-xs text-muted">{t("noForecastAvailable")}</span>
      </div>
    );
  }

  const isDense = flength >= 8;

  return (
    <div className="flex flex-2 flex-col gap-1.5 sm:flex-row sm:gap-0 sm:divide-x sm:divide-outline sm:rounded-xl sm:border sm:border-outline sm:bg-surface sm:shadow-xs">
      {weather.forecasts.map((fc) => {
        const date = new Date(fc.date);
        const minTemp = fc.temp.min.val !== null ? `${fc.temp.min.val}${fc.temp.min.unit}` : "--";
        const maxTemp = fc.temp.max.val !== null ? `${fc.temp.max.val}${fc.temp.max.unit}` : "--";

        return (
          <div
            key={fc.date}
            className={`flex w-full grow items-center justify-between rounded-xl border border-outline bg-surface p-2 shadow-xs sm:flex-col sm:justify-around sm:rounded-none sm:border-0 sm:bg-transparent sm:shadow-none ${
              isDense ? "sm:p-1.5" : "sm:p-2.5"
            }`}
          >
            {/* Date / Day */}
            {(showWeekday || showDate) && (
              <div className="flex min-w-16 flex-col items-start font-mono sm:items-center">
                {showWeekday && (
                  <span className="max-w-24 truncate text-xs font-semibold tracking-tight text-foreground sm:text-[11px] sm:text-muted sm:uppercase">
                    {date.toLocaleString(locale, { weekday: "short" })}
                  </span>
                )}
                {showDate && (
                  <span className="text-[11px] text-faint sm:text-xs">{date.getDate()}</span>
                )}
              </div>
            )}

            {/* Weather Pictogram */}
            <div className="my-1 flex shrink-0 items-center justify-center">
              <div className={isDense ? "h-7 w-10 sm:h-8 sm:w-11" : "h-8 w-11 sm:h-9.5 sm:w-13"}>
                <WxIcon
                  icon={fc.icon}
                  className="size-full object-contain"
                  alt={fc.weather ?? ""}
                />
              </div>
            </div>

            {/* Min-first temperature order */}
            <div className="flex items-center gap-2 font-mono sm:flex-col sm:gap-0.5">
              <div className="flex items-center gap-0.5 text-temp-low">
                <Icon icon="bi:thermometer-low" className="size-3 shrink-0" />
                <span className="text-xs font-medium opacity-85">{minTemp}</span>
              </div>
              <div className="flex items-center gap-0.5 text-temp-high">
                <Icon icon="bi:thermometer-high" className="size-3 shrink-0" />
                <span className="text-xs font-semibold">{maxTemp}</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
