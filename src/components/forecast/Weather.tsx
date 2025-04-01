import {PresentWeather} from "@/libs/wmo/types";
import {getTranslations} from "next-intl/server";

export default async function Weather({weather}: {weather: PresentWeather}) {
  const t = await getTranslations("weather");

  return (
    <div className="flex flex-col grow justify-center items-center gap-y-1.5 min-w-54 p-1 border border-gray-300 rounded">
      <div className="w-full text-center">
        <p className="text-gray-600 dark:text-gray-500 truncate">
          <i className="bi bi-geo"></i> {weather.city.name}
        </p>
      </div>

      <div className="flex items-center gap-x-2">
        <div className="w-1/2">
          <div className="justify-self-end h-[50px] w-[70px]">
            <img src={weather.icon!} className="size-full" />
          </div>
        </div>

        <div className="w-1/2">
          <p className="font-bold text-2xl">
            {`${weather.temp.val || "--"}${weather.temp.unit}`}
          </p>
        </div>
      </div>

      <div className="w-full max-w-50 text-center">
        <p className="text-xs dark:text-gray-400 truncate">
          {weather.weather ? t(weather.weather) : ""}
        </p>
      </div>

      <div className="flex gap-x-2">
        <span>
          <i className="bi bi-droplet-half"></i> {`${weather.rh || "--"}%`}
        </span>
        <span>
          <i className="bi bi-wind"></i>{" "}
          {weather.wind
            ? `${weather.wind.direction} ${weather.wind.speed || "--"} m/s`
            : "--"}
        </span>
      </div>
    </div>
  );
}
