"use client";

import { Icon } from "@iconify/react";
import { useEffect, useRef, useState } from "react";

/**
 * Mocked-data live preview of all six widget looks. The load-bearing trick:
 * Tailwind v4 container queries (`@container` + `@min-[640px]:`/`@min-[768px]:`)
 * — the widget's real components use `sm:`/`md:` viewport queries, which a
 * resized <div> can never trigger; container queries reflow at these SAME pixel
 * thresholds as the preview width changes (chips/slider, with horizontal
 * overflow for presets wider than the column).
 *
 * Data is fixed Hong Kong-flavoured sample weather — the preview demos the
 * settings, it is NOT the user's selected city (the embed URL still uses that).
 */

const MIN_WIDTH = 320;
const PREVIEW_HEIGHT = 420;

// Presets: null width = 100% of the column.
const PRESETS: Array<{ label: string; width: number | null }> = [
  { label: "Full", width: null },
  { label: "Tablet", width: 768 },
  { label: "Mobile", width: 375 },
];

const STYLES = ["cards", "editorial", "bars", "swiss", "pills", "telemetry"] as const;
type PreviewStyle = (typeof STYLES)[number];

// Verified-live WMO pictograms (same host the real widget loads from).
const PRESENT_ICON = "https://worldweather.wmo.int/images/i32.png";
const ROW_ICONS = [
  "https://worldweather.wmo.int/images/i23.png",
  "https://worldweather.wmo.int/images/i5.png",
  "https://worldweather.wmo.int/images/i32.png",
];

// Nine distinct Hong-Kong-plausible days — the forecast day stepper must always
// change the preview (1:1 with formData.days, no caps).
const C_MINS = [21, 19, 24, 18, 22, 25, 27, 23, 20];
const C_MAXS = [27, 25, 30, 26, 28, 29, 33, 28, 26];
const F_MINS = [70, 66, 75, 64, 72, 77, 81, 73, 68];
const F_MAXS = [81, 77, 86, 79, 82, 84, 91, 82, 79];

const alignCls: Record<string, string> = {
  center: "@min-[768px]:items-center",
  end: "@min-[768px]:items-end",
  start: "@min-[768px]:items-start",
};

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
  const [width, setWidth] = useState<number | null>(null); // null = 100%
  const [containerW, setContainerW] = useState(0);
  const wrapRef = useRef<HTMLDivElement>(null);

  // Track the preview column width so the slider max is the container itself.
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      setContainerW(entries[0].contentRect.width);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Effective px width; explicit widths may exceed the column (horizontal
  // scroll) so the Tablet preset genuinely reflows even in a narrow column.
  const effWidth = width === null ? containerW : width;
  const sliderMax = Math.max(containerW, MIN_WIDTH, effWidth);

  const look: PreviewStyle = (STYLES as readonly string[]).includes(style) ? (style as PreviewStyle) : "swiss";

  const isC = unit !== "F";
  const tempVal = isC ? 24 : 76;
  const tempUnit = isC ? "°C" : "°F";
  const cityName = "Hong Kong";
  const condition = "Cloudy";
  const rh = 68;
  const wind = "NE 3.6 m/s";

  const rowCount = Math.max(0, Math.min(9, days || 0));
  const now = Date.now();
  const rows = Array.from({ length: rowCount }, (_, i) => {
    const d = new Date(now + i * 86400000);
    return {
      key: i,
      weekday: d.toLocaleString(locale, { weekday: "short" }),
      day: d.getDate(),
      icon: ROW_ICONS[i % 3],
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
                  <span className="max-w-24 truncate text-xs font-semibold tracking-tight text-foreground @min-[640px]:text-[11px] @min-[640px]:text-muted @min-[640px]:uppercase">
                    {r.weekday}
                  </span>
                )}
                {date && (
                  <span className="text-[11px] text-faint @min-[640px]:text-xs">{r.day}</span>
                )}
              </div>
            )}
            <div className="my-1 flex shrink-0 items-center justify-center">
              <div className={dense ? "h-7 w-10 @min-[640px]:h-8 @min-[640px]:w-11" : "h-8 w-11 @min-[640px]:h-9.5 @min-[640px]:w-13"}>
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
      {look === "swiss" && (
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
              <span className="text-lg font-medium text-muted @min-[640px]:text-xl">{tempUnit}</span>
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

      {look === "cards" && (
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

      {look === "editorial" && (
        <div className="flex min-w-54 flex-1 flex-col gap-y-5 rounded-xl border border-outline bg-surface p-4 shadow-xs @min-[640px]:p-5 @min-[768px]:justify-center @min-[768px]:gap-y-6">
          <p className="truncate text-[11px] font-semibold tracking-[0.18em] text-faint uppercase">
            {cityName}
          </p>
          <div className="flex items-end justify-between gap-3">
            <div className="min-w-0">
              <p className="flex items-baseline font-display text-5xl leading-none font-bold tracking-tight text-foreground tabular-nums @min-[640px]:text-6xl">
                {tempVal}
                <span className="ms-1 text-xl font-normal text-muted @min-[640px]:text-2xl">{tempUnit}</span>
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

      {look === "bars" && (
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

      {look === "pills" && (
        <article className="flex min-w-54 flex-1 flex-col justify-between rounded-2xl border border-outline bg-surface p-4 shadow-sm @min-[768px]:p-5">
          <div className="flex items-center justify-between gap-2">
            <div className="flex max-w-[65%] min-w-0 shrink-0 items-center gap-1.5 rounded-full border border-outline bg-fill-faint px-2.5 py-1">
              <Icon icon="material-symbols:location-on-outline" className="size-3.5 shrink-0 text-brand" />
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
              <span className="ml-0.5 text-xl font-bold text-brand @min-[640px]:text-2xl">{tempUnit}</span>
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

      {look === "telemetry" && (
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
      {/* Toolbar: presets + width slider + readout */}
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
        <div className="flex gap-1 rounded-lg border border-outline bg-fill-faint p-1" role="group">
          {PRESETS.map((p) => (
            <button
              key={p.label}
              type="button"
              aria-pressed={width === p.width}
              onClick={() => setWidth(p.width)}
              className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                width === p.width
                  ? "bg-surface text-foreground shadow-xs ring-1 ring-outline"
                  : "text-muted hover:text-foreground"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>

        <input
          type="range"
          aria-label="Preview width"
          min={MIN_WIDTH}
          max={sliderMax}
          step="1"
          value={Math.min(effWidth, sliderMax)}
          disabled={containerW === 0}
          onChange={(e) => {
            setWidth(parseInt(e.target.value));
          }}
          className="h-1 min-w-32 flex-1 accent-brand-solid disabled:opacity-50"
        />

        <span className="min-w-14 text-end font-mono text-xs text-faint tabular-nums">
          {width === null ? "100%" : `${Math.round(effWidth)}px`}
        </span>
      </div>

      {/* Horizontal overflow lets presets wider than the column still reflow. */}
      <div className="overflow-x-auto pb-1" ref={wrapRef}>
        <div
          className="@container relative rounded-xl border border-outline bg-background"
          style={{
            height: PREVIEW_HEIGHT,
            width: width === null ? "100%" : effWidth,
          }}
        >
          {/* Widget page layout: stacked, side-by-side at the widget's md tier.
              Alignment applies in the row tier like the real page. */}
          <div
            className={`flex h-full flex-col items-stretch gap-2 overflow-y-auto p-2 @min-[768px]:flex-row @min-[768px]:gap-x-2 ${alignCls[align] ?? alignCls.start}`}
          >
            {present}
            {forecastStrip}
            {!weather && !forecast && (
              <p className="m-auto font-mono text-xs text-faint">—</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
