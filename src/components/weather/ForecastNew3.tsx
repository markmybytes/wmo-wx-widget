import { FutureWeather } from "@/lib/wmo";
import type { AppLocale } from "@/i18n/routing";
import { WxIcon } from "./WxIcon";
import { getTranslations } from "next-intl/server";

/** `new-3` variant: compact forecast rows with Apple-style temperature
 *  range bars normalized across the visible forecast period. */
export default async function ForecastNew3({
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
      <div className="flex min-h-20 flex-2 items-center justify-center rounded-lg border border-outline bg-surface p-6 shadow-xs">
        <span className="font-mono text-xs text-muted">{tc("noForecastAvailable")}</span>
      </div>
    );
  }

  const t = await getTranslations("weather");

  // Collect all valid readings to determine the overall forecast range
  const reads = weather.forecasts.flatMap((fc) => {
    const vals: number[] = [];
    if (fc.temp.min.val !== null) vals.push(fc.temp.min.val);
    if (fc.temp.max.val !== null) vals.push(fc.temp.max.val);
    return vals;
  });

  const hasReads = reads.length > 0;
  const gMin = hasReads ? Math.min(...reads) : 0;
  const gMax = hasReads ? Math.max(...reads) : 0;
  const span = gMax - gMin;

  return (
    <div className="flex flex-2 flex-col gap-1 rounded-lg border border-outline bg-surface p-1.5 shadow-xs sm:gap-0 sm:divide-y sm:divide-outline/70 sm:p-1">
      {weather.forecasts.map((fc) => {
        const min = fc.temp.min.val;
        const max = fc.temp.max.val;
        const hasBar = hasReads && min !== null && max !== null;

        // Zero-span fallback, clamped range bar, minimum pill width for degenerate days
        let left = 0;
        let width = 0;
        if (hasBar) {
          if (span === 0) {
            left = 35;
            width = 30;
          } else {
            const rawLeft = ((min - gMin) / span) * 100;
            const rawWidth = ((max - min) / span) * 100;
            const minBarWidth = 7;
            width = Math.min(100, Math.max(rawWidth, minBarWidth));
            left = Math.min(Math.max(0, rawLeft), 100 - width);
          }
        }

        const d = new Date(fc.date);

        return (
          <div
            key={fc.date}
            className="flex items-center gap-x-2 rounded-md bg-fill-faint px-2 py-1.5 shadow-2xs sm:rounded-none sm:bg-transparent sm:px-2.5 sm:py-2 sm:shadow-none"
          >
            {(showWeekday || showDate) && (
              <div className="flex w-10 shrink-0 flex-col items-center font-mono text-[11px] sm:w-12">
                {showWeekday && (
                  <span className="truncate text-muted">
                    {d.toLocaleString(locale, { weekday: "short" })}
                  </span>
                )}
                {showDate && (
                  <span className="font-medium text-foreground">{d.getDate()}</span>
                )}
              </div>
            )}

            <WxIcon
              icon={fc.icon}
              className="h-7 w-9.5 shrink-0"
              alt={fc.weather ? t(fc.weather) : ""}
            />

            <div className="flex min-w-0 grow items-center gap-x-2">
              <span className="w-8 shrink-0 text-end font-mono text-[11px] tabular-nums text-muted sm:w-9">
                {min !== null ? `${min}°` : "--"}
              </span>

              <div aria-hidden className="relative h-1.5 grow rounded-full bg-outline/80 dark:bg-fill">
                {hasBar && (
                  <div
                    className="absolute inset-y-0 rounded-full bg-gradient-to-r from-temp-low to-temp-high shadow-xs"
                    style={{ left: `${left}%`, width: `${width}%` }}
                  />
                )}
              </div>

              <span className="w-8 shrink-0 text-start font-mono text-[11px] tabular-nums font-medium text-foreground sm:w-9">
                {max !== null ? `${max}°` : "--"}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
