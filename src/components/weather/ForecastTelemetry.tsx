import { Icon } from "@iconify/react";
import { FutureWeather } from "@/lib/wmo";
import type { AppLocale } from "@/i18n/routing";
import { WxIcon } from "./WxIcon";
import { getTranslations } from "next-intl/server";

/** `telemetry` variant: Compact Telemetry & Tactical Cockpit.
 *  High-density forecast grid with directional markers (▼ / ▲), monospaced coordinates,
 *  and streamlined padding for space-constrained embed contexts. */
export default async function ForecastTelemetry({
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
      <div className="flex min-h-20 flex-2 items-center justify-center rounded-lg border-2 border-outline-strong bg-surface p-3 shadow-xs">
        <span className="font-mono text-xs text-muted">{t("noForecastAvailable")}</span>
      </div>
    );
  }

  const isDense = flength >= 8;

  return (
    <div className="flex flex-2 flex-col gap-1.5 sm:flex-row sm:gap-0 sm:divide-x sm:divide-outline sm:rounded-lg sm:border-2 sm:border-outline-strong sm:bg-surface sm:shadow-xs">
      {weather.forecasts.map((fc) => {
        const date = new Date(fc.date);
        const minTemp = fc.temp.min.val !== null ? `${fc.temp.min.val}${fc.temp.min.unit}` : "--";
        const maxTemp = fc.temp.max.val !== null ? `${fc.temp.max.val}${fc.temp.max.unit}` : "--";

        return (
          <div
            key={fc.date}
            className={`flex w-full grow items-center justify-between rounded-lg border border-outline bg-surface p-2 font-mono sm:flex-col sm:justify-between sm:rounded-none sm:border-0 sm:bg-transparent ${
              isDense ? "sm:p-1" : "sm:p-2"
            }`}
          >
            {/* Header: Weekday / Date */}
            {(showWeekday || showDate) && (
              <div className="flex min-w-14 flex-col items-start sm:items-center">
                {showWeekday && (
                  <span className="max-w-20 truncate text-[11px] font-bold tracking-tight text-foreground uppercase sm:text-[10px]">
                    {date.toLocaleString(locale, { weekday: "short" })}
                  </span>
                )}
                {showDate && <span className="text-[10px] text-faint">{date.getDate()}</span>}
              </div>
            )}

            {/* Pictogram */}
            <div className="my-0.5 flex shrink-0 items-center justify-center">
              <div
                className={isDense ? "h-6.5 w-9 sm:h-7 sm:w-10" : "h-7.5 w-10.5 sm:h-8.5 sm:w-12"}
              >
                <WxIcon
                  icon={fc.icon}
                  className="size-full object-contain"
                  alt={fc.weather ?? ""}
                />
              </div>
            </div>

            {/* Directional Min / Max temps (min-first) */}
            <div className="flex items-center gap-2 text-xs sm:flex-col sm:gap-0.5 sm:text-[11px]">
              <span className="flex items-center font-medium text-temp-low">
                <Icon icon="bi:caret-down-fill" className="mr-0.5 size-3 shrink-0 opacity-70" />
                {minTemp}
              </span>
              <span className="flex items-center font-semibold text-temp-high">
                <Icon icon="bi:caret-up-fill" className="mr-0.5 size-3 shrink-0 opacity-70" />
                {maxTemp}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
