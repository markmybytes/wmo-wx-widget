import { Icon } from "@iconify/react";
import { FutureWeather } from "@/lib/wmo";
import type { AppLocale } from "@/i18n/routing";
import { WxIcon } from "./WxIcon";
import { utcWeekday, utcDayNumber } from "@/lib/date";
import { useTranslations } from "next-intl";

/** `classic` variant. Spacing and the day-count-driven `flength` branching are frozen by
 *  decision ??the original's per-device sizing was validated. Only colour and font changed. */
export default function ForecastClassic({
  locale,
  weather,
  showWeekday,
  showDate,
}: {
  locale: AppLocale;
  weather: FutureWeather;
  style?: "classic" | "list"; // ignored; kept so both variants share one call site
  showWeekday: boolean;
  showDate: boolean;
}) {
  const t = useTranslations("common");
  const flength = weather.forecasts.length;

  if (flength == 0) {
    return (
      <div className="flex min-h-20 flex-2 items-center justify-center rounded border border-outline bg-surface shadow-sm">
        <span className="font-mono text-xs text-muted">{t("noForecastAvailable")}</span>
      </div>
    );
  }

  return (
    <div className="flex flex-2 flex-col items-center gap-y-1.5 rounded border-outline @min-[theme(--breakpoint-sm)]:flex-row @min-[theme(--breakpoint-sm)]:border @min-[theme(--breakpoint-sm)]:bg-surface @min-[theme(--breakpoint-sm)]:p-1 @min-[theme(--breakpoint-sm)]:shadow-sm">
      {weather.forecasts.map((fc) => {
        return (
          <div
            className="flex w-full grow items-center rounded border border-outline bg-surface shadow-sm @min-[theme(--breakpoint-sm)]:flex-col @min-[theme(--breakpoint-sm)]:border-none @min-[theme(--breakpoint-sm)]:bg-transparent @min-[theme(--breakpoint-sm)]:shadow-none"
            key={fc.date}
          >
            <div className="flex min-w-3/10 flex-col items-center justify-center font-mono text-xs">
              {showWeekday && (
                <span className="max-w-32 truncate text-muted">
                  {utcWeekday(fc.date, locale, "long")}
                </span>
              )}
              {showDate && <span>{utcDayNumber(fc.date)}</span>}
            </div>

            <div className="my-1 flex grow items-center justify-center">
              <div className="h-9.5 w-12.5">
                <WxIcon icon={fc.icon} className="size-full" alt={fc.weather ?? ""} />
              </div>
            </div>

            <div
              className={`flex min-w-3/10 flex-col items-center justify-center gap-x-1 ${
                flength >= 7
                  ? "@min-[theme(--breakpoint-xl)]:flex-row"
                  : "@min-[theme(--breakpoint-lg)]:flex-row"
              }`}
            >
              {flength < 8 ? (
                <>
                  <div className="flex min-w-13 items-center justify-around text-temp-low">
                    <Icon icon="bi:thermometer-low" className="size-3.5" />
                    <span className="grow text-center font-mono text-sm">
                      {`${fc.temp.min.val ?? "--"}${fc.temp.min.unit}`}
                    </span>
                  </div>
                  <div className="flex min-w-13 items-center justify-around text-temp-high">
                    <Icon icon="bi:thermometer-high" className="size-3.5" />
                    <span className="grow text-center font-mono text-sm">
                      {`${fc.temp.max.val ?? "--"}${fc.temp.max.unit}`}
                    </span>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex min-w-13 items-center justify-around text-temp-low @min-[theme(--breakpoint-xl)]:justify-end">
                    <Icon
                      icon="bi:thermometer-low"
                      className="size-3.5 @min-[theme(--breakpoint-sm)]:hidden"
                    />
                    <span className="grow text-center font-mono text-sm">
                      {`${fc.temp.min.val ?? "--"}${fc.temp.min.unit}`}
                    </span>
                  </div>
                  <div className="flex min-w-13 items-center justify-around text-temp-high @min-[theme(--breakpoint-xl)]:justify-start">
                    <Icon
                      icon="bi:thermometer-high"
                      className="size-3.5 @min-[theme(--breakpoint-sm)]:hidden"
                    />
                    <span className="grow text-center font-mono text-sm">
                      {`${fc.temp.max.val ?? "--"}${fc.temp.max.unit}`}
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
