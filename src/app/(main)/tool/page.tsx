"use client";

import {Icon} from "@iconify/react";
import {Locale} from "@/lib/wmo/enums";
import {useLocale, useTranslations} from "next-intl";
import {useEffect, useRef, useState} from "react";
import {getCity} from "./actions";

type CityOption = {value: string; label: string};

const SECTION_CLASS = "rounded-2xl border border-zinc-200 bg-white p-6";
const INPUT_CLASS =
  "w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 outline-none transition-colors placeholder:text-zinc-400 focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10";
const CHECK_CLASS = "h-4 w-4 accent-sky-600";

function CityPicker({
  options,
  value,
  onChange,
}: {
  options: CityOption[];
  value: string;
  onChange: (value: string) => void;
}) {
  const t = useTranslations("common");
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);

  const selected = options.find((o) => o.value === value);
  const filtered = query
    ? options.filter((o) =>
        o.label.toLowerCase().includes(query.toLowerCase()),
      )
    : options;
  // ponytail: cap the dropdown at 50 rows; fine for the ~4k cities on the source list
  const visible = filtered.slice(0, 50);

  useEffect(() => {
    if (!open) return;

    function handleMouseDown(event: MouseEvent) {
      if (
        rootRef.current &&
        !rootRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleMouseDown);
    return () => document.removeEventListener("mousedown", handleMouseDown);
  }, [open]);

  function select(option: CityOption) {
    onChange(option.value);
    setQuery("");
    setOpen(false);
  }

  return (
    <div ref={rootRef} className="relative sm:max-w-md">
      <Icon
        icon="material-symbols:search"
        className="pointer-events-none absolute start-3 top-1/2 -translate-y-1/2 text-zinc-400"
        width="18"
        height="18"
      />

      <input
        type="text"
        role="combobox"
        aria-expanded={open}
        aria-controls="city-listbox"
        autoComplete="off"
        className={`${INPUT_CLASS} pe-9 ps-9`}
        placeholder={t("cityPlaceholder")}
        value={query !== "" ? query : (selected?.label ?? "")}
        onFocus={() => setOpen(true)}
        onChange={(e) => {
          setQuery(e.target.value);
          setActiveIndex(0);
          setOpen(true);
        }}
        onKeyDown={(e) => {
          if (e.key === "ArrowDown") {
            e.preventDefault();
            setOpen(true);
            setActiveIndex((i) => Math.min(i + 1, visible.length - 1));
          } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setActiveIndex((i) => Math.max(i - 1, 0));
          } else if (e.key === "Enter" && open && visible[activeIndex]) {
            e.preventDefault();
            select(visible[activeIndex]);
          } else if (e.key === "Escape") {
            setOpen(false);
          }
        }}
      />

      {selected && (
        <button
          type="button"
          aria-label={t("clear")}
          className="absolute end-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600"
          onClick={() => {
            onChange("");
            setQuery("");
          }}
        >
          <Icon icon="material-symbols:close" width="16" height="16" />
        </button>
      )}

      {open && (
        <ul
          id="city-listbox"
          role="listbox"
          className="absolute z-20 mt-1.5 max-h-60 w-full overflow-auto rounded-xl border border-zinc-200 bg-white py-1.5 shadow-lg"
        >
          {visible.length === 0 && (
            <li className="px-3 py-2 text-sm text-zinc-500">
              {t("cityNoResults")}
            </li>
          )}
          {visible.map((o, i) => (
            <li key={o.value} role="option" aria-selected={o.value === value}>
              <button
                type="button"
                className={`flex w-full items-center justify-between px-3 py-2 text-start text-sm ${
                  i === activeIndex
                    ? "bg-sky-50 text-zinc-900"
                    : "text-zinc-700"
                }`}
                onMouseDown={(e) => e.preventDefault()}
                onMouseEnter={() => setActiveIndex(i)}
                onClick={() => select(o)}
              >
                {o.label}
                {o.value === value && (
                  <Icon
                    icon="material-symbols:check"
                    className="text-sky-600"
                    width="16"
                    height="16"
                  />
                )}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default function Page() {
  const t = useTranslations("common");
  const usrLocale = useLocale();
  const locale = {"zh-Hant": "tc", "zh-Hans": "zh"}[usrLocale] || usrLocale;

  const [cityOption, setCityOption] = useState<CityOption[]>([]);

  const [formData, setFormData] = useState({
    weather: true,
    forecast: true,
    align: "start",
    city: "",
    days: "5",
    lang: locale,
    unit: "C",
  });

  const [copied, setCopied] = useState(false);
  const [cityError, setCityError] = useState(false);
  const [outUrl, setOutUrl] = useState("");

  useEffect(() => {
    getCity(Locale[locale as keyof typeof Locale] || Locale.EN).then((cities) =>
      setCityOption(cities ?? []),
    );
  }, [locale]);

  function handleGenerate() {
    if (formData.city === "") {
      setOutUrl("");
      setCityError(true);
      return;
    }
    setCityError(false);

    setOutUrl(
      `${location.protocol}//${location.host}/forecast/${
        formData.city
      }?${new URLSearchParams(
        Object.fromEntries(
          Object.entries(formData)
            .filter(([k, v]) => {
              return v !== null && v !== "" && k != "city";
            })
            .map(([k, v]) => [k, v.toString()]),
        ),
      )}`,
    );
  }

  return (
    <form className="flex flex-col gap-y-6">
      <div className="motion-safe:animate-fade-up">
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900">
          {t("widgetCustomiser")}
        </h1>
        <p className="mt-1 text-sm text-zinc-500">{t("widgetCustomiserHelp")}</p>
      </div>

      <section className={`${SECTION_CLASS} motion-safe:animate-fade-up [animation-delay:80ms]`}>
        <h2 className="text-lg font-semibold text-zinc-900">{t("city")}</h2>
        <div className="mt-4">
          <label htmlFor="city" className="mb-1.5 block text-sm font-medium text-zinc-700">
            {t("city")}
          </label>
          <CityPicker
            options={cityOption}
            value={formData.city}
            onChange={(city) => {
              setFormData({...formData, city});
              if (city !== "") setCityError(false);
            }}
          />
        </div>
      </section>

      <section className={`${SECTION_CLASS} motion-safe:animate-fade-up [animation-delay:160ms]`}>
        <h2 className="text-lg font-semibold text-zinc-900">
          {t("displaySettings")}
        </h2>

        <div className="mt-4 flex flex-col gap-y-6">
          <div>
            <label htmlFor="locale" className="mb-1.5 block text-sm font-medium text-zinc-700">
              {t("language")}
            </label>

            <div className="relative sm:max-w-md">
              <select
                id="locale"
                name="locale"
                defaultValue={locale}
                onChange={(e) => {
                  setFormData({...formData, lang: e.target.value});
                }}
                className={`${INPUT_CLASS} appearance-none pe-9`}
              >
                <option value="ar">لعربية</option>
                <option value="en">English</option>
                <option value="tc">繁體中文</option>
                <option value="zh">简体中文</option>
                <option value="fr">Français</option>
                <option value="de">Deutsch</option>
                <option value="it">Italiano</option>
                <option value="kr">한국어</option>
                <option value="pl">Polski</option>
                <option value="pt">Português</option>
                <option value="ru">Русский</option>
                <option value="es">Español</option>
              </select>
              <Icon
                icon="material-symbols:keyboard-arrow-down"
                className="pointer-events-none absolute end-3 top-1/2 -translate-y-1/2 text-zinc-400"
                width="18"
                height="18"
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-x-10 gap-y-6">
            <fieldset>
              <legend className="mb-2 text-sm font-medium text-zinc-700">
                {t("displayedComponent")}
              </legend>

              <div className="flex gap-x-4">
                {Object.entries({
                  weather: t("presentWeather"),
                  forecast: t("futureWeather"),
                }).map(([k, text]) => (
                  <label
                    className="flex items-center gap-x-2 text-sm text-zinc-600"
                    key={k}
                  >
                    <input
                      type="checkbox"
                      name="unit"
                      value={k}
                      checked={formData[k as keyof typeof formData] as boolean}
                      onChange={() => {
                        const key = k as "weather" | "forecast";
                        setFormData({...formData, [key]: !formData[key]});
                      }}
                      className={CHECK_CLASS}
                    />
                    {text}
                  </label>
                ))}
              </div>
            </fieldset>

            <fieldset>
              <legend className="mb-2 text-sm font-medium text-zinc-700">
                {t("widgetAlignment")}
              </legend>

              <div className="flex gap-x-4">
                {Object.entries({
                  start: t("start"),
                  center: t("center"),
                  end: t("end"),
                }).map(([k, text]) => (
                  <label
                    className="flex items-center gap-x-2 text-sm text-zinc-600"
                    key={k}
                  >
                    <input
                      type="radio"
                      name="align"
                      value={k}
                      checked={formData.align == k}
                      onChange={() => setFormData({...formData, align: k})}
                      className={CHECK_CLASS}
                    />
                    {text}
                  </label>
                ))}
              </div>
            </fieldset>
          </div>

          <div>
            <label htmlFor="days" className="block text-sm font-medium text-zinc-700">
              {t("maxForecastPeriod")}
            </label>
            <p className="mb-2 mt-1 text-xs text-zinc-500">
              {t("maxForecastPeriodHelp")}
            </p>

            <div className="inline-flex items-stretch overflow-hidden rounded-lg border border-zinc-300">
              <button
                type="button"
                aria-label="−"
                className="px-3.5 text-zinc-600 transition-colors hover:bg-zinc-100"
                onClick={() => {
                  let d = parseInt(formData.days);
                  if (d > 1) {
                    setFormData({
                      ...formData,
                      days: (--d).toString(),
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
                className="w-14 border-x border-zinc-300 text-center text-sm text-zinc-900 outline-none"
                value={formData.days}
                onChange={(e) => {
                  if (e.target.value == "") {
                    setFormData({...formData, days: ""});
                  }
                  if (e.target.value.match(/^[0-9]+$/)) {
                    const d = parseInt(e.target.value);
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
                className="px-3.5 text-zinc-600 transition-colors hover:bg-zinc-100"
                onClick={() => {
                  let d = parseInt(formData.days);
                  if (isNaN(d)) d = 0; // guard: empty input + "+" used to yield "NaN"
                  setFormData({
                    ...formData,
                    days: (++d).toString(),
                  });
                }}
              >
                <Icon icon="material-symbols:add" width="18" height="18" />
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className={`${SECTION_CLASS} motion-safe:animate-fade-up [animation-delay:240ms]`}>
        <h2 className="text-lg font-semibold text-zinc-900">
          {t("unitSettings")}
        </h2>

        <fieldset className="mt-4">
          <legend className="mb-2 text-sm font-medium text-zinc-700">
            {t("temperatureUnit")}
          </legend>

          <div className="flex gap-x-4">
            {Object.entries({
              C: `${t("celsius")} (°C)`,
              F: `${t("fahrenheit")} (°F)`,
            }).map(([k, text]) => (
              <label
                className="flex items-center gap-x-2 text-sm text-zinc-600"
                key={k}
              >
                <input
                  type="radio"
                  name="unit"
                  value={k}
                  checked={formData.unit == k}
                  onChange={() => {
                    setFormData({...formData, unit: k});
                  }}
                  className={CHECK_CLASS}
                />
                {text}
              </label>
            ))}
          </div>
        </fieldset>
      </section>

      <section className={`${SECTION_CLASS} motion-safe:animate-fade-up [animation-delay:320ms]`}>
        <h2 className="text-lg font-semibold text-zinc-900">URL</h2>

        <div className="mt-4 flex flex-col gap-y-3">
          <div className="flex flex-col items-stretch gap-x-2 gap-y-3 sm:flex-row sm:items-center">
            <button
              type="button"
              className="inline-flex items-center justify-center gap-x-2 rounded-lg bg-sky-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-sky-500"
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
                className={`${INPUT_CLASS} pe-11 text-zinc-500 disabled:cursor-not-allowed disabled:bg-zinc-50`}
                readOnly
                disabled={!outUrl}
              />
              <button
                type="button"
                title={copied ? t("copied") : undefined}
                aria-label={copied ? t("copied") : t("copy")}
                disabled={!outUrl}
                className={`absolute inset-y-0 end-0 flex items-center px-3.5 transition-colors ${
                  copied
                    ? "text-green-600"
                    : "text-zinc-400 hover:text-zinc-600"
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

          {cityError && (
            <p className="text-xs text-red-600">{t("emptyCityValidation")}</p>
          )}
        </div>
      </section>
    </form>
  );
}
