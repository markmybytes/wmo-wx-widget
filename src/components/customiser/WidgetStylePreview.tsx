"use client";

import { Icon } from "@iconify/react";
import { useEffect, useMemo, useRef, useState } from "react";

const LOGICAL_WIDTHS = { desktop: 1024, tablet: 720, mobile: 375 } as const;
type ViewId = keyof typeof LOGICAL_WIDTHS;

// Per-view default stage height (visible CSS px), like a real embed: wide
// desktop embeds run taller, mobile embeds shorter. Tablet's default is
// unassigned by the owner, so it borrows the desktop value (580) as the
// designer-default. Drag persists into the current view's slot; double-click
// resets that view to its default. 580 is enough to showcase the
// responsiveness; stacked 5-row mobile content (~630px logical at factor 1)
// scrolls slightly inside 520 - owner-accepted.
//
// ponytail: this file is a deliberate MIRROR of the six Weather*/Forecast*
// server components, not a shared render. They are async server components
// (getTranslations + server-fetched data) and cannot mount in a client tree,
// and the owner needs live state reactivity (days, unit, align, gates) that
// server rendering can't give without a reload. When the styles next evolve
// or break visually here, the fix is the planned refactor: lift translated
// condition text into props, make the six pairs pure client-safe
// presentational components, then delete this mirror and render the real
// ones with sample data. Owner approved doing that later ("B now, A later").
const VIEW_DEFAULT_HEIGHTS: Record<ViewId, number> = { desktop: 580, tablet: 580, mobile: 520 };

// Present-weather pictogram; the per-day strip cycles three WMO codes by index.
const PRESENT_ICON = "https://worldweather.wmo.int/images/i24.png";

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
  // Per-view visible-height override; undefined = that view's default. Drag
  // writes the current view's slot, double-click clears it back to default.
  const [heights, setHeights] = useState<Record<ViewId, number | undefined>>({
    desktop: undefined,
    tablet: undefined,
    mobile: undefined,
  });
  const colRef = useRef<HTMLDivElement>(null);
  const drag = useRef<{ y: number; h: number } | null>(null);

  useEffect(() => {
    const el = colRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      setColW(entries[0].contentRect.width);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Math.random() sample values must not run during SSR/hydration (they would
  // differ from the server's), so they only appear after mount; the pre-mount
  // render is deterministic and matches on both sides.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const viewW = LOGICAL_WIDTHS[view];
  const factor = colW > 0 ? Math.min(1, colW / viewW) : 1;
  const visH = heights[view] ?? VIEW_DEFAULT_HEIGHTS[view];
  // Logical stage per view: visH/factor scales back to exactly visH visible
  // px, so the box height is view-independent.
  const stageH = visH / factor;

  function onHandleDown(e: React.PointerEvent<HTMLDivElement>) {
    if (e.button !== 0) return;
    e.preventDefault();
    drag.current = { y: e.clientY, h: visH };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  }

  function onHandleMove(e: React.PointerEvent<HTMLDivElement>) {
    if (!drag.current) return;
    const next = Math.min(700, Math.max(240, drag.current.h - (e.clientY - drag.current.y)));
    setHeights((prev) => ({ ...prev, [view]: next }));
  }

  function onHandleUp(e: React.PointerEvent<HTMLDivElement>) {
    drag.current = null;
    (e.target as HTMLElement).releasePointerCapture(e.pointerId);
  }

  const look = (
    ["precision", "classic", "masthead", "range-bars", "capsule", "beacon"] as readonly string[]
  ).includes(style)
    ? (style as "precision" | "classic" | "masthead" | "range-bars" | "capsule" | "beacon")
    : "precision";

  const isC = unit !== "F";
  const tempUnit = isC ? "°C" : "°F";
  const cityName = "Geneva";
  const condition = "Sunny";
  const rowCount = Math.max(0, Math.min(9, days || 0));

  // Sample data: inline formulas + Math.random (owner-accepted), memoized per
  // (days, unit, locale) so values never jitter on unrelated re-renders.
  const { rows, tempVal, rh, wind } = useMemo(() => {
    const rnd = () => (mounted ? Math.random() : 0.5);
    const toF = (c: number) => Math.round((c * 9) / 5 + 32);
    const rows = Array.from({ length: rowCount }, (_, i) => {
      const lo = 8 + i * 2 + Math.round(rnd() * 4);
      const hi = lo + 6 + Math.round(rnd() * 3);
      const minNum = isC ? lo : toF(lo);
      const maxNum = isC ? hi : toF(hi);
      const d = new Date(Date.now() + i * 86400000);
      return {
        key: i,
        weekday: d.toLocaleString(locale, { weekday: "short" }),
        weekdayLong: d.toLocaleString(locale, { weekday: "long" }),
        day: d.getDate(),
        condition: ["Sunny", "Sunny Periods", "Overcast"][i % 3],
        icon: [
          "https://worldweather.wmo.int/images/i24.png",
          "https://worldweather.wmo.int/images/i22.png",
          "https://worldweather.wmo.int/images/i20.png",
        ][i % 3],
        min: `${minNum}${tempUnit}`,
        max: `${maxNum}${tempUnit}`,
        minNum,
        maxNum,
      };
    });
    const tempC = 10 + Math.round(rnd() * 6);
    return {
      rows,
      tempVal: isC ? tempC : Math.round(((tempC * 9) / 5 + 32) * 10) / 10,
      rh: 60 + Math.round(rnd() * 35),
      wind: `${["N", "NE", "E", "SE"][Math.floor(rnd() * 4)]} ${(0.4 + rnd() * 4).toFixed(1)} m/s`,
    };
  }, [rowCount, isC, locale, mounted, tempUnit]);

  const forecastStrip = forecast && (
    <>
      {/* precision: hairline-divided calendar strip with thermometer metrics
          (mirrors ForecastPrecision) */}
      {look === "precision" && (
        <div className="flex flex-2 flex-col gap-1.5 @min-[640px]:flex-row @min-[640px]:gap-0 @min-[640px]:divide-x @min-[640px]:divide-outline @min-[640px]:rounded-xl @min-[640px]:border @min-[640px]:border-outline @min-[640px]:bg-surface @min-[640px]:shadow-xs">
          {rows.map((r) => {
            const dense = rowCount >= 8;
            return (
              <div
                key={r.key}
                className={`flex w-full grow items-center justify-between rounded-xl border border-outline bg-surface p-2 shadow-xs @min-[640px]:flex-col @min-[640px]:justify-around @min-[640px]:rounded-none @min-[640px]:border-0 @min-[640px]:bg-transparent @min-[640px]:shadow-none ${
                  dense ? "@min-[640px]:p-1.5" : "@min-[640px]:p-2.5"
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
                      <span
                        className="text-[11px] text-faint @min-[640px]:text-xs"
                        {...suppressDate}
                      >
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
                  <div className="flex items-center gap-0.5 text-temp-low">
                    <Icon icon="bi:thermometer-low" className="size-3 shrink-0" />
                    <span className="text-xs font-medium opacity-85">{r.min}</span>
                  </div>
                  <div className="flex items-center gap-0.5 text-temp-high">
                    <Icon icon="bi:thermometer-high" className="size-3 shrink-0" />
                    <span className="text-xs font-semibold">{r.max}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* classic: bordered column list ??long-weekday block / icon / mono temp
          cluster, columns collapse to a row at the wide tier (mirrors
          ForecastClassic) */}
      {look === "classic" && (
        <div className="flex flex-2 flex-col items-center gap-y-1.5 rounded border border-outline bg-surface shadow-sm @min-[640px]:flex-row @min-[640px]:p-1">
          {rows.map((r) => (
            <div
              key={r.key}
              className="flex w-full grow items-center rounded border border-outline @min-[640px]:flex-col @min-[640px]:border-none"
            >
              <div className="flex min-w-3/10 flex-col items-center justify-center font-mono text-xs">
                {weekday && (
                  <span className="max-w-32 truncate text-muted" {...suppressDate}>
                    {r.weekdayLong}
                  </span>
                )}
                {date && <span {...suppressDate}>{r.day}</span>}
              </div>

              <div className="my-1 flex grow items-center justify-center">
                <div className="h-9.5 w-12.5">
                  <img src={r.icon} alt="" className="size-full" />
                </div>
              </div>

              <div
                className={`flex min-w-3/10 flex-col items-center justify-center gap-x-1 ${
                  rowCount >= 7 ? "@min-[1024px]:flex-row" : "@min-[768px]:flex-row"
                }`}
              >
                {rowCount < 8 ? (
                  <>
                    <div className="flex min-w-13 items-center justify-around text-temp-low">
                      <Icon icon="bi:thermometer-low" className="size-3.5" />
                      <span className="grow text-center font-mono text-sm">{r.min}</span>
                    </div>
                    <div className="flex min-w-13 items-center justify-around text-temp-high">
                      <Icon icon="bi:thermometer-high" className="size-3.5" />
                      <span className="grow text-center font-mono text-sm">{r.max}</span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex min-w-13 items-center justify-around text-temp-low @min-[1024px]:justify-end">
                      <Icon icon="bi:thermometer-low" className="size-3.5 @min-[640px]:hidden" />
                      <span className="grow text-center font-mono text-sm">{r.min}</span>
                    </div>
                    <div className="flex min-w-13 items-center justify-around text-temp-high @min-[1024px]:justify-start">
                      <Icon icon="bi:thermometer-high" className="size-3.5 @min-[640px]:hidden" />
                      <span className="grow text-center font-mono text-sm">{r.max}</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* masthead: hairline-divided typographic list rows with localized
          condition copy at the strip tier (mirrors ForecastMasthead) */}
      {look === "masthead" && (
        <div className="flex flex-2 flex-col divide-y divide-outline/80 rounded-xl border border-outline bg-surface p-1 shadow-xs">
          {rows.map((r) => (
            <div key={r.key} className="flex items-center gap-x-3 px-2.5 py-2.5 @min-[640px]:px-3">
              {(weekday || date) && (
                <div className="flex w-12 shrink-0 flex-col font-mono text-xs @min-[640px]:w-16">
                  {weekday && (
                    <span
                      className="truncate text-[11px] font-semibold tracking-wider text-muted uppercase"
                      {...suppressDate}
                    >
                      {r.weekday}
                    </span>
                  )}
                  {date && (
                    <span className="text-xs font-medium text-foreground" {...suppressDate}>
                      {r.day}
                    </span>
                  )}
                </div>
              )}

              <img src={r.icon} alt="" className="h-9.5 w-12.5 shrink-0 object-contain" />

              <p className="hidden min-w-0 grow truncate text-xs text-muted @min-[640px]:block @min-[640px]:ps-2">
                {r.condition}
              </p>

              <div className="ms-auto flex shrink-0 items-baseline gap-x-1.5 font-mono text-xs @min-[640px]:text-sm">
                <span className="text-muted">{`${r.minNum}°`}</span>
                <span className="font-light text-outline-strong">/</span>
                <span className="font-medium text-foreground">{r.max}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* range-bars: divided rows with mono readings and temperature-range
          pills normalized across the visible period (mirrors
          ForecastRangeBars) */}
      {look === "range-bars" && (
        <div className="flex flex-2 flex-col divide-y divide-outline/70 rounded-lg border border-outline bg-surface p-1 shadow-xs">
          {rows.map((r) => {
            // Zero-span fallback, clamped range, minimum pill width for
            // degenerate days ??same geometry as the real component.
            let left = 0;
            let width = 0;
            if (rowCount > 0) {
              const reads = rows.flatMap((x) => [x.minNum, x.maxNum]);
              const gMin = Math.min(...reads);
              const gMax = Math.max(...reads);
              const span = gMax - gMin;
              if (span === 0) {
                left = 35;
                width = 30;
              } else {
                const rawLeft = ((r.minNum - gMin) / span) * 100;
                const rawWidth = ((r.maxNum - r.minNum) / span) * 100;
                width = Math.min(100, Math.max(rawWidth, 7));
                left = Math.min(Math.max(0, rawLeft), 100 - width);
              }
            }

            return (
              <div key={r.key} className="flex items-center gap-x-2 px-2.5 py-2">
                {(weekday || date) && (
                  <div className="flex w-10 shrink-0 flex-col items-center font-mono text-[11px] @min-[640px]:w-12">
                    {weekday && (
                      <span className="truncate text-muted" {...suppressDate}>
                        {r.weekday}
                      </span>
                    )}
                    {date && (
                      <span className="font-medium text-foreground" {...suppressDate}>
                        {r.day}
                      </span>
                    )}
                  </div>
                )}

                <img src={r.icon} alt="" className="h-7 w-9.5 shrink-0 object-contain" />

                <div className="ms-auto flex w-full min-w-0 items-center gap-x-2 @min-[640px]:max-w-56">
                  <span className="w-8 shrink-0 text-end font-mono text-[11px] text-muted tabular-nums @min-[640px]:w-9">
                    {`${r.minNum}°`}
                  </span>

                  <div className="relative h-1.5 max-w-32 grow rounded-full bg-outline/80 @min-[640px]:max-w-44 dark:bg-fill">
                    <div
                      className="absolute inset-y-0 rounded-full bg-gradient-to-r from-temp-low to-temp-high shadow-xs"
                      style={{ left: `${left}%`, width: `${width}%` }}
                    />
                  </div>

                  <span className="w-8 shrink-0 text-start font-mono text-[11px] font-medium text-foreground tabular-nums @min-[640px]:w-9">
                    {`${r.maxNum}°`}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* capsule: rounded day chips converging to a unified pill tray at the
          strip tier (mirrors ForecastCapsule) */}
      {look === "capsule" && (
        <div className="flex flex-2 flex-col gap-2 @min-[640px]:flex-row @min-[640px]:gap-1.5 @min-[640px]:rounded-2xl @min-[640px]:border @min-[640px]:border-outline @min-[640px]:bg-surface @min-[640px]:p-2 @min-[640px]:shadow-sm">
          {rows.map((r) => {
            const dense = rowCount >= 8;
            return (
              <div
                key={r.key}
                className={`flex w-full grow items-center justify-between rounded-xl border border-outline bg-surface p-2.5 shadow-xs @min-[640px]:flex-col @min-[640px]:justify-between @min-[640px]:border-0 @min-[640px]:bg-fill-faint/60 @min-[640px]:shadow-none @min-[640px]:hover:bg-fill-faint ${
                  dense ? "@min-[640px]:px-1 @min-[640px]:py-2" : "@min-[640px]:p-2.5"
                }`}
              >
                {(weekday || date) && (
                  <div className="flex items-center gap-1 rounded-full bg-fill px-2 py-0.5 text-xs font-semibold text-foreground @min-[640px]:flex-col @min-[640px]:gap-0 @min-[640px]:bg-transparent @min-[640px]:px-1 @min-[640px]:py-0">
                    {weekday && (
                      <span
                        className="max-w-20 truncate text-[11px] tracking-wide text-muted uppercase @min-[640px]:text-[10px]"
                        {...suppressDate}
                      >
                        {r.weekday}
                      </span>
                    )}
                    {date && (
                      <span
                        className="font-mono text-xs font-bold text-foreground"
                        {...suppressDate}
                      >
                        {r.day}
                      </span>
                    )}
                  </div>
                )}

                <div className="my-1 flex shrink-0 items-center justify-center">
                  <div
                    className={
                      dense
                        ? "h-7 w-10 @min-[640px]:h-7.5 @min-[640px]:w-10.5"
                        : "h-8 w-11 @min-[640px]:h-9 @min-[640px]:w-12.5"
                    }
                  >
                    <img src={r.icon} alt="" className="size-full object-contain" />
                  </div>
                </div>

                <div className="flex items-center gap-1.5 rounded-full border border-outline/60 bg-fill-faint px-2 py-0.5 font-mono text-xs @min-[640px]:flex-col @min-[640px]:gap-0 @min-[640px]:border-0 @min-[640px]:bg-transparent @min-[640px]:p-0">
                  <span className="text-temp-low opacity-80">{r.min}</span>
                  <span className="font-bold text-temp-high">{r.max}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* beacon: dense mono bordered grid with directional markers
          (mirrors ForecastBeacon) */}
      {look === "beacon" && (
        <div className="flex flex-2 flex-col gap-1.5 @min-[640px]:flex-row @min-[640px]:gap-0 @min-[640px]:divide-x @min-[640px]:divide-outline @min-[640px]:rounded-lg @min-[640px]:border-2 @min-[640px]:border-outline-strong @min-[640px]:bg-surface @min-[640px]:shadow-xs">
          {rows.map((r) => {
            const dense = rowCount >= 8;
            return (
              <div
                key={r.key}
                className={`flex w-full grow items-center justify-between rounded-lg border border-outline bg-surface p-2 font-mono @min-[640px]:flex-col @min-[640px]:justify-between @min-[640px]:rounded-none @min-[640px]:border-0 @min-[640px]:bg-transparent ${
                  dense ? "@min-[640px]:p-1" : "@min-[640px]:p-2"
                }`}
              >
                {(weekday || date) && (
                  <div className="flex min-w-14 flex-col items-start @min-[640px]:items-center">
                    {weekday && (
                      <span
                        className="max-w-20 truncate text-[11px] font-bold tracking-tight text-foreground uppercase @min-[640px]:text-[10px]"
                        {...suppressDate}
                      >
                        {r.weekday}
                      </span>
                    )}
                    {date && (
                      <span className="text-[10px] text-faint" {...suppressDate}>
                        {r.day}
                      </span>
                    )}
                  </div>
                )}

                <div className="my-0.5 flex shrink-0 items-center justify-center">
                  <div
                    className={
                      dense
                        ? "h-6.5 w-9 @min-[640px]:h-7 @min-[640px]:w-10"
                        : "h-7.5 w-10.5 @min-[640px]:h-8.5 @min-[640px]:w-12"
                    }
                  >
                    <img src={r.icon} alt="" className="size-full object-contain" />
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs @min-[640px]:flex-col @min-[640px]:gap-0.5 @min-[640px]:text-[11px]">
                  <span className="flex items-center font-medium text-temp-low">
                    <Icon icon="bi:caret-down-fill" className="mr-0.5 size-3 shrink-0 opacity-70" />
                    {r.min}
                  </span>
                  <span className="flex items-center font-semibold text-temp-high">
                    <Icon icon="bi:caret-up-fill" className="mr-0.5 size-3 shrink-0 opacity-70" />
                    {r.max}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </>
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
      <div className="flex items-center justify-between gap-2">
        <div className="flex gap-1 rounded-lg border border-outline bg-fill-faint p-1">
          {(
            [
              ["desktop", "material-symbols:desktop-windows-outline"],
              ["tablet", "material-symbols:tablet-mac-outline"],
              ["mobile", "material-symbols:phone-iphone-outline"],
            ] as const
          ).map(([v, icon]) => (
            <button
              key={v}
              type="button"
              onClick={() => setView(v)}
              className={`flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-medium capitalize transition-colors ${
                view === v
                  ? "bg-surface text-foreground shadow-xs ring-1 ring-outline"
                  : "text-muted hover:text-foreground"
              }`}
            >
              <Icon icon={icon} width="14" height="14" />
              <span className="hidden sm:inline">{v}</span>
            </button>
          ))}
        </div>

        <span className="font-mono text-xs text-faint tabular-nums">
          {viewW}px{factor < 1 ? ` · ${Math.round(factor * 100)}%` : ""}
          {visH !== VIEW_DEFAULT_HEIGHTS[view] ? ` · ${Math.round(visH)}px` : ""}
        </span>
      </div>

      {/* Fixed-width, draggable-height preview stage: width rescales per view;
          the top edge is a drag handle (drag / double-click reset) and content
          never resizes the frame. */}
      <div ref={colRef} className="w-full">
        <div className="mx-auto" style={{ width: viewW * factor }}>
          <div
            title="Drag to resize · double-click to reset"
            onPointerDown={onHandleDown}
            onPointerMove={onHandleMove}
            onPointerUp={onHandleUp}
            onPointerCancel={onHandleUp}
            onDoubleClick={() => setHeights((prev) => ({ ...prev, [view]: undefined }))}
            className="group flex h-6 w-full cursor-ns-resize touch-none items-center justify-center rounded-lg text-faint transition-colors hover:bg-fill hover:text-muted"
          >
            <Icon
              icon="material-symbols:unfold-more"
              width="16"
              height="16"
              className="opacity-0 transition-opacity group-hover:opacity-100"
            />
          </div>

          <div
            className="overflow-hidden rounded-xl border border-outline bg-background"
            style={{ width: viewW * factor, height: visH }}
          >
            {/* The @container must be a distinct ancestor of the elements using
                its variants: a container query never matches the container
                itself. Frame is always authored at viewW; scale-to-fit is
                purely visual. */}
            <div
              className="@container"
              style={{
                width: viewW,
                height: stageH,
                transform: `scale(${factor})`,
                transformOrigin: "top left",
              }}
            >
              {/* Mirrors the real widget page: alignment sits on the OUTER flex
                  wrapper (the outer <main> in weather/[id]/page.tsx), so its
                  leftover stage space is what start/center/end act on; the row
                  inside is w-full + items-stretch, matching heights of both
                  cards regardless of align. The align layer scrolls like the
                  real page does when content exceeds the viewport. */}
              <div
                className={`flex h-full w-full overflow-y-auto ${
                  align === "center" ? "items-center" : align === "end" ? "items-end" : "items-start"
                }`}
              >
                <div className="flex w-full flex-col items-stretch gap-2 p-2.5 @min-[768px]:flex-row @min-[768px]:gap-x-2">
                  {present}
                  {forecastStrip}
                  {!weather && !forecast && (
                    <p className="m-auto font-mono text-xs text-faint">–</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
