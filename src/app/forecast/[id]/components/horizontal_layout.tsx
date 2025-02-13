import {FutureWeather, PresentWeather} from "@/libs/wmo/definition";
import {Locale} from "@/libs/wmo/enums";
import Forecasts from "./horizontal/forecasts";
import Present from "./horizontal/present";

export default async function HorizontalLayout({
  locale,
  weather,
  forecast,
}: {
  locale: Locale;
  weather: PresentWeather;
  forecast: FutureWeather;
}) {
  return (
    <div
      className="flex flex-row justify-around items-center m-1 p-2"
      style={{border: "1px lightgray solid", borderRadius: "5px"}}
    >
      <div className="mx-1 lg:mx-0 w-60 border-r">
        <Present weather={weather}></Present>
      </div>

      <div className="flex flex-1 justify-center">
        <Forecasts locale={locale} forecast={forecast}></Forecasts>
      </div>
    </div>
  );
}
