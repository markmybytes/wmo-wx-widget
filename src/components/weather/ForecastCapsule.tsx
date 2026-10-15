import { FutureWeather } from "@/lib/wmo";
import type { AppLocale } from "@/i18n/routing";
import { WxIcon } from "./WxIcon";
import { getTranslations } from "next-intl/server";

/** `capsule` variant: Glass Pill & Soft Tech Dashboard.
 *  Rounded capsule rows at mobile (<sm), converging to a unified pill tray at sm+.
 *  Features rounded day chips and pill-styled temperature ranges. */
export default async function ForecastCapsule({
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
      <div className="flex min-h-20 flex-2 items-center justify-center rounded-2xl border border-outline bg-surface p-4 shadow-sm">
        <span className="font-mono text-xs text-muted">{t("noForecastAvailable")}</span>
      </div>
    );
  }

  const isDense = flength >= 8;

  return (
    <div className="flex flex-2 flex-col gap-2 sm:flex-row sm:gap-1.5 sm:rounded-2xl sm:border sm:border-outline sm:bg-surface sm:p-2 sm:shadow-sm">
      {weather.forecasts.map((fc) => {
        const date = new Date(fc.date);
        const minTemp = fc.temp.min.val !== null ? `${fc.temp.min.val}${fc.temp.min.unit}` : "--";
        const maxTemp = fc.temp.max.val !== null ? `${fc.temp.max.val}${fc.temp.max.unit}` : "--";

        return (
          <div
            key={fc.date}
            className={`flex w-full grow items-center justify-between rounded-xl border border-outline bg-surface p-2.5 shadow-xs sm:flex-col sm:justify-between sm:rounded-xl sm:border-0 sm:bg-fill-faint/60 sm:p-2 sm:shadow-none hover:sm:bg-fill-faint ${
              isDense ? "sm:px-1 sm:py-2" : "sm:p-2.5"
            }`}
          >
            {/* Day / Date pill chip */}
            {(showWeekday || showDate) && (
              <div className="flex items-center gap-1 rounded-full bg-fill px-2 py-0.5 text-xs font-semibold text-foreground sm:flex-col sm:gap-0 sm:bg-transparent sm:px-1 sm:py-0">
                {showWeekday && (
                  <span className="max-w-20 truncate text-[11px] tracking-wide text-muted uppercase sm:text-[10px]">
                    {date.toLocaleString(locale, { weekday: "short" })}
                  </span>
                )}
                {showDate && (
                  <span className="font-mono text-xs font-bold text-foreground">
                    {date.getDate()}
                  </span>
                )}
              </div>
            )}

            {/* Pictogram */}
            <div className="my-1 flex shrink-0 items-center justify-center">
              <div
                className={isDense ? "h-7 w-10 sm:h-7.5 sm:w-10.5" : "h-8 w-11 sm:h-9 sm:w-12.5"}
              >
                <WxIcon
                  icon={fc.icon}
                  className="size-full object-contain"
                  alt={fc.weather ?? ""}
                />
              </div>
            </div>

            {/* Min-first temperature range capsule */}
            <div className="flex items-center gap-1.5 rounded-full border border-outline/60 bg-fill-faint px-2 py-0.5 font-mono text-xs sm:flex-col sm:gap-0 sm:border-0 sm:bg-transparent sm:p-0">
              <span className="text-temp-low opacity-80">{minTemp}</span>
              <span className="font-bold text-temp-high">{maxTemp}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
