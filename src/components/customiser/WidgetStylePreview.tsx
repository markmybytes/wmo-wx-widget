"use client";

import { Icon } from "@iconify/react";
import { useEffect, useRef, useState } from "react";
import { TempUnit } from "@/lib/wmo";
import type { AppLocale } from "@/i18n/routing";
import WeatherPrecision from "@/components/weather/WeatherPrecision";
import WeatherClassic from "@/components/weather/WeatherClassic";
import WeatherMasthead from "@/components/weather/WeatherMasthead";
import WeatherRangeBars from "@/components/weather/WeatherRangeBars";
import WeatherCapsule from "@/components/weather/WeatherCapsule";
import WeatherBeacon from "@/components/weather/WeatherBeacon";
import ForecastPrecision from "@/components/weather/ForecastPrecision";
import ForecastClassic from "@/components/weather/ForecastClassic";
import ForecastMasthead from "@/components/weather/ForecastMasthead";
import ForecastRangeBars from "@/components/weather/ForecastRangeBars";
import ForecastCapsule from "@/components/weather/ForecastCapsule";
import ForecastBeacon from "@/components/weather/ForecastBeacon";

const LOGICAL_WIDTHS = { desktop: 1024, tablet: 720, mobile: 375 } as const;

// Default stage height (visible px); drag override is shared, double-click resets.
const DEFAULT_HEIGHT = 350;

// look → the real present/forecast pair, so the stage can't drift from the
// shipped widgets. The stage's @container ancestor supplies query context.
const LOOKS = {
  precision: { Present: WeatherPrecision, Forecast: ForecastPrecision },
  classic: { Present: WeatherClassic, Forecast: ForecastClassic },
  masthead: { Present: WeatherMasthead, Forecast: ForecastMasthead },
  "range-bars": { Present: WeatherRangeBars, Forecast: ForecastRangeBars },
  capsule: { Present: WeatherCapsule, Forecast: ForecastCapsule },
  beacon: { Present: WeatherBeacon, Forecast: ForecastBeacon },
};

const SAMPLE_ISSUE_AT = new Date("2024-01-01T00:00:00.000Z");

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
  const [view, setView] = useState<keyof typeof LOGICAL_WIDTHS>("desktop");
  const [colW, setColW] = useState(0);
  // Dragged height override, shared across views; double-click clears it.
  const [height, setHeight] = useState<number | undefined>(undefined);
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

  const viewW = LOGICAL_WIDTHS[view];
  const factor = colW > 0 ? Math.min(1, colW / viewW) : 1;
  const visH = height ?? DEFAULT_HEIGHT;

  const { Present, Forecast } = LOOKS[style as keyof typeof LOOKS] ?? LOOKS.precision;

  const tUnit = unit === "F" ? TempUnit.F : TempUnit.C;

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
          {visH !== DEFAULT_HEIGHT ? ` · ${Math.round(visH)}px` : ""}
        </span>
      </div>

      {/* Stage: width authored per view and scaled to fit; bottom edge
          drags height (drag / double-click reset); content never resizes it. */}
      <div ref={colRef} className="w-full">
        <div className="mx-auto" style={{ width: viewW * factor }}>
          <div
            className="overflow-hidden rounded-xl border border-outline bg-background"
            style={{ width: viewW * factor, height: visH }}
          >
            {/* A container query never matches its own container: the ancestor
                must hold @container. Frame stays authored at viewW; the
                visH/factor logical height + scale() is pure fit-to-column. */}
            <div
              className="@container"
              style={{
                width: viewW,
                height: visH / factor,
                transform: `scale(${factor})`,
                transformOrigin: "top left",
              }}
            >
              {/* Aligns the outer flex exactly like the real page's <main> —
                  the row inside is w-full + items-stretch and scrolls when
                  content overflows. */}
              <div
                className={`flex h-full w-full overflow-y-auto ${
                  align === "center"
                    ? "items-center"
                    : align === "end"
                      ? "items-end"
                      : "items-start"
                }`}
              >
                <div className="flex w-full flex-col items-stretch gap-2 p-2.5 @min-[theme(--breakpoint-md)]:flex-row @min-[theme(--breakpoint-md)]:gap-x-2">
                  {/* Static deterministic samples: SSR and client paint equal. */}
                  {weather && (
                    <Present
                      city={{
                        id: 0,
                        name: "Geneva",
                        latitude: 46.2,
                        longitude: 6.14,
                        forecast: true,
                        climate: false,
                        isCapital: false,
                      }}
                      weather={{
                        issueAt: SAMPLE_ISSUE_AT,
                        temp: {
                          unit: tUnit,
                          val: tUnit === TempUnit.C ? 13 : Math.round((13 * 9) / 5 + 32),
                        },
                        rh: 77,
                        weather: "Sunny",
                        icon: "https://worldweather.wmo.int/images/i24.png",
                        wind: { direction: "NE", speed: 2.4 },
                        sun: { rise: null, set: null },
                      }}
                    />
                  )}

                  {/* UTC-midnight ISO dates as the feed emits them; 0 rows
                      shows the real component's built-in empty state. */}
                  {forecast && (
                    <Forecast
                      locale={locale as AppLocale}
                      showWeekday={weekday}
                      showDate={date}
                      weather={{
                        issueAt: SAMPLE_ISSUE_AT,
                        forecasts: Array.from(
                          { length: Math.min(9, Math.max(0, days || 0)) },
                          (_, i) => {
                            const lo = 10 + i * 2;
                            const hi = lo + 8;
                            const cond = ["Sunny", "Sunny Periods", "Overcast"][i % 3];
                            return {
                              date: `${new Date(SAMPLE_ISSUE_AT.getTime() + i * 86400000).toISOString().slice(0, 10)}T00:00:00.000Z`,
                              description: cond,
                              weather: cond,
                              temp: {
                                min: {
                                  unit: tUnit,
                                  val: tUnit === TempUnit.C ? lo : Math.round((lo * 9) / 5 + 32),
                                },
                                max: {
                                  unit: tUnit,
                                  val: tUnit === TempUnit.C ? hi : Math.round((hi * 9) / 5 + 32),
                                },
                              },
                              icon: `https://worldweather.wmo.int/images/i${24 - (i % 3) * 2}.png`,
                            };
                          },
                        ),
                      }}
                    />
                  )}

                  {!weather && !forecast && (
                    <p className="m-auto font-mono text-xs text-faint">–</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div
            title="Drag to resize · double-click to reset"
            onPointerDown={(e) => {
              if (e.button !== 0) return;
              e.preventDefault();
              drag.current = { y: e.clientY, h: visH };
              (e.target as HTMLElement).setPointerCapture(e.pointerId);
            }}
            onPointerMove={(e) => {
              if (!drag.current) return;
              setHeight(
                Math.min(700, Math.max(240, drag.current.h + (e.clientY - drag.current.y))),
              );
            }}
            onPointerUp={(e) => {
              drag.current = null;
              (e.target as HTMLElement).releasePointerCapture(e.pointerId);
            }}
            onPointerCancel={(e) => {
              drag.current = null;
              (e.target as HTMLElement).releasePointerCapture(e.pointerId);
            }}
            onDoubleClick={() => setHeight(undefined)}
            className="flex h-6 w-full cursor-ns-resize touch-none items-center justify-center rounded-lg text-faint transition-colors hover:bg-fill hover:text-muted"
          >
            <Icon icon="material-symbols:unfold-more" width="16" height="16" />
          </div>
        </div>
      </div>
    </div>
  );
}
