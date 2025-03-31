import {Locale, TempUnit} from "./enums";
import {
  Country,
  FutureWeather,
  PresentWeather,
  WmoCountryResponse,
  WmoForecastResponse,
  WmoPresentWxResponse,
} from "./types";

const wmoUrl = "https://worldweather.wmo.int";

/**
 * Converts WMO locale codes to ISO639 codes.
 *
 * @param locale - The WMO locale code to be converted.
 * @returns The corresponding ISO639 code.
 */
export function wmoToIso639(locale: Locale) {
  const mapping = {
    ar: "ar",
    en: "en",
    tc: "zh-Hant",
    zh: "zh-Hans",
    fr: "fr",
    de: "de",
    it: "it",
    kr: "ko",
    pl: "pl",
    pt: "pt",
    ru: "ru",
    es: "es",
  };

  return mapping[locale] || locale;
}

/**
 * Generates the URL for a WMO weather icon based on the icon ID.
 *
 * @param id - The four-digit icon ID.
 * @param daynight - Whether to display the day/night variation icon (if available).
 * @returns The URL of the weather icon.
 */
export function wxIconUrl(id: string, daynight: boolean) {
  let iconId = parseInt(id.slice(0, id.length - 2)).toString(); // remove leading zero
  let dn = id.slice(-2);
  if (parseInt(iconId) >= 21 && parseInt(iconId) <= 25) {
    if (daynight) {
      iconId += dn == "01" ? "a" : "b";
    } else {
      iconId += "a";
    }
  }
  return `${wmoUrl}/images/i${iconId}.png`;
}

/**
 * Fetches the forecast data for a specified city.
 *
 * @param cityId - The ID of the city.
 * @param locale - The locale code.
 * @param unit - The temperature unit (Celsius or Fahrenheit).
 * @param days - The number of days for the forecast.
 * @returns A promise that resolves to the forecast data.
 */
export async function forecasts(
  cityId: number,
  locale: Locale,
  unit: TempUnit,
  days: number,
): Promise<FutureWeather> {
  return fetch(`${wmoUrl}/${locale}/json/${cityId}_${locale}.xml`)
    .then(async (res) => {
      try {
        return res.json();
      } catch (e) {
        return Promise.reject(new Error("Invalid Locale"));
      }
    })
    .then((json: WmoForecastResponse) => {
      return {
        country: {
          id: json.city.member.memId,
          name: json.city.member.memName,
        },
        city: {
          name: json.city.cityName,
          stationName: json.city.stationName,
          latitude: parseFloat(json.city.cityLatitude),
          longitude: parseFloat(json.city.cityLongitude),
          isCapital: json.city.isCapital,
          timeZone: json.city.timeZone,
          isDST: json.city.isDST !== "N",
        },
        forecasts: {
          issueAt:
            json.city.forecast.issueDate != "N/A"
              ? new Date(json.city.forecast.issueDate + json.city.timeZone)
              : null,
          data: json.city.forecast.forecastDay
            .map((forecast) => ({
              date: forecast.forecastDate,
              description: forecast.wxdesc,
              weather: forecast.weather,
              temp: {
                min: {
                  unit: unit,
                  val:
                    (unit == TempUnit.C && forecast.minTemp !== "") ||
                    (unit == TempUnit.F && forecast.minTempF !== "")
                      ? parseInt(
                          unit == TempUnit.C
                            ? forecast.minTemp
                            : forecast.minTempF,
                        )
                      : null,
                },
                max: {
                  unit: unit,
                  val:
                    (unit == TempUnit.C && forecast.maxTemp !== "") ||
                    (unit == TempUnit.F && forecast.maxTempF !== "")
                      ? parseInt(
                          unit == TempUnit.C
                            ? forecast.maxTemp
                            : forecast.maxTempF,
                        )
                      : null,
                },
              },
              icon:
                forecast.weatherIcon != 0
                  ? wxIconUrl(forecast.weatherIcon.toString(), false)
                  : "/images/question_mark.png",
            }))
            .slice(0, Math.max(Math.abs(days), 1)),
        },
        organisation: {
          name: json.city.member.orgName,
          logo: json.city.member.logo
            ? wmoUrl + `/images/logo/${json.city.member.logo}`
            : null,
          url: json.city.member.url || null,
        },
      };
    });
}

/**
 * Fetches the present weather data for a specified city.
 *
 * @param cityId - The ID of the city.
 * @param locale - The locale code.
 * @param unit - The temperature unit (Celsius or Fahrenheit).
 * @returns A promise that resolves to the present weather data.
 */
export async function present(
  cityId: number,
  locale: Locale,
  unit: TempUnit,
): Promise<PresentWeather> {
  return fetch(`${wmoUrl}/${locale}/json/present.xml`)
    .then(async (res) => {
      try {
        return res.json();
      } catch (e) {
        return Promise.reject(new Error("Invalid Locale"));
      }
    })
    .then(async (json: WmoPresentWxResponse) => {
      try {
        var wx = Object.entries(json.present).filter(
          ([_, v]) => v.cityId == cityId,
        )[0][1];
      } catch (e) {
        return Promise.reject(new Error("Invalid City ID"));
      }

      if (!wx) {
        return Promise.reject(
          new RangeError(`No data for the city (id: ${cityId})`),
        );
      }

      return {
        city: (await city(cityId, locale))!,
        issueAt: wx.issue
          ? new Date(
              wx.issue.slice(0, 4) as any,
              wx.issue.slice(5, 6) as any,
              wx.issue.slice(7, 8) as any,
              wx.issue.slice(9, 10) as any,
              wx.issue.slice(11, 12) as any,
            )
          : null,
        temp: {
          unit: unit,
          val:
            wx.temp !== ""
              ? unit == TempUnit.C
                ? wx.temp
                : Math.round(((wx.temp * 9) / 5 + 32 + Number.EPSILON) * 100) /
                  100
              : null,
        },
        rh: wx.rh || null,
        weather: wx.wxdesc,
        icon:
          wx.iconNum !== ""
            ? wxIconUrl(wx.iconNum, true)
            : "/images/question_mark.png",
        wind:
          wx.wd !== "" && wx.ws !== ""
            ? {
                direction: wx.wd,
                speed:
                  wx.ws !== "" ? Math.round(parseFloat(wx.ws) * 10) / 10 : null,
              }
            : null,
        sun: {
          rise: new Date(
            wx.sundate.slice(0, 4) as any,
            wx.sundate.slice(5, 6) as any,
            wx.sundate.slice(7, 8) as any,
            wx.sunrise.slice(0, 2) as any,
            wx.sunrise.slice(3, 4) as any,
          ),
          set: new Date(
            wx.sundate.slice(0, 4) as any,
            wx.sundate.slice(5, 6) as any,
            wx.sundate.slice(7, 8) as any,
            wx.sunset.slice(0, 2) as any,
            wx.sunset.slice(3, 4) as any,
          ),
        },
      };
    });
}

/**
 * Fetches the data of list of countries.
 *
 * @param locale - The locale code.
 * @returns A promise that resolves to an array of countries.
 */
export async function countries(locale: Locale): Promise<Array<Country>> {
  return fetch(`${wmoUrl}/${locale}/json/Country_${locale}.xml`)
    .then((res) => res.json())
    .then((json: WmoCountryResponse) => {
      let countries: Array<Country> = [];
      for (const [_, country] of Object.entries(json.member)) {
        countries.push({
          id: country.memId,
          name: country.memName,
          cities: country.city?.map((c) => ({
            id: c.cityId,
            name: c.cityName,
            latitude: parseFloat(c.cityLatitude),
            longitude: parseFloat(c.cityLongitude),
            forecast: c.forecast === "Y",
            climate: c.climate === "Y",
            isCapital: c.isCapital,
          })),
          organisation: {
            name: country.orgName,
            logo: country.logo ? wmoUrl + `/images/logo/${country.logo}` : null,
            url: country.url || null,
          },
        });
      }
      return countries;
    });
}

/**
 * Fetches the weather data for a specific city.
 *
 * @param cityId - The ID of the city.
 * @param locale - The locale code.
 * @returns A promise that resolves to the city data.
 */
export async function city(cityId: number, locale: Locale) {
  return (await countries(locale))
    .flatMap((c) => c.cities)
    .find((el) => el.id == cityId);
}
