import { Icon } from "@iconify/react";
import { getTranslations } from "next-intl/server";
import Link from "next/link";

export default async function Home() {
  const t = await getTranslations("home");
  const wt = await getTranslations("weather");
  const ct = await getTranslations("common");

  return (
    <div className="motion-safe:animate-fade-up">
      {/* Station masthead: one line of real observation framing, one rule. */}
      <div
        aria-hidden
        className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 border-b border-line pb-3 font-mono text-[11px] tracking-[0.14em] text-faint sm:text-xs"
      >
        <span>06710 · 46.20° N 06.09° E</span>
        <span>WMO · World Weather Information Service</span>
      </div>

      <section className="grid gap-x-12 gap-y-10 py-10 sm:grid-cols-[1fr_auto] sm:items-center sm:py-14">
        <div className="max-w-lg">
          <h1 className="text-balance font-display text-2xl font-bold leading-[1.15] tracking-tight text-ink sm:text-3xl">
            {t("heroTitle")}
          </h1>

          <p className="mt-3 max-w-prose text-sm leading-relaxed text-faint sm:text-base">
            {t("heroDescription")}
          </p>
        </div>

        <div className="justify-self-center sm:justify-self-end">
          {/* Static, real-CSS mock of the actual widget card (components/forecast/Weather.tsx). */}
          <div
            aria-hidden
            className="flex w-56 flex-col items-center gap-y-1.5 rounded border border-line bg-white p-3 shadow-sm"
          >
            <p className="flex items-center gap-x-1 text-xs text-faint">
              <Icon
                icon="material-symbols:location-on-outline"
                width="1em"
                height="1em"
              />
              Geneva
            </p>

            <div className="flex items-center gap-x-2">
              {/* WWIS-style flat pictogram in place of the WMO icon image. */}
              <svg
                className="h-[50px] w-[70px]"
                viewBox="0 0 70 50"
                fill="none"
                aria-hidden
              >
                <circle cx="45" cy="18" r="12" fill="#FBBF24" />
                <path
                  d="M17 39h26a9 9 0 0 0 2.2-17.7A12.5 12.5 0 0 0 21.6 20 9.5 9.5 0 0 0 17 39Z"
                  fill="#F4F7FA"
                  stroke="#8FA3B8"
                  strokeWidth={2}
                  strokeLinejoin="round"
                />
              </svg>
              <span className="text-2xl font-bold text-ink">18°C</span>
            </div>

            <p className="max-w-[12.5rem] truncate bg-lift px-2 text-xs text-ink">
              {wt("Sunny")}
            </p>

            <div className="flex gap-x-2 text-xs text-faint">
              <span className="flex items-center gap-x-1">
                <Icon
                  icon="material-symbols:water-drop"
                  width="1em"
                  height="1em"
                />
                64%
              </span>
              <span className="flex items-center gap-x-1">
                <Icon icon="material-symbols:air" width="1em" height="1em" />
                {wt("NE")} 3 m/s
              </span>
            </div>
          </div>

          <p className="mt-2 text-center text-xs text-faint">
            {t("heroMockCaption")}
          </p>
        </div>
      </section>

      {/* The single entry point into /tool — staged as the page's CTA panel. */}
      <Link
        href="/tool"
        className="group grid gap-x-8 gap-y-3 rounded-xl border border-line bg-white px-5 py-5 shadow-sm transition-colors hover:border-signal/50 hover:bg-signal-soft/40 sm:grid-cols-[1fr_auto] sm:items-end sm:px-7 sm:py-6"
      >
        <div>
          <p className="font-mono text-[11px] font-medium uppercase tracking-[0.16em] text-signal">
            {ct("widgetCustomiser")}
          </p>

          <h2 className="mt-1.5 font-display text-xl font-bold text-ink sm:text-2xl">
            {t("customiserTitle")}
          </h2>

          <p className="mt-1.5 max-w-prose text-sm leading-relaxed text-faint">
            {t("customiserDescription")}
          </p>
        </div>

        {/* Button-styled chip; arrow travel flips per direction. */}
        <span className="inline-flex items-center gap-x-1.5 justify-self-start rounded-md border border-signal bg-white px-3.5 py-2 font-mono text-xs font-medium text-signal sm:justify-self-end">
          {t("customiserCta")}
          <Icon
            icon="material-symbols:chevron-right"
            className="shrink-0 transition-transform motion-reduce:transition-none ltr:group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5"
            width="16"
            height="16"
          />
        </span>
      </Link>

      {/* Sources and code, set as report rows rather than cards. */}
      <section className="mt-12 border-t border-line pt-5 sm:mt-16">
        <h2 className="font-mono text-[11px] font-medium uppercase tracking-[0.16em] text-faint">
          {t("aboutTitle")}
        </h2>

        <ul className="mt-1 divide-y divide-line">
          <li>
            <a
              href="https://worldweather.wmo.int"
              target="_blank"
              rel="noopener noreferrer"
              className="group grid items-baseline gap-x-6 gap-y-1 py-4 sm:grid-cols-[8rem_1fr_auto]"
            >
              <span className="font-mono text-xs text-faint">
                {t("dataSourceLabel")}
              </span>
              <div>
                <p className="font-display text-base font-semibold text-ink">
                  {t("dataSourceName")}
                </p>
                <p className="mt-1 max-w-prose text-sm leading-relaxed text-faint">
                  {t("dataSourceDescription")}
                </p>
              </div>
              <Icon
                icon="material-symbols:arrow-outward"
                className="justify-self-end text-faint transition-colors group-hover:text-signal"
                width="18"
                height="18"
              />
            </a>
          </li>

          <li>
            <a
              href="https://github.com/markmybytes/wmo-wx-widget"
              target="_blank"
              rel="noopener noreferrer"
              className="group grid items-baseline gap-x-6 gap-y-1 py-4 sm:grid-cols-[8rem_1fr_auto]"
            >
              <span className="font-mono text-xs text-faint">
                {t("repoLabel")}
              </span>
              <div>
                <p className="font-display text-base font-semibold text-ink">
                  {t("repoName")}
                </p>
                <p className="mt-1 max-w-prose text-sm leading-relaxed text-faint">
                  {t("repoDescription")}
                </p>
              </div>
              <Icon
                icon="material-symbols:arrow-outward"
                className="justify-self-end text-faint transition-colors group-hover:text-signal"
                width="18"
                height="18"
              />
            </a>
          </li>
        </ul>
      </section>
    </div>
  );
}
