import { Icon } from "@iconify/react";
import { City, PresentWeather } from "@/lib/wmo";
import { WxIcon } from "./WxIcon";
import { translateWxdesc } from "@/lib/wxdesc";
import { useTranslations } from "next-intl";

/** `classic` variant. Spacing and sizing are frozen by decision, not accident - the
 *  original's per-device proportions were validated. Only colour and font changed. */
export default function WeatherClassic({
  city,
  weather,
}: {
  city: City;
  weather: PresentWeather;
  style?: "classic" | "list"; // ignored; kept so both variants share one call site
}) {
  const t = useTranslations("weather");

  return (
    <div className="flex min-w-54 flex-1 flex-col items-center justify-around gap-y-1.5 rounded border border-outline bg-surface p-1 shadow-sm @min-[theme(--breakpoint-md)]:justify-center">
      <div className="w-full text-center">
        <p className="flex items-center justify-center gap-x-1 text-xs text-muted @min-[theme(--breakpoint-sm)]:text-sm">
          <Icon icon="material-symbols:location-on-outline" />
          <span className="min-w-0 truncate">{city.name}</span>
        </p>
      </div>

      <div className="flex items-center justify-around gap-2 @min-[theme(--breakpoint-md)]:flex-col">
        <div className="flex items-center gap-x-0.5 @min-[theme(--breakpoint-sm)]:gap-x-1.5 @min-[theme(--breakpoint-md)]:w-full">
          <div className="w-1/2">
            <div className="h-10 w-13.75 justify-self-end @min-[theme(--breakpoint-sm)]:h-12.5 @min-[theme(--breakpoint-sm)]:w-17.5">
              <WxIcon icon={weather.icon} className="size-full" alt={weather.weather ?? ""} />
            </div>
          </div>

          <div className="w-1/2">
            <p className="text-center font-mono text-lg font-medium text-foreground @min-[theme(--breakpoint-sm)]:text-2xl">
              {`${weather.temp.val ?? "--"}${weather.temp.unit}`}
            </p>
          </div>
        </div>

        <div className="flex flex-col items-center @min-[theme(--breakpoint-md)]:w-full">
          <div className="hidden w-full max-w-50 text-center @min-[theme(--breakpoint-sm)]:block">
            <p className="truncate bg-fill text-xs text-foreground">
              {weather.weather ? translateWxdesc(t, weather.weather) : ""}
            </p>
          </div>

          <div className="flex flex-col gap-x-2 text-xs @min-[theme(--breakpoint-sm)]:flex-row @min-[theme(--breakpoint-sm)]:text-sm">
            <span className="flex items-center gap-x-1">
              <Icon icon="material-symbols:water-drop" />
              {`${weather.rh ?? "--"}%`}
            </span>
            <span className="flex items-center gap-x-1">
              <Icon icon="material-symbols:air" />
              {weather.wind ? `${weather.wind.direction} ${weather.wind.speed ?? "--"} m/s` : "--"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
