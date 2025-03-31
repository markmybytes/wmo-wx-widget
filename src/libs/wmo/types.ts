import {TempUnit} from "./enums";

export interface City {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  forecast: boolean;
  climate: boolean;
  isCapital: boolean;
}

export interface Country {
  id: number;
  name: string;
  cities: Array<City>;
  organisation: {
    name: string;
    logo: string | null;
    url: string | null;
  };
}

export interface FutureWeather {
  country: {
    id: number;
    name: string;
  };
  organisation: {
    name: string;
    logo: string | null;
    url: string | null;
  };
  city: {
    name: string;
    stationName: string;
    latitude: number;
    longitude: number;
    isCapital: boolean;
    timeZone: string;
    isDST: boolean;
  };
  forecasts: {
    issueAt: Date | null;
    data: Array<{
      date: string;
      description: string;
      weather: string;
      temp: {
        min: {
          unit: TempUnit;
          val: number | null;
        };
        max: {
          unit: TempUnit;
          val: number | null;
        };
      };
      icon: string;
    }>;
  };
}

export interface PresentWeather {
  city: City;
  issueAt: Date | null;
  temp: {
    unit: TempUnit;
    val: number | null;
  };
  rh: number | null;
  weather: string | null;
  icon: string | null;
  wind: {
    direction: string;
    speed: number | null;
  } | null;
  sun: {
    rise: Date;
    set: Date;
  };
}

/**
 * Represents the response structure for a weather forecast from `/{local}/json/{city_id}_{local}.xml`.
 */
export type WmoForecastResponse = {
  city: {
    cityId: number;
    cityLatitude: string;
    cityLongitude: string;
    cityName: string;
    climate: any;
    forecast: {
      forecastDay: Array<{
        forecastDate: string;
        maxTemp: string;
        maxTempF: string;
        minTemp: string;
        minTempF: string;
        weather: string;
        weatherIcon: number;
        wxdesc: string;
      }>;
      issueDate: string;
      timeZone: string;
    };
    isCapital: boolean;
    isDST: "Y" | "N";
    isDep: boolean;
    lang: string;
    member: {
      logo: string;
      memId: number;
      memName: string;
      orgName: string;
      ra: number;
      shortMemName: string;
      url: string;
    };
    stationName: string;
    timeZone: string;
    tourismBoardName: string;
    tourismURL: string;
  };
};

/**
 * Represents the response structure for a country information from `/{local}/json/Country_{local}.xml`.
 */
export type WmoCountryResponse = {
  member: Array<{
    city: Array<{
      cityId: number;
      cityLatitude: string;
      cityLongitude: string;
      cityName: string;
      climate: "Y" | "N";
      enName: string;
      forecast: "Y" | "N";
      isCapital: boolean;
      isDep: boolean;
      stationName: string;
      timeZone: string;
      tourismURL: string;
      tourismBoardName: string;
    }>;
    countryLatitude: string;
    countryLongitude: string;
    logo: string;
    memId: number;
    memName: string;
    orgName: string;
    ra: number;
    shortMemName: string;
    szmlv: number;
    url: string;
    zoomlv: 6;
  }>;
};

/**
 * Represents the response structure for a present weather from `/{local}/json/present.xml`.
 */
export type WmoPresentWxResponse = {
  present: Array<{
    cityId: number;
    daynightcode: "" | "a" | "b";
    iconNum: string;
    issue: string;
    moonrise: string;
    moonset: string;
    rh: "" | number;
    stnId: string;
    stnName: string;
    sundate: string;
    sunrise: string;
    sunset: string;
    temp: "" | number;
    wd: string;
    ws: string;
    wxImageCode: string;
    wxdesc: string;
  }>;
};
