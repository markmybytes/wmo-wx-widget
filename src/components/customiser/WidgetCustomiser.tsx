"use client";

import { Icon } from "@iconify/react";
import { routing } from "@/i18n/routing";
import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";
import CityPicker, { type CityOption } from "./CityPicker";
import WidgetStylePreview from "./WidgetStylePreview";

// The WMO feed never returns more than nine days, so anything above this
// only widens the URL without changing the widget.
const MAX_DAYS = 9;

type TabId = "display" | "unit" | "layout";

export default function WidgetCustomiser({ cityOptions }: { cityOptions: CityOption[] }) {
  const t = useTranslations("common");
  const usrLocale = useLocale();

  const [formData, setFormData] = useState({
    weather: true,
    forcast: true,
    align: "start",
    style: "swiss",
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
  const [tab, setTab] = useState<TabId>("display");

  // NaN while the field is empty; both steppers read it as 0.
  const dayCount = parseInt(formData.days) || 0;

  function handleGenerate() {
    if (formData.city === "") {
      setOutUrl("");
      setCityError(true);
      return;
    }
    setCityError(false);

    setOutUrl(
      `${location.protocol}//${location.host}${
        formData.lang === routing.defaultLocale ? "" : `/${formData.lang}`
      }/weather/${formData.city}?${new URLSearchParams(
        Object.fromEntries(
          Object.entries(formData)
            .filter(([k, v]) => {
              return v !== null && v !== "" && k != "city" && k != "lang";
            })
            .map(([k, v]) => [k, v.toString()]),
        ),
      )}`,
    );
  }

  const tabs: Array<[TabId, string]> = [
    ["display", t("displaySettings")],
    ["unit", t("unitSettings")],
    ["layout", t("widgetAlignment")],
  ];

  const tabButton = (id: TabId, label: string) => (
    <button
      key={id}
      type="button"
      role="tab"
      aria-selected={tab === id}
      aria-controls={`wctl-panel-${id}`}
      id={`wctl-tab-${id}`}
      onClick={() => setTab(id)}
      className={`min-w-0 truncate rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
        tab === id
          ? "bg-surface text-foreground shadow-xs ring-1 ring-outline"
          : "text-muted hover:text-foreground"
      }`}
    >
      {label}
    </button>
  );

  return (
    <form className="flex flex-col gap-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          {t("widgetCustomiser")}
        </h1>
        <p className="mt-1 text-sm text-faint">{t("widgetCustomiserHelp")}</p>
      </div>

      <section className="wctl-section">
        {/* Also the input's label — a second "City" label pointed at no id. */}
        <h2 id="city-label" className="wctl-heading">
          {t("city")}
        </h2>
        <div className="mt-4">
          <CityPicker
            labelId="city-label"
            options={cityOptions}
            value={formData.city}
            onChange={(city) => {
              setFormData({ ...formData, city });
              if (city !== "") setCityError(false);
            }}
          />
        </div>
      </section>

      {/* Style: promoted out of the tabs so the look choice sits next to its preview */}
      <section className="wctl-section">
        <h2 className="wctl-heading">{t("widgetStyle")}</h2>
        <div className="relative mt-4 w-full sm:w-60">
          <select
            id="style"
            name="style"
            value={formData.style}
            onChange={(e) => {
              setFormData({ ...formData, style: e.target.value });
            }}
            className="wctl-input appearance-none pe-9"
          >
            {/* Style names are proper nouns; plain string labels rather than locale keys */}
            <option value="cards">Cards</option>
            <option value="editorial">Editorial</option>
            <option value="bars">Bars</option>
            <option value="swiss">Swiss</option>
            <option value="pills">Pills</option>
            <option value="telemetry">Telemetry</option>
          </select>
          <Icon
            icon="material-symbols:keyboard-arrow-down"
            className="pointer-events-none absolute inset-e-3 top-1/2 -translate-y-1/2 text-faint"
            width="18"
            height="18"
          />
        </div>
      </section>

      <hr className="border-outline" />

      {/* Tabs + preview side by side on wide screens, stacked on mobile */}
      <div className="min-w-0 grid gap-y-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-x-8">
        <div className="flex min-w-0 flex-col gap-y-6">
          <div role="tablist" aria-label={t("displaySettings")} className="grid grid-cols-3 gap-1 rounded-xl border border-outline bg-fill-faint p-1">
            {tabs.map(([id, label]) => tabButton(id, label))}
          </div>

      {/* Display: what data shows */}
      {tab === "display" && (
        <div role="tabpanel" id="wctl-panel-display" aria-labelledby="wctl-tab-display" className="flex flex-col gap-y-6">
          <div>
            <label htmlFor="locale" className="mb-1.5 block text-sm font-medium text-muted">
              {t("language")}
            </label>

            <div className="relative sm:max-w-md">
              <select
                id="locale"
                name="locale"
                defaultValue={usrLocale}
                onChange={(e) => {
                  setFormData({ ...formData, lang: e.target.value });
                }}
                className="wctl-input appearance-none pe-9"
              >
                <option value="ar">لعربية</option>
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
                className="pointer-events-none absolute inset-e-3 top-1/2 -translate-y-1/2 text-faint"
                width="18"
                height="18"
              />
            </div>
          </div>

          <fieldset>
            <legend className="wctl-legend">{t("displayedComponent")}</legend>

            <div className="flex gap-x-4">
              {Object.entries({
                weather: t("presentWeather"),
                forcast: t("futureWeather"),
              }).map(([k, text]) => (
                <label className="wctl-option" key={k}>
                  <input
                    type="checkbox"
                    name={k}
                    value={k}
                    checked={formData[k as keyof typeof formData] as boolean}
                    onChange={() => {
                      const key = k as "weather" | "forcast";
                      setFormData({ ...formData, [key]: !formData[key] });
                    }}
                    className="wctl-check"
                  />
                  {text}
                </label>
              ))}
            </div>
          </fieldset>

          <div>
            <label htmlFor="days" className="block text-sm font-medium text-muted">
              {t("maxForecastPeriod")}
            </label>
            <p className="mt-1 mb-2 text-xs text-faint">{t("maxForecastPeriodHelp")}</p>

            <div className="inline-flex items-stretch overflow-hidden rounded-lg border border-outline-strong">
              <button
                type="button"
                aria-label="−"
                disabled={dayCount <= 1}
                className="px-3.5 text-muted transition-colors hover:bg-fill disabled:cursor-not-allowed disabled:text-faint disabled:hover:bg-transparent"
                onClick={() => {
                  if (dayCount > 1) {
                    setFormData({
                      ...formData,
                      days: (dayCount - 1).toString(),
                    });
                  }
                }}
              >
                <Icon icon="material-symbols:remove" width="18" height="18" />
              </button>
              <input
                id="days"
                type="number"
                min="1"
                max={MAX_DAYS}
                className="w-14 border-x border-outline-strong text-center text-sm text-foreground outline-none"
                value={formData.days}
                onChange={(e) => {
                  if (e.target.value == "") {
                    setFormData({ ...formData, days: "" });
                  }
                  if (e.target.value.match(/^[0-9]+$/)) {
                    const d = Math.min(parseInt(e.target.value), MAX_DAYS);
                    setFormData({
                      ...formData,
                      days: d > 0 ? d.toString() : "1",
                    });
                  }
                }}
              />
              <button
                type="button"
                aria-label="+"
                disabled={dayCount >= MAX_DAYS}
                className="px-3.5 text-muted transition-colors hover:bg-fill disabled:cursor-not-allowed disabled:text-faint disabled:hover:bg-transparent"
                onClick={() => {
                  if (dayCount < MAX_DAYS) {
                    setFormData({
                      ...formData,
                      days: (dayCount + 1).toString(),
                    });
                  }
                }}
              >
                <Icon icon="material-symbols:add" width="18" height="18" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Unit: temperature */}
      {tab === "unit" && (
        <div role="tabpanel" id="wctl-panel-unit" aria-labelledby="wctl-tab-unit" className="flex flex-col gap-y-6">
          <fieldset>
            <legend className="wctl-legend">{t("temperatureUnit")}</legend>

            <div className="flex gap-x-4">
              {Object.entries({
                C: `${t("celsius")} (°C)`,
                F: `${t("fahrenheit")} (°F)`,
              }).map(([k, text]) => (
                <label className="wctl-option" key={k}>
                  <input
                    type="radio"
                    name="unit"
                    value={k}
                    checked={formData.unit == k}
                    onChange={() => {
                      setFormData({ ...formData, unit: k });
                    }}
                    className="wctl-check"
                  />
                  {text}
                </label>
              ))}
            </div>
          </fieldset>
        </div>
      )}

      {/* Layout: alignment + date display */}
      {tab === "layout" && (
        <div role="tabpanel" id="wctl-panel-layout" aria-labelledby="wctl-tab-layout" className="flex flex-col gap-y-6">
          <fieldset>
            <legend className="wctl-legend">{t("widgetAlignment")}</legend>

            <div className="flex gap-x-4">
              {Object.entries({
                start: t("start"),
                center: t("center"),
                end: t("end"),
              }).map(([k, text]) => (
                <label className="wctl-option" key={k}>
                  <input
                    type="radio"
                    name="align"
                    value={k}
                    checked={formData.align == k}
                    onChange={() => setFormData({ ...formData, align: k })}
                    className="wctl-check"
                  />
                  {text}
                </label>
              ))}
            </div>
          </fieldset>

          <fieldset>
            <legend className="wctl-legend">{t("dateDisplay")}</legend>

            <div className="flex gap-x-4">
              {Object.entries({
                weekday: t("showWeekday"),
                date: t("showDate"),
              }).map(([k, text]) => (
                <label className="wctl-option" key={k}>
                  <input
                    type="checkbox"
                    name={k}
                    value={k}
                    checked={formData[k as "weekday" | "date"]}
                    onChange={() => {
                      const key = k as "weekday" | "date";
                      setFormData({
                        ...formData,
                        [key]: !formData[key],
                      });
                    }}
                    className="wctl-check"
                  />
                  {text}
                </label>
              ))}
            </div>
          </fieldset>
        </div>
      )}

      {/* Preview column: the result surface every tab feeds (unit → temps,
          layout → align/date, display → days/toggles, style → whole look).
          Sticky on desktop, below controls when stacked on mobile. */}
        </div>

        <aside className="min-w-0">
          <div className="lg:sticky lg:top-6">
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
          </div>
        </aside>
      </div>

      <section className="wctl-section">
        <h2 className="wctl-heading">URL</h2>

        <div className="mt-4 flex flex-col gap-y-3">
          <div className="flex flex-col items-stretch gap-x-2 gap-y-3 sm:flex-row sm:items-center">
            <button
              type="button"
              className="inline-flex items-center justify-center gap-x-2 rounded-lg bg-brand-solid px-5 py-2.5 text-sm font-medium text-on-brand shadow-sm transition-colors hover:bg-brand-hover"
              onClick={handleGenerate}
            >
              <Icon icon="material-symbols:link" width="18" height="18" />
              {t("generate")}
            </button>

            <div className="relative flex-1">
              <input
                type="text"
                value={outUrl}
                aria-label="URL"
                className="wctl-input pe-11 text-faint disabled:cursor-not-allowed disabled:bg-fill-faint"
                readOnly
                disabled={!outUrl}
              />
              <button
                type="button"
                title={copied ? t("copied") : undefined}
                aria-label={copied ? t("copied") : t("copy")}
                disabled={!outUrl}
                className={`absolute inset-y-0 inset-e-0 flex items-center px-3.5 transition-colors ${
                  copied ? "text-success" : "text-faint hover:text-muted"
                } disabled:cursor-not-allowed`}
                onClick={() => {
                  if (!outUrl) {
                    return;
                  }

                  if (!copied) {
                    setTimeout(() => {
                      setCopied(false);
                    }, 2000);
                  }
                  setCopied(true);

                  navigator.clipboard.writeText(outUrl);
                }}
              >
                <Icon
                  icon={
                    copied
                      ? "material-symbols:check-circle"
                      : "material-symbols:content-copy-outline"
                  }
                  width="18"
                  height="18"
                />
              </button>
            </div>
          </div>

          {cityError && <p className="text-xs text-danger">{t("emptyCityValidation")}</p>}
        </div>
      </section>
    </form>
  );
}
