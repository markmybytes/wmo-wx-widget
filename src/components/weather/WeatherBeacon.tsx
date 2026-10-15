import { Icon } from "@iconify/react";
import { City, PresentWeather, TempUnit } from "@/lib/wmo";
import { WxIcon } from "./WxIcon";
import { useTranslations } from "next-intl";

/** `beacon` variant: Compact Telemetry & Tactical Cockpit.
 *  High-density, space-efficient telemetry block engineered for tight embed columns (~260–300px).
 *  Monospace accents, status beacons, and zero wasted margins. */
export default function WeatherBeacon({
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
  const condText = weather.weather ? t(weather.weather) : "";

  // Temperature bands anchored to human thermal physiology (air temp as PET-free
  // proxy; humidity/radiation not modelled):
  //   blue  < 10 °C  cold-stress caution (ACSM cold-risk; PET "cold" ≤ 8, Matzarakis & Mayer 1996)
  //   cyan  10-18 °C  cool — persistent mild vasoconstriction, layers needed (PET "cool" 8-13, "slightly cool" 13-18)
  //   green 18-26 °C  thermal neutral zone at ~1 MET — no active thermoregulation (ASHRAE adaptive comfort; PET "comfortable" 18-23)
  //   yellow 26-32 °C  above neutrality: sustained sweating required (PET "warm")
  //   orange 32-38 °C  heat-health caution (advisory territory; PET "hot" from 35)
  //   red   ≥ 38 °C  heat danger (approaching PET "very hot" > 41; WHO heat-health warning zone)
  // ponytail: raw air temp proxy, humidity not modelled; swap to PET input if thermal comfort becomes a feature.
  const celsius =
    tempVal === null ? null : tempUnit === TempUnit.F ? ((tempVal - 32) * 5) / 9 : tempVal;
  const dotColor =
    celsius === null
      ? "var(--color-muted)" // n/a reading
      : celsius < 10
        ? "var(--color-sky-400)" // cold stress caution
        : celsius < 18
          ? "var(--color-cyan-400)" // cool (PET "cool"/"slightly cool")
          : celsius < 26
            ? "var(--color-emerald-400)" // thermal neutral zone
            : celsius < 32
              ? "var(--color-yellow-400)" // sweating regime
              : celsius < 38
                ? "var(--color-orange-400)" // heat caution
                : "var(--color-red-500)"; // heat danger

  return (
    <article className="flex min-w-50 flex-1 flex-col justify-between rounded-lg border-2 border-outline-strong bg-surface p-3 shadow-xs">
      {/* Telemetry Header: Temp-stepped status beacon + Location */}
      <div className="flex items-center gap-1.5 border-b border-outline pb-2">
        {dotColor !== null && (
          <span
            className="inline-block size-2 shrink-0 rounded-full"
            style={{ backgroundColor: dotColor }}
            aria-hidden
          />
        )}
        <span className="truncate font-mono text-xs font-bold tracking-tight text-foreground uppercase">
          {city.name}
        </span>
      </div>

      {/* Primary Telemetry: Temperature & Pictogram with fluid condition text */}
      <div className="my-2 flex items-center justify-between gap-2">
        <div className="flex min-w-0 flex-1 flex-col">
          <div className="flex items-baseline font-mono font-bold text-foreground">
            <span className="text-3xl tracking-tighter @min-[theme(--breakpoint-sm)]:text-4xl">{tempVal ?? "--"}</span>
            {tempVal !== null && (
              <span className="ml-1 text-sm font-semibold text-muted">{tempUnit}</span>
            )}
          </div>
          {condText && (
            <p className="min-w-0 truncate text-[11px] font-medium text-muted">{condText}</p>
          )}
        </div>

        <div className="flex shrink-0 items-center justify-center rounded border border-outline bg-fill-faint p-1">
          <WxIcon icon={weather.icon} className="h-8 w-11 object-contain" alt={condText} />
        </div>
      </div>

      {/* Telemetry Data Grid: Grouped metrics in natural reading order with standard icons */}
      <div className="grid grid-cols-2 gap-1 border-t border-outline pt-2 font-mono text-[11px]">
        <div className="flex items-center gap-1 truncate text-muted">
          <Icon icon="material-symbols:water-drop" className="size-3 shrink-0 text-faint" />
          <span className="font-medium text-foreground">
            {weather.rh !== null ? `${weather.rh}%` : "--"}
          </span>
        </div>
        <div className="flex items-center gap-1 truncate text-muted">
          <Icon icon="material-symbols:air" className="size-3 shrink-0 text-faint" />
          <span className="truncate font-medium text-foreground">
            {weather.wind && weather.wind.speed !== null
              ? `${weather.wind.direction} ${weather.wind.speed} m/s`
              : "--"}
          </span>
        </div>
      </div>
    </article>
  );
}
