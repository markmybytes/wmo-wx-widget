import { FutureWeather } from "@/lib/wmo";
import type { AppLocale } from "@/i18n/routing";
import { WxIcon } from "./WxIcon";
import { getTranslations } from "next-intl/server";

/** `new-2` variant: editorial list — soft card tiles at mobile width, hairline-divided
 *  rows with room for localized condition text from `sm:` up. */
export default async function ForecastNew2({
  locale,
  weather,
  showWeekday,
  showDate,
}: {
  locale: AppLocale;
  weather: FutureWeather;
  style?: string; // ignored; kept so variants share one call site
  showWeekday: boolean;
  showDate: boolean;
}) {
  if (weather.forecasts.length === 0) {
    const tc = await getTranslations("common");

    return (
      <div className="flex min-h-20 flex-2 items-center justify-center rounded-xl border border-outline bg-surface p-6 shadow-xs">
        <span className="font-mono text-xs text-muted">{tc("noForecastAvailable")}</span>
      </div>
    );
  }

  const t = await getTranslations("weather");

  return (
    <div className="flex flex-2 flex-col gap-1.5 rounded-xl border border-outline bg-surface p-2 shadow-xs sm:gap-0 sm:divide-y sm:divide-outline/80 sm:p-1">
      {weather.forecasts.map((fc) => {
        const d = new Date(fc.date);

        return (
          <div
            key={fc.date}
            className="flex items-center gap-x-3 rounded-lg bg-fill-faint p-2.5 shadow-2xs sm:rounded-none sm:bg-transparent sm:px-3 sm:py-2.5 sm:shadow-none"
          >
            {(showWeekday || showDate) && (
              <div className="flex w-12 shrink-0 flex-col font-mono text-xs sm:w-16">
                {showWeekday && (
                  <span className="truncate font-sans text-[11px] font-semibold uppercase tracking-wider text-muted">
                    {d.toLocaleString(locale, { weekday: "short" })}
                  </span>
                )}
                {showDate && (
                  <span className="text-xs font-medium text-foreground">{d.getDate()}</span>
                )}
              </div>
            )}

            <WxIcon
              icon={fc.icon}
              className="h-9.5 w-12.5 shrink-0"
              alt={fc.weather ? t(fc.weather) : ""}
            />

            <p className="hidden min-w-0 grow truncate text-xs text-muted sm:block sm:ps-2">
              {fc.weather ? t(fc.weather) : ""}
            </p>

            <div className="ms-auto flex shrink-0 items-baseline gap-x-1.5 font-mono text-xs sm:text-sm">
              <span className="text-muted">
                {fc.temp.min.val !== null ? `${fc.temp.min.val}°` : "--"}
              </span>
              <span className="font-light text-outline-strong">/</span>
              <span className="font-medium text-foreground">
                {fc.temp.max.val !== null ? `${fc.temp.max.val}${fc.temp.max.unit}` : "--"}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
