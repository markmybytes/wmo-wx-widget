import { FutureWeather } from "@/lib/wmo/types";
import { Locale } from "@/lib/wmo/enums";
import * as wmo from "@/lib/wmo/wmo";
import { getTranslations } from "next-intl/server";

/**
 * One row per day at every width — the widget's spine. A fixed grid template
 * locks weekday, pictogram and temps into true columns across rows.
 */
export default async function Forecast({
  locale,
  weather,
  showWeekday,
  showDate,
}: {
  locale: Locale;
  weather: FutureWeather;
  style?: "cards" | "list";
  showWeekday?: boolean;
  showDate?: boolean;
}) {
  const t = await getTranslations("weather");
  // Day number off by default: this is the `list` default, and its 2.75rem
  // column is too narrow for a long weekday, so it shows the short one alone.
  // Day number off by default: this is the `list` default, and its 2.75rem
  // column is too narrow for a long weekday, so it shows the short one alone.
  const weekday = showWeekday ?? true;
  const dayNum = showDate ?? false;

  if (weather.forecasts.length === 0) {
    const tc = await getTranslations("common");

    return (
      <div className="flex grow items-center justify-center rounded-lg border border-line bg-white p-6 shadow-sm">
        <span className="font-mono text-xs text-faint">
          {tc("noForecastAvailable")}
        </span>
      </div>
    );
  }

  return (
    <div className="flex grow flex-col divide-y divide-line rounded-lg border border-line bg-white shadow-sm">
      {weather.forecasts.map((fc) => {
        const d = new Date(fc.date);

        return (
          <div
            className="grid h-11 grid-cols-[2.75rem_3.125rem_1fr] items-center gap-x-2 px-3 sm:h-14 sm:grid-cols-[4rem_3.125rem_1fr_auto] sm:gap-x-3"
            key={fc.date}
          >
            {/* Weekday over day number, matching the cards variant. */}
            <div className="flex flex-col items-center font-mono text-[11px] text-faint sm:text-xs">
              {weekday && (
                <span className="truncate">
                  {d.toLocaleString(wmo.wmoToIso639(locale), {
                    weekday: "short",
                  })}
                </span>
              )}
              {dayNum && <span className="text-ink">{d.getDate()}</span>}
            </div>

            <img
              src={fc.icon}
              className="h-9.5 w-12.5"
              alt={fc.weather ?? ""}
            />

            <p className="hidden min-w-0 truncate text-xs text-faint sm:block">
              {fc.weather ? t(fc.weather) : ""}
            </p>

            {/* Range as one unit; the unit rides on max, written once. */}
            <div className="flex items-baseline justify-self-end gap-x-1 font-mono text-xs sm:text-sm">
              <span className="text-faint">{`${fc.temp.min.val ?? "--"}°`}</span>
              <span className="text-faint">/</span>
              <span className="font-medium text-ink">
                {`${fc.temp.max.val ?? "--"}${fc.temp.max.unit}`}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
