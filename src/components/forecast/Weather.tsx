import {City, PresentWeather} from "@/libs/wmo/types";
import {getTranslations} from "next-intl/server";

export default async function Weather({
  city,
  weather,
}: {
  city: City;
  weather: PresentWeather;
}) {
  const t = await getTranslations("weather");

  return (
    <div className="flex flex-col flex-1 justify-around md:justify-center items-center gap-y-1.5 min-w-54 p-1 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded">
      <div className="w-full text-center">
        <p className="text-xs sm:text-sm text-gray-500 truncate">
          <i className="bi bi-geo"></i> {city.name}
        </p>
      </div>

      <div className="flex md:flex-col justify-around items-center gap-2">
        <div className="md:w-full flex items-center gap-x-0.5 sm:gap-x-1.5">
          <div className="w-1/2">
            <div className="justify-self-end h-[40px] w-[55px] sm:h-[50px] sm:w-[70px]">
              <img
                src={weather.icon!}
                className="size-full"
                alt={weather.weather ?? ""}
              />
            </div>
          </div>

          <div className="w-1/2">
            <p className="font-bold text-center text-lg sm:text-2xl">
              {`${weather.temp.val || "--"}${weather.temp.unit}`}
            </p>
          </div>
        </div>

        <div className="md:w-full flex flex-col items-center">
          <div className="hidden sm:block w-full max-w-50 text-center">
            <p className="text-xs bg-gray-100 dark:bg-gray-500 text-black truncate">
              {weather.weather ? t(weather.weather) : ""}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-x-2 text-xs sm:text-sm">
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
      </div>
    </div>
  );
}
