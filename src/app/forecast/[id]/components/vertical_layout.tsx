import {FutureWeather, PresentWeather} from "@/libs/wmo/definition";
import {Locale} from "@/libs/wmo/enums";
import Forecasts from "./vertical/forecasts";
import Present from "./vertical/present";

export default function VerticalLayout({
  locale,
  weather,
  forecast,
}: {
  locale: Locale;
  weather: PresentWeather;
  forecast: FutureWeather;
}) {
  return (
    <div className="flex flex-col flex-nowrap">
      <Present weather={weather}></Present>
      <Forecasts locale={locale} forecast={forecast}></Forecasts>
    </div>
  );
}
