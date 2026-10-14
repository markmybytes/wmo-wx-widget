import { FutureWeather } from "@/lib/wmo";
import type { AppLocale } from "@/i18n/routing";
import { WxIcon } from "./WxIcon";
import { getTranslations } from "next-intl/server";

/** `new-1` variant: forecast days as glass tiles matching the dark-glass theme.
 *  Horizontal row tiles at base mobile width, structured column tiles at `sm:` up. */
export default async function ForecastNew1({
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
  const flength = weather.forecasts.length;

  if (flength === 0) {
    const t = await getTranslations("common");

    return (
      <div className="flex min-h-20 flex-2 items-center justify-center rounded-xl border border-outline bg-surface/90 p-6 shadow-sm backdrop-blur-md">
        <span className="font-mono text-xs text-muted">{t("noForecastAvailable")}</span>
      </div>
    );
  }

  const t = await getTranslations("weather");

  return (
    <div className="relative flex flex-2 flex-col gap-1.5 overflow-hidden rounded-xl border border-outline bg-surface/90 p-2 shadow-sm backdrop-blur-md sm:flex-row sm:items-stretch sm:gap-1 sm:p-1.5">
      {/* Soft atmospheric ambient glow matching WeatherNew1 */}
      <div
        aria-hidden
        className="pointer-events-none absolute -start-10 -bottom-10 size-40 rounded-full bg-brand/10 blur-2xl dark:bg-brand/15"
      />

      {weather.forecasts.map((fc) => {
        const d = new Date(fc.date);

        return (
          <div
            key={fc.date}
            className={`relative flex min-w-0 grow items-center justify-between gap-x-2 rounded-lg bg-fill-faint p-2.5 shadow-2xs sm:flex-col sm:items-center sm:justify-center ${
              flength >= 7 ? "sm:gap-y-1 sm:p-1.5" : "sm:gap-y-1.5 sm:p-2"
            }`}
          >
            {(showWeekday || showDate) && (
              <div className="flex w-14 shrink-0 flex-col items-start font-mono text-xs sm:w-auto sm:items-center">
                {showWeekday && (
                  <span className="max-w-24 truncate text-muted sm:max-w-16">
                    {d.toLocaleString(locale, { weekday: flength >= 8 ? "narrow" : "short" })}
                  </span>
                )}
                {showDate && (
                  <span className="font-medium text-foreground">{d.getDate()}</span>
                )}
              </div>
            )}

            <div className="flex shrink-0 items-center justify-center sm:my-0.5">
              <div
                className={
                  flength >= 8
                    ? "h-8 w-10.5 sm:h-7.5 sm:w-10"
                    : "h-8.5 w-11 sm:h-9.5 sm:w-12.5"
                }
              >
                <WxIcon
                  icon={fc.icon}
                  className="size-full"
                  alt={fc.weather ? t(fc.weather) : ""}
                />
              </div>
            </div>

            <div className="flex shrink-0 flex-col items-end justify-center font-mono text-xs sm:items-center sm:gap-y-0.5">
              <span className="text-temp-low">
                {fc.temp.min.val !== null ? `${fc.temp.min.val}°` : "--"}
              </span>
              <span className="font-medium text-temp-high">
                {fc.temp.max.val !== null ? `${fc.temp.max.val}°` : "--"}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
