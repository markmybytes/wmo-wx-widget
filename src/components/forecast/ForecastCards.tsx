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
  showWeekday?: boolean;
  showDate?: boolean;
}) {
  const flength = weather.forecasts.length;
  const weekday = showWeekday ?? true;
  const dayNum = showDate ?? true;

  if (flength == 0) {
    const t = await getTranslations("common");

    return (
      <div className="flex flex-2 justify-center items-center min-h-20 border border-outline rounded">
        <span className="font-mono text-xs text-muted">
          {t("noForecastAvailable")}
        </span>
      </div>
    );
  }

  return (
    <div className="flex flex-col sm:flex-row flex-2 items-center gap-y-1.5 sm:p-1 sm:border border-outline rounded">
      {weather.forecasts.map((fc) => {
        const date = new Date(fc.date);

        return (
          <div
            className="flex sm:flex-col items-center grow w-full border sm:border-none border-outline rounded"
            key={fc.date}
          >
            <div className="flex flex-col justify-center items-center min-w-3/10 text-xs font-mono">
              {weekday && (
                <span className="max-w-32 text-muted truncate">
                  {date.toLocaleString(wmo.wmoToIso639(locale), {
                    weekday: "long",
                  })}
                </span>
              )}
              {dayNum && <span>{date.getDate()}</span>}
            </div>

            <div className="flex justify-center items-center grow my-1">
              <div className="h-9.5 w-12.5">
                <WxIcon
                  icon={fc.icon}
                  className="size-full"
                  alt={fc.weather ?? ""}
                />
              </div>
            </div>

            <div
              className={`flex flex-col justify-center items-center gap-x-1 min-w-3/10  ${
                flength >= 7 ? "xl:flex-row" : "lg:flex-row"
              }`}
            >
              {flength < 8 ? (
                <>
                  <div className="flex justify-around min-w-13 text-temp-low">
                    <Icon
                      icon="material-symbols:device-thermometer"
                      className="inline"
                      width="1em"
                      height="1em"
                    />
                    <span className="grow text-center font-mono text-sm">
                      {`${fc.temp.min.val ?? "--"}${fc.temp.min.unit}`}
                    </span>
                  </div>
                  <div className="flex justify-around min-w-13 text-temp-high">
                    <Icon
                      icon="material-symbols:device-thermometer"
                      className="inline"
                      width="1em"
                      height="1em"
                    />
                    <span className="grow text-center font-mono text-sm">
                      {`${fc.temp.max.val ?? "--"}${fc.temp.max.unit}`}
                    </span>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex justify-around xl:justify-end min-w-13 text-temp-low">
                    <Icon
                      icon="material-symbols:device-thermometer"
                      className="sm:hidden inline"
                      width="1em"
                      height="1em"
                    />
                    <span className="grow text-center font-mono text-sm">
                      {`${fc.temp.min.val ?? "--"}${fc.temp.min.unit}`}
                    </span>
                  </div>
                  <div className="flex justify-around xl:justify-start min-w-13 text-temp-high">
                    <Icon
                      icon="material-symbols:device-thermometer"
                      className="sm:hidden inline"
                      width="1em"
                      height="1em"
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
