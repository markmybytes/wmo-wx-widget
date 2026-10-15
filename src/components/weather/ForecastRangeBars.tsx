import { FutureWeather } from "@/lib/wmo";
import type { AppLocale } from "@/i18n/routing";
import { WxIcon } from "./WxIcon";
import { getTranslations } from "next-intl/server";

/** `range-bars` variant: compact forecast rows with Apple-style temperature
 *  range bars normalized across the visible forecast period. */
export default async function ForecastRangeBars({
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
    <div className="flex flex-2 flex-col divide-y divide-outline/70 rounded-lg border border-outline bg-surface p-1 shadow-xs">
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
          <div key={fc.date} className="flex items-center gap-x-2 px-2.5 py-2">
            {(showWeekday || showDate) && (
              <div className="flex w-10 shrink-0 flex-col items-center font-mono text-[11px] sm:w-12">
                {showWeekday && (
                  <span className="truncate text-muted">
                    {d.toLocaleString(locale, { weekday: "short" })}
                  </span>
                )}
                {showDate && <span className="font-medium text-foreground">{d.getDate()}</span>}
              </div>
            )}

            <WxIcon
              icon={fc.icon}
              className="h-7 w-9.5 shrink-0 object-contain"
              alt={fc.weather ? t(fc.weather) : ""}
            />

            {/* Min-first temperature cluster capped at max-w-32/sm:max-w-44 */}
            <div className="ms-auto flex w-full max-w-48 min-w-0 items-center gap-x-2 sm:max-w-56">
              <span className="w-8 shrink-0 text-end font-mono text-[11px] text-muted tabular-nums sm:w-9">
                {min !== null ? `${min}°` : "--"}
              </span>

              <div
                aria-hidden
                className="relative h-1.5 max-w-32 grow rounded-full bg-outline/80 sm:max-w-44 dark:bg-fill"
              >
                {hasBar && (
                  <div
                    className="absolute inset-y-0 rounded-full bg-gradient-to-r from-temp-low to-temp-high shadow-xs"
                    style={{ left: `${left}%`, width: `${width}%` }}
                  />
                )}
              </div>

              <span className="w-8 shrink-0 text-start font-mono text-[11px] font-medium text-foreground tabular-nums sm:w-9">
                {max !== null ? `${max}°` : "--"}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
