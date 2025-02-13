import {PresentWeather as PresentWeatherData} from "@/libs/wmo/definition";

export default function Present({weather}: {weather: PresentWeatherData}) {
  return (
    <div className="flex flex-col items-center m-1 rounded-border">
      <div className="flex my-1">
        <span className="text-gray-600">
          <i className="bi bi-geo"></i>
          <span className="me-1">{weather.city.name}</span>
        </span>
      </div>

      <div className="flex justify-around items-center my-1">
        <img src={weather.icon!} width={60} height={40} />

        <span className="font-medium text-xl">
          {`${weather.temp.val || "--"}${weather.temp.unit}`}
        </span>

        <div className="flex mx-2" style={{height: "2.5rem"}}>
          <div className="vr"></div>
        </div>

        <div className="flex flex-col">
          <div className="flex my-1">
            <span className="text-muted">
              <i className="bi bi-droplet-half"></i> {`${weather.rh || "--"}%`}
            </span>
          </div>
          <div className="flex my-1">
            <span className="text-muted">
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
