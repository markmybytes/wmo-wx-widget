export default function Home() {
  return (
    <main className="flex flex-col justify-center items-center gap-y-8 w-full flex-1 px-3 py-8">
      <a
        href="https://github.com/markmybytes/wmo-wx-widget"
        target="_blank"
        className="flex flex-col gap-y-2 max-w-xl p-6 rounded-lg shadow-md"
      >
        <p className="text-gray-500">Source Code/Repository</p>

        <div className="flex items-center gap-x-1">
          <img
            src="https://github.githubassets.com/assets/GitHub-Mark-ea2971cee799.png"
            alt="GitHub Icon"
            className="w-6 h-6"
          />

          <p className="font-bold">markmybytes/wmo-wx-widget</p>
        </div>

        <p className="mt-4 text-gray-600">
          A responsive, self-hostable weather widget that provide official
          weather information around the world.
        </p>
      </a>

      <a
        href="https://worldweather.wmo.int/en/home.html"
        target="_blank"
        className="flex flex-col gap-y-2 max-w-xl p-6 rounded-lg shadow-md"
      >
        <p className="text-gray-500">Data Source</p>
        <div className="flex items-center gap-x-1">
          <img
            src="https://wmo.int/themes/custom/server_theme/dist/images/logo.svg"
            alt="WMO Icon"
            className="w-6 h-6"
          />

          <p className="font-bold">
            World Meteorological Organization - World Weather Information
            Service
          </p>
        </div>

        <p className="mt-4 text-gray-600">
          A global website presents OFFICIAL weather observations, weather
          forecasts and climatological information for selected cities supplied
          by National Meteorological & Hydrological Services (NMHSs)
          worldwide.The NMHSs make official weather observations in their
          respective countries. Links to their official weather service websites
          and tourism board/organization are also provided whenever available.
          Weather icons are shown alongside worded forecasts in this version to
          facilitate visual inspection.
        </p>
      </a>
    </main>
  );
}
