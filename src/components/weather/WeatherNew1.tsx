import { Icon } from "@iconify/react";
import { City, PresentWeather } from "@/lib/wmo";
import { WxIcon } from "./WxIcon";
import { getTranslations } from "next-intl/server";

/** `new-1` variant: showcase-inspired dark-glass direction — atmospheric ambient
 *  brand glow, banded header with status beacon, high-contrast hero readout,
 *  and a dual-metric bento panel. */
export default async function WeatherNew1({
  city,
  weather,
}: {
  city: City;
  weather: PresentWeather;
  style?: string; // ignored; kept so variants share one call site
}) {
  const t = await getTranslations("weather");

  return (
    <div className="relative flex min-w-54 flex-1 flex-col justify-between overflow-hidden rounded-xl border border-outline bg-surface/90 p-4 shadow-sm backdrop-blur-md">
      {/* Soft ambient brand glow contained strictly within card boundaries */}
      <div
        aria-hidden
        className="pointer-events-none absolute -end-10 -top-10 size-40 rounded-full bg-brand/15 blur-2xl dark:bg-brand/20"
      />

      <div className="relative flex items-center justify-between gap-2 border-b border-outline/70 pb-2.5">
        <p className="flex min-w-0 items-center gap-x-1.5 text-xs font-semibold text-foreground sm:text-sm">
          <Icon icon="material-symbols:location-on-outline" className="size-4 shrink-0 text-brand" />
          <span className="truncate">{city.name}</span>
        </p>
        <span aria-hidden className="size-1.5 shrink-0 rounded-full bg-brand" />
      </div>

      <div className="relative my-3 flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="flex items-baseline font-mono text-4xl font-bold tracking-tight text-foreground tabular-nums sm:text-5xl">
            {weather.temp.val !== null ? weather.temp.val : "--"}
            {weather.temp.val !== null && (
              <span className="ms-0.5 text-base font-medium text-muted sm:text-lg">
                {weather.temp.unit}
              </span>
            )}
          </p>
          <p className="mt-1 truncate text-xs font-medium text-muted sm:text-sm">
            {weather.weather ? t(weather.weather) : ""}
          </p>
        </div>

        <div className="h-12.5 w-17.5 shrink-0">
          <WxIcon
            icon={weather.icon}
            className="size-full"
            alt={weather.weather ? t(weather.weather) : ""}
          />
        </div>
      </div>

      <div className="relative grid grid-cols-2 gap-2 rounded-lg bg-fill-faint p-2 font-mono text-xs text-foreground sm:p-2.5">
        <span className="flex min-w-0 items-center gap-x-2">
          <span className="flex size-7 shrink-0 items-center justify-center rounded-md bg-fill text-temp-low shadow-2xs">
            <Icon icon="material-symbols:water-drop" className="size-3.5" />
          </span>
          <span className="truncate">{weather.rh !== null ? `${weather.rh}%` : "--"}</span>
        </span>
        <span className="flex min-w-0 items-center gap-x-2">
          <span className="flex size-7 shrink-0 items-center justify-center rounded-md bg-fill text-brand shadow-2xs">
            <Icon icon="material-symbols:air" className="size-3.5" />
          </span>
          <span className="truncate">
            {weather.wind && weather.wind.speed !== null
              ? `${weather.wind.direction} ${weather.wind.speed} m/s`
              : "--"}
          </span>
        </span>
      </div>
    </div>
  );
}
