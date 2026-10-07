import {Icon} from "@iconify/react";
import {getTranslations} from "next-intl/server";
import Link from "next/link";

export default async function Home() {
  const t = await getTranslations("home");

  return (
    <div className="relative">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 -top-10 -z-10 h-80 bg-gradient-to-b from-sky-100/80 to-transparent"
      />

      <section className="flex flex-col items-start gap-y-5 py-16 sm:py-24 motion-safe:animate-fade-up">
        <p className="flex items-center gap-x-1.5 rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-xs font-medium text-sky-700">
          <Icon icon="material-symbols:cloud" width="14" height="14" />
          {t("heroEyebrow")}
        </p>

        <h1 className="text-4xl font-bold tracking-tight text-zinc-900 sm:text-5xl">
          {t("heroTitle")}
        </h1>

        <p className="max-w-2xl text-lg leading-relaxed text-zinc-600">
          {t("heroDescription")}
        </p>

        <Link
          href="/tool"
          className="mt-2 inline-flex items-center gap-x-2 rounded-xl bg-sky-600 px-5 py-3 text-sm font-medium text-white shadow-sm transition-colors hover:bg-sky-500"
        >
          {t("customiserCta")}
          <Icon icon="material-symbols:arrow-forward" width="18" height="18" />
        </Link>
      </section>

      <section
        className="mt-4 motion-safe:animate-fade-up [animation-delay:120ms]"
      >
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
