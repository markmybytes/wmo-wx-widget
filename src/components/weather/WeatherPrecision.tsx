import { Icon } from "@iconify/react";
import { City, PresentWeather } from "@/lib/wmo";
import { WxIcon } from "./WxIcon";
import { useTranslations } from "next-intl";

/** `precision` variant: Editorial Swiss Precision.
 *  Crisp typographic hierarchy, structured hairline dividers, and high-contrast data rows.
 *  Compact two-band layout optimized for tight vertical embedding. */
export default function WeatherPrecision({
  city,
  weather,
}: {
  city: City;
  weather: PresentWeather;
  style?: string; // ignored; kept so all variants share one call site
}) {
  const t = useTranslations("weather");
  const condText = weather.weather ? t(weather.weather) : "";

  return (
    <article className="flex min-w-54 flex-1 flex-col justify-between rounded-xl border border-outline bg-surface p-3.5 shadow-xs transition-colors @min-[theme(--breakpoint-md)]:p-4">
      {/* Top row: Location & Condition */}
      <div className="flex items-start justify-between gap-2 border-b border-outline pb-2.5">
        <div className="min-w-0 flex-1">
          <p className="flex items-center gap-1 font-mono text-[11px] font-semibold tracking-wider text-muted uppercase">
            <Icon icon="material-symbols:location-on-outline" className="size-3.5 shrink-0" />
            <span className="truncate">{city.name}</span>
          </p>
          {condText ? (
            <p className="mt-0.5 truncate text-xs font-medium text-foreground @min-[theme(--breakpoint-sm)]:text-sm">
              {condText}
            </p>
          ) : null}
        </div>

        <div className="flex shrink-0 items-center justify-center rounded-lg border border-outline bg-fill-faint p-1">
          <WxIcon icon={weather.icon} className="h-8 w-11 object-contain" alt={condText} />
        </div>
      </div>

      {/* Main readout: Big temperature + telemetry in freed space */}
      <div className="mt-3 flex items-end justify-between gap-2">
        <div className="flex items-baseline gap-1">
          <span className="font-display text-4xl font-bold tracking-tight text-foreground @min-[theme(--breakpoint-sm)]:text-5xl">
            {weather.temp.val !== null ? weather.temp.val : "--"}
          </span>
          {weather.temp.val !== null && (
            <span className="text-lg font-medium text-muted @min-[theme(--breakpoint-sm)]:text-xl">{weather.temp.unit}</span>
          )}
        </div>

        {/* Grouped metrics in natural reading order */}
        <div className="flex items-center gap-2.5 font-mono text-xs text-muted">
          <span className="flex items-center gap-1">
            <Icon icon="material-symbols:water-drop" className="size-3.5 shrink-0 text-faint" />
            <span className="font-medium text-foreground">
              {weather.rh !== null ? `${weather.rh}%` : "--"}
            </span>
          </span>
          <span className="flex items-center gap-1">
            <Icon icon="material-symbols:air" className="size-3.5 shrink-0 text-faint" />
            <span className="truncate font-medium text-foreground">
              {weather.wind && weather.wind.speed !== null
                ? `${weather.wind.direction} ${weather.wind.speed} m/s`
                : "--"}
            </span>
          </span>
        </div>
      </div>
    </article>
  );
}
