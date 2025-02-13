import pprint
import json
import os

os.system('cls' if os.name == 'nt' else 'clear')

# JSON.stringify($(".wxicons_row .col_wxicons3").map(function(idx, el) {return [$(el).text().split(',')]}).get())

wind = {
    "N": "N",
    "NNE": "NNE",
    "NE": "NE",
    "ENE": "ENE",
    "E": "E",
    "ESE": "ESE",
    "SE": "SE",
    "SSE": "SSE",
    "S": "S",
    "SSW": "SSW",
    "SW": "SW",
    "WSW": "WSW",
    "W": "W",
    "WNW": "WNW",
    "NW": "NW",
    "NNW": "NNW",
}

weather = [
    ["Sandstorm", "Duststorm", "Sand", "Dust"],
    ["Thunderstorms", "Thundershowers", "Storm", "Lightning"],
    ["Hail"],
    ["Blowing Snow", "Blizzard", "Snowdrift", "Snowstorm"],
    ["Snow Showers", "Flurries"],
    ["Snow", "Heavy Snow", "Snowfall"],
    ["Light Snow"],
    ["Sleet"],
    ["Showers", "Heavy Showers", "Rainshower"],
    ["Occasional Showers", "Scattered Showers"],
    ["Isolated Showers"],
    ["Light Showers"],
    ["Freezing Rain"],
    ["Rain"],
    ["Drizzle", "Light Rain"],
    ["Fog"],
    ["Mist"],
    ["Smoke"],
    ["Haze"],
    ["Overcast"],
    ["Sunny Intervals", "No Rain", "Clearing"],
    ["Sunny Periods", "Partly Cloudy", "Partly Bright", "Mild"],
    ["Cloudy", "Mostly Cloudy"],
    ["Bright", "Sunny", "Fair", "Fine", "Clear"],
    ["Windy", "Squall", "Stormy", "Gale"],
    ["Wet", "Humid"],
    ["Dry"],
    ["Freezing"],
    ["Frost"],
    ["Hot"],
    ["Cold", "Chilly"],
    ["Warm"],
    ["Cool"],
    ["Volcanic Ash"]
]

t = [["عاصفة رملية", "عاصفة غبارية", "رمل", "غبار"], ["عواصف رعدية", "زخات مطر رعدية", "عاصفة", "برق"], ["برد"], ["هبوب عاصفة ثلجية", "عاصفة ثلجية", "ثلوج عائمة"], ["تساقط ثلوج", "تساقط ثلجي خفيف"], ["ثلج", "ثلج كثيف", "تساقط الثلوج"], ["ثلوج خفيفة"], ["مطر ثلجى"], ["زخات مطر", "زخات المطر كثيفة", "مطر"], ["أحيانا زخات المطر", "أمطار واسعة النطاق"], ["زخات مطر متفرقة"], ["زخات مطر خفيفة"], [
    "أمطار متجمدة"], ["مطر"], ["رذاذ", "مطر خفيف"], ["ضباب"], ["ضباب خفيف"], ["دخان"], ["مغبر"], ["غائم كليا"], ["فترات مشمسة", "لا مطر", "تصفى السماء"], ["فترات مشمسة", "غائم جزئيا", "مشرق جزئيا", "معتدل"], ["غائم كليا", "غائم"], ["مشرق", "مشمس", "معتدل", "جيد", "صافي"], ["رياح", "عاصفة ثلجية", "عاصف", "عاصفة"], ["رطب"], ["يجف"], ["تجمد"], ["صقيع"], ["حار"], ["بارد"], ["دافئ"], ["بارد"], ["الرماد البركاني"]]

length = 0
for row in weather:
    length += len(row)
print(f"Total: {length}")

translated = {}
for wx, wx_t in zip(weather, t):
    if (len(wx) != len(wx_t)):
        print("Text count miss match!")
        print(wx, wx_t)
        print("-" * 20)
        translated |= dict(zip(wx, wx))
    else:

        translated |= dict(zip(wx, wx_t))

with open('weather.json', 'w', encoding="utf-8") as f:
    json.dump(wind | translated, f, indent=4, ensure_ascii=False)
