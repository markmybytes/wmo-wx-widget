"use client";

import { Icon } from "@iconify/react";
import { routing } from "@/i18n/routing";
import { WindUnit } from "@/lib/wmo";
import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";
import CityPicker, { type CityOption } from "./CityPicker";
import WidgetStylePreview from "./WidgetStylePreview";

const MAX_DAYS = 9;

/* Chip: the one toggle face in the bar. Selected state is a single className
   conditional so on/off faces never fight Tailwind's stylesheet ordering. */
function Chip({
  selected,
  icon,
  label,
  title,
  className,
  onClick,
}: {
  selected: boolean;
  icon?: string;
  label: React.ReactNode;
  title?: string;
  className?: string;
  onClick: (e: React.MouseEvent<HTMLButtonElement>) => void;
}) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      className={`flex h-9 shrink-0 items-center gap-1.5 rounded-lg border px-2.5 text-xs transition-colors outline-none ${
        selected
          ? "border-brand-solid bg-brand-solid text-on-brand"
          : "border-outline bg-surface text-muted hover:border-outline-strong hover:bg-fill hover:text-foreground"
      }${className ? ` ${className}` : ""}`}
    >
      {icon && (
        <Icon
          icon={icon}
          width="15"
          height="15"
          className={selected ? "text-on-brand" : "text-faint"}
        />
      )}
      <span>{label}</span>
    </button>
  );
}

/* Cluster: a micro-label row, then its control row — rows stack in the pane. */
function Cluster({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="wctl-micro">{label}</span>
      {children}
    </div>
  );
}

/* Every tab panel lives in the same grid cell, so the input section always
   sizes to the tallest panel and switching tabs can never resize the layout. */
const STACKED_PANEL = "col-start-1 row-start-1 min-w-0";

export default function WidgetCustomiser({ cityOptions }: { cityOptions: CityOption[] }) {
  const t = useTranslations("common");

  const [formData, setFormData] = useState({
    weather: true,
    forcast: true,
    align: "start",
    style: "precision",
    weekday: true,
    date: true,
    city: "",
    days: "5",
    lang: useLocale(),
    unit: "C",
    wind: "ms",
  });

  const [copied, setCopied] = useState(false);
  const [cityError, setCityError] = useState(false);
  const [outUrl, setOutUrl] = useState("");

  // Tabs fold the secondary controls; default = display settings, the
  // most-touched cluster. Not persisted across visits.
  const [activeTab, setActiveTab] = useState<"display" | "unit" | "style">("display");

  const dayCount = parseInt(formData.days) || 0;

  function handleGenerate() {
    if (!formData.city) {
      setOutUrl("");
      setCityError(true);
      const cityEl = document.getElementById("city");
      cityEl?.scrollIntoView({ behavior: "smooth", block: "center" });
      cityEl?.focus();
      return;
    }
    setCityError(false);

    const localePrefix = formData.lang === routing.defaultLocale ? "" : `/${formData.lang}`;
    setOutUrl(
      `${location.protocol}//${location.host}${localePrefix}/weather/${formData.city}?${new URLSearchParams(
        Object.fromEntries(
          Object.entries(formData)
            .filter(([k, v]) => v !== "" && k !== "city" && k !== "lang")
            .map(([k, v]) => [k, v.toString()]),
        ),
      )}`,
    );
  }

  return (
    <form className="flex flex-col gap-y-4" onSubmit={(e) => e.preventDefault()}>
      <div>
        <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
          {t("widgetCustomiser")}
        </h1>
        <p className="mt-1 max-w-2xl text-xs text-faint">{t("widgetCustomiserHelp")}</p>
      </div>

      <div className="flex flex-col gap-y-4 lg:grid lg:grid-cols-[minmax(0,4fr)_minmax(0,6fr)] lg:items-stretch lg:gap-x-8">
        {/* h-full shares the preview column's height through the grid row; the
            panel region flexes to absorb the slack, so dragging the canvas
            handle grows both columns together. */}
        <section className="wctl-section flex flex-col gap-2.5 lg:h-full">
          <div className="flex flex-wrap items-center gap-2">
            <div className="min-w-56 flex-1">
              <label id="wctl-city-label" htmlFor="city" className="sr-only">
                {t("city")}
              </label>
              <CityPicker
                labelId="wctl-city-label"
                options={cityOptions}
                value={formData.city}
                hasError={cityError}
                onChange={(city) => {
                  setFormData({ ...formData, city });
                  if (city) setCityError(false);
                }}
              />
            </div>

            {cityError && (
              <span className="flex shrink-0 items-center gap-1 text-xs font-semibold text-danger">
                <Icon icon="material-symbols:error-outline" width="15" height="15" />
                {t("emptyCityValidation")}
              </span>
            )}
          </div>

          <div
            className="inline-flex h-9 items-center gap-0.5 self-start rounded-lg border border-outline bg-surface p-0.5"
          >
            {(
              [
                { id: "display", label: t("displaySettings") },
                { id: "unit", label: t("unitSettings") },
                { id: "style", label: t("widgetStyle") },
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                id={`wctl-tab-${tab.id}`}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex h-full items-center rounded-md px-3 text-xs transition-colors outline-none ${
                  activeTab === tab.id
                    ? "bg-fill font-medium text-foreground"
                    : "text-muted hover:bg-fill hover:text-foreground"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab panels · all mounted, stacked in one grid cell so the
              section's height is set by the tallest panel and swapping tabs
              never resizes the layout at ANY width. Inactive panels are
              inert ??unfocusable, unclickable, invisible.
              flex-1 is lg-ONLY: on desktop it absorbs the stretched grid
              row's slack; on mobile the column is auto-height, and a
              flex-basis-0 track there sizes algorithmically instead of by
              max(panels) ??the mobile height jumps are exactly that. Below
              lg the container is a plain auto grid = max(panels). */}
          <div className="grid lg:flex-1">
            <div
              inert={activeTab !== "display"}
              className={`${STACKED_PANEL} ${
                activeTab === "display"
                  ? "flex flex-col justify-start gap-3.5"
                  : "pointer-events-none invisible opacity-0"
              }`}
            >
              <Cluster label={t("displayedComponent")}>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    { key: "weather" as const, label: t("presentWeather"), icon: "material-symbols:partly-cloudy-day-outline" },
                    { key: "forcast" as const, label: t("futureWeather"), icon: "material-symbols:calendar-month-outline" },
                  ].map((item) => (
                    <Chip
                      key={item.key}
                      selected={Boolean(formData[item.key])}
                      icon={item.icon}
                      label={item.label}
                      title={item.label}
                      onClick={() => setFormData({ ...formData, [item.key]: !formData[item.key] })}
                    />
                  ))}
                </div>
              </Cluster>

              <Cluster label={t("dateDisplay")}>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    // calendar-view-week = the weekday-name column, today = the
                    // date number ??shapes chosen so the two can't be confused
                    // at a glance.
                    { key: "weekday" as const, label: t("showWeekday"), icon: "material-symbols:calendar-view-week" },
                    { key: "date" as const, label: t("showDate"), icon: "material-symbols:today" },
                  ].map((item) => (
                    <Chip
                      key={item.key}
                      selected={formData[item.key]}
                      icon={item.icon}
                      label={item.label}
                      title={item.label}
                      onClick={() => setFormData({ ...formData, [item.key]: !formData[item.key] })}
                    />
                  ))}
                </div>
              </Cluster>

              <Cluster label={t("maxForecastPeriod")}>
                {/* One control, three cells: ??/ value / + ??the input is the
                    center cell of this single control, never a box-in-a-box.
                    self-start: as a flex-col child the inline-flex would
                    otherwise stretch to full pane width (align-items:stretch
                    default), sweeping ??+ to the edges; pin it to content
                    width so the cells always render as ONE ~h-9 control. */}
                <div className="inline-flex h-9 items-stretch self-start overflow-hidden rounded-lg border border-outline">
                  <button
                    type="button"
                    disabled={dayCount <= 1}
                    className="flex h-full items-center px-3.5 text-muted transition-colors hover:bg-fill hover:text-foreground disabled:cursor-not-allowed disabled:text-faint"
                    onClick={() => {
                      if (dayCount > 1) {
                        setFormData({ ...formData, days: (dayCount - 1).toString() });
                      }
                    }}
                  >
                    <Icon icon="material-symbols:remove" width="15" height="15" />
                  </button>
                  <input
                    id="days"
                    type="number"
                    min="1"
                    max={MAX_DAYS}
                    className="w-14 border-x border-outline bg-transparent text-center text-sm text-foreground outline-none"
                    value={formData.days}
                    onChange={(e) => {
                      if (e.target.value === "") {
                        setFormData({ ...formData, days: "" });
                      }
                      if (e.target.value.match(/^[0-9]+$/)) {
                        const d = Math.min(parseInt(e.target.value), MAX_DAYS);
                        setFormData({ ...formData, days: d > 0 ? d.toString() : "1" });
                      }
                    }}
                  />
                  <button
                    type="button"
                    disabled={dayCount >= MAX_DAYS}
                    className="flex h-full items-center px-3.5 text-muted transition-colors hover:bg-fill hover:text-foreground disabled:cursor-not-allowed disabled:text-faint"
                    onClick={() => {
                      if (dayCount < MAX_DAYS) {
                        setFormData({ ...formData, days: (dayCount + 1).toString() });
                      }
                    }}
                  >
                    <Icon icon="material-symbols:add" width="15" height="15" />
                  </button>
                </div>
                <p className="text-xs text-faint">{t("maxForecastPeriodHelp")}</p>
              </Cluster>
            </div>

            <div
              inert={activeTab !== "unit"}
              className={`${STACKED_PANEL} ${
                activeTab === "unit"
                  ? "flex flex-col justify-start gap-3.5"
                  : "pointer-events-none invisible opacity-0"
              }`}
            >
              <Cluster label={t("unitSettings")}>
                <div className="flex gap-1.5">
                  {["C", "F"].map((k) => (
                    <Chip
                      key={k}
                      selected={formData.unit === k}
                      label={k === "C" ? "°C" : "°F"}
                      onClick={() => setFormData({ ...formData, unit: k })}
                    />
                  ))}
                </div>
              </Cluster>

              <Cluster label={t("windSpeedUnit")}>
                <div className="flex gap-1.5">
                  {(["ms", "kmh", "mph", "kn"] as const).map((k) => (
                    <Chip
                      key={k}
                      selected={formData.wind === k}
                      label={WindUnit[k]}
                      onClick={() => setFormData({ ...formData, wind: k })}
                    />
                  ))}
                </div>
              </Cluster>
            </div>

            <div
              inert={activeTab !== "style"}
              className={`${STACKED_PANEL} ${
                activeTab === "style"
                  ? "flex flex-col justify-start gap-3.5"
                  : "pointer-events-none invisible opacity-0"
              }`}
            >
              <Cluster label={t("widgetAlignment")}>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    { id: "start", label: t("start"), icon: "material-symbols:vertical-align-top" },
                    { id: "center", label: t("center"), icon: "material-symbols:vertical-align-center" },
                    { id: "end", label: t("end"), icon: "material-symbols:vertical-align-bottom" },
                  ].map((item) => (
                    <Chip
                      key={item.id}
                      selected={formData.align === item.id}
                      icon={item.icon}
                      label={item.label}
                      title={`${t("widgetAlignment")}: ${item.label}`}
                      onClick={() => setFormData({ ...formData, align: item.id })}
                    />
                  ))}
                </div>
              </Cluster>

              {/* py-0.5 reserves room for the thin scrollbar so control rows stay aligned */}
              <Cluster label={t("widgetStyle")}>
                <div
                  className={`flex snap-x gap-1.5 [scrollbar-width:thin] [&::-webkit-scrollbar]:h-1 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-outline-strong [&::-webkit-scrollbar-track]:bg-transparent overflow-x-auto py-0.5 lg:flex-wrap lg:overflow-visible lg:py-0`}
                >
                  {(
                    [
                      { id: "precision", label: "Precision", icon: "material-symbols:border-all" },
                      { id: "classic", label: "Classic", icon: "material-symbols:crop-portrait" },
                      { id: "masthead", label: "Masthead", icon: "material-symbols:title" },
                      { id: "range-bars", label: "Range Bars", icon: "material-symbols:linear-scale" },
                      { id: "capsule", label: "Capsule", icon: "material-symbols:pill" },
                      { id: "beacon", label: "Beacon", icon: "material-symbols:terminal" },
                    ] as const
                  ).map((st) => (
                    <Chip
                      key={st.id}
                      selected={formData.style === st.id}
                      icon={st.icon}
                      label={st.label}
                      className="snap-start justify-center"
                      onClick={(e) => {
                        setFormData({ ...formData, style: st.id });
                        e.currentTarget.scrollIntoView({
                          behavior: "smooth",
                          inline: "center",
                          block: "nearest",
                        });
                      }}
                    />
                  ))}
                </div>
              </Cluster>
            </div>
          </div>
        </section>

        <section className="wctl-section">
          <WidgetStylePreview
            style={formData.style}
            unit={formData.unit}
            wind={formData.wind}
            align={formData.align}
            weekday={formData.weekday}
            date={formData.date}
            weather={formData.weather}
            forecast={formData.forcast}
            days={dayCount}
            locale={formData.lang}
          />
        </section>
      </div>

      <section className="wctl-section">
        <h2 className="sr-only">URL</h2>
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="inline-flex h-9 shrink-0 items-center justify-center gap-x-1.5 rounded-lg bg-brand-solid px-4 text-xs font-semibold text-on-brand shadow-sm transition-all hover:bg-brand-hover active:scale-[0.99]"
            onClick={handleGenerate}
          >
            <Icon icon="material-symbols:link" width="16" height="16" />
            <span>{t("generate")}</span>
          </button>

          <div className="relative flex-1">
            <input
              type="text"
              value={outUrl}
              placeholder="Click Generate to produce embed URL..."
              className="wctl-input h-9 pe-16 font-mono text-xs text-foreground disabled:cursor-not-allowed disabled:bg-fill-faint"
              readOnly
              disabled={!outUrl}
            />

            <div className="absolute inset-y-0 inset-e-1 flex items-center gap-0.5">
              {outUrl && (
                <a
                  href={outUrl}
                  target="_blank"
                  rel="noreferrer"
                  title="Open in new tab"
                  className="flex size-7 items-center justify-center rounded text-faint hover:bg-fill hover:text-foreground"
                >
                  <Icon icon="material-symbols:open-in-new" width="15" height="15" />
                </a>
              )}

              <button
                type="button"
                title={copied ? t("copied") : t("copy")}
                disabled={!outUrl}
                className={`flex size-7 items-center justify-center rounded transition-colors ${
                  copied ? "text-success" : "text-faint hover:bg-fill hover:text-muted"
                } disabled:cursor-not-allowed`}
                onClick={() => {
                  if (!outUrl) return;
                  navigator.clipboard.writeText(outUrl);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2000);
                }}
              >
                <Icon
                  icon={
                    copied
                      ? "material-symbols:check-circle"
                      : "material-symbols:content-copy-outline"
                  }
                  width="15"
                  height="15"
                />
              </button>
            </div>
          </div>
        </div>
      </section>
    </form>
  );
}
