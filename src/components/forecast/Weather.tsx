import { Icon } from "@iconify/react";
import { City, PresentWeather } from "@/lib/wmo/types";
import { getTranslations } from "next-intl/server";

export default async function Weather({
  city,
  weather,
}: {
  city: City;
  weather: PresentWeather;
  style?: "cards" | "list"; // ignored; kept so both variants share one call site
}) {
  const t = await getTranslations("weather");

  return (
    // The 240px cap makes this a sidebar at md+, so `only:` drops it when the
    // card is alone and it fills the row like cards does. A sibling appearing
    // later reverts to the sidebar, which is the wanted behaviour anyway.
    <div className="flex w-full shrink-0 flex-col items-center gap-y-2 rounded-lg border border-line bg-white p-3 shadow-sm md:justify-center md:max-w-60 md:only:max-w-none">
      <p className="truncate font-mono text-xs text-faint">{city.name}</p>

      {/* Hero: pictogram at its full 70×50 beside the reading — the pairing
          this widget exists for. The image is shrink-0 so the temp keeps its
          measure instead of both fighting over one cramped flex line. */}
      <div className="flex items-center gap-x-2">
        <img
          src={weather.icon}
          className="h-12.5 w-17.5 shrink-0"
          alt={weather.weather ?? ""}
        />
        <p className="whitespace-nowrap font-mono text-2xl font-medium text-ink">
          {`${weather.temp.val ?? "--"}${weather.temp.unit}`}
        </p>
      </div>

      <p className="max-w-52 truncate bg-lift px-2 py-0.5 text-xs text-ink">
        {weather.weather ? t(weather.weather) : ""}
      </p>

      <div className="flex justify-center gap-x-3 font-mono text-xs text-faint">
        <span className="flex items-center gap-x-1">
          <Icon icon="material-symbols:water-drop" width="1em" height="1em" />
          {`${weather.rh ?? "--"}%`}
        </span>
        <span className="flex items-center gap-x-1">
          <Icon icon="material-symbols:air" width="1em" height="1em" />
          {weather.wind
            ? `${weather.wind.direction} ${weather.wind.speed ?? "--"} m/s`
            : "--"}
        </span>
      </div>
    </div>
  );
}
