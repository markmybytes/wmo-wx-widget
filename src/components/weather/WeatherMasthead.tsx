import { Icon } from "@iconify/react";
import { City, PresentWeather } from "@/lib/wmo";
import { WxIcon } from "./WxIcon";
import { translateWxdesc } from "@/lib/wxdesc";
import { useTranslations } from "next-intl";

/** `masthead` variant: light editorial publication style — refined uppercase
 *  masthead, prominent display-face hero reading, and a delicate hairline rule. */
export default function WeatherMasthead({
  city,
  weather,
}: {
  city: City;
  weather: PresentWeather;
  style?: string; // ignored; kept so variants share one call site
}) {
  const t = useTranslations("weather");

  return (
    <div className="flex min-w-54 flex-1 flex-col justify-between gap-y-5 rounded-xl border border-outline bg-surface p-4 shadow-xs @min-[theme(--breakpoint-md)]:justify-center @min-[theme(--breakpoint-md)]:gap-y-6 @min-[theme(--breakpoint-sm)]:p-5">
      <p className="truncate font-sans text-[11px] font-semibold tracking-[0.18em] text-faint uppercase">
        {city.name}
      </p>

      <div className="flex items-end justify-between gap-3">
        <div className="min-w-0">
          <p className="flex items-baseline font-display text-5xl leading-none font-bold tracking-tight text-foreground tabular-nums @min-[theme(--breakpoint-sm)]:text-6xl">
            {weather.temp.val !== null ? weather.temp.val : "--"}
            {weather.temp.val !== null && (
              <span className="ms-1 font-sans text-xl font-normal text-muted @min-[theme(--breakpoint-sm)]:text-2xl">
                {weather.temp.unit}
              </span>
            )}
          </p>
          <p className="mt-2.5 truncate text-xs font-medium text-muted @min-[theme(--breakpoint-sm)]:text-sm">
            {weather.weather ? translateWxdesc(t, weather.weather) : ""}
          </p>
        </div>

        <div className="h-12.5 w-17.5 shrink-0">
          <WxIcon
            icon={weather.icon}
            className="size-full object-contain"
            alt={weather.weather ? translateWxdesc(t, weather.weather) : ""}
          />
        </div>
      </div>

      <div className="flex items-center justify-start gap-x-5 border-t border-outline/80 pt-3 text-xs text-muted @min-[theme(--breakpoint-sm)]:pt-4">
        <span className="flex shrink-0 items-center gap-x-1.5">
          <Icon icon="material-symbols:water-drop" className="size-3.5 text-faint" />
          <span>{weather.rh !== null ? `${weather.rh}%` : "--"}</span>
        </span>
        <span className="flex min-w-0 items-center gap-x-1.5">
          <Icon icon="material-symbols:air" className="size-3.5 shrink-0 text-faint" />
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
