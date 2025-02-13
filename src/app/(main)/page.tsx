export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-2 sm:p-24">
      <div className="flex flex-col sm:flex-row">
        <div className="flex flex-shrink-0 justify-center">
          <img
            className="w-[100px] h-[100px]"
            src="https://github.githubassets.com/assets/GitHub-Mark-ea2971cee799.png"
          ></img>
        </div>
        <div className="flex flex-col justify-around max-w-96 text-center sm:text-left">
          <a
            className="text-sky-700 text-lg font-bold"
            href="https://github.com/SuperDumbTM/wmo-wx-widget"
            target="_blank"
          >
            SuperDumbTM/wmo-wx-widget
          </a>

          <p>
            A responsive, self-hosted weather widget that provide official
            weather information around the world.
          </p>
        </div>
      </div>
      {/* <div className="grid grid-rows-3 grid-flow-col gap-1">
        <div className="row-span-3">
          <img
            className="w-[100px] h-[100px]"
            src="https://github.githubassets.com/assets/GitHub-Mark-ea2971cee799.png"
          ></img>
        </div>
        <div className="col-span-2 flex items-center">
          <a
            href="https://github.com/SuperDumbTM/wmo-wx-widget"
            target="_blank"
          >
            SuperDumbTM/wmo-wx-widget
          </a>
        </div>
        <div className="row-span-2 col-span-2 flex items-center">
          <p style={{maxWidth: "300px"}}>
            A self-hosted responsive weather widget that uses the World
            Meteorological Organization (WMO) as the data source.
          </p>
        </div>
      </div> */}
    </main>
  );
}
