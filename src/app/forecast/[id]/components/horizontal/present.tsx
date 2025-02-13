import {PresentWeather} from "@/libs/wmo/definition";
import {getTranslations} from "next-intl/server";

export default async function Present({weather}: {weather: PresentWeather}) {
  const t = await getTranslations("weather");

  return (
    <div className="flex flex-col justify-center items-center">
      <div className="flex">
        <span className="text-gray-600 max-w-60 overflow-hidden whitespace-nowrap text-ellipsis">
          <i className="bi bi-geo"></i>
          <span className="me-1">{weather.city.name}</span>
        </span>
      </div>

      <div className="flex items-center my-1">
        <img src={weather.icon!} width={70} height={50} />

        <div className="flex flex-col items-center my-1">
          <span className="font-bold text-2xl">
            {`${weather.temp.val || "--"}${weather.temp.unit}`}
          </span>
        </div>
      </div>

      <div className="flex my-1 max-w-50">
        <span className="w-full text-xs truncate">
          {weather.weather ? t(weather.weather) : ""}
        </span>
      </div>

      <div className="flex flex-row">
        <span className="mx-1">
          <i className="bi bi-droplet-half"></i> {`${weather.rh || "--"}%`}
        </span>
        <span className="mx-1">
          <i className="bi bi-wind"></i>{" "}
          {weather.wind
            ? `${weather.wind.direction} ${weather.wind.speed || "--"} m/s`
            : "--"}
        </span>
      </div>
    </div>
  );
}
