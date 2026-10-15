"use client";

import { Icon } from "@iconify/react";
import { routing } from "@/i18n/routing";
import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";
import CityPicker, { type CityOption } from "./CityPicker";
import WidgetStylePreview from "./WidgetStylePreview";

const MAX_DAYS = 9;

type TabId = "style" | "unit" | "display" | "layout";

const STYLE_OPTIONS = [
  // Icons/descriptions grounded in src/components/weather/Weather{Classic,Masthead,
  // RangeBars,Precision,Capsule,Beacon}.tsx — each names the style's actual visual character.
  {
    id: "precision",
    label: "Precision",
    subtitle: "Hairline type grid",
    icon: "material-symbols:border-all",
  },
  {
    id: "classic",
    label: "Classic",
    subtitle: "Centered classic card",
    icon: "material-symbols:crop-portrait",
  },
  {
    id: "masthead",
    label: "Masthead",
    subtitle: "Display-type hierarchy",
    icon: "material-symbols:title",
  },
  {
    id: "range-bars",
    label: "Range Bars",
    subtitle: "Per-day min→max range bars",
    icon: "material-symbols:linear-scale",
  },
  {
    id: "capsule",
    label: "Capsule",
    subtitle: "Rounded chip clusters",
    icon: "material-symbols:capsule",
  },
  {
    id: "beacon",
    label: "Beacon",
    subtitle: "Dense mono status board",
    icon: "material-symbols:terminal",
  },
] as const;

export default function WidgetCustomiser({ cityOptions }: { cityOptions: CityOption[] }) {
  const t = useTranslations("common");
  const usrLocale = useLocale();

  const [formData, setFormData] = useState({
    weather: true,
    forcast: true,
    align: "start",
    style: "precision",
    weekday: true,
    date: true,
    city: "",
    days: "5",
    lang: usrLocale,
    unit: "C",
  });

  const [copied, setCopied] = useState(false);
  const [cityError, setCityError] = useState(false);
  const [outUrl, setOutUrl] = useState("");
  const [tab, setTab] = useState<TabId>("style");

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

  const tabs: Array<{ id: TabId; label: string; icon: string }> = [
    { id: "style", label: t("widgetStyle"), icon: "material-symbols:palette-outline" },
    { id: "unit", label: t("temperatureUnit"), icon: "material-symbols:device-thermostat" },
    { id: "display", label: t("displaySettings"), icon: "material-symbols:visibility-outline" },
    {
      id: "layout",
      label: t("widgetAlignment"),
      icon: "material-symbols:dashboard-customize-outline",
    },
  ];

  return (
    <form className="flex flex-col gap-y-4" onSubmit={(e) => e.preventDefault()}>
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
          {t("widgetCustomiser")}
        </h1>
        <p className="mt-1 max-w-2xl text-xs text-faint">{t("widgetCustomiserHelp")}</p>
      </div>

      {/* SECTION 1: Anchored Core Setting */}
      <section className="wctl-section">
        <div className="flex flex-col gap-y-1">
          <div className="flex items-center justify-between">
            <label htmlFor="city" id="wctl-city-label" className="wctl-label font-medium">
              {t("city")} <span className="text-danger">*</span>
            </label>
            {cityError && (
              <span className="flex items-center gap-1 text-xs font-semibold text-danger">
                <Icon icon="material-symbols:error-outline" width="14" height="14" />
                {t("emptyCityValidation")}
              </span>
            )}
          </div>
          <div className="mt-1 max-w-md">
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
        </div>
      </section>

      {/* SECTION 2: Configuration Tabs */}
      <section className="wctl-section">
        {/* Tab List */}
        <div
          role="tablist"
          aria-label="Configuration tabs"
          className="mb-3.5 inline-flex max-w-full flex-wrap gap-1 rounded-lg border border-outline bg-fill-faint p-1"
        >
          {tabs.map((tabItem) => (
            <button
              key={tabItem.id}
              type="button"
              role="tab"
              aria-selected={tab === tabItem.id}
              aria-controls={`wctl-panel-${tabItem.id}`}
              id={`wctl-tab-${tabItem.id}`}
              onClick={() => setTab(tabItem.id)}
              className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                tab === tabItem.id
                  ? "bg-surface text-foreground shadow-xs ring-1 ring-outline"
                  : "text-muted hover:text-foreground"
              }`}
            >
              <Icon icon={tabItem.icon} width="15" height="15" />
              <span>{tabItem.label}</span>
            </button>
          ))}
        </div>

        {/* Tab Panels */}
        <div className="grid grid-cols-1 grid-rows-1">
          {/* TAB 1: STYLE - Always 2 items per row */}
          <div
            role="tabpanel"
            id="wctl-panel-style"
            aria-labelledby="wctl-tab-style"
            aria-hidden={tab !== "style"}
            className={`col-start-1 row-start-1 transition-opacity duration-150 ${
              tab === "style" ? "z-10 opacity-100" : "pointer-events-none invisible opacity-0"
            }`}
          >
            <div className="grid grid-cols-2 gap-2">
              {STYLE_OPTIONS.map((st) => {
                const isSelected = formData.style === st.id;
                return (
                  <button
                    key={st.id}
                    type="button"
                    onClick={() => setFormData({ ...formData, style: st.id })}
                    className={`flex flex-col items-start rounded-lg border p-2 text-start transition-all ${
                      isSelected
                        ? "border-brand-solid bg-brand-wash font-semibold shadow-xs ring-1 ring-brand-solid"
                        : "border-outline bg-surface hover:border-outline-strong hover:bg-fill-faint"
                    }`}
                  >
                    <div className="flex w-full items-center justify-between">
                      <Icon
                        icon={st.icon}
                        width="16"
                        height="16"
                        className={isSelected ? "text-brand-solid" : "text-faint"}
                      />
                      {isSelected && (
                        <Icon
                          icon="material-symbols:check-circle"
                          className="text-brand-solid"
                          width="14"
                          height="14"
                        />
                      )}
                    </div>
                    <span className="mt-1 text-xs font-bold text-foreground">{st.label}</span>
                    <span className="line-clamp-1 text-[10px] text-faint">{st.subtitle}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* TAB 2: UNIT */}
          <div
            role="tabpanel"
            id="wctl-panel-unit"
            aria-labelledby="wctl-tab-unit"
            aria-hidden={tab !== "unit"}
            className={`col-start-1 row-start-1 flex flex-col gap-y-2 transition-opacity duration-150 ${
              tab === "unit" ? "z-10 opacity-100" : "pointer-events-none invisible opacity-0"
            }`}
          >
            <span className="wctl-label font-medium">{t("temperatureUnit")}</span>

            <div className="flex flex-wrap gap-2">
              {[
                { value: "C", label: "°C" },
                { value: "F", label: "°F" },
              ].map((u) => {
                const isSelected = formData.unit === u.value;
                return (
                  <button
                    key={u.value}
                    type="button"
                    aria-pressed={isSelected}
                    onClick={() => setFormData({ ...formData, unit: u.value })}
                    className={`flex h-9 items-center gap-2 rounded-lg border px-3 text-xs font-medium transition-all ${
                      isSelected
                        ? "border-brand-solid bg-brand-wash font-semibold text-foreground shadow-xs ring-1 ring-brand-solid"
                        : "border-outline bg-surface text-muted hover:border-outline-strong hover:text-foreground"
                    }`}
                  >
                    <span className={isSelected ? "font-bold text-brand-solid" : "text-foreground"}>
                      {u.label}
                    </span>
                    <div
                      className={`ms-1 flex size-3.5 shrink-0 items-center justify-center rounded-full border transition-colors ${
                        isSelected ? "border-brand-solid" : "border-outline-strong bg-surface"
                      }`}
                    >
                      {isSelected && <div className="size-2 rounded-full bg-brand-solid" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* TAB 3: DISPLAY */}
          <div
            role="tabpanel"
            id="wctl-panel-display"
            aria-labelledby="wctl-tab-display"
            aria-hidden={tab !== "display"}
            className={`col-start-1 row-start-1 flex flex-col gap-y-3.5 transition-opacity duration-150 ${
              tab === "display" ? "z-10 opacity-100" : "pointer-events-none invisible opacity-0"
            }`}
          >
            {/* Language */}
            <div>
              <label htmlFor="locale" className="wctl-label font-medium">
                {t("language")}
              </label>
              <div className="relative mt-1 max-w-xs">
                <select
                  id="locale"
                  name="locale"
                  value={formData.lang}
                  onChange={(e) => setFormData({ ...formData, lang: e.target.value })}
                  className="wctl-input h-9 appearance-none pe-8 text-xs font-medium"
                >
                  <option value="ar">العربية</option>
                  <option value="en">English</option>
                  <option value="zh-Hant">繁體中文</option>
                  <option value="zh-Hans">简体中文</option>
                  <option value="fr">Français</option>
                  <option value="de">Deutsch</option>
                  <option value="it">Italiano</option>
                  <option value="ko">한국어</option>
                  <option value="pl">Polski</option>
                  <option value="pt">Português</option>
                  <option value="ru">Русский</option>
                  <option value="es">Español</option>
                </select>
                <Icon
                  icon="material-symbols:keyboard-arrow-down"
                  className="pointer-events-none absolute inset-e-2.5 top-1/2 -translate-y-1/2 text-faint"
                  width="16"
                  height="16"
                />
              </div>
            </div>

            {/* Displayed Components */}
            <div>
              <span className="wctl-label font-medium">{t("displayedComponent")}</span>
              <div className="mt-1.5 flex flex-wrap gap-2">
                {[
                  {
                    key: "weather",
                    label: t("presentWeather"),
                    icon: "material-symbols:partly-cloudy-day-outline",
                  },
                  {
                    key: "forcast",
                    label: t("futureWeather"),
                    icon: "material-symbols:calendar-month-outline",
                  },
                ].map((item) => {
                  const isChecked = Boolean(formData[item.key as "weather" | "forcast"]);
                  return (
                    <button
                      key={item.key}
                      type="button"
                      role="checkbox"
                      aria-checked={isChecked}
                      onClick={() => {
                        const k = item.key as "weather" | "forcast";
                        setFormData({ ...formData, [k]: !formData[k] });
                      }}
                      className={`flex h-9 items-center gap-2 rounded-lg border px-3 text-xs transition-all ${
                        isChecked
                          ? "border-brand-solid bg-brand-wash font-medium text-foreground shadow-xs ring-1 ring-brand-solid"
                          : "border-outline bg-surface text-muted hover:border-outline-strong hover:text-foreground"
                      }`}
                    >
                      <Icon
                        icon={item.icon}
                        width="15"
                        height="15"
                        className={isChecked ? "text-brand-solid" : "text-faint"}
                      />
                      <span>{item.label}</span>
                      <div
                        className={`ms-1 flex size-3.5 shrink-0 items-center justify-center rounded border transition-colors ${
                          isChecked
                            ? "border-brand-solid bg-brand-solid text-on-brand"
                            : "border-outline-strong bg-surface"
                        }`}
                      >
                        {isChecked && <Icon icon="material-symbols:check" width="10" height="10" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Forecast Days - Keeps 最多預測日數 description */}
            <div>
              <label htmlFor="days" className="wctl-label font-medium">
                {t("maxForecastPeriod")}
              </label>
              <p className="mt-0.5 text-xs text-faint">{t("maxForecastPeriodHelp")}</p>
              <div className="mt-1.5 flex items-center gap-2">
                <div className="inline-flex h-9 items-stretch overflow-hidden rounded-lg border border-outline-strong bg-surface shadow-xs">
                  <button
                    type="button"
                    aria-label="Decrease"
                    disabled={dayCount <= 1}
                    className="px-2.5 text-muted transition-colors hover:bg-fill hover:text-foreground disabled:cursor-not-allowed disabled:text-faint"
                    onClick={() => {
                      if (dayCount > 1) {
                        setFormData({ ...formData, days: (dayCount - 1).toString() });
                      }
                    }}
                  >
                    <Icon icon="material-symbols:remove" width="14" height="14" />
                  </button>
                  <input
                    id="days"
                    type="number"
                    min="1"
                    max={MAX_DAYS}
                    className="w-10 border-x border-outline-strong bg-transparent text-center text-xs font-semibold text-foreground outline-none"
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
                    aria-label="Increase"
                    disabled={dayCount >= MAX_DAYS}
                    className="px-2.5 text-muted transition-colors hover:bg-fill hover:text-foreground disabled:cursor-not-allowed disabled:text-faint"
                    onClick={() => {
                      if (dayCount < MAX_DAYS) {
                        setFormData({ ...formData, days: (dayCount + 1).toString() });
                      }
                    }}
                  >
                    <Icon icon="material-symbols:add" width="14" height="14" />
                  </button>
                </div>

                <div className="flex items-center gap-1">
                  {[3, 5, 7, 9].map((count) => (
                    <button
                      key={count}
                      type="button"
                      onClick={() => setFormData({ ...formData, days: count.toString() })}
                      className={`h-9 rounded-md border px-2 text-xs font-semibold transition-all ${
                        dayCount === count
                          ? "border-brand-solid bg-brand-solid text-on-brand shadow-xs"
                          : "border-outline bg-surface text-muted hover:border-outline-strong hover:text-foreground"
                      }`}
                    >
                      {count}d
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* TAB 4: LAYOUT */}
          <div
            role="tabpanel"
            id="wctl-panel-layout"
            aria-labelledby="wctl-tab-layout"
            aria-hidden={tab !== "layout"}
            className={`col-start-1 row-start-1 flex flex-col gap-y-4 transition-opacity duration-150 ${
              tab === "layout" ? "z-10 opacity-100" : "pointer-events-none invisible opacity-0"
            }`}
          >
            {/* Row 1: Alignment */}
            <div className="w-full">
              <span className="wctl-label font-medium">{t("widgetAlignment")}</span>
              <div className="mt-1.5 flex flex-wrap gap-2">
                {[
                  { id: "start", label: t("start"), icon: "material-symbols:vertical-align-top" },
                  {
                    id: "center",
                    label: t("center"),
                    icon: "material-symbols:vertical-align-center",
                  },
                  { id: "end", label: t("end"), icon: "material-symbols:vertical-align-bottom" },
                ].map((item) => {
                  const isSelected = formData.align === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      aria-pressed={isSelected}
                      onClick={() => setFormData({ ...formData, align: item.id })}
                      className={`flex h-9 items-center gap-1.5 rounded-lg border px-3 text-xs transition-all ${
                        isSelected
                          ? "border-brand-solid bg-brand-wash font-semibold text-foreground shadow-xs ring-1 ring-brand-solid"
                          : "border-outline bg-surface text-muted hover:border-outline-strong hover:text-foreground"
                      }`}
                    >
                      <Icon
                        icon={item.icon}
                        width="16"
                        height="16"
                        className={isSelected ? "text-brand-solid" : "text-faint"}
                      />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Row 2: Date Display */}
            <div className="w-full">
              <span className="wctl-label font-medium">{t("dateDisplay")}</span>
              <div className="mt-1.5 flex flex-wrap gap-2">
                {[
                  {
                    // weekday toggles the short weekday-name column in the preview
                    // (and the real Forecast* widget), date toggles the day number.
                    key: "weekday",
                    label: t("showWeekday"),
                    icon: "bi:calendar-week",
                  },
                  { key: "date", label: t("showDate"), icon: "material-symbols:event-outline" },
                ].map((item) => {
                  const isChecked = formData[item.key as "weekday" | "date"];
                  return (
                    <button
                      key={item.key}
                      type="button"
                      role="checkbox"
                      aria-checked={isChecked}
                      onClick={() => {
                        const k = item.key as "weekday" | "date";
                        setFormData({ ...formData, [k]: !formData[k] });
                      }}
                      className={`flex h-9 items-center gap-2 rounded-lg border px-3 text-xs transition-all ${
                        isChecked
                          ? "border-brand-solid bg-brand-wash font-semibold text-foreground shadow-xs ring-1 ring-brand-solid"
                          : "border-outline bg-surface text-muted hover:border-outline-strong hover:text-foreground"
                      }`}
                    >
                      <Icon
                        icon={item.icon}
                        width="15"
                        height="15"
                        className={isChecked ? "text-brand-solid" : "text-faint"}
                      />
                      <span>{item.label}</span>
                      <div
                        className={`ms-1 flex size-3.5 shrink-0 items-center justify-center rounded border transition-colors ${
                          isChecked
                            ? "border-brand-solid bg-brand-solid text-on-brand"
                            : "border-outline-strong bg-surface"
                        }`}
                      >
                        {isChecked && <Icon icon="material-symbols:check" width="10" height="10" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 3: Live Preview Frame */}
      <section className="wctl-section">
        <WidgetStylePreview
          style={formData.style}
          unit={formData.unit}
          align={formData.align}
          weekday={formData.weekday}
          date={formData.date}
          weather={formData.weather}
          forecast={formData.forcast}
          days={dayCount}
          locale={formData.lang}
        />
      </section>

      {/* SECTION 4: Action & URL Generation */}
      <section className="wctl-section">
        <h2 className="sr-only">URL</h2>
        <div className="flex flex-col gap-y-2">
          <div className="flex flex-col items-stretch gap-2 sm:flex-row sm:items-center">
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
                aria-label="Generated URL"
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
                  aria-label={copied ? t("copied") : t("copy")}
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

          {cityError && <p className="text-xs text-danger">{t("emptyCityValidation")}</p>}
        </div>
      </section>
    </form>
  );
}
