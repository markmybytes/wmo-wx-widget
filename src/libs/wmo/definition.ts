import {TempUnit} from "./enums";

export interface Country {
  id: number;
  name: string;
}

export interface Organisation {
  name: string;
  logo: string | null;
  url: string | null;
}

export interface City {
  id: number;
  name: string;
  country: Country;
  organisation: Organisation;
  latitude: number;
  longitude: number;
  forecast: boolean;
  climate: boolean;
  isCapital: boolean;
}

export interface Forecast {
  date: string;
  description: string;
  weather: string;
  temp: {
    min: Temperature;
    max: Temperature;
  };
  icon: string;
}

export interface ForecastCity {
  name: string;
  stationName: string;
  latitude: number;
  longitude: number;
  isCapital: boolean;
  timeZone: string;
  isDST: boolean;
}

export interface FutureWeather {
  country: Country;
  organisation: Organisation;
  city: ForecastCity;
  forecasts: {
    issueAt: Date | null;
    data: Array<Forecast>;
  };
}

export interface Temperature {
  unit: TempUnit;
  val: number | null;
}

export interface Wind {
  direction: string;
  speed: number | null;
}

export interface Sun {
  rise: Date;
  set: Date;
}

export interface PresentWeather {
  city: City;
  issueAt: Date | null;
  temp: Temperature;
  rh: number | null;
  weather: string | null;
  icon: string | null;
  wind: Wind | null;
  sun: Sun;
}

export interface WmoForecastResponse {
  city: {
    lang: string;
    cityName: string;
    cityLatitude: string;
    cityLongitude: string;
    cityId: number;
    isCapital: boolean;
    stationName: string;
    tourismURL: string;
    tourismBoardName: string;
    timeZone: string;
    isDep: boolean;
    isDST: "Y" | "N";
    member: {
      memId: number;
      memName: string;
      shortMemName: string;
      url: string;
      orgName: string;
      logo: string;
      ra: number;
    };
    forecast: {
      issueDate: string;
      forecastDay: Array<{
        forecastDate: string;
        wxdesc: string;
        weather: string;
        minTemp: "" | number;
        maxTemp: "" | number;
        minTempF: "" | number;
        maxTempF: "" | number;
        weatherIcon: number;
      }>;
    };
    climate: Object;
  };
}

export interface WmoCityResponse {
  member: Array<{
    memId: number;
    memName: string;
    orgName: string;
    logo: string;
    url: string;
    city: Array<{
      cityName: string;
      enName: string;
      cityLatitude: string;
      cityLongitude: string;
      cityId: number;
      forecast: "Y" | "N,";
      climate: "Y" | "N";
      isCapital: boolean;
      stationName: string;
      tourismURL: string;
      tourismBoardName: string;
      isDep: boolean;
      timeZone: string;
    }>;
  }>;
}

export interface WmoPresentWxResponse {
  present: Array<{
    cityId: number;
    stnId: string;
    stnName: string;
    issue: string;
    temp: "" | number;
    rh: "" | number;
    wxdesc: string;
    wxImageCode: string;
    wd: string;
    ws: string;
    iconNum: string;
    sundate: string;
    sunrise: string;
    sunset: string;
    moonrise: string;
    moonset: string;
    daynightcode: "" | "a" | "b";
  }>;
}
