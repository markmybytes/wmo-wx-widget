import { Icon } from "@iconify/react";
import { City, PresentWeather } from "@/lib/wmo";
import { WxIcon } from "./WxIcon";
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
    // The 240px cap makes this a sidebar at md+, so `only:` drops it when the card is
    // alone. A sibling appearing later reverts to the sidebar, which is wanted anyway.
    <div className="flex w-full shrink-0 flex-col items-center gap-y-2 rounded-lg border border-outline bg-surface p-3 shadow-sm md:max-w-60 md:justify-center md:only:max-w-none">
      <p className="truncate font-mono text-xs text-muted">{city.name}</p>

      <div className="flex items-center gap-x-2">
        <WxIcon
          icon={weather.icon}
          className="h-12.5 w-17.5 shrink-0"
          alt={weather.weather ?? ""}
        />
        <p className="font-mono text-2xl font-medium whitespace-nowrap text-foreground">
          {`${weather.temp.val ?? "--"}${weather.temp.unit}`}
        </p>
      </div>

      <p className="max-w-52 truncate bg-fill px-2 py-0.5 text-xs text-foreground">
        {weather.weather ? t(weather.weather) : ""}
      </p>

      <div className="flex justify-center gap-x-3 font-mono text-xs text-muted">
        <span className="flex items-center gap-x-1">
          <Icon icon="material-symbols:water-drop" />
          {`${weather.rh ?? "--"}%`}
        </span>
        <span className="flex items-center gap-x-1">
          <Icon icon="material-symbols:air" />
          {weather.wind ? `${weather.wind.direction} ${weather.wind.speed ?? "--"} m/s` : "--"}
        </span>
      </div>
    </div>
  );
}
