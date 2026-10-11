import { Icon } from "@iconify/react";
import { FutureWeather } from "@/lib/wmo/types";
import { Locale } from "@/lib/wmo/enums";
import * as wmo from "@/lib/wmo/wmo";
import { WxIcon } from "./WxIcon";
import { getTranslations } from "next-intl/server";

/** `cards` variant. Spacing and the day-count-driven `flength` branching are frozen by
 *  decision — the original's per-device sizing was validated. Only colour and font changed. */
export default async function ForecastCards({
  locale,
  weather,
  showWeekday,
  showDate,
}: {
  locale: Locale;
  weather: FutureWeather;
  style?: "cards" | "list"; // ignored; kept so both variants share one call site
  showWeekday: boolean;
  showDate: boolean;
}) {
  const flength = weather.forecasts.length;

  if (flength == 0) {
    const t = await getTranslations("common");

    return (
      <div className="flex min-h-20 flex-2 items-center justify-center rounded border border-outline bg-surface shadow-sm">
        <span className="font-mono text-xs text-muted">{t("noForecastAvailable")}</span>
      </div>
    );
  }

  return (
    <div className="flex flex-2 flex-col items-center gap-y-1.5 rounded border-outline bg-surface shadow-sm sm:flex-row sm:border sm:p-1">
      {weather.forecasts.map((fc) => {
        const date = new Date(fc.date);

        return (
          <div
            className="flex w-full grow items-center rounded border border-outline sm:flex-col sm:border-none"
            key={fc.date}
          >
            <div className="flex min-w-3/10 flex-col items-center justify-center font-mono text-xs">
              {showWeekday && (
                <span className="max-w-32 truncate text-muted">
                  {date.toLocaleString(wmo.wmoToIso639(locale), {
                    weekday: "long",
                  })}
                </span>
              )}
              {showDate && <span>{date.getDate()}</span>}
            </div>

            <div className="my-1 flex grow items-center justify-center">
              <div className="h-9.5 w-12.5">
                <WxIcon icon={fc.icon} className="size-full" alt={fc.weather ?? ""} />
              </div>
            </div>

            <div
              className={`flex min-w-3/10 flex-col items-center justify-center gap-x-1 ${
                flength >= 7 ? "xl:flex-row" : "lg:flex-row"
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
                  <div className="flex min-w-13 items-center justify-around text-temp-low xl:justify-end">
                    <Icon icon="bi:thermometer-low" className="size-3.5 sm:hidden" />
                    <span className="grow text-center font-mono text-sm">
                      {`${fc.temp.min.val ?? "--"}${fc.temp.min.unit}`}
                    </span>
                  </div>
                  <div className="flex min-w-13 items-center justify-around text-temp-high xl:justify-start">
                    <Icon icon="bi:thermometer-high" className="size-3.5 sm:hidden" />
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
