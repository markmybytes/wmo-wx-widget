import { Icon } from "@iconify/react";
import { City, PresentWeather } from "@/lib/wmo";
import { WxIcon } from "./WxIcon";
import { translateWxdesc } from "@/lib/wxdesc";
import { useTranslations } from "next-intl";

/** `capsule` variant: Glass Pill & Soft Tech Dashboard.
 *  Rounded pill geometry, nested soft capsule chips, and modern floating metrics.
 *  Fluid, friendly, and ultra-crisp across narrow ~300px sidebars and wide containers. */
export default function WeatherCapsule({
  city,
  weather,
}: {
  city: City;
  weather: PresentWeather;
  style?: string; // ignored; kept so all variants share one call site
}) {
  const t = useTranslations("weather");
  const tempVal = weather.temp.val;
  const tempUnit = weather.temp.unit;
  const condText = weather.weather ? translateWxdesc(t, weather.weather) : "";

  return (
    <article className="flex min-w-54 flex-1 flex-col justify-between rounded-2xl border border-outline bg-surface p-4 shadow-sm @min-[theme(--breakpoint-md)]:p-5">
      {/* Pill header: City pill & condition sharing space fluidly */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex max-w-[65%] min-w-0 shrink-0 items-center gap-1.5 rounded-full border border-outline bg-fill-faint px-2.5 py-1">
          <Icon
            icon="material-symbols:location-on-outline"
            className="size-3.5 shrink-0 text-brand"
          />
          <span className="truncate text-xs font-semibold text-foreground">{city.name}</span>
        </div>
        {condText ? (
          <span className="min-w-0 truncate rounded-full bg-fill px-2.5 py-1 text-[11px] font-medium text-muted">
            {condText}
          </span>
        ) : null}
      </div>

      {/* Hero display: Asymmetric temperature & weather pictogram */}
      <div className="my-3 flex items-center justify-between @min-[theme(--breakpoint-sm)]:my-4">
        <div className="flex items-baseline">
          <span className="font-display text-4xl font-extrabold tracking-tight text-foreground @min-[theme(--breakpoint-sm)]:text-5xl">
            {tempVal ?? "--"}
          </span>
          {tempVal !== null && (
            <span className="ml-0.5 text-xl font-bold text-brand @min-[theme(--breakpoint-sm)]:text-2xl">{tempUnit}</span>
          )}
        </div>

        <div className="flex shrink-0 items-center justify-center rounded-2xl bg-fill/50 p-1.5">
          <WxIcon icon={weather.icon} className="h-10 w-14 object-contain" alt={condText} />
        </div>
      </div>

      {/* Pill metric chips: Grouped in natural reading order */}
      <div className="flex items-center gap-2">
        <div className="flex min-w-0 flex-1 items-center gap-1.5 rounded-xl border border-outline/70 bg-fill-faint px-2.5 py-1.5">
          <Icon icon="material-symbols:water-drop" className="size-3.5 shrink-0 text-brand" />
          <span className="truncate font-mono text-xs font-medium text-foreground">
            {weather.rh !== null ? `${weather.rh}%` : "--"}
          </span>
        </div>

        <div className="flex min-w-0 flex-1 items-center gap-1.5 rounded-xl border border-outline/70 bg-fill-faint px-2.5 py-1.5">
          <Icon icon="material-symbols:air" className="size-3.5 shrink-0 text-muted" />
          <span className="truncate font-mono text-xs font-medium text-foreground">
            {weather.wind && weather.wind.speed !== null
              ? `${weather.wind.direction} ${weather.wind.speed} m/s`
              : "--"}
          </span>
        </div>
      </div>
    </article>
  );
}
