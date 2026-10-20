import type { FutureWeather } from "@/lib/wmo";
import type { AppLocale } from "@/i18n/routing";
import { WxIcon } from "./WxIcon";
import { utcWeekday, utcDayNumber } from "@/lib/date";
import { useTranslations } from "next-intl";

/** `capsule` variant: Glass Pill & Soft Tech Dashboard.
 *  Rounded capsule rows at mobile (<sm), converging to a unified pill tray at sm+.
 *  Features rounded day chips and pill-styled temperature ranges. */
export default function ForecastCapsule({
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
  const t = useTranslations("common");
  const flength = weather.forecasts.length;

  if (flength === 0) {
    return (
      <div className="flex min-h-20 flex-2 items-center justify-center rounded-2xl border border-outline bg-surface p-4 shadow-sm">
        <span className="font-mono text-xs text-muted">{t("noForecastAvailable")}</span>
      </div>
    );
  }

  const isDense = flength >= 8;

  return (
    <div className="flex flex-2 flex-col gap-2 @min-[theme(--breakpoint-sm)]:flex-row @min-[theme(--breakpoint-sm)]:gap-1.5 @min-[theme(--breakpoint-sm)]:rounded-2xl @min-[theme(--breakpoint-sm)]:border @min-[theme(--breakpoint-sm)]:border-outline @min-[theme(--breakpoint-sm)]:bg-surface @min-[theme(--breakpoint-sm)]:p-2 @min-[theme(--breakpoint-sm)]:shadow-sm">
      {weather.forecasts.map((fc) => {
        const minTemp = fc.temp.min.val !== null ? `${fc.temp.min.val}${fc.temp.min.unit}` : "--";
        const maxTemp = fc.temp.max.val !== null ? `${fc.temp.max.val}${fc.temp.max.unit}` : "--";

        return (
          <div
            key={fc.date}
            className={`flex w-full grow items-center justify-between rounded-xl border border-outline bg-surface p-2.5 shadow-xs @min-[theme(--breakpoint-sm)]:flex-col @min-[theme(--breakpoint-sm)]:justify-between @min-[theme(--breakpoint-sm)]:rounded-xl @min-[theme(--breakpoint-sm)]:border-0 @min-[theme(--breakpoint-sm)]:bg-fill-faint/60 @min-[theme(--breakpoint-sm)]:p-2 @min-[theme(--breakpoint-sm)]:shadow-none hover:@min-[theme(--breakpoint-sm)]:bg-fill-faint ${
              isDense
                ? "@min-[theme(--breakpoint-sm)]:px-1 @min-[theme(--breakpoint-sm)]:py-2"
                : "@min-[theme(--breakpoint-sm)]:p-2.5"
            }`}
          >
            {/* Day / Date pill chip */}
            {(showWeekday || showDate) && (
              <div className="flex items-center gap-1 rounded-full bg-fill px-2 py-0.5 text-xs font-semibold text-foreground @min-[theme(--breakpoint-sm)]:flex-col @min-[theme(--breakpoint-sm)]:gap-0 @min-[theme(--breakpoint-sm)]:bg-transparent @min-[theme(--breakpoint-sm)]:px-1 @min-[theme(--breakpoint-sm)]:py-0">
                {showWeekday && (
                  <span className="max-w-20 truncate text-[11px] tracking-wide text-muted uppercase @min-[theme(--breakpoint-sm)]:text-[10px]">
                    {utcWeekday(fc.date, locale)}
                  </span>
                )}
                {showDate && (
                  <span className="font-mono text-xs font-bold text-foreground">
                    {utcDayNumber(fc.date)}
                  </span>
                )}
              </div>
            )}

            {/* Pictogram */}
            <div className="my-1 flex shrink-0 items-center justify-center">
              <div
                className={
                  isDense
                    ? "h-7 w-10 @min-[theme(--breakpoint-sm)]:h-7.5 @min-[theme(--breakpoint-sm)]:w-10.5"
                    : "h-8 w-11 @min-[theme(--breakpoint-sm)]:h-9 @min-[theme(--breakpoint-sm)]:w-12.5"
                }
              >
                <WxIcon
                  icon={fc.icon}
                  className="size-full object-contain"
                  alt={fc.weather ?? ""}
                />
              </div>
            </div>

            {/* Min-first temperature range capsule */}
            <div className="flex items-center gap-1.5 rounded-full border border-outline/60 bg-fill-faint px-2 py-0.5 font-mono text-xs @min-[theme(--breakpoint-sm)]:flex-col @min-[theme(--breakpoint-sm)]:gap-0 @min-[theme(--breakpoint-sm)]:border-0 @min-[theme(--breakpoint-sm)]:bg-transparent @min-[theme(--breakpoint-sm)]:p-0">
              <span className="text-temp-low opacity-80">{minTemp}</span>
              <span className="font-bold text-temp-high">{maxTemp}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
