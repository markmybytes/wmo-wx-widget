"use client";

import { Icon } from "@iconify/react";
import { useEffect, useRef, useState } from "react";

const LOGICAL_HEIGHT = 420;
const LOGICAL_WIDTHS = { desktop: 1024, tablet: 720, mobile: 375 } as const;
type ViewId = keyof typeof LOGICAL_WIDTHS;
const VIEW_IDS = ["desktop", "tablet", "mobile"] as const;

const VIEW_ICONS: Record<ViewId, string> = {
  desktop: "material-symbols:desktop-windows-outline",
  tablet: "material-symbols:tablet-mac-outline",
  mobile: "material-symbols:phone-iphone-outline",
};

const STYLES = ["precision", "classic", "masthead", "range-bars", "capsule", "beacon"] as const;
type PreviewStyle = (typeof STYLES)[number];

// Sample values hardcoded from a live WMO reference pull so the client-side
// preview needs no runtime fetch. City: Geneva, Switzerland (WMO city id 193,
// station "GENEVE-COINTRIN"). Icon URLs follow the feed's wxIconUrl scheme
// (i{numeric code with the last two digits dropped}); forecast min/max use the
// feed's own C and F strings, present °F is the feed's Celsius converted.
const PRESENT_ICON = "https://worldweather.wmo.int/images/i24.png";
const ROW_ICONS = [
  "https://worldweather.wmo.int/images/i24.png", // 2402 Sunny
  "https://worldweather.wmo.int/images/i24.png", // 2402 Sunny
  "https://worldweather.wmo.int/images/i22.png", // 2201 Sunny Periods
  "https://worldweather.wmo.int/images/i20.png", // 2001 Overcast
  "https://worldweather.wmo.int/images/i21.png", // 2101 Sunny Intervals
  "https://worldweather.wmo.int/images/i22.png", // 2201 Sunny Periods
  "https://worldweather.wmo.int/images/i22.png", // 2201 Sunny Periods
  "https://worldweather.wmo.int/images/i22.png", // 2201 Sunny Periods
  "https://worldweather.wmo.int/images/i22.png", // feed's last day, continued
];

const C_MINS = [9, 7, 10, 8, 8, 7, 9, 9, 9];
const C_MAXS = [19, 20, 15, 13, 13, 15, 15, 16, 16];
const F_MINS = [48, 45, 50, 46, 46, 45, 48, 48, 48];
const F_MAXS = [66, 68, 59, 55, 55, 59, 59, 61, 61];

const alignCls: Record<string, string> = {
  center: "@min-[768px]:items-center",
  end: "@min-[768px]:items-end",
  start: "@min-[768px]:items-start",
};

const suppressDate = { suppressHydrationWarning: true } as const;

export default function WidgetStylePreview({
  style,
  unit,
  align,
  weekday,
  date,
  weather,
  forecast,
  days,
  locale,
}: {
  style: string;
  unit: string;
  align: string;
  weekday: boolean;
  date: boolean;
  weather: boolean;
  forecast: boolean;
  days: number;
  locale: string;
}) {
  const [view, setView] = useState<ViewId>("desktop");
  const [colW, setColW] = useState(0);
  const colRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = colRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      setColW(entries[0].contentRect.width);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const viewW = LOGICAL_WIDTHS[view];
  const factor = colW > 0 ? Math.min(1, colW / viewW) : 1;

  const look: PreviewStyle = (STYLES as readonly string[]).includes(style)
    ? (style as PreviewStyle)
    : "precision";

  const isC = unit !== "F";
  const tempVal = isC ? 11 : 51.8;
  const tempUnit = isC ? "°C" : "°F";
  const cityName = "Geneva";
  const condition = "Sunny";
  const rh = 96;
  const wind = "NNE 0.4 m/s";

  const rowCount = Math.max(0, Math.min(9, days || 0));
  const rows = Array.from({ length: rowCount }, (_, i) => {
    const d = new Date(Date.now() + i * 86400000);
    return {
      key: i,
      weekday: d.toLocaleString(locale, { weekday: "short" }),
      day: d.getDate(),
      icon: ROW_ICONS[i % ROW_ICONS.length],
      min: `${(isC ? C_MINS : F_MINS)[i]}${tempUnit}`,
      max: `${(isC ? C_MAXS : F_MAXS)[i]}${tempUnit}`,
    };
  });

  const forecastStrip = forecast && (
    <div className="flex flex-2 flex-col gap-1.5 @min-[640px]:flex-row @min-[640px]:gap-0 @min-[640px]:divide-x @min-[640px]:divide-outline @min-[640px]:rounded-xl @min-[640px]:border @min-[640px]:border-outline @min-[640px]:bg-surface @min-[640px]:shadow-xs">
      {rows.map((r) => {
        const dense = rowCount >= 8;
        return (
          <div
            key={r.key}
            className={`flex w-full grow items-center justify-between rounded-xl border border-outline bg-surface p-2 shadow-xs @min-[640px]:flex-col @min-[640px]:justify-around @min-[640px]:rounded-none @min-[640px]:border-0 @min-[640px]:bg-transparent @min-[640px]:shadow-none ${
              dense ? "@min-[640px]:p-1.5" : "@min-[640px]:p-2"
            }`}
          >
            {(weekday || date) && (
              <div className="flex min-w-16 flex-col items-start font-mono @min-[640px]:items-center">
                {weekday && (
                  <span
                    className="max-w-24 truncate text-xs font-semibold tracking-tight text-foreground @min-[640px]:text-[11px] @min-[640px]:text-muted @min-[640px]:uppercase"
                    {...suppressDate}
                  >
                    {r.weekday}
                  </span>
                )}
                {date && (
                  <span className="text-[11px] text-faint @min-[640px]:text-xs" {...suppressDate}>
                    {r.day}
                  </span>
                )}
              </div>
            )}
            <div className="my-1 flex shrink-0 items-center justify-center">
              <div
                className={
                  dense
                    ? "h-7 w-10 @min-[640px]:h-8 @min-[640px]:w-11"
                    : "h-8 w-11 @min-[640px]:h-9.5 @min-[640px]:w-13"
                }
              >
                <img src={r.icon} alt="" className="size-full object-contain" />
              </div>
            </div>
            <div className="flex items-center gap-2 font-mono @min-[640px]:flex-col @min-[640px]:gap-0.5">
              <span className="flex items-center gap-0.5 text-temp-low">
                <Icon icon="bi:thermometer-low" className="size-3 shrink-0" />
                <span className="text-xs font-medium opacity-85">{r.min}</span>
              </span>
              <span className="flex items-center gap-0.5 text-temp-high">
                <Icon icon="bi:thermometer-high" className="size-3 shrink-0" />
                <span className="text-xs font-semibold">{r.max}</span>
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );

  const present = weather && (
    <>
      {look === "precision" && (
        <article className="flex min-w-54 flex-1 flex-col justify-between rounded-xl border border-outline bg-surface p-3.5 shadow-xs transition-colors @min-[768px]:p-4">
          <div className="flex items-start justify-between gap-2 border-b border-outline pb-2.5">
            <div className="min-w-0 flex-1">
              <p className="flex items-center gap-1 font-mono text-[11px] font-semibold tracking-wider text-muted uppercase">
                <Icon icon="material-symbols:location-on-outline" className="size-3.5 shrink-0" />
                <span className="truncate">{cityName}</span>
              </p>
              <p className="mt-0.5 truncate text-xs font-medium text-foreground @min-[640px]:text-sm">
                {condition}
              </p>
            </div>
            <div className="flex shrink-0 items-center justify-center rounded-lg border border-outline bg-fill-faint p-1">
              <img src={PRESENT_ICON} alt={condition} className="h-8 w-11 object-contain" />
            </div>
          </div>
          <div className="mt-3 flex items-end justify-between gap-2">
            <div className="flex items-baseline gap-1">
              <span className="font-display text-4xl font-bold tracking-tight text-foreground @min-[640px]:text-5xl">
                {tempVal}
              </span>
              <span className="text-lg font-medium text-muted @min-[640px]:text-xl">
                {tempUnit}
              </span>
            </div>
            <div className="flex items-center gap-2.5 font-mono text-xs text-muted">
              <span className="flex items-center gap-1">
                <Icon icon="material-symbols:water-drop" className="size-3.5 shrink-0 text-faint" />
                <span className="font-medium text-foreground">{`${rh}%`}</span>
              </span>
              <span className="flex items-center gap-1">
                <Icon icon="material-symbols:air" className="size-3.5 shrink-0 text-faint" />
                <span className="truncate font-medium text-foreground">{wind}</span>
              </span>
            </div>
          </div>
        </article>
      )}

      {look === "classic" && (
        <div className="flex min-w-54 flex-1 flex-col items-center justify-around gap-y-1.5 rounded border border-outline bg-surface p-1 shadow-sm @min-[768px]:justify-center">
          <p className="flex items-center justify-center gap-x-1 text-xs text-muted @min-[640px]:text-sm">
            <Icon icon="material-symbols:location-on-outline" />
            <span className="min-w-0 truncate">{cityName}</span>
          </p>
          <div className="flex items-center justify-around gap-2 @min-[768px]:flex-col">
            <div className="flex items-center gap-x-0.5 @min-[640px]:gap-x-1.5 @min-[768px]:w-full">
              <div className="h-10 w-13.75 @min-[640px]:h-12.5 @min-[640px]:w-17.5">
                <img src={PRESENT_ICON} alt={condition} className="size-full" />
              </div>
              <p className="text-center font-mono text-lg font-medium text-foreground @min-[640px]:text-2xl">
                {`${tempVal}${tempUnit}`}
              </p>
            </div>
            <div className="flex flex-col items-center @min-[768px]:w-full">
              <p className="hidden w-full max-w-50 truncate bg-fill text-center text-xs text-foreground @min-[640px]:block">
                {condition}
              </p>
              <div className="flex flex-col gap-x-2 text-xs @min-[640px]:flex-row @min-[640px]:text-sm">
                <span className="flex items-center gap-x-1">
                  <Icon icon="material-symbols:water-drop" />
                  {`${rh}%`}
                </span>
                <span className="flex items-center gap-x-1">
                  <Icon icon="material-symbols:air" />
                  {wind}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {look === "masthead" && (
        <div className="flex min-w-54 flex-1 flex-col gap-y-5 rounded-xl border border-outline bg-surface p-4 shadow-xs @min-[640px]:p-5 @min-[768px]:justify-center @min-[768px]:gap-y-6">
          <p className="truncate text-[11px] font-semibold tracking-[0.18em] text-faint uppercase">
            {cityName}
          </p>
          <div className="flex items-end justify-between gap-3">
            <div className="min-w-0">
              <p className="flex items-baseline font-display text-5xl leading-none font-bold tracking-tight text-foreground tabular-nums @min-[640px]:text-6xl">
                {tempVal}
                <span className="ms-1 text-xl font-normal text-muted @min-[640px]:text-2xl">
                  {tempUnit}
                </span>
              </p>
              <p className="mt-2.5 truncate text-xs font-medium text-muted @min-[640px]:text-sm">
                {condition}
              </p>
            </div>
            <div className="h-12.5 w-17.5 shrink-0">
              <img src={PRESENT_ICON} alt={condition} className="size-full object-contain" />
            </div>
          </div>
          <div className="flex items-center justify-start gap-x-5 border-t border-outline/80 pt-3 text-xs text-muted @min-[640px]:pt-4">
            <span className="flex shrink-0 items-center gap-x-1.5">
              <Icon icon="material-symbols:water-drop" className="size-3.5 text-faint" />
              <span>{`${rh}%`}</span>
            </span>
            <span className="flex min-w-0 items-center gap-x-1.5">
              <Icon icon="material-symbols:air" className="size-3.5 shrink-0 text-faint" />
              <span className="truncate">{wind}</span>
            </span>
          </div>
        </div>
      )}

      {look === "range-bars" && (
        <div className="flex min-w-54 flex-1 flex-col justify-between gap-y-2.5 rounded-lg border border-outline bg-surface p-3 shadow-xs">
          <div className="flex min-w-0 items-center gap-x-1 text-xs text-muted">
            <Icon icon="material-symbols:location-on-outline" className="size-3.5 shrink-0" />
            <span className="truncate font-medium">{cityName}</span>
          </div>
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0">
              <p className="flex items-baseline font-mono text-3xl leading-none font-semibold text-foreground tabular-nums">
                {tempVal}
                <span className="ms-0.5 text-xs font-medium text-muted">{tempUnit}</span>
              </p>
              <p className="mt-1.5 truncate rounded bg-fill px-1.5 py-0.5 text-[11px] font-medium text-foreground">
                {condition}
              </p>
            </div>
            <div className="h-10 w-13.75 shrink-0">
              <img src={PRESENT_ICON} alt={condition} className="size-full object-contain" />
            </div>
          </div>
          <div className="flex items-center justify-start gap-x-4 border-t border-outline/60 pt-2 font-mono text-[11px] text-muted">
            <span className="flex shrink-0 items-center gap-x-1">
              <Icon icon="material-symbols:water-drop" className="size-3" />
              <span>{`${rh}%`}</span>
            </span>
            <span className="flex min-w-0 items-center gap-x-1">
              <Icon icon="material-symbols:air" className="size-3 shrink-0" />
              <span className="truncate">{wind}</span>
            </span>
          </div>
        </div>
      )}

      {look === "capsule" && (
        <article className="flex min-w-54 flex-1 flex-col justify-between rounded-2xl border border-outline bg-surface p-4 shadow-sm @min-[768px]:p-5">
          <div className="flex items-center justify-between gap-2">
            <div className="flex max-w-[65%] min-w-0 shrink-0 items-center gap-1.5 rounded-full border border-outline bg-fill-faint px-2.5 py-1">
              <Icon
                icon="material-symbols:location-on-outline"
                className="size-3.5 shrink-0 text-brand"
              />
              <span className="truncate text-xs font-semibold text-foreground">{cityName}</span>
            </div>
            <span className="min-w-0 truncate rounded-full bg-fill px-2.5 py-1 text-[11px] font-medium text-muted">
              {condition}
            </span>
          </div>
          <div className="my-3 flex items-center justify-between @min-[640px]:my-4">
            <div className="flex items-baseline">
              <span className="font-display text-4xl font-extrabold tracking-tight text-foreground @min-[640px]:text-5xl">
                {tempVal}
              </span>
              <span className="ml-0.5 text-xl font-bold text-brand @min-[640px]:text-2xl">
                {tempUnit}
              </span>
            </div>
            <div className="flex shrink-0 items-center justify-center rounded-2xl bg-fill/50 p-1.5">
              <img src={PRESENT_ICON} alt={condition} className="h-10 w-14 object-contain" />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex min-w-0 flex-1 items-center gap-1.5 rounded-xl border border-outline/70 bg-fill-faint px-2.5 py-1.5">
              <Icon icon="material-symbols:water-drop" className="size-3.5 shrink-0 text-brand" />
              <span className="truncate font-mono text-xs font-medium text-foreground">{`${rh}%`}</span>
            </div>
            <div className="flex min-w-0 flex-1 items-center gap-1.5 rounded-xl border border-outline/70 bg-fill-faint px-2.5 py-1.5">
              <Icon icon="material-symbols:air" className="size-3.5 shrink-0 text-muted" />
              <span className="truncate font-mono text-xs font-medium text-foreground">{wind}</span>
            </div>
          </div>
        </article>
      )}

      {look === "beacon" && (
        <article className="flex min-w-50 flex-1 flex-col justify-between rounded-lg border-2 border-outline-strong bg-surface p-3 shadow-xs">
          <div className="flex items-center gap-1.5 border-b border-outline pb-2">
            <span
              className="inline-block size-2 shrink-0 rounded-full"
              style={{ backgroundColor: "var(--color-emerald-400)" }}
              aria-hidden
            />
            <span className="truncate font-mono text-xs font-bold tracking-tight text-foreground uppercase">
              {cityName}
            </span>
          </div>
          <div className="my-2 flex items-center justify-between gap-2">
            <div className="flex min-w-0 flex-1 flex-col">
              <div className="flex items-baseline font-mono font-bold text-foreground">
                <span className="text-3xl tracking-tighter @min-[640px]:text-4xl">{tempVal}</span>
                <span className="ml-1 text-sm font-semibold text-muted">{tempUnit}</span>
              </div>
              <p className="min-w-0 truncate text-[11px] font-medium text-muted">{condition}</p>
            </div>
            <div className="flex shrink-0 items-center justify-center rounded border border-outline bg-fill-faint p-1">
              <img src={PRESENT_ICON} alt={condition} className="h-8 w-11 object-contain" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-1 border-t border-outline pt-2 font-mono text-[11px]">
            <div className="flex items-center gap-1 truncate text-muted">
              <Icon icon="material-symbols:water-drop" className="size-3 shrink-0 text-faint" />
              <span className="font-medium text-foreground">{`${rh}%`}</span>
            </div>
            <div className="flex items-center gap-1 truncate text-muted">
              <Icon icon="material-symbols:air" className="size-3 shrink-0 text-faint" />
              <span className="truncate font-medium text-foreground">{wind}</span>
            </div>
          </div>
        </article>
      )}
    </>
  );

  return (
    <div className="flex flex-col gap-y-3">
      {/* Pure Viewport Toolbar */}
      <div className="flex items-center justify-between gap-2">
        <div
          className="flex gap-1 rounded-lg border border-outline bg-fill-faint p-1"
          role="group"
          aria-label="Preview viewport"
        >
          {VIEW_IDS.map((v) => {
            const isSelected = view === v;
            return (
              <button
                key={v}
                type="button"
                aria-pressed={isSelected}
                onClick={() => setView(v)}
                className={`flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-medium capitalize transition-colors ${
                  isSelected
                    ? "bg-surface text-foreground shadow-xs ring-1 ring-outline"
                    : "text-muted hover:text-foreground"
                }`}
              >
                <Icon icon={VIEW_ICONS[v]} width="14" height="14" />
                <span className="hidden sm:inline">{v}</span>
              </button>
            );
          })}
        </div>

        <span aria-hidden className="font-mono text-xs text-faint tabular-nums">
          {viewW}px {factor < 1 ? `· ${Math.round(factor * 100)}%` : ""}
        </span>
      </div>

      {/* Responsive Preview Frame */}
      <div ref={colRef} className="w-full">
        <div
          className="mx-auto overflow-hidden rounded-xl border border-outline bg-background"
          style={{ width: viewW * factor, height: LOGICAL_HEIGHT * factor }}
        >
          {/* The @container must be a distinct ancestor of the elements using its
              variants: a container query never matches the container itself. Frame
              is always authored at viewW; scale-to-fit is purely visual. */}
          <div
            className="@container"
            style={{
              width: viewW,
              height: LOGICAL_HEIGHT,
              transform: `scale(${factor})`,
              transformOrigin: "top left",
            }}
          >
            <div
              className={`flex h-full flex-col gap-2 overflow-y-auto p-2.5 @min-[768px]:flex-row @min-[768px]:gap-x-2 ${
                alignCls[align] ?? alignCls.start
              }`}
            >
              {present}
              {forecastStrip}
              {!weather && !forecast && <p className="m-auto font-mono text-xs text-faint">—</p>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
