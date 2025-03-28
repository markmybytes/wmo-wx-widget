import {FutureWeather} from "@/libs/wmo/definition";
import {Locale} from "@/libs/wmo/enums";
import * as wmo from "@/libs/wmo/wmo";
import {getTranslations} from "next-intl/server";

export default async function Forecasts({
  locale,
  forecast,
}: {
  locale: Locale;
  forecast: FutureWeather;
}) {
  if (forecast.forecasts.data.length == 0) {
    const t = await getTranslations("common");

    return (
      <div className="flex">
        <span className="text-red-600">{t("noForecastAvailable")}</span>
      </div>
    );
  }

  return forecast.forecasts.data.map(function (wx, idx) {
    let _d = new Date(wx.date);

    return (
      <div className="flex flex-col flex-1 h-auto dark:text-gray-400" key={idx}>
        <div
          className="flex flex-col justify-center items-center"
          style={{fontSize: "0.75rem"}}
        >
          <span
            className="text-gray-400 dark:text-gray-500"
            style={{
              whiteSpace: "nowrap",
              overflow: "ellipsis",
            }}
          >
            {_d.toLocaleString(wmo.wmoToIso639(locale), {weekday: "long"})}{" "}
          </span>
          <span>{_d.getDate()}</span>
        </div>

        <div
          className="flex justify-center items-center my-2"
          style={{minWidth: "30%"}}
        >
          <img src={wx.icon!} width={50} height={30} />
        </div>

        <div className="flex flex-col lg:flex-row justify-center items-center">
          <div className="flex justify-between mx-1 min-w-12 text-sky-600 dark:text-sky-700">
            {forecast.forecasts.data.length >= 7 ? (
              ""
            ) : (
              <i className="bi bi-thermometer-low"></i>
            )}

            {`${wx.temp.min.val ?? "--"}${wx.temp.min.unit}`}
          </div>
          <div className="flex justify-between mx-1 min-w-12 text-red-600 dark:text-red-700">
            {forecast.forecasts.data.length >= 7 ? (
              ""
            ) : (
              <i className="bi bi-thermometer-high"></i>
            )}

            {`${wx.temp.max.val ?? "--"}${wx.temp.max.unit}`}
          </div>
        </div>
      </div>
    );
  });
}
