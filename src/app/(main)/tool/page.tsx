"use client";

import "./style.css";

import {Locale} from "@/libs/wmo/enums";
import {useLocale, useTranslations} from "next-intl";
import {useEffect, useState} from "react";
import {createFilter} from "react-select";
import AsyncSelect from "react-select/async";
import {getCity} from "./actions";

export default function Page() {
  const t = useTranslations("common");
  const usrLocale = useLocale();

  const [language, setLanguage] = useState(
    {"zh-Hant": "tc", "zh-Hans": "zh"}[usrLocale] || usrLocale,
  );

  const [cityOption, setCityOption] = useState<
    Array<{value: string; label: string}>
  >([]);

  const [formData, setFormData] = useState({
    weather: true,
    forecast: true,
    align: "start",
    city: "",
    days: "5",
    lang: "",
    unit: "C",
  });

  const [copied, setCopied] = useState(false);

  const [outUrl, setOutUrl] = useState("");

  useEffect(() => {
    // trigger change event to load the city options
    document
      .querySelector("select[name=locale]")
      ?.dispatchEvent(new Event("change", {bubbles: true}));
  }, []);

  return (
    <form className="flex flex-col space-y-4">
      <div>
        <h1 className="text-3xl font-bold">{t("widgetCustomiser")}</h1>
        <p className="mt-1 text-sm text-gray-400">
          {t("widgetCustomiserHelp")}
        </p>
      </div>

      <div className="flex flex-col gap-y-4 pb-4 border-b border-gray-900/10">
        <h2 className="text-xl font-bold text-gray-900"></h2>

        <div>
          <h3 className="text-base">{t("city")}</h3>

          <AsyncSelect
            instanceId="city"
            name="city"
            defaultOptions={cityOption}
            loadOptions={(inputValue, callback) => {
              callback(
                cityOption.filter((c) =>
                  c.label
                    .toLocaleLowerCase()
                    .includes(inputValue.toLocaleLowerCase()),
                ),
              );
            }}
            onChange={(newValue) => {
              setFormData({...formData, city: newValue!.value});
            }}
            filterOption={createFilter({ignoreAccents: false})}
            className="block w-full sm:max-w-md sm:text-sm"
          ></AsyncSelect>
        </div>
      </div>

      <div className="flex flex-col gap-y-4 pb-4 border-b border-gray-900/10">
        <h2 className="text-xl font-bold text-gray-900">
          {t("displaySettings")}
        </h2>

        <div>
          <h3 className="text-base">{t("language")}</h3>

          <select
            name="locale"
            defaultValue={language}
            onChange={(e) => {
              setFormData({...formData, lang: e.target.value});
              setLanguage(e.target.value);

              if (e.target.value.length != 2) {
                setCityOption([]);
                return;
              }

              getCity(
                Locale[
                  (e.target.value[0].toUpperCase() +
                    e.target.value.slice(1)) as keyof typeof Locale
                ],
              )
                .then((cities) => {
                  setCityOption(
                    cities.map((v, i) => {
                      return {value: v.id.toString(), label: v.name};
                    }),
                  );
                })
                .catch((_) => []);
            }}
            className="w-full sm:max-w-md sm:text-sm border border-gray-300 rounded-[4px]"
            style={{height: "38px"}}
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
        </div>

        <div className="flex flex-wrap gap-x-8 gap-y-4">
          <div>
            <h3 className="text-base">{t("displayedComponent")}</h3>

            <div className="flex gap-x-3">
              {Object.entries({
                present: t("presentWeather"),
                future: t("futureWeather"),
              }).map(([k, text]) => (
                <label className="flex items-center gap-x-1" key={k}>
                  <input
                    type="checkbox"
                    name="unit"
                    value={k}
                    checked={formData[k as keyof typeof formData] as boolean}
                    onChange={() => {
                      let d: {[key: string]: any} = {};
                      d[k] = !formData[k as keyof typeof formData];
                      setFormData({...formData, ...d});
                    }}
                    className="h-4 w-4"
                  />
                  {text}
                </label>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-base">{t("widgetAlignment")}</h3>

            <div className="flex gap-x-3">
              {Object.entries({
                start: t("start"),
                center: t("center"),
                end: t("end"),
              }).map(([k, text]) => (
                <label className="flex items-center gap-x-1" key={k}>
                  <input
                    type="radio"
                    name="align"
                    value={k}
                    checked={formData.align == k}
                    onChange={() => setFormData({...formData, align: k})}
                    className="h-4 w-4"
                  />
                  {text}
                </label>
              ))}
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-base">{t("maxForecastPeriod")}</h3>
          <p className="mb-2 text-xs text-gray-400">
            {t("maxForecastPeriodHelp")}
          </p>

          <div className="flex items-center me-4">
            <button
              type="button"
              className="bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded-s-lg p-3 h-11 focus:ring-gray-100 focus:ring-2 focus:outline-hidden"
              onClick={(_) => {
                let d = parseInt(formData.days);
                if (d > 1) {
                  setFormData({
                    ...formData,
                    days: (--d).toString(),
                  });
                }
              }}
            >
              -
            </button>
            <input
              type="number"
              className="w-14 h-11 text-center text-sm border-y border-gray-300"
              value={formData.days}
              onChange={(e) => {
                if (e.target.value == "") {
                  setFormData({...formData, days: ""});
                }
                if (e.target.value.match(/^[0-9]+$/)) {
                  let d = parseInt(e.target.value);
                  setFormData({
                    ...formData,
                    days: d > 0 ? d.toString() : "1",
                  });
                }
              }}
            />
            <button
              type="button"
              className="bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded-e-lg p-3 h-11 focus:ring-gray-100 focus:ring-2 focus:outline-hidden"
              onClick={(_) => {
                let d = parseInt(formData.days);
                setFormData({
                  ...formData,
                  days: (++d).toString(),
                });
              }}
            >
              +
            </button>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-y-4 pb-4 border-b border-gray-900/10">
        <h2 className="text-xl font-bold text-gray-900">{t("unitSettings")}</h2>

        <div>
          <h3 className="text-base">{t("temperatureUnit")}</h3>

          <div className="flex gap-x-3">
            {Object.entries({
              C: `${t("celsius")} (°C)`,
              F: `${t("fahrenheit")} (°F)`,
            }).map(([k, text]) => (
              <label className="flex items-center gap-x-1" key={k}>
                <input
                  type="radio"
                  name="unit"
                  value={k}
                  checked={formData.unit == k}
                  onChange={() => {
                    setFormData({...formData, unit: k});
                  }}
                  className="h-4 w-4"
                />
                {text}
              </label>
            ))}
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-y-4">
        <h2 className="text-xl font-bold text-gray-900">URL</h2>

        <div className="flex items-center gap-x-2">
          <div className="relative flex-1">
            <input
              type="text"
              value={outUrl}
              className="w-full px-3 py-3 pr-10 text-sm border border-gray-300 rounded-lg"
              readOnly
              disabled
            />
            <button
              type="button"
              className="absolute inset-y-0 right-0 px-4 rounded-lg text-gray-500 hover:bg-gray-400/20"
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
              {!copied ? (
                <span>
                  <svg
                    className="w-3.5 h-3.5"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="currentColor"
                    viewBox="0 0 18 20"
                  >
                    <path d="M16 1h-3.278A1.992 1.992 0 0 0 11 0H7a1.993 1.993 0 0 0-1.722 1H2a2 2 0 0 0-2 2v15a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V3a2 2 0 0 0-2-2Zm-3 14H5a1 1 0 0 1 0-2h8a1 1 0 0 1 0 2Zm0-4H5a1 1 0 0 1 0-2h8a1 1 0 1 1 0 2Zm0-5H5a1 1 0 0 1 0-2h2V2h4v2h2a1 1 0 1 1 0 2Z" />
                  </svg>
                </span>
              ) : (
                <span className="items-center">
                  <svg
                    className="w-3.5 h-3.5 text-green-700"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 16 12"
                  >
                    <path
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M1 5.917 5.724 10.5 15 1.5"
                    />
                  </svg>
                </span>
              )}
            </button>
          </div>
          <button
            type="button"
            className="px-4 py-3 text-white rounded-lg bg-indigo-600 hover:bg-indigo-500 focus:outline-hidden"
            onClick={(_) => {
              if (formData.city == "") {
                setOutUrl("");
                return;
              }

              setOutUrl(
                `${location.protocol}//${location.host}/forecast/${
                  formData.city
                }?${new URLSearchParams(
                  Object.fromEntries(
                    Object.entries(formData)
                      .filter(([k, v]) => {
                        return v !== null && v !== "" && k != "city";
                      })
                      .map(([k, v], _) => [k, v.toString()]),
                  ),
                )}`,
              );
            }}
          >
            {t("generate")}
          </button>
        </div>

        <p
          className={`text-red-500 text-xs italic ${
            formData.city == "" ? "" : "hidden"
          } `}
        >
          {t("emptyCityValidation")}
        </p>
      </div>
    </form>
  );
}
