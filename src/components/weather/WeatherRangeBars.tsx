import { Icon } from "@iconify/react";
import { City, PresentWeather } from "@/lib/wmo";
import { WxIcon } from "./WxIcon";
import { translateWxdesc } from "@/lib/wxdesc";
import { useTranslations } from "next-intl";

/** `range-bars` variant: compact minimal — tight spacing, high data density,
 *  disciplined typography without decorative clutter. */
export default function WeatherRangeBars({
  city,
  weather,
}: {
  city: City;
  weather: PresentWeather;
  style?: string; // ignored; kept so variants share one call site
}) {
  const t = useTranslations("weather");

  return (
    <div className="flex min-w-54 flex-1 flex-col justify-between gap-y-2.5 rounded-lg border border-outline bg-surface p-3 shadow-xs">
      <div className="flex min-w-0 items-center gap-x-1 text-xs text-muted">
        <Icon icon="material-symbols:location-on-outline" className="size-3.5 shrink-0" />
        <span className="truncate font-medium">{city.name}</span>
      </div>

      <div className="flex items-center justify-between gap-2">
        <div className="min-w-0">
          <p className="flex items-baseline font-mono text-3xl leading-none font-semibold text-foreground tabular-nums">
            {weather.temp.val !== null ? weather.temp.val : "--"}
            {weather.temp.val !== null && (
              <span className="ms-0.5 text-xs font-medium text-muted">{weather.temp.unit}</span>
            )}
          </p>
          {weather.weather && (
            <p className="mt-1.5 truncate rounded bg-fill px-1.5 py-0.5 text-[11px] font-medium text-foreground">
              {translateWxdesc(t, weather.weather)}
            </p>
          )}
        </div>

        <div className="h-10 w-13.75 shrink-0">
          <WxIcon
            icon={weather.icon}
            className="size-full object-contain"
            alt={weather.weather ? translateWxdesc(t, weather.weather) : ""}
          />
        </div>
      </div>

      {/* Grouped metrics in natural reading order */}
      <div className="flex items-center justify-start gap-x-4 border-t border-outline/60 pt-2 font-mono text-[11px] text-muted">
        <span className="flex shrink-0 items-center gap-x-1">
          <Icon icon="material-symbols:water-drop" className="size-3" />
          <span>{weather.rh !== null ? `${weather.rh}%` : "--"}</span>
        </span>
        <span className="flex min-w-0 items-center gap-x-1">
          <Icon icon="material-symbols:air" className="size-3 shrink-0" />
          <span className="truncate">
            {weather.wind && weather.wind.speed !== null
              ? `${weather.wind.direction} ${weather.wind.speed} ${weather.wind.unit}`
              : "--"}
          </span>
        </span>
      </div>
    </div>
  );
}
