import { Icon } from "@iconify/react";
import { City, PresentWeather } from "@/lib/wmo/types";
import { WxIcon } from "./WxIcon";
import { getTranslations } from "next-intl/server";

/** `cards` variant. Spacing and sizing are frozen by decision, not accident — the
 *  original's per-device proportions were validated. Only colour and font changed. */
export default async function WeatherCards({
  city,
  weather,
}: {
  city: City;
  weather: PresentWeather;
  style?: "cards" | "list"; // ignored; kept so both variants share one call site
}) {
  const t = await getTranslations("weather");

  return (
    <div className="flex flex-col flex-1 justify-around md:justify-center items-center gap-y-1.5 min-w-54 p-1 border border-outline rounded">
      <div className="w-full text-center">
        <p className="text-xs sm:text-sm text-muted truncate">
          <Icon
            icon="material-symbols:location-on-outline"
            className="inline"
            width="1em"
            height="1em"
          />{" "}
          {city.name}
        </p>
      </div>

      <div className="flex md:flex-col justify-around items-center gap-2">
        <div className="md:w-full flex items-center gap-x-0.5 sm:gap-x-1.5">
          <div className="w-1/2">
            <div className="justify-self-end h-10 w-13.75 sm:h-12.5 sm:w-17.5">
              <WxIcon
                icon={weather.icon}
                className="size-full"
                alt={weather.weather ?? ""}
              />
            </div>
          </div>

          <div className="w-1/2">
            <p className="font-mono font-medium text-center text-lg sm:text-2xl text-foreground">
              {`${weather.temp.val ?? "--"}${weather.temp.unit}`}
            </p>
          </div>
        </div>

        <div className="md:w-full flex flex-col items-center">
          <div className="hidden sm:block w-full max-w-50 text-center">
            <p className="text-xs bg-fill text-foreground truncate">
              {weather.weather ? t(weather.weather) : ""}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-x-2 text-xs sm:text-sm">
            <span>
              <Icon
                icon="material-symbols:water-drop"
                className="inline"
                width="1em"
                height="1em"
              />{" "}
              {`${weather.rh ?? "--"}%`}
            </span>
            <span>
              <Icon
                icon="material-symbols:air"
                className="inline"
                width="1em"
                height="1em"
              />{" "}
              {weather.wind
                ? `${weather.wind.direction} ${weather.wind.speed ?? "--"} m/s`
                : "--"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
