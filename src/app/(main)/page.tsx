import { Icon } from "@iconify/react";
import { getTranslations } from "next-intl/server";
import Link from "next/link";

export default async function Home() {
  const t = await getTranslations("home");
  const wt = await getTranslations("weather");

  return (
    <div>
      <section className="grid items-center gap-x-12 gap-y-10 py-12 sm:grid-cols-[1fr_auto] sm:py-16 motion-safe:animate-fade-up">
        <div className="max-w-xl">
          <h1 className="text-3xl font-semibold tracking-tight text-zinc-900 sm:text-4xl">
            {t("heroTitle")}
          </h1>

          <p className="mt-3 text-base leading-relaxed text-zinc-600">
            {t("heroDescription")}
          </p>
        </div>

        <div className="justify-self-center sm:justify-self-end">
          {/* Static, real-CSS mock of the actual widget card (components/forecast/Weather.tsx). */}
          <div
            aria-hidden
            className="rounded-2xl border border-dashed border-zinc-300 p-4"
          >
            <div className="w-56 rounded border border-zinc-300 bg-white p-3 shadow-sm">
              <p className="flex items-center justify-center gap-x-1 text-xs text-zinc-500">
                <Icon
                  icon="material-symbols:location-on-outline"
                  width="1em"
                  height="1em"
                />
                Geneva
              </p>

              <div className="mt-2 flex flex-col items-center gap-y-2">
                <div className="flex items-center gap-x-2">
                  <Icon
                    icon="material-symbols:partly-cloudy-day"
                    className="text-amber-500"
                    width="44"
                    height="44"
                  />
                  <span className="text-2xl font-bold text-zinc-900">18°C</span>
                </div>

                <p className="bg-zinc-100 px-2 text-xs text-zinc-700">
                  {wt("Sunny")}
                </p>

                <div className="flex gap-x-3 text-xs text-zinc-600">
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
            </div>
          </div>

          <p className="mt-2 text-center text-xs text-zinc-400">
            {t("heroMockCaption")}
          </p>
        </div>
      </section>

      {/* The single entry point into /tool. */}
      <section className="mt-2 motion-safe:animate-fade-up [animation-delay:120ms]">
        <Link
          href="/tool"
          className="group flex items-center justify-between gap-x-4 rounded-2xl border border-zinc-200 bg-white p-6 transition-colors hover:border-sky-300 hover:bg-sky-50/50"
        >
          <div className="flex items-center gap-x-4">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-sky-100 text-sky-700">
              <Icon icon="material-symbols:tune" width="22" height="22" />
            </span>
            <div>
              <h2 className="font-semibold text-zinc-900">
                {t("customiserTitle")}
              </h2>
              <p className="mt-0.5 text-sm text-zinc-600">
                {t("customiserDescription")}
              </p>
            </div>
          </div>
          <Icon
            icon="material-symbols:chevron-right"
            className="shrink-0 text-zinc-400 transition-transform group-hover:translate-x-0.5 group-hover:text-sky-600"
            width="24"
            height="24"
          />
        </Link>
      </section>

      <section className="mt-12 motion-safe:animate-fade-up [animation-delay:240ms]">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-400">
          {t("aboutTitle")}
        </h2>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <a
            href="https://worldweather.wmo.int"
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col gap-y-3 rounded-2xl border border-zinc-200 bg-white p-6 transition-colors hover:border-zinc-300"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium uppercase tracking-wide text-zinc-500">
                {t("dataSourceLabel")}
              </span>
              <Icon
                icon="material-symbols:arrow-outward"
                className="text-zinc-400"
                width="18"
                height="18"
              />
            </div>
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-100 text-zinc-700">
              <Icon icon="material-symbols:public" width="20" height="20" />
            </span>
            <div>
              <p className="font-semibold text-zinc-900">
                {t("dataSourceName")}
              </p>
              <p className="mt-1 text-sm leading-relaxed text-zinc-600">
                {t("dataSourceDescription")}
              </p>
            </div>
          </a>

          <a
            href="https://github.com/markmybytes/wmo-wx-widget"
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col gap-y-3 rounded-2xl border border-zinc-200 bg-white p-6 transition-colors hover:border-zinc-300"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium uppercase tracking-wide text-zinc-500">
                {t("repoLabel")}
              </span>
              <Icon
                icon="material-symbols:arrow-outward"
                className="text-zinc-400"
                width="18"
                height="18"
              />
            </div>
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-100 text-zinc-700">
              <Icon icon="material-symbols:code" width="20" height="20" />
            </span>
            <div>
              <p className="font-semibold text-zinc-900">{t("repoName")}</p>
              <p className="mt-1 text-sm leading-relaxed text-zinc-600">
                {t("repoDescription")}
              </p>
            </div>
          </a>
        </div>
      </section>
    </div>
  );
}
